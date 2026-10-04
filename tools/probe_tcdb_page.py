#!/usr/bin/env python3
"""Probe TCDB URL variants and record only sanitized structural metadata."""
from __future__ import annotations

import json
import re
import time
import urllib.robotparser
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "data" / "tcdb-probe.json"
USER_AGENT = "CollectorsSportsCatalog/1.0 (+https://github.com/alandealba31-sketch/collectors-sports)"
SID = "587629"
CANDIDATES = [
    f"https://www.tcdb.com/Checklist.cfm/sid/{SID}?PageIndex=1",
    f"https://www.tcdb.com/Checklist.cfm/sid/{SID}/",
    f"https://www.tcdb.com/Checklist.cfm/sid/{SID}/2026-Topps-Chrome-Tennis",
    f"https://www.tcdb.com/Checklist.cfm/sid/{SID}/2026-Topps-Chrome-Tennis?PageIndex=1",
    f"https://www.tcdb.com/ViewSet.cfm/sid/{SID}",
    f"https://www.tcdb.com/ViewCollection.cfm/sid/{SID}",
]


def clean(value: str, limit: int = 300) -> str:
    return re.sub(r"\s+", " ", value or "").strip()[:limit]


def summarize(url: str, rp: urllib.robotparser.RobotFileParser) -> dict:
    item = {"requestedUrl": url, "robotsAllowed": bool(rp.can_fetch(USER_AGENT, url))}
    if not item["robotsAllowed"]:
        return item
    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept-Language": "en-US,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout=25,
            allow_redirects=True,
        )
        item.update({
            "httpStatus": response.status_code,
            "finalUrl": response.url,
            "contentType": response.headers.get("content-type", ""),
            "htmlLength": len(response.text),
        })
        soup = BeautifulSoup(response.text, "html.parser")
        item["title"] = clean(soup.title.get_text(" ", strip=True) if soup.title else "", 180)
        visible = clean(soup.get_text(" ", strip=True), 1800).lower()
        markers = ["cloudflare", "captcha", "access denied", "verify you are human", "just a moment", "forbidden"]
        item["challengeMarkers"] = [x for x in markers if x in visible]
        anchors = list(soup.find_all("a", href=True))
        item["anchorCount"] = len(anchors)
        cardish = []
        for a in anchors:
            href = str(a.get("href") or "")
            if any(token in href.lower() for token in ("viewcard", "card", "sid/", "checklist")):
                cardish.append({"text": clean(a.get_text(" ", strip=True), 100), "href": clean(href, 240)})
        item["cardishLinks"] = cardish[:30]
        rows = []
        for tr in soup.find_all("tr")[:80]:
            text = clean(tr.get_text(" | ", strip=True), 320)
            links = [clean(str(a.get("href") or ""), 220) for a in tr.find_all("a", href=True)[:6]]
            if text or links:
                rows.append({"text": text, "links": links})
            if len(rows) >= 20:
                break
        item["tableRows"] = rows
    except Exception as exc:
        item["error"] = clean(str(exc), 500)
    return item


def main() -> None:
    robots_url = "https://www.tcdb.com/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    robots_status = None
    try:
        r = requests.get(robots_url, headers={"User-Agent": USER_AGENT}, timeout=20)
        robots_status = r.status_code
        rp.parse(r.text.splitlines())
    except Exception:
        rp.disallow_all = True
    report = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sid": SID,
        "robotsStatus": robots_status,
        "candidates": [summarize(url, rp) for url in CANDIDATES],
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
