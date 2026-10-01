#!/usr/bin/env python3
"""Build catalog-imported.js from official manufacturer checklists.

The source registry lives in tools/checklist_sources.json. Each generated base
card is stored compactly as [number, subject, team/affiliation, rookie].
"""
from __future__ import annotations

import io
import json
import math
import re
import sys
import urllib.request
from pathlib import Path

import pandas as pd
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "tools" / "checklist_sources.json"
OUTPUT = ROOT / "catalog-imported.js"

MLB_TEAMS = sorted([
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
    "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians",
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
    "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers", "Minnesota Twins",
    "New York Mets", "New York Yankees", "Philadelphia Phillies", "Pittsburgh Pirates",
    "San Diego Padres", "San Francisco Giants", "Seattle Mariners", "St. Louis Cardinals",
    "Tampa Bay Rays", "Texas Rangers", "Toronto Blue Jays", "Washington Nationals",
    "Athletics", "Angels"
], key=len, reverse=True)

F1_TEAMS = sorted([
    "Mercedes-AMG PETRONAS Formula One Team", "McLaren Mastercard Formula 1 Team",
    "VISA Cash App Racing Bulls Formula One Team", "Aston Martin Aramco Formula One Team",
    "Atlassian Williams F1 Team", "BWT Alpine Formula One Team", "Cadillac Formula 1 Team",
    "Oracle Red Bull Racing", "Scuderia Ferrari HP", "Audi Revolut F1 Team", "TGR Haas F1 Team",
    "Van Amersfoort Racing", "Rodin Motorsport", "PREMA Racing", "DAMS Lucas Oil",
    "ART Grand Prix", "MP Motorsport", "Campos Racing", "Hitech TGR", "AIX Racing",
    "Invicta Racing", "Trident", "Legend", "TBD"
], key=len, reverse=True)


