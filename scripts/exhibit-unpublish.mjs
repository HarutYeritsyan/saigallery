#!/usr/bin/env node
// pnpm exhibit:unpublish <NNN>
// One-way: deletes the exhibit's image and reduces its entry to a tombstone, so its URL shows
// "no longer available" and its number is never reused (research R6).
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exhibitsDir, pad3, parseEntry, TOMBSTONE } from './lib/entries.mjs';

const arg = process.argv[2] ?? '';
if (!/^\d+$/.test(arg) || Number(arg) < 1) {
  console.error('Usage: pnpm exhibit:unpublish <catalog number>, e.g. 17 or 017');
  process.exit(1);
}

const dir = exhibitsDir();
const id = pad3(Number(arg));
const entryPath = join(dir, `${id}.md`);

let text;
try {
  text = await readFile(entryPath, 'utf8');
} catch {
  console.error(`Exhibit No. ${id} does not exist.`);
  process.exit(1);
}
if (parseEntry(text).data?.status === 'unpublished') {
  console.error(`Exhibit No. ${id} is already unpublished.`);
  process.exit(1);
}

await rm(join(dir, `${id}.webp`), { force: true });
await writeFile(entryPath, TOMBSTONE);
console.log(`Exhibit No. ${id} is unpublished. Its page will say it is no longer available after the next build.`);
