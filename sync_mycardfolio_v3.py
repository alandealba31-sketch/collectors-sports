#!/usr/bin/env python3
"""Exact-year safety wrapper for the high-volume MyCardfolio sync."""
import asyncio
import sync_mycardfolio_v2 as sync


def exact_years(desired: str, available: list[str]) -> list[str]:
    """Never substitute a neighboring card year unless a future config explicitly opts in."""
    return [desired] if desired in available else []


sync.candidate_years = exact_years

if __name__ == "__main__":
    asyncio.run(sync.main_async())
