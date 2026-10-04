#!/usr/bin/env python3
"""High-volume, strict structured catalog/image sync for Collectors Sports.

This runner is intentionally conservative about product identity and aggressive about
volume once the product is verified:
- product -> set -> complete checklist, never player-by-player;
- up to 150 sets per product per run;
- exact card-attached fronts only;
- ambiguous product matches are rejected instead of guessed;
- known weak matches from the previous runner are purged automatically;
- state is resumable, so later runs continue where the previous one stopped.
"""
from __future__ import annotations

import asyncio
import json
import re
import time
import unicodedata
from pathlib import Path
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "mycardfolio_product_sources_v2.json"
CATALOG_OUT = ROOT / "catalog-mycardfolio-expanded.js"
IMAGES_OUT = ROOT / "catalog-images-mycardfolio.js"
REPORT = ROOT / "data" / "mycardfolio-sync-report.json"
STATE = ROOT / "data" / "mycardfolio-sync-state.json"
URL = "https://mycardfolio.com/api/mcp"

SETS_PER_PRODUCT_PER_RUN = 150
REQUEST_DELAY = 1.05
RATE_LIMIT_WAIT = 70
MAX_RATE_RETRIES = 8
MAX_RUNTIME = 46 * 60
FORCE_PURGE_COLLECTION_IDS: set[str] = set()

PARALLEL_WORDS = re.compile(
    r"\b(refractor|prizm|parallel|foil|gold|orange|red|black|green|blue|aqua|purple|pink|teal|yellow|silver|bronze|sepia|negative|frozen|superfractor|sapphire|atomic|mojo|lava|wave|raywave|x-fractor|geometric|ruby|burgundy|amber|violet|jade|obsidian|artist proof)\b",
    re.I,
)
AUTO_WORDS = re.compile(r"\b(auto|autograph|signature|signatures)\b", re.I)
RELIC_WORDS = re.compile(r"\b(relic|memorabilia|patch|jersey)\b", re.I)
LAST_CALL = 0.0


def norm(value: Any) -> str:
    s = unicodedata.normalize("NFKD", str(value or ""))
    s = "".join(c for c in s if not unicodedata.combining(c)).lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def extract_generated(path: Path, pattern: str) -> dict:
    try:
        text = path.read_text(encoding="utf-8")
        match = re.search(pattern, text, re.S)
        return json.loads(match.group(1)) if match else {}
    except Exception:
        return {}


def result_json(result: Any) -> dict:
    structured = getattr(result, "structuredContent", None)
    if structured:
        if hasattr(structured, "model_dump"):
            structured = structured.model_dump(mode="json")
        if isinstance(structured, dict):
            return structured
    for item in getattr(result, "content", []) or []:
        text = getattr(item, "text", "")
        if text:
            try:
                return json.loads(text)
            except Exception:
                pass
    return {}


def objects(node: Any):
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from objects(value)
    elif isinstance(node, list):
        for value in node:
            yield from objects(value)


def first(d: dict, *keys: str) -> Any:
    for key in keys:
        value = d.get(key) if isinstance(d, dict) else None
        if value not in (None, ""):
            return value
    return ""


def obj_label(d: dict) -> str:
    return str(first(d, "product", "product_name", "name", "title", "set", "set_name", "label"))


def match_score(label: str, wanted: str) -> int:
    hay = norm(label)
    want = norm(wanted)
    if not hay or not want:
        return -999
    wanted_tokens = want.split()
    hay_tokens = set(hay.split())
    score = sum(3 for token in wanted_tokens if token in hay_tokens)
    score -= sum(2 for token in wanted_tokens if token not in hay_tokens)
    if hay == want:
        score += 30
    if want in hay or hay in want:
        score += 8
    return score


def product_score(label: str, cfg: dict) -> int:
    names = [cfg.get("product", "")] + list(cfg.get("aliases", []) or [])
    return max(match_score(label, name) for name in names if name)


def product_is_strict_match(label: str, cfg: dict) -> bool:
    hay = norm(label)
    required = [norm(x) for x in cfg.get("required", []) if norm(x)]
    return all(token in hay.split() or token in hay for token in required)


