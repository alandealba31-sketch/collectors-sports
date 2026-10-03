#!/usr/bin/env python3
"""Safety-first high-volume structured sync.

Before each sync, purge any previously generated collection whose persisted source year
does not equal the configured card year. This cleans historical neighbor-year matches
created by older runners, then delegates to the exact-year/product-family guarded v3.
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import sync_mycardfolio_v3 as guarded

sync = guarded.sync


def cleanup_inherited_wrong_years() -> None:
    config = json.loads(sync.CONFIG.read_text(encoding="utf-8"))
    catalog = sync.extract_generated(sync.CATALOG_OUT, r"const payload=(\{.*?\});\n const key=")
    images = sync.extract_generated(sync.IMAGES_OUT, r"Object\.assign\(r\.cards,(\{.*\})\);")
    state = sync.load_json(sync.STATE, {"version": 2, "products": {}})
    products_state = state.setdefault("products", {})
    cleaned = []

    for cfg in config.get("products", []):
        cid = cfg.get("collectionId", "")
        desired_year = str(cfg.get("year", ""))
        ps = products_state.get(cid) or {}
        source_year = str(ps.get("yearUsed", ""))
        if not cid or not source_year or source_year == desired_year:
            continue
        removed_rows, removed_images = sync.purge_collection(cid, catalog, images, ps)
        cleaned.append(
            {
                "collectionId": cid,
                "configuredYear": desired_year,
                "removedSourceYear": source_year,
                "rowsRemoved": removed_rows,
                "imagesRemoved": removed_images,
            }
        )

    if not cleaned:
        print("Historical year audit: no inherited wrong-year collections found.", flush=True)
        return

    sync.CATALOG_OUT.write_text(sync.render_catalog(catalog), encoding="utf-8")
    sync.IMAGES_OUT.write_text(sync.render_images(images), encoding="utf-8")
    sync.STATE.parent.mkdir(parents=True, exist_ok=True)
    sync.STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Historical year audit purged:", json.dumps(cleaned, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    cleanup_inherited_wrong_years()
    asyncio.run(sync.main_async())
