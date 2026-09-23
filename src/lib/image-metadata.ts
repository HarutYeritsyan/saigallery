import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Shared by scripts/verify-exhibits.mjs, scripts/exhibit-add.mjs and the tests (FR-013).
// Kept to erasable TypeScript syntax so Node can import it directly from .mjs scripts.

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_TEXT_CHUNKS = new Set(['tEXt', 'iTXt', 'zTXt', 'eXIf']);
const WEBP_METADATA_CHUNKS = new Set(['EXIF', 'XMP ', 'ICCP']);

function pngTextChunks(buf: Buffer): string[] {
  const found: string[] = [];
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return found;
  let offset = 8;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('latin1', offset + 4, offset + 8);
    if (PNG_TEXT_CHUNKS.has(type)) found.push(type);
    if (type === 'IEND') break;
    offset += 12 + length;
  }
  return found;
}

function webpMetadataChunks(buf: Buffer): string[] {
  const found: string[] = [];
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return found;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const type = buf.toString('latin1', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (WEBP_METADATA_CHUNKS.has(type)) found.push(type.trim());
    offset += 8 + size + (size % 2);
  }
  return found;
}

function jpegCommentSegments(buf: Buffer): number {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return 0;
  let count = 0;
  let offset = 2;
  while (offset + 4 <= buf.length && buf[offset] === 0xff) {
    const marker = buf[offset + 1];
    if (marker === 0xda || marker === 0xd9) break; // start of scan / end of image
    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xfe) count += 1;
    offset += 2 + length;
  }
  return count;
}

/** Returns a list of embedded-metadata problems; an empty list means the image is clean. */
export async function inspectImage(path: string): Promise<string[]> {
  const buf = await readFile(path);
  const problems: string[] = [];
  const meta = await sharp(buf).metadata();
  if (meta.exif) problems.push('EXIF data');
  if (meta.xmp) problems.push('XMP data');
  if (meta.iptc) problems.push('IPTC data');
  if (meta.icc) problems.push('ICC profile');
  for (const chunk of pngTextChunks(buf)) problems.push(`PNG ${chunk} chunk`);
  for (const chunk of webpMetadataChunks(buf)) problems.push(`WebP ${chunk} chunk`);
  if (jpegCommentSegments(buf) > 0) problems.push('JPEG comment');
  return [...new Set(problems)];
}
