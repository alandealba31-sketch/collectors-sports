#!/usr/bin/env python3
"""Small diagnostic for the TCDB checklist HTML seen by GitHub Actions.

Writes only structural/sanitized metadata to data/tcdb-probe.json. It does not
persist the page body or scrape card images.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.robotparser
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "data" / "tcdb-probe.json"
USER_AGENT = "CollectorsSportsCatalog/1.0 (+https://github.com/alandealba31-sketch/collectors-sports)"
SID = "587629"
URL = f"https://www.tcdb.com/Checklist.cfm/sid/{SID}?PageIndex=1"


def clean(value: str, limit: int = 300) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value[:limit]


def href_record(a) -> dict:
    href = str(a.get("href") or "")
    return {
        "text": clean(a.get_text(" ", strip=True), 120),
        "href": clean(href, 260),
    }


def main() -> None:
    report = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sid": SID,
        "requestedUrl": URL,
        "userAgent": USER_AGENT,
    }

    robots_url = "https://www.tcdb.com/robots.txt"
    try:
        robots_response = requests.get(
            robots_url,
            headers={"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.8"},
            timeout=20,
        )
        report["robotsStatus"] = robots_response.status_code
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.parse(robots_response.text.splitlines())
        report["robotsAllowed"] = bool(rp.can_fetch(USER_AGENT, URL))
    except Exception as exc:
        report["robotsError"] = clean(str(exc), 500)
        report["robotsAllowed"] = False

    if not report.get("robotsAllowed"):
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return

    try:
        response = requests.get(
            URL,
            headers={
                "User-Agent": USER_AGENT,
                "Accept-Language": "en-US,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout=25,
            allow_redirects=True,
        )
        report["httpStatus"] = response.status_code
        report["finalUrl"] = response.url
        report["contentType"] = response.headers.get("content-type", "")
        report["htmlLength"] = len(response.text)
        html = response.text
        soup = BeautifulSoup(html, "html.parser")
        report["title"] = clean(soup.title.get_text(" ", strip=True) if soup.title else "", 200)

        visible = clean(soup.get_text(" ", strip=True), 2000).lower()
        challenge_terms = [
            "cloudflare", "captcha", "access denied", "verify you are human",
            "just a moment", "enable javascript", "rate limit", "forbidden",
            "sign in", "login",
        ]
        report["challengeMarkers"] = [term for term in challenge_terms if term in visible]

        anchors = list(soup.find_all("a", href=True))
        report["anchorCount"] = len(anchors)
        buckets = {}
        for label, pattern in [
            ("viewCard", "ViewCard"),
            ("card", "Card"),
            ("checklist", "Checklist"),
            ("sid", f"/sid/{SID}"),
            ("profile", "Profile"),
        ]:
            matched = [a for a in anchors if pattern.lower() in str(a.get("href") or "").lower()]
            buckets[label] = {
                "count": len(matched),
                "samples": [href_record(a) for a in matched[:20]],
            }
        report["anchorBuckets"] = buckets
        report["anchorSamples"] = [href_record(a) for a in anchors[:30]]

        rows = []
        for tr in soup.find_all("tr")[:80]:
            row_anchors = [href_record(a) for a in tr.find_all("a", href=True)[:8]]
            text = clean(tr.get_text(" | ", strip=True), 350)
            if text or row_anchors:
                rows.append({"text": text, "links": row_anchors})
            if len(rows) >= 25:
                break
        report["tableRowSamples"] = rows

        class_counts = {}
        for tag in soup.find_all(True):
            for cls in tag.get("class") or []:
                class_counts[str(cls)] = class_counts.get(str(cls), 0) + 1
        report["topClasses"] = sorted(class_counts.items(), key=lambda x: (-x[1], x[0]))[:30]

        id_samples = []
        for tag in soup.find_all(id=True)[:40]:
            id_samples.append({"tag": tag.name, "id": clean(str(tag.get("id")), 100)})
        report["idSamples"] = id_samples
    except Exception as exc:
        report["requestError"] = clean(str(exc), 700)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
