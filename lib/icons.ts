import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'icon-registry.json');
const NEW_ICON_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

interface IconRegistry {
  [iconName: string]: string; // ISO date string of when it was first seen
}

function readRegistry(): IconRegistry {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    }
  } catch {
    // If registry is corrupt, start fresh
  }
  return {};
}

function writeRegistry(registry: IconRegistry) {
  try {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  } catch {
    // Non-fatal: can't write registry (e.g. read-only FS)
  }
}

export interface IconEntry {
  name: string;
  addedAt: string; // ISO date string
  isNew: boolean;
}

export function getIconList(): IconEntry[] {
  const svgDir = path.join(process.cwd(), 'svg');
  const files = fs.readdirSync(svgDir);

  const iconNames = files
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.replace('.svg', ''))
    .sort();

  const registry = readRegistry();
  const now = new Date();
  let registryChanged = false;

  for (const name of iconNames) {
    if (!registry[name]) {
      registry[name] = now.toISOString();
      registryChanged = true;
    }
  }

  if (registryChanged) {
    writeRegistry(registry);
  }

  return iconNames.map((name) => {
    const addedAt = registry[name] ?? now.toISOString();
    const age = now.getTime() - new Date(addedAt).getTime();
    return {
      name,
      addedAt,
      isNew: age < NEW_ICON_TTL_MS,
    };
  });
}
