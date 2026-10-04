#!/usr/bin/env python3
"""Repair exact card fronts from MyCardfolio card-detail records.

The structured checklist sync is intentionally conservative and only stores images
attached directly to checklist rows. Some products expose the same card identity in
the checklist but keep the exact front on the card-detail endpoint instead.

This pass spends its request budget only on already-known card identities that are
missing exact fronts, with user-owned collections first.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import time
from pathlib import Path
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

import sync_mycardfolio_v2 as sync

ROOT = Path(__file__).resolve().parents[1]
PRIORITY = ROOT / "data" / "user-collection-priority.json"
GAPS = ROOT / "data" / "owned-collection-gap-report.json"
STATE = ROOT / "data" / "mycardfolio-detail-image-state.json"
REPORT = ROOT / "data" / "mycardfolio-detail-image-report.json"

MAX_CARDS = max(1, int(os.getenv("MCF_DETAIL_IMAGE_MAX", "320")))
REQUEST_DELAY = max(1.02, float(os.getenv("MCF_DETAIL_IMAGE_DELAY", "1.05")))
MAX_ATTEMPTS_PER_CARD = max(1, int(os.getenv("MCF_DETAIL_IMAGE_MAX_ATTEMPTS", "3")))
MAX_RUNTIME = max(60, int(os.getenv("MCF_DETAIL_IMAGE_MAX_SECONDS", "1500")))
RATE_LIMIT_WAIT = max(10, int(os.getenv("MCF_DETAIL_IMAGE_RATE_WAIT", "70")))

STRATEGIC_PRIORITY = [
    "topps-chrome-tennis-2026",
    "topps-chrome-ucc-2025-26",
    "topps-finest-ucc-2025-26",
    "topps-argentina-collector-tin-2026",
    "topps-barcelona-collector-tin-2025-26",
    "topps-real-madrid-collector-tin-2025-26",
    "topps-man-utd-collector-tin-2025-26",
    "topps-man-city-collector-tin-2025-26",
    "topps-liverpool-collector-tin-2025-26",
    "topps-juventus-collector-tin-2025-26",
    "topps-bayern-collector-tin-2025-26",
    "topps-celtic-collector-tin-2025-26",
    "panini-intl-england-2026",
    "panini-intl-france-2026",
    "panini-intl-mexico-2026",
    "panini-intl-germany-2026",
    "panini-prizm-club-world-cup-2025",
    "panini-prizm-monopoly-world-cup-2026",
    "topps-chrome-mls-2026",
    "topps-premier-league-2025-26",
]

IMAGE_FIELDS = (
    "image_url",
    "image",
    "front_image_url",
    "front_image",
    "front_url",
    "front",
    "imageUrl",
    "frontImageUrl",
)
PAGE_FIELDS = ("url", "card_url", "page_url", "web_url")


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


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


def extract_detail_card(payload: dict, card_id: str) -> dict:
    exact = []
    fallback = []
    for item in objects(payload):
        if not isinstance(item, dict):
            continue
        iid = str(first(item, "card_id", "cardId", "id"))
        if iid == card_id:
            exact.append(item)
        if any(str(first(item, field)).startswith("https://") for field in IMAGE_FIELDS):
            fallback.append(item)
    for item in exact:
        if any(str(first(item, field)).startswith("https://") for field in IMAGE_FIELDS):
            return item
    return exact[0] if exact else (fallback[0] if len(fallback) == 1 else {})


def image_from_card(card: dict) -> str:
    for field in IMAGE_FIELDS:
        value = first(card, field)
        if isinstance(value, dict):
            value = first(value, "url", "src", "href")
        if isinstance(value, list):
            for part in value:
                if isinstance(part, str) and part.startswith("https://"):
                    return part
                if isinstance(part, dict):
                    nested = first(part, "url", "src", "href")
                    if str(nested).startswith("https://"):
                        return str(nested)
        if str(value).startswith("https://"):
            return str(value)
    for item in objects(card.get("images") or card.get("media") or {}):
        if isinstance(item, dict):
            for key in ("url", "src", "href"):
                value = item.get(key)
                if isinstance(value, str) and value.startswith("https://"):
                    return value
    return ""


def priority_ids(catalog: dict) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()

    def add(value: str) -> None:
        if value and value in catalog and value not in seen:
            ordered.append(value)
            seen.add(value)

    for cid in STRATEGIC_PRIORITY:
        add(cid)

    data = load_json(PRIORITY, {})
    collections = data.get("collections", []) if isinstance(data, dict) else []
    collections = sorted(
        (x for x in collections if isinstance(x, dict)),
        key=lambda x: int(x.get("ownedRows") or 0),
        reverse=True,
    )
    for item in collections:
        add(str(item.get("collectionId") or ""))

    gap_data = load_json(GAPS, {})
    gap_rows = gap_data.get("collections", []) if isinstance(gap_data, dict) else []
    gap_rows = sorted(
        (x for x in gap_rows if isinstance(x, dict)),
        key=lambda x: (float(x.get("exactFrontCoveragePct") or 0), -int(x.get("ownedRows") or 0)),
    )
    for item in gap_rows:
        add(str(item.get("collectionId") or ""))

    for cid in catalog:
        add(cid)
    return ordered


def targets_for_collection(cid: str, payload: dict, images: dict, attempts: dict) -> list[dict]:
    rows = payload.get("rows", []) if isinstance(payload, dict) else []
    out = []
    for row in rows:
        if not isinstance(row, list) or len(row) < 8:
            continue
        number = str(row[0] or "")
        player = str(row[1] or "")
        team = str(row[2] or "")
        set_name = str(row[4] or "")
        variant = str(row[6] or set_name or "Base")
        entry_key = str(row[7] or "")
        match = re.fullmatch(r"mcf:([^:]+):(.+)", entry_key)
        if not match:
            continue
        set_id, card_id = match.groups()
        image_key = f"{cid}|{number}|{entry_key}"
        if image_key in images:
            continue
        state_key = f"{cid}|{entry_key}"
        if int(attempts.get(state_key, {}).get("misses", 0)) >= MAX_ATTEMPTS_PER_CARD:
            continue
        out.append(
            {
                "collectionId": cid,
                "number": number,
                "player": player,
                "team": team,
                "setName": set_name,
                "variant": variant,
                "entryKey": entry_key,
                "setId": set_id,
                "cardId": card_id,
                "imageKey": image_key,
                "stateKey": state_key,
            }
        )
    return out


async def call_get_card(session: ClientSession, card_id: str) -> tuple[dict, str]:
    for attempt in range(4):
        try:
            result = await session.call_tool("get_card", arguments={"card_id": card_id})
            payload = sync.result_json(result)
            return payload, ""
        except Exception as exc:
            message = str(exc)
            if "rate limit" in message.lower() and attempt < 3:
                await asyncio.sleep(RATE_LIMIT_WAIT + attempt * 5)
                continue
            if attempt < 2:
                await asyncio.sleep(3 * (attempt + 1))
                continue
            return {}, message
    return {}, "retry budget exhausted"


async def main_async() -> None:
    started = time.monotonic()
    catalog = sync.extract_generated(sync.CATALOG_OUT, r"const payload=(\{.*?\});\n const key=")
    images = sync.extract_generated(sync.IMAGES_OUT, r"Object\.assign\(r\.cards,(\{.*\})\);")
    state = load_json(STATE, {"version": 1, "cards": {}})
    attempts = state.setdefault("cards", {})

    before = len(images)
    report = {
        "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "maxCards": MAX_CARDS,
        "exactFrontsBefore": before,
        "attempted": 0,
        "added": 0,
        "missed": 0,
        "errors": 0,
        "byCollection": {},
        "samplesAdded": [],
    }

    ordered_ids = priority_ids(catalog)
    queue: list[dict] = []
    for cid in ordered_ids:
        queue.extend(targets_for_collection(cid, catalog[cid], images, attempts))
    queue = queue[:MAX_CARDS]

    if not queue:
        report["finishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        report["exactFrontsAfter"] = before
        report["message"] = "No eligible known-card image gaps remain within retry policy."
        save_json(REPORT, report)
        print(report["message"], flush=True)
        return

    print(
        f"Detail-image repair: {len(queue)} known identities queued across "
        f"{len({x['collectionId'] for x in queue})} collections.",
        flush=True,
    )

    async with streamable_http_client(sync.URL) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            for index, target in enumerate(queue, 1):
                if time.monotonic() - started > MAX_RUNTIME:
                    report["stoppedForRuntimeBudget"] = True
                    break

                cid = target["collectionId"]
                coll = report["byCollection"].setdefault(cid, {"attempted": 0, "added": 0, "missed": 0, "errors": 0})
                report["attempted"] += 1
                coll["attempted"] += 1

                payload, error = await call_get_card(session, target["cardId"])
                detail = extract_detail_card(payload, target["cardId"]) if payload else {}
                image = image_from_card(detail) if detail else ""
                page = str(first(detail, *PAGE_FIELDS)) if detail else ""

                entry_state = attempts.setdefault(target["stateKey"], {})
                entry_state["lastAttemptAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

                if image:
                    images[target["imageKey"]] = {
                        "front": image,
                        "kind": "exact",
                        "exactVerified": True,
                        "variant": target["variant"],
                        "source": "MyCardfolio structured card detail",
                        "sourcePage": page,
                        "sourceImageUrl": image,
                        "label": f"{target['player']} #{target['number']} · {target['setName']} · frente exacto por card_id",
                        "verified": [target["setId"], target["cardId"], target["number"], target["player"]],
                        "verificationMethod": "known checklist card_id → get_card(card_id) → card-attached image",
                        "verifiedAt": time.strftime("%Y-%m-%d"),
                        "confidence": "structured-high",
                    }
                    entry_state["resolved"] = True
                    entry_state["misses"] = 0
                    report["added"] += 1
                    coll["added"] += 1
                    if len(report["samplesAdded"]) < 30:
                        report["samplesAdded"].append(
                            {
                                "collectionId": cid,
                                "cardId": target["cardId"],
                                "number": target["number"],
                                "player": target["player"],
                                "image": image,
                            }
                        )
                elif error:
                    entry_state["lastError"] = error[:500]
                    entry_state["misses"] = int(entry_state.get("misses", 0)) + 1
                    report["errors"] += 1
                    coll["errors"] += 1
                else:
                    entry_state["misses"] = int(entry_state.get("misses", 0)) + 1
                    report["missed"] += 1
                    coll["missed"] += 1

                if index % 25 == 0:
                    sync.IMAGES_OUT.write_text(sync.render_images(images), encoding="utf-8")
                    save_json(STATE, state)
                    save_json(REPORT, report)
                    print(
                        f"  {index}/{len(queue)} detail cards · +{report['added']} exact fronts "
                        f"· {report['missed']} without image · {report['errors']} errors",
                        flush=True,
                    )
                await asyncio.sleep(REQUEST_DELAY)

    sync.IMAGES_OUT.write_text(sync.render_images(images), encoding="utf-8")
    report["finishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    report["exactFrontsAfter"] = len(images)
    report["runtimeSeconds"] = round(time.monotonic() - started, 1)
    save_json(STATE, state)
    save_json(REPORT, report)
    print(
        f"Detail-image repair complete: +{report['added']} exact fronts "
        f"({before} → {len(images)}) from {report['attempted']} known identities.",
        flush=True,
    )


if __name__ == "__main__":
    asyncio.run(main_async())
