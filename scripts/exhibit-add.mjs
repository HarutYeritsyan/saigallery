#!/usr/bin/env node
// pnpm exhibit:add <path-to-image>
// Assigns the next catalog number, re-encodes the image without any embedded metadata as
// <NNN>.webp, and creates <NNN>.md as a draft (contracts/exhibit-content.md). Nothing about the
// input (its path, filename or metadata) is written anywhere or printed.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { inspectImage } from '../src/lib/image-metadata.ts';
import { exhibitsDir, listEntries, pad3 } from './lib/entries.mjs';

const input = process.argv[2];
if (!input) {
  console.error('Usage: pnpm exhibit:add <path-to-image>');
  process.exit(1);
}

const dir = exhibitsDir();
const numbers = (await listEntries(dir)).map((e) => Number(e.stem)).filter((n) => Number.isInteger(n) && n > 0);
const id = pad3(Math.max(0, ...numbers) + 1);
const imagePath = join(dir, `${id}.webp`);
const entryPath = join(dir, `${id}.md`);

let cleaned;
try {
  // rotate() applies the EXIF orientation before the metadata is dropped. sharp writes no
  // metadata unless asked to (no withMetadata/keepExif/keepIccProfile), so this strips it all.
  cleaned = await sharp(await readFile(input)).rotate().webp({ quality: 90 }).toBuffer();
} catch {
  console.error('That file could not be read as an image. Nothing was created.');
  process.exit(1);
}

await writeFile(imagePath, cleaned);
const leftovers = await inspectImage(imagePath);
if (leftovers.length > 0) {
  await rm(imagePath);
  console.error(`Metadata survived re-encoding (${leftovers.join(', ')}). Nothing was created.`);
  process.exit(1);
}
await writeFile(entryPath, `---\nstatus: draft\nimage: ./${id}.webp\nalt: ""\n---\n`);

console.log(`Created Exhibit No. ${id} as a draft:
  ${imagePath}
  ${entryPath}

Next: write the alt text (what the image literally shows) and the caption below the frontmatter,
then set "status: published".
Caption review (Principle I): critique the image and its unexamined use, never the person who posted it.
Reminder: crop or cover any names, handles, avatars or platform interface before adding an image,
and delete your downloaded original now that the cleaned copy exists.`);
