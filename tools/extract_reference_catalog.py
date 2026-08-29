from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://guiafarmaco.erastogaertner.com.br"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sano-app" / "frontend" / "src" / "data" / "referenceCatalog.json"

session = requests.Session()
session.headers.update({"User-Agent": "SANO-local-reference-import/1.0"})


def clean(value: str) -> str:
    return re.sub(r"\\s+", " ", value or "").strip()


def page_links(path: str) -> list[dict[str, str]]:
    response = session.get(urljoin(BASE_URL, path), timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    result = []
    seen = set()
    for link in soup.find_all("a", href=True):
        name = clean(link.get_text(" "))
        href = urljoin(BASE_URL, link["href"])
        if not name or href in seen or href.rstrip("/") in {BASE_URL + path.rstrip("/")}:
            continue
        if href.startswith(BASE_URL) and href.rstrip("/").startswith(BASE_URL + path.rstrip("/") + "/"):
            seen.add(href)
            result.append({"name": name, "url": href})
    return result


def detail(url: str) -> dict[str, str]:
    response = session.get(url, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    result: dict[str, str] = {}
    headings = soup.find_all(["h3", "h4"])
    for heading in headings:
        label = clean(heading.get_text(" "))
        if not label:
            continue
        values = []
        sibling = heading.find_next_sibling()
        while sibling and sibling.name not in {"h3", "h4"}:
            text = clean(sibling.get_text(" "))
            if text:
                values.append(text)
            sibling = sibling.find_next_sibling()
        if values:
            result[label] = "\n".join(dict.fromkeys(values))
    return result


def collect(path: str) -> list[dict]:
    entries = page_links(path)
    output = []
    for index, entry in enumerate(entries, start=1):
        try:
            output.append({**entry, "fields": detail(entry["url"])})
            print(f"{index}/{len(entries)} {entry['name']}")
        except requests.RequestException as exc:
            print(f"SKIP {entry['name']}: {exc}")
        time.sleep(0.08)
    return output


catalog = {
    "source": BASE_URL,
    "sourceConsultedAt": "2026-08-31",
    "farmacoterapeutico": {
        "source": f"{BASE_URL}/farmacoterapeutico/medicamentos",
        "items": collect("/farmacoterapeutico/medicamentos"),
    },
    "antineoplasicos": {
        "source": f"{BASE_URL}/antineoplasicos/protocolos",
        "items": collect("/antineoplasicos/protocolos"),
    },
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Wrote {OUTPUT}")
