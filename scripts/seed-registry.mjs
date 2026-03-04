/**
 * Seed the icon registry.
 *
 * Fetches the full icon list from GitHub API and writes icon-registry.json,
 * stamping every existing icon 30 days in the past so none show as "new".
 * Future icons added after this baseline will be stamped with today's date
 * and will display the NEW badge for 2 weeks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'icon-registry.json');
const GITHUB_API_URL = 'https://api.github.com/repos/luisson10/pixelarticons/contents/svg';

const OLD_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

async function fetchAllIconNames() {
  console.log('Fetching icon list from GitHub API...');
  const res = await fetch(GITHUB_API_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
  const data = await res.json();
  return data
    .filter((f) => f.type === 'file' && f.name.endsWith('.svg'))
    .map((f) => f.name.replace('.svg', ''))
    .sort();
}

async function main() {
  const allIcons = await fetchAllIconNames();
  console.log(`Found ${allIcons.length} icons on GitHub.`);

  // Load existing registry so we don't overwrite already-tracked icons
  let registry = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
      console.log(`Loaded existing registry with ${Object.keys(registry).length} entries.`);
    } catch {
      console.warn('Could not parse existing registry — starting fresh.');
    }
  }

  let seeded = 0;
  for (const name of allIcons) {
    if (!registry[name]) {
      registry[name] = OLD_DATE;
      seeded++;
    }
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Done. Seeded ${seeded} icons as "old". Registry saved to icon-registry.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
