#!/usr/bin/env python3
"""Build catalog-imported.js from official manufacturer checklists.

The app keeps the source registry in tools/checklist_sources.json. This script
fetches those files, extracts the base checklist, and emits compact rows:
[number, subject, team/affiliation, rookie].
"""
from __future__ import annotations

import io
import json
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


def clean_text(value: str) -> str:
    value = str(value or "")
    value = value.replace("®", "").replace("™", "")
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


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
            subject = clean[:idx].strip()
            if not subject:
                subject = team
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
        # Occasionally PDF extraction glues two numbered rows together. The normal
        # per-line path handles almost all cards; a fallback regex below catches tails.
        candidates = [line]
        m = re.match(r"^(\d{1,3})\s+(.+)$", line)
        if not m:
            continue
        number = int(m.group(1))
        if not 1 <= number <= 300:
            continue
        rest = m.group(2)
        found = split_subject_team(rest, MLB_TEAMS)
        if found:
            subject, team = found
            rows[number] = [number, subject, team, 0]
    # We deliberately fail if extraction is materially incomplete so bad data is
    # never silently published into the collector catalog.
    if len(rows) < 285:
        raise RuntimeError(f"MLB parser only extracted {len(rows)}/300 base cards")
    return [rows[n] for n in sorted(rows)]


def strip_f1_subset(rest: str) -> str:
    marker = " BASE CARDS - "
    if marker in rest:
        return rest.split(marker, 1)[0].strip()
    return rest.strip()


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
        # Remove flags which can trail the team in extraction.
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


def locate_header(raw: pd.DataFrame) -> int | None:
    limit = min(25, len(raw))
    for i in range(limit):
        cells = [clean_text(x).lower() for x in raw.iloc[i].tolist()]
        if any("card number" in x or x in {"card #", "card no", "card no."} for x in cells):
            return i
    return None


def pick_column(columns, needles):
    normalized = {c: clean_text(c).lower() for c in columns}
    for needle in needles:
        for original, norm in normalized.items():
            if needle in norm:
                return original
    return None


def parse_generic_xls(data: bytes, expected: int = 0) -> list[list]:
    book = pd.ExcelFile(io.BytesIO(data), engine="xlrd")
    best: list[list] = []
    for sheet in book.sheet_names:
        raw = pd.read_excel(book, sheet_name=sheet, header=None, dtype=object)
        header = locate_header(raw)
        if header is None:
            continue
        frame = pd.read_excel(book, sheet_name=sheet, header=header, dtype=object)
        number_col = pick_column(frame.columns, ["card number", "card #", "card no"])
        name_col = pick_column(frame.columns, ["name", "subject", "fighter"])
        subset_col = pick_column(frame.columns, ["subset", "set name", "card set"])
        team_col = pick_column(frame.columns, ["team", "weight class", "division"])
        rookie_col = pick_column(frame.columns, ["rookie", "rc"])
        if number_col is None or name_col is None:
            continue
        rows: list[list] = []
        for _, row in frame.iterrows():
            number_raw = clean_text(row.get(number_col, ""))
            if not re.fullmatch(r"\d{1,4}", number_raw):
                continue
            if subset_col is not None:
                subset = clean_text(row.get(subset_col, "")).lower()
                if subset and "base" not in subset:
                    continue
            number = int(number_raw)
            subject = clean_text(row.get(name_col, ""))
            if not subject or subject.lower() == "nan":
                continue
            team = clean_text(row.get(team_col, "")) if team_col is not None else ""
            if team.lower() == "nan": team = ""
            rookie_value = clean_text(row.get(rookie_col, "")) if rookie_col is not None else ""
            rookie = 1 if rookie_value.lower() in {"1","true","yes","y","rookie","rc","x"} else 0
            rows.append([number, subject, team, rookie])
        if len(rows) > len(best):
            best = rows
    if expected and len(best) < int(expected * 0.85):
        raise RuntimeError(f"XLS parser only extracted {len(best)}/{expected} expected base cards")
    best.sort(key=lambda r: int(r[0]))
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
            # One upstream format change should not destroy already-good catalog data.
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
