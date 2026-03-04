import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/luisson10/pixelarticons/master/svg';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // 1. Try local file first
  try {
    const filePath = join(process.cwd(), 'svg', `${name}.svg`);
    const svgContent = await readFile(filePath, 'utf-8');
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // not found locally — proxy from GitHub
  }

  // 2. Proxy from GitHub raw
  try {
    const res = await fetch(`${GITHUB_RAW_BASE}/${name}.svg`);
    if (!res.ok) throw new Error('GitHub fetch failed');
    const svgContent = await res.text();
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Icon not found', { status: 404 });
  }
}
