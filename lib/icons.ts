import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'icon-registry.json');
const NEW_ICON_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/luisson10/pixelarticons/master/svg';
const GITHUB_API_URL = 'https://api.github.com/repos/luisson10/pixelarticons/contents/svg';

export interface IconEntry {
  name: string;
  addedAt: string;
  isNew: boolean;
}

interface IconRegistry {
  [iconName: string]: string; // ISO date string of first seen
}

function readRegistry(): IconRegistry {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    }
  } catch {
    // corrupt registry — start fresh
  }
  return {};
}

function writeRegistry(registry: IconRegistry) {
  try {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  } catch {
    // non-fatal: read-only FS in some environments
  }
}

export async function getIconList(): Promise<IconEntry[]> {
  // 1. Try to read SVGs from local /svg directory first
  let iconNames: string[] = [];

  const svgDir = path.join(process.cwd(), 'svg');
  try {
    const files = fs.readdirSync(svgDir);
    iconNames = files
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace('.svg', ''))
      .sort();
  } catch {
    // local dir missing or empty — fall through to GitHub API
  }

  // 2. If local is empty, fetch from GitHub API
  if (iconNames.length === 0) {
    try {
      const res = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 3600 }, // cache for 1 hour
      });
      if (res.ok) {
        const data: { name: string; type: string }[] = await res.json();
        iconNames = data
          .filter((f) => f.type === 'file' && f.name.endsWith('.svg'))
          .map((f) => f.name.replace('.svg', ''))
          .sort();
      }
    } catch {
      // GitHub API unavailable — return empty
    }
  }

  // 3. Update registry: stamp any new icons with today's date
  const registry = readRegistry();
  const now = new Date();
  let changed = false;

  for (const name of iconNames) {
    if (!registry[name]) {
      registry[name] = now.toISOString();
      changed = true;
    }
  }

  if (changed) writeRegistry(registry);

  // 4. Return entries with isNew flag
  return iconNames.map((name) => {
    const addedAt = registry[name] ?? now.toISOString();
    const age = now.getTime() - new Date(addedAt).getTime();
    return { name, addedAt, isNew: age < NEW_ICON_TTL_MS };
  });
}

export function getIconUrl(name: string): string {
  // If local SVG exists, serve via API proxy; otherwise use GitHub raw
  const svgDir = path.join(process.cwd(), 'svg');
  try {
    const files = fs.readdirSync(svgDir);
    if (files.includes(`${name}.svg`)) {
      return `/api/icons/${name}`;
    }
  } catch {
    // fall through
  }
  return `${GITHUB_RAW_BASE}/${name}.svg`;
}
