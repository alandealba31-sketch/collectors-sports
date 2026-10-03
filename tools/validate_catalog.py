#!/usr/bin/env python3
"""Validate generated official checklist data, failing closed except for documented parser gaps."""
from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/'tools'/'checklist_sources.json';CATALOG=ROOT/'catalog-imported.js'
PLACEHOLDERS={'','tbd','unknown','n/a','na','pending','to be determined'}

def load_imported():
    text=CATALOG.read_text(encoding='utf-8');m=re.search(r'\bconst imported = (\{.*?\});\n\s*Object\.entries',text,re.S)
    if not m:raise RuntimeError('Could not locate generated imported catalog payload')
    return json.loads(m.group(1))

def main():
    sources=json.loads(SOURCES.read_text(encoding='utf-8'));imported=load_imported();errors=[];warnings=[];verified_total=0
    for source in sources:
        sid=source['id'];expected=int(source.get('expected_base_count',0));partial=bool(source.get('allow_partial_verified',False));allow_missing=bool(source.get('allow_parser_failure',False));minimum=int(source.get('minimum_verified_count',expected if expected else 1));rows=imported.get(sid)
        if rows is None:
            if allow_missing:warnings.append(f'{sid}: official parser did not resolve this layout; preserved specialized/manual catalog module')
            else:errors.append(f'{sid}: missing from generated catalog')
            continue
        numbers=[row[0] for row in rows if isinstance(row,list) and row]
        if len(numbers)!=len(rows) or len(numbers)!=len(set(numbers)):errors.append(f'{sid}: malformed or duplicate card numbers')
        placeholders=[];verified=[]
        for row in rows:
            subject=str(row[1]).strip().lower() if len(row)>1 else ''
            (placeholders if subject in PLACEHOLDERS else verified).append(row)
        verified_total+=len(verified)
        if partial:
            if len(verified)<minimum:errors.append(f'{sid}: only {len(verified)} verified rows; minimum is {minimum}')
            if expected and any(not 1<=int(row[0])<=expected for row in verified):errors.append(f'{sid}: verified card number outside 1..{expected}')
            numeric={int(n) for n in numbers if str(n).isdigit()};missing=sorted(set(range(1,expected+1))-numeric) if expected else []
            if placeholders:warnings.append(f'{sid}: {len(placeholders)} official placeholder row(s) hidden at runtime')
            if missing:warnings.append(f'{sid}: partial official parser is missing {len(missing)} number(s): {missing[:12]}')
        else:
            if placeholders:errors.append(f'{sid}: placeholder subjects at cards {[r[0] for r in placeholders[:12]]}')
            if expected and len(rows)!=expected:errors.append(f'{sid}: got {len(rows)} rows, expected exactly {expected}')
            if expected and sorted(numbers)!=list(range(1,expected+1)):errors.append(f'{sid}: card numbers are not complete 1..{expected}')
    for warning in warnings:print('WARNING:',warning)
    if errors:raise SystemExit('Catalog integrity validation failed:\n- '+'\n- '.join(errors))
    print(f'Catalog integrity OK: {len(sources)} registered sources, {verified_total} verified generated rows, {len(warnings)} documented warning(s)')
    return 0
if __name__=='__main__':raise SystemExit(main())
