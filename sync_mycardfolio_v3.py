#!/usr/bin/env python3
"""Exact-year and product-family safety wrapper for the high-volume MyCardfolio sync."""
import asyncio
import sync_mycardfolio_v2 as sync


def exact_years(desired: str, available: list[str]) -> list[str]:
    """Never substitute a neighboring card year unless a future config explicitly opts in."""
    return [desired] if desired in available else []


_base_product_match = sync.product_is_strict_match


def strict_product_family(label: str, cfg: dict) -> bool:
    if not _base_product_match(label, cfg):
        return False
    text = sync.norm(label)
    collection_id = cfg.get("collectionId", "")
    # Update Series and Chrome Update are distinct products. Never cross-match them.
    if collection_id == "topps-update-baseball-2026" and "chrome" in text:
        return False
    return True


sync.candidate_years = exact_years
sync.product_is_strict_match = strict_product_family

if __name__ == "__main__":
    asyncio.run(sync.main_async())