def subject(card: dict) -> tuple[str, str]:
    subs = card.get("subjects") or card.get("subject") or []
    if isinstance(subs, dict):
        subs = [subs]
    if isinstance(subs, list) and subs:
        item = subs[0] if isinstance(subs[0], dict) else {"subject_name": subs[0]}
        return str(first(item, "subject_name", "name", "player", "subject")), str(first(item, "team_name", "team"))
    return str(first(card, "player", "subject_name", "name", "athlete", "fighter", "wrestler")), str(first(card, "team", "team_name"))


def card_objects(payload: dict) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for item in objects(payload):
        if not isinstance(item, dict):
            continue
        number = first(item, "card_number", "number", "card_no")
        card_id = first(item, "card_id", "cardId")
        player, _ = subject(item)
        if not number or not player or not card_id or str(card_id) in seen:
            continue
        seen.add(str(card_id))
        out.append(item)
    return out


def set_objects(payload: dict) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for item in objects(payload):
        if not isinstance(item, dict):
            continue
        set_id = first(item, "set_id", "setId")
        if not set_id or str(set_id) in seen:
            continue
        seen.add(str(set_id))
        out.append(item)
    return out


def product_objects(payload: dict) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for item in objects(payload):
        if not isinstance(item, dict):
            continue
        product_id = first(item, "product_id", "productId")
        if not product_id or str(product_id) in seen:
            continue
        seen.add(str(product_id))
        out.append(item)
    return out


def flags(card: dict, set_name: str):
    details = " ".join(str(first(card, key)) for key in ("card_details", "details", "notes", "attributes")) + " " + set_name
    upper = details.upper()
    out: list[str] = []
    if re.search(r"\bRC\b|ROOKIE", upper):
        out.append("RC")
    if AUTO_WORDS.search(details):
        out.append("AUTO")
    if RELIC_WORDS.search(details):
        out.append("RELIC")
    if re.search(r"\bSSP\b", upper):
        out.append("SSP")
    elif re.search(r"\bSP\b", upper):
        out.append("SP")
    return out or 0


def category(set_name: str, details: str = "") -> str:
    text = f"{set_name} {details}"
    if AUTO_WORDS.search(text) and RELIC_WORDS.search(text):
        return "auto-relic"
    if AUTO_WORDS.search(text):
        return "autograph"
    if RELIC_WORDS.search(text):
        return "relic"
    if "rookie" in text.lower():
        return "rookie-insert"
    if norm(set_name) in {"base", "base set", "base cards", "chrome", "bowman chrome"}:
        return "base"
    if PARALLEL_WORDS.search(set_name):
        return "parallel"
    return "insert"


def variant_name(set_name: str, cat: str) -> str:
    return "Base" if cat == "base" else set_name


def year_for_collection(cfg: dict) -> str:
    return cfg.get("displayYear") or ("2025/26" if cfg.get("year") == "2025" and "25/26" in cfg.get("shortName", "") else cfg.get("year", ""))


def declared_count(s: dict) -> int:
    try:
        return int(first(s, "count", "card_count", "cards_count") or 0)
    except Exception:
        return 0


def set_priority(s: dict):
    name = norm(obj_label(s))
    count = declared_count(s)
    canonical = 0
    if name in {"base", "base set", "base cards", "chrome", "bowman chrome"}:
        canonical += 10000
    if any(x in name for x in ("prospect", "rookie", "autograph", "auto", "insert", "relic", "memorabilia")):
        canonical += 2500
    if PARALLEL_WORDS.search(name) and count <= 2:
        canonical -= 2500
    return canonical + count * 100, count, name


def row_key(row: list) -> tuple[str, str, str, str]:
    return str(row[0]), norm(row[1]), norm(row[4] if len(row) > 4 else ""), norm(row[6] if len(row) > 6 else "")


