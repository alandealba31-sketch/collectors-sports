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
    tokens = set(text.split())

    # Configurable hard exclusions. This is intentionally conservative: when the
    # structured source cannot identify the exact product family, the collection
    # stays pending instead of being populated from a similar product.
    forbidden = [sync.norm(x) for x in cfg.get("forbidden", []) if sync.norm(x)]
    for value in forbidden:
        if value in text or all(token in tokens for token in value.split()):
            return False

    collection_id = cfg.get("collectionId", "")
    # Update Series and Chrome Update are distinct products. Never cross-match them.
    if collection_id == "topps-update-baseball-2026" and "chrome" in tokens:
        return False

    # Team Sets and Collector Tins are different physical products even when the
    # club/country name is identical.
    if "team-set" in collection_id and any(x in text for x in ("collector tin", "collector tins")):
        return False
    if "collector-tin" in collection_id and "team set" in text:
        return False

    return True


sync.candidate_years = exact_years
sync.product_is_strict_match = strict_product_family

if __name__ == "__main__":
    asyncio.run(sync.main_async())
