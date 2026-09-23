import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { inspectImage } from '../../src/lib/image-metadata';
import { DIST, htmlPages, ORIGIN, walk } from './dist';

const IMAGE = /\.(webp|jpe?g|png|avif|gif)$/i;

describe('no source data in the build (V5, SC-002)', async () => {
  const files = await walk(DIST);
  const images = files.filter((f) => IMAGE.test(f));
  const pages = await htmlPages();

  it('links to no other origin', () => {
    for (const { route, html } of pages) {
      const urls = html.match(/https?:\/\/[^\s"'<>)]+/g) ?? [];
      const foreign = urls.filter((u) => !u.startsWith(ORIGIN) && !u.startsWith('http://www.w3.org/'));
      expect(foreign, route).toEqual([]);
    }
  });

  it('contains no source marker anywhere, in text or binary files', async () => {
    for (const file of files) {
      const content = await readFile(file);
      expect(content.includes('SOURCE-MARKER'), file).toBe(false);
    }
  });

  it('serves only images named by catalog number, with no embedded metadata', async () => {
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(basename(image)).toMatch(/^\d{3,}\.[\w-]+\.(webp|jpe?g|png|avif)$/);
      expect(await inspectImage(image), image).toEqual([]);
    }
  });

  it('emits no image for a draft or an unpublished exhibit (V9)', () => {
    const names = images.map((f) => basename(f));
    expect(names.filter((n) => n.startsWith('041.') || n.startsWith('042.'))).toEqual([]);
  });
});
