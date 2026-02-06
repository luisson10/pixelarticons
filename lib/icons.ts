import fs from 'fs';
import path from 'path';

export function getIconList(): string[] {
  const svgDir = path.join(process.cwd(), 'svg');
  const files = fs.readdirSync(svgDir);
  
  return files
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''))
    .sort();
}
