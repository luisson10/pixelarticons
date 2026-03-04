"""
Seed the icon registry by fetching all icons from GitHub API and stamping
them as "old" (30 days ago) so they won't show a NEW badge.
Only icons added after this baseline will appear as new.
"""

import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone

GITHUB_API_URL = "https://api.github.com/repos/luisson10/pixelarticons/contents/svg"
ROOT = os.path.join(os.path.dirname(__file__), "..")
REGISTRY_PATH = os.path.join(ROOT, "icon-registry.json")

old_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

print("Fetching icon list from GitHub API...")
req = urllib.request.Request(
    GITHUB_API_URL,
    headers={"Accept": "application/vnd.github+json", "User-Agent": "seed-registry"},
)
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())

all_icons = sorted(
    f["name"].replace(".svg", "")
    for f in data
    if f.get("type") == "file" and f["name"].endswith(".svg")
)
print(f"Found {len(all_icons)} icons on GitHub.")

registry = {}
if os.path.exists(REGISTRY_PATH):
    try:
        with open(REGISTRY_PATH, "r") as f:
            registry = json.load(f)
        print(f"Loaded existing registry with {len(registry)} entries.")
    except Exception:
        print("Could not parse existing registry — starting fresh.")

seeded = 0
for name in all_icons:
    if name not in registry:
        registry[name] = old_date
        seeded += 1

with open(REGISTRY_PATH, "w") as f:
    json.dump(registry, f, indent=2)

print(f"Done. Seeded {seeded} new icons as 'old'. Registry saved to icon-registry.json.")
print(f"Total icons in registry: {len(registry)}")
