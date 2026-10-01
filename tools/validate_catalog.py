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

    for source in sources:
        sid = source["id"]
        expected = int(source.get("expected_base_count", 0))
        rows = imported.get(sid)
        if rows is None:
            errors.append(f"{sid}: missing from generated catalog")
            continue
        if expected and len(rows) != expected:
            errors.append(f"{sid}: got {len(rows)} rows, expected exactly {expected}")

        numbers = [row[0] for row in rows if isinstance(row, list) and row]
        if len(numbers) != len(rows) or len(numbers) != len(set(numbers)):
            errors.append(f"{sid}: malformed or duplicate card numbers")
        if expected and sorted(numbers) != list(range(1, expected + 1)):
            errors.append(f"{sid}: card numbers are not the complete 1..{expected} sequence")

        bad = []
        for row in rows:
            subject = str(row[1]).strip().lower() if len(row) > 1 else ""
            if subject in PLACEHOLDERS:
                bad.append(row[0] if row else "?")
        if bad:
            errors.append(f"{sid}: placeholder subjects at cards {bad[:12]}")

    extra = sorted(set(imported) - {s["id"] for s in sources})
    if extra:
        print(f"Note: generated catalog contains {len(extra)} unregistered set(s): {', '.join(extra)}")

    if errors:
        raise SystemExit("Catalog integrity validation failed:\n- " + "\n- ".join(errors))

    print(f"Catalog integrity OK: {len(sources)} registered sets, {sum(len(imported[s['id']]) for s in sources)} verified rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