def render_catalog(data: dict) -> str:
    packed = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return f"""// Generated by sync_mycardfolio_v2.py. Do not edit by hand.\n(() => {{\n const catalog=window.CS_CATALOG;if(!catalog)return;\n const payload={packed};\n const key=r=>`${{String(r?.[0]??'')}}|${{String(r?.[1]??'').toLowerCase()}}|${{String(r?.[4]??'').toLowerCase()}}|${{String(r?.[6]??'').toLowerCase()}}`;\n for(const [id,p] of Object.entries(payload)){{\n   let c=catalog.collections.find(x=>x.id===id);if(!c){{c={{...p.collection}};catalog.collections.push(c);}}else Object.assign(c,p.collection);\n   const existing=catalog.checklists[id]||[];const seen=new Set(existing.map(key));const merged=[...existing];\n   for(const r of p.rows){{const k=key(r);if(!seen.has(k)){{merged.push(r);seen.add(k);}}}}\n   catalog.checklists[id]=merged;c.coverage='expanded-structured';c.expandedCount=merged.length;c.entryIdentity=true;\n }}\n}})();\n"""


def render_images(images: dict) -> str:
    packed = json.dumps(images, ensure_ascii=False, separators=(",", ":"))
    return f"// Generated by sync_mycardfolio_v2.py.\n(() => {{const r=window.CS_IMAGE_CATALOG=window.CS_IMAGE_CATALOG||{{collections:{{}},cards:{{}}}};r.cards=r.cards||{{}};Object.assign(r.cards,{packed});}})();\n"


def write_outputs(catalog: dict, images: dict, state: dict, report: dict) -> None:
    CATALOG_OUT.write_text(render_catalog(catalog), encoding="utf-8")
    IMAGES_OUT.write_text(render_images(images), encoding="utf-8")
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def purge_collection(cid: str, catalog: dict, images: dict, product_state: dict) -> tuple[int, int]:
    removed_rows = len(catalog.get(cid, {}).get("rows", []))
    catalog.pop(cid, None)
    doomed = [key for key in images if key.startswith(cid + "|")]
    for key in doomed:
        images.pop(key, None)
    product_state["processedSets"] = []
    product_state.pop("productId", None)
    product_state.pop("yearUsed", None)
    product_state.pop("knownSets", None)
    return removed_rows, len(doomed)


async def paced_call(session: ClientSession, name: str, args: dict) -> dict:
    global LAST_CALL
    for attempt in range(MAX_RATE_RETRIES + 1):
        gap = time.monotonic() - LAST_CALL
        if gap < REQUEST_DELAY:
            await asyncio.sleep(REQUEST_DELAY - gap)
        try:
            result = await session.call_tool(name, arguments=args)
            LAST_CALL = time.monotonic()
            return result_json(result)
        except Exception as exc:
            LAST_CALL = time.monotonic()
            message = str(exc).lower()
            if "rate limit" in message and attempt < MAX_RATE_RETRIES:
                wait = RATE_LIMIT_WAIT + attempt * 5
                print(f"    rate limit: waiting {wait}s then retrying...", flush=True)
                await asyncio.sleep(wait)
                continue
            if attempt < 2:
                await asyncio.sleep(4 * (attempt + 1))
                continue
            raise


def available_years(payload: dict) -> list[str]:
    years: list[str] = []
    for item in objects(payload):
        if not isinstance(item, dict):
            continue
        value = str(first(item, "year", "name", "label"))
        match = re.search(r"\b(19|20)\d{2}\b", value)
        if match and match.group(0) not in years:
            years.append(match.group(0))
    return years


def candidate_years(desired: str, available: list[str]) -> list[str]:
    try:
        y = int(desired)
    except Exception:
        return [desired]
    wanted = [str(y), str(y - 1), str(y + 1)]
    return [year for year in wanted if year in available] or ([desired] if desired else [])


async def choose_verified_product(session: ClientSession, cfg: dict, years_cache: dict, products_cache: dict):
    sport = cfg["sport"]
    desired = cfg["year"]
    if sport not in years_cache:
        years_cache[sport] = available_years(await paced_call(session, "browse", {"sport": sport}))
    years = candidate_years(desired, years_cache[sport])
    considered: list[dict] = []
    best = None
    best_score = -9999
    for year in years:
        cache_key = (sport, year)
        if cache_key not in products_cache:
            products_cache[cache_key] = product_objects(await paced_call(session, "browse", {"sport": sport, "year": year}))
        for product in products_cache[cache_key]:
            label = obj_label(product)
            score = product_score(label, cfg) - abs(int(year) - int(desired)) * 2
            considered.append({"year": year, "label": label, "score": score, "strict": product_is_strict_match(label, cfg), "productId": str(first(product, "product_id", "productId"))})
            if score > best_score and score >= 1 and product_is_strict_match(label, cfg):
                best = (product, year)
                best_score = score
    considered.sort(key=lambda item: item["score"], reverse=True)
    return best, considered[:8]


