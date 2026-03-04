/**
 * Seed the icon registry.
 *
 * Usage:
 *   node scripts/seed-registry.mjs           → stamps ALL icons as "old" (30 days ago)
 *   node scripts/seed-registry.mjs --new abc def  → stamps specific icons as "today"
 *
 * Run this after a sync to mark newly added icons as new.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'icon-registry.json');
const SVG_DIR = path.join(ROOT, 'svg');

const OLD_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const NOW = new Date().toISOString();

// Parse --new flag
const args = process.argv.slice(2);
const newFlagIdx = args.indexOf('--new');
const explicitNew = newFlagIdx !== -1 ? args.slice(newFlagIdx + 1) : [];

// Read existing registry (or start fresh)
let registry = {};
if (fs.existsSync(REGISTRY_PATH)) {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

// Read all SVG names
const allIcons = fs
  .readdirSync(SVG_DIR)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.replace('.svg', ''));

let added = 0;
let markedNew = 0;

for (const name of allIcons) {
  if (explicitNew.includes(name)) {
    // Force mark as new
    registry[name] = NOW;
    markedNew++;
  } else if (!registry[name]) {
    // Never seen before → treat as old baseline
    registry[name] = OLD_DATE;
    added++;
  }
  // Already in registry → leave untouched
}

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

console.log(`Registry updated:`);
console.log(`  ${allIcons.length} total icons`);
console.log(`  ${added} newly seeded as old`);
console.log(`  ${markedNew} explicitly marked as new`);
console.log(`  Written to ${REGISTRY_PATH}`);
