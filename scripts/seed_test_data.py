#!/usr/bin/env python3
"""
Seed script: creates test users, orgs, and uploads sample .originpkg assets
to verify Phase 1, 2, and 3 features.
"""
import io
import json
import os
import tarfile
import tempfile
import requests

BASE = "http://localhost:8000"

def make_bundle(name: str, version: str, asset_type: str, description: str, tags: list) -> bytes:
    """Create an in-memory .originpkg (tar.gz) with a hub-manifest.json"""
    manifest = {
        "name": name,
        "version": version,
        "type": asset_type,
        "description": description,
        "tags": tags,
        "author": "seed-script",
        "dependencies": [],
    }
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        data = json.dumps(manifest, indent=2).encode()
        info = tarfile.TarInfo(name="hub-manifest.json")
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
        # Add a dummy entrypoint file
        entry = f"# {name} v{version}\nprint('hello from {name}')".encode()
        ei = tarfile.TarInfo(name="main.py")
        ei.size = len(entry)
        tar.addfile(ei, io.BytesIO(entry))
    buf.seek(0)
    return buf.read()


def register(username, email, password="Secret123!"):
    r = requests.post(f"{BASE}/auth/register", json={"username": username, "email": email, "password": password})
    if r.status_code == 201:
        data = r.json()
        print(f"  ✅ Registered {username} → api_key: {data['api_key'][:16]}...")
        return data["api_key"]
    elif r.status_code == 409:
        # Already exists, login
        r2 = requests.post(f"{BASE}/auth/login", json={"username": username, "password": password})
        if r2.status_code == 200:
            data = r2.json()
            print(f"  ℹ️  {username} already exists, logged in → api_key: {data['api_key'][:16]}...")
            return data["api_key"]
    print(f"  ❌ Register failed for {username}: {r.status_code} {r.text[:200]}")
    return None


def upload_asset(api_key, name, version, asset_type, description, tags):
    bundle = make_bundle(name, version, asset_type, description, tags)
    headers = {"Authorization": f"Bearer {api_key}"}
    files = {"file": (f"{name}-{version}.originpkg", bundle, "application/gzip")}
    r = requests.post(f"{BASE}/assets/{name}/{version}", headers=headers, files=files)
    if r.status_code == 201:
        print(f"  ✅ Uploaded {name}@{version} ({asset_type})")
        return r.json()
    else:
        print(f"  ❌ Upload failed {name}@{version}: {r.status_code} {r.text[:200]}")
        return None


def download_asset(name, version):
    r = requests.get(f"{BASE}/assets/{name}/{version}/bundle", stream=True)
    if r.status_code == 200:
        size = len(r.content)
        print(f"  ✅ Downloaded {name}@{version} ({size} bytes) — download_count +1")
        return True
    print(f"  ❌ Download failed {name}@{version}: {r.status_code}")
    return False


def yank_version(api_key, name, version):
    headers = {"Authorization": f"Bearer {api_key}"}
    r = requests.patch(f"{BASE}/assets/{name}/{version}/yank", headers=headers)
    if r.status_code == 200:
        data = r.json()
        state = "YANKED" if data["yanked"] else "RESTORED"
        print(f"  ✅ {state} {name}@{version}")
        return data
    print(f"  ❌ Yank failed: {r.status_code} {r.text[:200]}")
    return None


def check_download_count(name):
    r = requests.get(f"{BASE}/assets/{name}")
    if r.status_code == 200:
        data = r.json()
        print(f"  📊 {name} download_count = {data.get('download_count', 0)}")
        return data.get("download_count", 0)
    return 0


def create_org(api_key, slug, display_name):
    headers = {"Authorization": f"Bearer {api_key}"}
    r = requests.post(f"{BASE}/orgs", headers=headers, json={"slug": slug, "display_name": display_name})
    if r.status_code in (200, 201):
        print(f"  ✅ Created org: {slug}")
        return r.json()
    print(f"  ❌ Org creation failed: {r.status_code} {r.text[:200]}")
    return None