async def main_async() -> None:
    started = time.monotonic()
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    catalog = extract_generated(CATALOG_OUT, r"const payload=(\{.*?\});\n const key=")
    images = extract_generated(IMAGES_OUT, r"Object\.assign\(r\.cards,(\{.*\})\);")
    state = load_json(STATE, {"version": 2, "products": {}})
    state["version"] = 2
    forced_purge_report = {}
    for cid in sorted(FORCE_PURGE_COLLECTION_IDS):
        ps = state["products"].setdefault(cid, {"processedSets": []})
        removed_rows, removed_images = purge_collection(cid, catalog, images, ps)
        if removed_rows or removed_images:
            forced_purge_report[cid] = {"rows": removed_rows, "images": removed_images}
            print(f"[{cid}] forced legacy purge: -{removed_rows} rows, -{removed_images} fronts", flush=True)
    report = {
        "runner": "sync_mycardfolio_v2.py",
        "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "endpoint": URL,
        "setsPerProductPerRun": SETS_PER_PRODUCT_PER_RUN,
        "requestDelaySeconds": REQUEST_DELAY,
        "forcedLegacyPurges": forced_purge_report,
        "products": {},
    }
    years_cache: dict[str, list[str]] = {}
    products_cache: dict[tuple[str, str], list[dict]] = {}

    async with streamable_http_client(URL) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            for product_cfg in cfg.get("products", []):
                if time.monotonic() - started > MAX_RUNTIME:
                    report["stoppedForRuntimeBudget"] = True
                    break

                cid = product_cfg["collectionId"]
                print(f"[{cid}] strict high-volume structured sync", flush=True)
                ps = state["products"].setdefault(cid, {"processedSets": []})
                processed = set(ps.get("processedSets", []))
                stats = {"setsFetchedThisRun": 0, "rowsAddedThisRun": 0, "imagesAddedThisRun": 0}

                try:
                    chosen, candidates = await choose_verified_product(session, product_cfg, years_cache, products_cache)
                    stats["candidateProducts"] = candidates
                    if not chosen:
                        if product_cfg.get("resetOnMismatch") and (cid in catalog or any(key.startswith(cid + "|") for key in images)):
                            removed_rows, removed_images = purge_collection(cid, catalog, images, ps)
                            stats["purgedUnverifiedRows"] = removed_rows
                            stats["purgedUnverifiedImages"] = removed_images
                            processed = set()
                        stats["error"] = "strict-product-not-found"
                        report["products"][cid] = stats
                        write_outputs(catalog, images, state, report)
                        print("  -> no strict product match; skipped instead of guessing", flush=True)
                        continue

                    product, year = chosen
                    pid = str(first(product, "product_id", "productId"))
                    label = obj_label(product)

                    old_pid = str(ps.get("productId") or "")
                    if old_pid and old_pid != pid:
                        removed_rows, removed_images = purge_collection(cid, catalog, images, ps)
                        stats["purgedRowsAfterProductChange"] = removed_rows
                        stats["purgedImagesAfterProductChange"] = removed_images
                        processed = set()

                    sets = set_objects(await paced_call(session, "browse", {"product_id": pid}))
                    sets.sort(key=set_priority, reverse=True)
                    pending = [item for item in sets if str(first(item, "set_id", "setId")) not in processed]
                    selected = pending[:SETS_PER_PRODUCT_PER_RUN]

                    existing = catalog.get(
                        cid,
                        {
                            "collection": {
                                "id": cid,
                                "sport": product_cfg.get("appSport", product_cfg["sport"]),
                                "manufacturer": "Panini" if "panini" in product_cfg["product"].lower() else "Topps",
                                "year": year_for_collection(product_cfg),
                                "name": product_cfg["product"],
                                "shortName": product_cfg.get("shortName", product_cfg["product"]),
                                "sourceUrl": "https://mycardfolio.com",
                                "coverage": "expanded-structured",
                            },
                            "rows": [],
                        },
                    )
                    row_seen = {row_key(row) for row in existing.get("rows", [])}

                    for index, set_obj in enumerate(selected, 1):
                        if time.monotonic() - started > MAX_RUNTIME:
                            report["stoppedForRuntimeBudget"] = True
                            break
                        set_id = str(first(set_obj, "set_id", "setId"))
                        set_name = obj_label(set_obj) or "Base"
                        checklist = await paced_call(session, "get_set_checklist", {"set_id": set_id})
                        cards = card_objects(checklist)

                        for card in cards:
                            number = str(first(card, "card_number", "number", "card_no"))
                            player, team = subject(card)
                            if not number or not player:
                                continue
                            details = str(first(card, "card_details", "details", "notes"))
                            cat = category(set_name, details)
                            variant = variant_name(set_name, cat)
                            card_id = str(first(card, "card_id", "cardId"))
                            entry_key = f"mcf:{set_id}:{card_id}"
                            row = [number, player, team, flags(card, set_name), "Base" if cat == "base" else set_name, cat, variant, entry_key]
                            rk = row_key(row)
                            if rk not in row_seen:
                                existing["rows"].append(row)
                                row_seen.add(rk)
                                stats["rowsAddedThisRun"] += 1

                            image = str(first(card, "image_url", "image", "front_image", "front_image_url"))
                            page = str(first(card, "url", "card_url"))
                            if image.startswith("https://"):
                                image_key = f"{cid}|{number}|{entry_key}"
                                if image_key not in images:
                                    stats["imagesAddedThisRun"] += 1
                                images[image_key] = {
                                    "front": image,
                                    "kind": "exact",
                                    "exactVerified": True,
                                    "variant": variant,
                                    "source": "MyCardfolio structured card record",
                                    "sourcePage": page,
                                    "sourceImageUrl": image,
                                    "label": f"{player} #{number} · {set_name} · frente estructurado",
                                    "verified": [year, label, set_name, number, player],
                                    "verificationMethod": "verified product→set→card_id identity + card-attached image",
                                    "verifiedAt": time.strftime("%Y-%m-%d"),
                                    "confidence": "structured-high",
                                }

                        processed.add(set_id)
                        stats["setsFetchedThisRun"] += 1
                        if index % 10 == 0:
                            ps["processedSets"] = sorted(processed)
                            catalog[cid] = existing
                            write_outputs(catalog, images, state, report)
                            print(f"    {index}/{len(selected)} sets · +{stats['rowsAddedThisRun']} rows · +{stats['imagesAddedThisRun']} fronts", flush=True)

                    ps["processedSets"] = sorted(processed)
                    ps["productId"] = pid
                    ps["productMatched"] = label
                    ps["yearUsed"] = year
                    ps["knownSets"] = len(sets)
                    catalog[cid] = existing
                    stats.update(
                        {
                            "yearUsed": year,
                            "productId": pid,
                            "productMatched": label,
                            "knownSets": len(sets),
                            "processedSetsTotal": len(processed),
                            "remainingSets": max(0, len(sets) - len(processed)),
                            "rowsAccumulated": len(existing["rows"]),
                        }
                    )
                except Exception as exc:
                    stats["fatalError"] = repr(exc)
                    print("  !", exc, flush=True)

                report["products"][cid] = stats
                write_outputs(catalog, images, state, report)
                print(
                    f"  -> +{stats.get('rowsAddedThisRun', 0)} identities, +{stats.get('imagesAddedThisRun', 0)} fronts; "
                    f"{stats.get('processedSetsTotal', 0)}/{stats.get('knownSets', '?')} sets done",
                    flush=True,
                )

    report["finishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    report["collectionsWritten"] = len(catalog)
    report["rowsWritten"] = sum(len(item.get("rows", [])) for item in catalog.values())
    report["exactFrontsWritten"] = len(images)
    report["runtimeSeconds"] = round(time.monotonic() - started, 1)
    write_outputs(catalog, images, state, report)
    print(
        f"TOTAL ACCUMULATED: {report['rowsWritten']} identities, {report['exactFrontsWritten']} structured fronts, "
        f"{report['collectionsWritten']} products",
        flush=True,
    )


if __name__ == "__main__":
    asyncio.run(main_async())