import baselineRegistry from '@/icon-registry.json';

// Git Trees API returns all files in one request — no pagination issues
const GITHUB_TREE_API = 'https://api.github.com/repos/luisson10/pixelarticons/git/trees/master?recursive=1';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/luisson10/pixelarticons/master/svg';
const NEW_ICON_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

export interface IconEntry {
  name: string;
  addedAt: string;
  isNew: boolean;
}

// Maps icon name → ISO date added. Icons not present here are "new" (added after last registry update).
const registry: Record<string, string> = baselineRegistry as Record<string, string>;

async function fetchAllIconNames(): Promise<string[]> {
  const res = await fetch(GITHUB_TREE_API, {
    headers: { Accept: 'application/vnd.github+json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data: { tree: { path: string; type: string }[] } = await res.json();
  return data.tree
    .filter((f) => f.type === 'blob' && f.path.startsWith('svg/') && f.path.endsWith('.svg'))
    .map((f) => f.path.replace('svg/', '').replace('.svg', ''))
    .sort();
}

export async function getIconList(): Promise<IconEntry[]> {
  const iconNames = await fetchAllIconNames();
  const now = new Date();

  return iconNames.map((name) => {
    // If not in registry baseline → it was added after the last sync → mark as NEW
    const addedAt = registry[name] ?? now.toISOString();
    const age = now.getTime() - new Date(addedAt).getTime();
    return { name, addedAt, isNew: age < NEW_ICON_TTL_MS };
  });
}

export function getIconUrl(name: string): string {
  return `${GITHUB_RAW_BASE}/${name}.svg`;
}
