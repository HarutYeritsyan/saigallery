#!/usr/bin/env node
// Enforces data-model.md "Validation summary". Runs before every build (pnpm build) and in tests.
// Exits 1 on any violation, printing one `<file>: <rule>` line per problem.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectImage } from '../src/lib/image-metadata.ts';
import { exhibitsDir, listEntries } from './lib/entries.mjs';

const ALLOWED_KEYS = new Set(['status', 'title', 'image', 'alt']);
const STATUSES = new Set(['draft', 'published', 'unpublished']);
const IMAGE_EXT = /\.(webp|png|jpe?g|gif|avif|tiff?|bmp|svg)$/i;

export async function verify({ dir = exhibitsDir(), siteDir = 'src/content/site' } = {}) {
  const problems = [];
  const report = (file, rule) => problems.push(`${file}: ${rule}`);
  const entries = await listEntries(dir);
  const stems = new Set(entries.map((e) => e.stem));

  for (const entry of entries) {
    const file = join(dir, entry.name);
    if (!/^\d{3,}$/.test(entry.stem) || Number(entry.stem) < 1) {
      report(file, 'filename must be a zero-padded catalog number such as 017.md');
    }
    if (!entry.data) {
      report(file, 'missing frontmatter');
      continue;
    }
    const { data } = entry;
    const caption = entry.body.trim();

    // Rule 1: strict schema (Principle III guard).
    for (const key of Object.keys(data)) {
      if (!ALLOWED_KEYS.has(key)) report(file, `unknown frontmatter key "${key.replace(/^__invalid__/, '')}"`);
    }
    if (!STATUSES.has(data.status)) {
      report(file, `status must be draft, published or unpublished`);
      continue;
    }
    if (data.title !== undefined && (data.title.length < 1 || data.title.length > 120)) {
      report(file, 'title must be 1–120 characters');
    }
    if (data.alt !== undefined && data.alt.length > 500) report(file, 'alt must be at most 500 characters');

    const expectedImage = `./${entry.stem}.webp`;
    if (data.image !== undefined && data.image !== expectedImage) {
      report(file, `image must be ${expectedImage}`);
    }

    if (data.status === 'published') {
      // Rule 2 (FR-009, FR-005).
      if (!data.image) report(file, 'published exhibit has no image');
      if (!data.alt || data.alt.trim() === '') report(file, 'published exhibit has empty alt text');
      if (caption === '') report(file, 'published exhibit has an empty caption');
      // Rule 3.
      if (data.alt && caption && data.alt.trim().toLowerCase() === caption.toLowerCase()) {
        report(file, 'alt text must differ from the caption');
      }
    }

    if (data.status === 'unpublished') {
      // Rule 5 (R6).
      for (const key of ['image', 'alt', 'title']) {
        if (data[key] !== undefined) report(file, `unpublished exhibit still has ${key}`);
      }
      if (caption !== '') report(file, 'unpublished exhibit still has a caption');
    }

    // Rule 6: no links, images or raw HTML in captions.
    if (/\[[^\]]*\]\([^)]*\)|<https?:\/\/|https?:\/\/|www\./i.test(caption)) report(file, 'caption contains a link');
    if (/!\[[^\]]*\]/.test(caption)) report(file, 'caption contains an image');
    if (/<\/?[a-z][^>]*>/i.test(caption)) report(file, 'caption contains raw HTML');
  }

  // Rule 4: image files are named by catalog number, belong to an entry, and carry no metadata.
  let files = [];
  try {
    files = await readdir(dir);
  } catch {
    files = [];
  }
  for (const name of files.filter((n) => IMAGE_EXT.test(n))) {
    const file = join(dir, name);
    const match = /^(\d{3,})\.webp$/.exec(name);
    if (!match) {
      report(file, 'image must be named <NNN>.webp by catalog number (use pnpm exhibit:add)');
    } else if (!stems.has(match[1])) {
      report(file, 'image has no matching entry');
    } else {
      const owner = entries.find((e) => e.stem === match[1]);
      if (owner?.data?.status === 'unpublished') report(file, 'unpublished exhibit still has an image file');
    }
    for (const problem of await inspectImage(file)) report(file, `embedded metadata: ${problem}`);
  }
  for (const entry of entries) {
    if (entry.data?.image && !files.includes(`${entry.stem}.webp`)) {
      report(join(dir, entry.name), `image file ${entry.stem}.webp is missing`);
    }
  }

  // Rule 7: collection framing copy (FR-014).
  for (const name of ['intro.md', 'about.md']) {
    const file = join(siteDir, name);
    let text = '';
    try {
      text = await readFile(file, 'utf8');
    } catch {
      report(file, 'missing (collection framing text is required)');
      continue;
    }
    if (text.trim() === '') report(file, 'empty (collection framing text is required)');
  }

  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = await verify();
  for (const p of problems) console.error(p);
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s) found.`);
    process.exit(1);
  }
  console.log('All exhibits verified.');
}
