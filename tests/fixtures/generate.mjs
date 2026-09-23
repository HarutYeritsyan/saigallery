#!/usr/bin/env node
// Regenerates the committed test fixtures: 40 published exhibits, one draft (041), one
// unpublished tombstone (042), and raw images that deliberately carry metadata containing
// SOURCE_MARKER, so tests can prove it never reaches the repository or the build output.
// Run with: node tests/fixtures/generate.mjs
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32 } from 'node:zlib';
import sharp from 'sharp';

export const SOURCE_MARKER = 'SOURCE-MARKER';
const here = dirname(fileURLToPath(import.meta.url));
const exhibits = join(here, 'exhibits');
const raw = join(here, 'raw');

const pad3 = (n) => String(n).padStart(3, '0');
const color = (n) => `hsl(${(n * 37) % 360}, 45%, ${35 + (n % 5) * 8}%)`;

function square(n, size = 480) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="100%" height="100%" fill="${color(n)}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="white" fill-opacity="0.35"/>
  </svg>`;
  return sharp(Buffer.from(svg));
}

function entry(fields, body = '') {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n---\n${body ? `${body}\n` : ''}`;
}

function withPngTextChunk(png, keyword, text) {
  const data = Buffer.from(`${keyword}\0${text}`, 'latin1');
  const type = Buffer.from('tEXt', 'latin1');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([type, data])), 8 + data.length);
  const ihdrEnd = 8 + 12 + png.readUInt32BE(8); // signature + IHDR chunk
  return Buffer.concat([png.subarray(0, ihdrEnd), chunk, png.subarray(ihdrEnd)]);
}

await rm(exhibits, { recursive: true, force: true });
await rm(raw, { recursive: true, force: true });
await mkdir(exhibits, { recursive: true });
await mkdir(raw, { recursive: true });

for (let n = 1; n <= 40; n++) {
  const id = pad3(n);
  await square(n).webp({ quality: 80 }).toFile(join(exhibits, `${id}.webp`));
  const fields = { status: 'published' };
  if (n === 17) fields.title = 'The Seventeenth Square';
  else if (n % 3 === 0) fields.title = `Study in Shade ${n}`;
  fields.image = `./${id}.webp`;
  fields.alt = `A flat square in shade ${n} with a pale circle at its centre.`;
  await writeFile(
    join(exhibits, `${id}.md`),
    entry(fields, `Exhibit ${id} is a square that insists on its own importance. The circle adds nothing.`),
  );
}

// 041: a draft freshly ingested, not yet written up.
await square(41).webp({ quality: 80 }).toFile(join(exhibits, '041.webp'));
await writeFile(join(exhibits, '041.md'), entry({ status: 'draft', image: './041.webp', alt: '' }));

// 042: unpublished tombstone.
await writeFile(join(exhibits, '042.md'), '---\nstatus: unpublished\n---\n');

// Raw images with source-like metadata.
await square(90, 320)
  .jpeg()
  .withExif({ IFD0: { ImageDescription: `${SOURCE_MARKER} https://example.com/post/1`, Artist: SOURCE_MARKER } })
  .toFile(join(raw, 'with-exif.jpg'));
await square(91, 320)
  .webp()
  .withXmp(
    `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>${SOURCE_MARKER}</dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>`,
  )
  .toFile(join(raw, 'with-xmp.webp'));
const png = await square(92, 320).png().toBuffer();
await writeFile(join(raw, 'with-params.png'), withPngTextChunk(png, 'parameters', `${SOURCE_MARKER} prompt: a meeting`));
await writeFile(join(raw, 'not-an-image.jpg'), 'this is not an image');

console.log('Fixtures written to tests/fixtures/exhibits and tests/fixtures/raw');
