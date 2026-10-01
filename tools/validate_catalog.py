#!/usr/bin/env python3
"""Fail closed when generated official checklist data is incomplete or unsafe."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "tools" / "checklist_sources.json"
CATALOG = ROOT / "catalog-imported.js"
PLACEHOLDERS = {"", "tbd", "unknown", "n/a", "na", "pending", "to be determined"}


def load_imported() -> dict[str, list[list]]:
    text = CATALOG.read_text(encoding="utf-8")
    match = re.search(r"\bconst imported = (\{.*?\});\n\s*Object\.entries", text, re.S)
    if not match:
        raise RuntimeError("Could not locate generated imported catalog payload")
    return json.loads(match.group(1))


def main() -> int:
    sources = json.loads(SOURCES.read_text(encoding="utf-8"))
    imported = load_imported()
    errors: list[str] = []
    verified_total = 0

    for source in sources:
        sid = source["id"]
        expected = int(source.get("expected_base_count", 0))
        partial = bool(source.get("allow_partial_verified", False))
        minimum = int(source.get("minimum_verified_count", expected if expected else 1))
        rows = imported.get(sid)
        if rows is None:
            errors.append(f"{sid}: missing from generated catalog")
            continue

        numbers = [row[0] for row in rows if isinstance(row, list) and row]
        if len(numbers) != len(rows) or len(numbers) != len(set(numbers)):
            errors.append(f"{sid}: malformed or duplicate card numbers")

        placeholders = []
        verified = []
        for row in rows:
            subject = str(row[1]).strip().lower() if len(row) > 1 else ""
            if subject in PLACEHOLDERS:
                placeholders.append(row[0] if row else "?")
            else:
                verified.append(row)
        verified_total += len(verified)

        if partial:
            if len(verified) < minimum:
                errors.append(f"{sid}: only {len(verified)} verified rows; minimum is {minimum}")
            if expected and any(not 1 <= int(row[0]) <= expected for row in verified):
                errors.append(f"{sid}: verified card number outside 1..{expected}")
            if placeholders:
                print(f"Note: {sid} is provisional; runtime guard will hide {len(placeholders)} official placeholder row(s)")
        else:
            if placeholders:
                errors.append(f"{sid}: placeholder subjects at cards {placeholders[:12]}")
            if expected and len(rows) != expected:
                errors.append(f"{sid}: got {len(rows)} rows, expected exactly {expected}")
            if expected and sorted(numbers) != list(range(1, expected + 1)):
                errors.append(f"{sid}: card numbers are not the complete 1..{expected} sequence")

    if errors:
        raise SystemExit("Catalog integrity validation failed:\n- " + "\n- ".join(errors))

    print(f"Catalog integrity OK: {len(sources)} registered sets, {verified_total} verified rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
