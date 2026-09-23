import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

export const DIST = 'dist';
export const ORIGIN = 'http://localhost:4321';

export async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

export async function htmlPages(): Promise<{ path: string; route: string; root: HTMLElement; html: string }[]> {
  const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));
  return Promise.all(
    files.map(async (path) => {
      const html = await readFile(path, 'utf8');
      const route = `/${relative(DIST, path).replace(/index\.html$/, '')}`;
      return { path, route, root: parse(html), html };
    }),
  );
}

export function meta(root: HTMLElement, key: string): string | undefined {
  return (root.querySelector(`meta[property="${key}"]`) ?? root.querySelector(`meta[name="${key}"]`))?.getAttribute('content');
}