def clean_text(value) -> str:
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except Exception:
        pass
    value = str(value).replace("®", "").replace("™", "").replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def card_number(value) -> int | None:
    """Accept Excel numeric cells (1, 1.0) as well as textual card numbers."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if not math.isnan(value) and value.is_integer():
            return int(value)
        return None
    text = clean_text(value)
    m = re.fullmatch(r"(\d{1,4})(?:\.0+)?", text)
    return int(m.group(1)) if m else None


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "CollectorsSportsCatalog/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def pdf_lines(data: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(data))
    lines: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        lines.extend(clean_text(line) for line in text.splitlines() if clean_text(line))
    return lines


def split_subject_team(rest: str, teams: list[str]) -> tuple[str, str] | None:
    clean = clean_text(rest)
    for team in teams:
        idx = clean.find(team)
        if idx >= 0:
            subject = clean[:idx].strip() or team
            return subject, team
    return None


def parse_mlb_pdf(data: bytes) -> list[list]:
    lines = pdf_lines(data)
    rows: dict[int, list] = {}
    started = False
    for raw in lines:
        line = clean_text(raw)
        if line == "BASE CARDS":
            started = True
            continue
        if started and (line == "INSERT" or line.startswith("INSERT ") or line == "INSERTS"):
            break
        if not started:
            continue
        m = re.match(r"^(\d{1,3})\s+(.+)$", line)
        if not m:
            continue
        number = int(m.group(1))
        if not 1 <= number <= 300:
            continue
        found = split_subject_team(m.group(2), MLB_TEAMS)
        if found:
            subject, team = found
            rows[number] = [number, subject, team, 0]
    if len(rows) < 285:
        raise RuntimeError(f"MLB parser only extracted {len(rows)}/300 base cards")
    return [rows[n] for n in sorted(rows)]


def strip_f1_subset(rest: str) -> str:
    marker = " BASE CARDS - "
    return rest.split(marker, 1)[0].strip() if marker in rest else rest.strip()


def parse_f1_pdf(data: bytes) -> list[list]:
    lines = pdf_lines(data)
    rows: dict[int, list] = {}
    started = False
    for raw in lines:
        line = clean_text(raw)
        if line == "BASE CARDS":
            started = True
            continue
        if started and line == "INSERTS":
            break
        if not started:
            continue
        m = re.match(r"^(\d{1,3})\s+(.+)$", line)
        if not m:
            continue
        number = int(m.group(1))
        if not 1 <= number <= 200:
            continue
        whole_rest = clean_text(m.group(2))
        rookie = 1 if re.search(r"\bRookie\b", whole_rest, re.I) else 0
        rest = strip_f1_subset(whole_rest)
        rest = re.sub(r"\s+(Rookie|1st Logo)\s*$", "", rest, flags=re.I).strip()
        found = split_subject_team(rest, F1_TEAMS)
        if found:
            subject, team = found
            rows[number] = [number, subject, team, rookie]
        elif rest.startswith("TBD"):
            rows[number] = [number, "TBD", "TBD", rookie]
    if len(rows) < 180:
        raise RuntimeError(f"F1 parser only extracted {len(rows)}/200 base cards")
    return [rows[n] for n in sorted(rows)]


def header_score(cells: list[str]) -> int:
    score = 0
    if any(("card" in x and ("number" in x or "#" in x or "no" in x)) or x in {"number", "no."} for x in cells):
        score += 3
    if any(any(word in x for word in ("player", "subject", "fighter", "athlete", "name")) for x in cells):
        score += 2
    if any(any(word in x for word in ("team", "division", "weight class", "affiliation")) for x in cells):
        score += 1
    if any(any(word in x for word in ("set", "subset")) for x in cells):
        score += 1
    return score


def locate_header(raw: pd.DataFrame) -> int | None:
    best_index = None
    best_score = 0
    for i in range(min(100, len(raw))):
        cells = [clean_text(x).lower() for x in raw.iloc[i].tolist()]
        score = header_score(cells)
        if score > best_score:
            best_index, best_score = i, score
    return best_index if best_score >= 4 else None


def pick_column(columns, needles, reject=()):
    normalized = {c: clean_text(c).lower() for c in columns}
    for needle in needles:
        for original, norm in normalized.items():
            if needle in norm and not any(bad in norm for bad in reject):
                return original
    return None


def print_xls_preview(sheet: str, raw: pd.DataFrame) -> None:
    print(f"  XLS diagnostic sheet={sheet!r} shape={raw.shape}", file=sys.stderr)
    for i in range(min(12, len(raw))):
        values = [clean_text(x) for x in raw.iloc[i].tolist()]
        values = [x for x in values if x][:10]
        if values:
            print(f"    row {i}: {values}", file=sys.stderr)


def parse_generic_xls(data: bytes, expected: int = 0) -> list[list]:
    book = pd.ExcelFile(io.BytesIO(data), engine="xlrd")
    best: list[list] = []
    for sheet in book.sheet_names:
        raw = pd.read_excel(book, sheet_name=sheet, header=None, dtype=object)
        header = locate_header(raw)
        if header is None:
            print_xls_preview(sheet, raw)
            continue
        frame = pd.read_excel(book, sheet_name=sheet, header=header, dtype=object)
        print(f"  XLS sheet={sheet!r} header={header} columns={[clean_text(c) for c in frame.columns]}", flush=True)
        number_col = pick_column(frame.columns, ["card number", "card #", "card no", "number", "no."], reject=("set", "subset"))
        name_col = pick_column(frame.columns, ["fighter name", "player name", "subject", "fighter", "athlete", "name"])
        subset_col = pick_column(frame.columns, ["subset", "set name", "card set"])
        team_col = pick_column(frame.columns, ["team", "weight class", "division", "affiliation"])
        rookie_col = pick_column(frame.columns, ["rookie", "rc"])
        if number_col is None or name_col is None:
            print(f"  Could not identify number/name columns in {sheet!r}", file=sys.stderr)
            print_xls_preview(sheet, raw)
            continue
        unique: dict[int, list] = {}
        for _, row in frame.iterrows():
            number = card_number(row.get(number_col))
            if number is None:
                continue
            if expected and not 1 <= number <= expected:
                continue
            if not expected and subset_col is not None:
                subset = clean_text(row.get(subset_col)).lower()
                if subset and "base" not in subset:
                    continue
            subject = clean_text(row.get(name_col))
            if not subject:
                continue
            team = clean_text(row.get(team_col)) if team_col is not None else ""
            rookie_value = clean_text(row.get(rookie_col)).lower() if rookie_col is not None else ""
            rookie = 1 if rookie_value in {"1","true","yes","y","rookie","rc","x"} else 0
            unique.setdefault(number, [number, subject, team, rookie])
        rows = [unique[n] for n in sorted(unique)]
        if len(rows) > len(best):
            best = rows
    if expected and len(best) < int(expected * 0.85):
        raise RuntimeError(f"XLS parser only extracted {len(best)}/{expected} expected base cards")
    return best


def build() -> dict[str, list[list]]:
    sources = json.loads(SOURCES.read_text(encoding="utf-8"))
    imported: dict[str, list[list]] = {}
    for source in sources:
        sid = source["id"]
        kind = source["kind"]
        print(f"Fetching {sid} ({kind})", flush=True)
        try:
            data = fetch_bytes(source["url"])
            if kind == "pdf-mlb":
                rows = parse_mlb_pdf(data)
            elif kind == "pdf-f1":
                rows = parse_f1_pdf(data)
            elif kind == "xls-generic":
                rows = parse_generic_xls(data, int(source.get("expected_base_count", 0)))
            else:
                raise RuntimeError(f"Unknown source kind: {kind}")
            imported[sid] = rows
            print(f"  -> {len(rows)} base rows", flush=True)
        except Exception as exc:
            print(f"WARNING: {sid}: {exc}", file=sys.stderr, flush=True)
    return imported


def render(imported: dict[str, list[list]]) -> str:
    payload = json.dumps(imported, ensure_ascii=False, separators=(",", ":"))
    return f'''// Generated by tools/sync_checklists.py from official manufacturer checklists.\n// Do not edit by hand.\n(() => {{\n  const catalog = window.CS_CATALOG;\n  if (!catalog) return;\n  const imported = {payload};\n  Object.entries(imported).forEach(([id, rows]) => {{\n    catalog.checklists[id] = rows;\n    const collection = catalog.collections.find(c => c.id === id);\n    if (collection && rows.length) {{\n      collection.coverage = 'base-complete';\n      collection.baseCount = rows.length;\n    }}\n  }});\n}})();\n'''


def main() -> int:
    imported = build()
    if not imported:
        print("No checklists were generated; leaving current catalog-imported.js unchanged.", file=sys.stderr)
        return 1
    OUTPUT.write_text(render(imported), encoding="utf-8")
    print(f"Wrote {OUTPUT.name} with {sum(map(len, imported.values()))} rows across {len(imported)} sets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
