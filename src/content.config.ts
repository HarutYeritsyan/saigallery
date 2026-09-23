import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Tests point EXHIBITS_DIR at fixture content; real exhibits live in src/content/exhibits.
const exhibitsDir = process.env.EXHIBITS_DIR ?? './src/content/exhibits';
const stemId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

// Strict on purpose: any unknown frontmatter key (source, url, author, date, ...) fails the
// build, so source information can't be added to an exhibit by accident (Principle III).
// Only published exhibits resolve `image` as an asset. A draft's image stays a plain path, so
// Astro never copies an unpublished draft's image into the public build.
const exhibits = defineCollection({
  loader: glob({ pattern: '*.md', base: exhibitsDir, generateId: stemId }),
  schema: ({ image }) =>
    z.discriminatedUnion('status', [
      z.strictObject({
        status: z.literal('published'),
        title: z.string().min(1).max(120).optional(),
        image: image(),
        alt: z.string().trim().min(1).max(500),
      }),
      z.strictObject({
        status: z.literal('draft'),
        title: z.string().min(1).max(120).optional(),
        image: z.string().optional(),
        // A freshly ingested draft has `alt: ""`.
        alt: z.string().max(500).optional(),
      }),
      // Unpublished tombstones keep nothing but their status (R6).
      z.strictObject({ status: z.literal('unpublished') }),
    ]),
});

const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site', generateId: stemId }),
  schema: z.strictObject({}),
});

export const collections = { exhibits, site };