def search_assets(q=None):
    params = {}
    if q:
        params["q"] = q
    r = requests.get(f"{BASE}/assets", params=params)
    if r.status_code == 200:
        data = r.json()
        print(f"  🔍 search('{q}') → {data['total']} assets")
        for item in data["items"]:
            print(f"     - {item['name']} [{item['type']}] downloads={item['download_count']}")
        return data
    return None


if __name__ == "__main__":
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  Origin Hub Registry — Feature Verification Seed")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    # ── Phase 1: User Registration & API Key ──────────────
    print("📋 PHASE 1: User Registration & Asset Management")
    print("─────────────────────────────────────────────────")
    alice_key = register("alice", "alice@example.com")
    bob_key   = register("bob",   "bob@example.com")

    if not alice_key or not bob_key:
        print("⛔ Could not get API keys. Aborting.")
        exit(1)

    # Upload multiple assets with multiple versions
    assets_to_upload = [
        ("weather-agent",       "1.0.0", "agent",       "Fetches current weather for any city",     ["weather", "api", "agent"]),
        ("weather-agent",       "1.1.0", "agent",       "Fetches current weather for any city",     ["weather", "api", "agent"]),
        ("code-reviewer",       "1.0.0", "skill",       "Reviews code and suggests improvements",   ["code", "review", "skill"]),
        ("code-reviewer",       "2.0.0", "skill",       "Reviews code and suggests improvements",   ["code", "review", "skill"]),
        ("csv-summarizer",      "1.0.0", "workflow",    "Summarizes CSV data files with AI",        ["csv", "data", "workflow"]),
        ("slack-notifier",      "1.0.0", "extension",   "Sends Slack messages from agents",         ["slack", "notifications"]),
        ("playwright-tester",   "1.0.0", "skill",       "Automated browser testing with AI",        ["testing", "playwright", "browser"]),
        ("readme-generator",    "1.0.0", "instruction", "Generates README files from code",         ["docs", "readme", "generation"]),
    ]

    for name, version, atype, desc, tags in assets_to_upload:
        upload_asset(alice_key, name, version, atype, desc, tags)

    # Bob uploads one too
    upload_asset(bob_key, "sql-query-builder", "1.0.0", "workflow", "Builds SQL queries from natural language", ["sql", "database", "nlp"])

    print()

    # ── Phase 1: Search & Discovery ──────────────────────
    print("🔍 PHASE 1: Search & Discovery")
    print("─────────────────────────────────────────────────")
    search_assets()
    search_assets(q="code")
    search_assets(q="weather")

    print()

    # ── Phase 1: Download ─────────────────────────────────
    print("⬇️  PHASE 1: Download (increments download_count)")
    print("─────────────────────────────────────────────────")
    download_asset("weather-agent", "1.1.0")
    download_asset("weather-agent", "1.1.0")
    download_asset("weather-agent", "1.1.0")
    download_asset("code-reviewer", "2.0.0")
    download_asset("code-reviewer", "2.0.0")
    download_asset("slack-notifier", "1.0.0")

    print()

    # ── Phase 3: Metrics (download_count) ─────────────────
    print("📊 PHASE 3: Download Count Metrics")
    print("─────────────────────────────────────────────────")
    check_download_count("weather-agent")
    check_download_count("code-reviewer")
    check_download_count("slack-notifier")
    check_download_count("sql-query-builder")

    print()

    # ── Phase 3: Version Yanking ──────────────────────────
    print("🚫 PHASE 3: Version Yanking (Deprecation)")
    print("─────────────────────────────────────────────────")
    yank_version(alice_key, "weather-agent", "1.0.0")   # Yank the old version
    yank_version(alice_key, "code-reviewer", "1.0.0")   # Yank old version

    # Verify yanked version can't be downloaded
    print("\n  Attempting to download yanked version...")
    r = requests.get(f"{BASE}/assets/weather-agent/1.0.0/bundle")
    if r.status_code == 410:
        print(f"  ✅ Correct! Got 410 Gone for yanked version")
    else:
        print(f"  ❌ Unexpected status: {r.status_code}")

    print()

    # ── Final summary ─────────────────────────────────────
    print("🎉 FINAL STATE (all assets in registry)")
    print("─────────────────────────────────────────────────")
    search_assets()
    print("\n✅ Seed complete! Open http://localhost:5173 to see the UI.\n")
