# SAIGallery

A museum of real AI-generated images found in public social media posts, where they were
meant to engage or inform and grossly failed. The "S" stands for "Shameful".

The site is a static Astro build. The rules it follows are in the
[constitution](.specify/memory/constitution.md), and the MVP design is in
[specs/001-gallery-mvp](specs/001-gallery-mvp/).

## Prerequisites

- The project devcontainer (Node.js 26 with pnpm through Corepack)
- `pnpm install`

## Running the site

```bash
pnpm dev                                  # local development server
pnpm dev:host                             # same, reachable from the host at http://localhost:4321
SITE_URL=https://your.domain pnpm build   # production build into dist/
pnpm preview                              # serve dist/ locally
```

`SITE_URL` is required for every build. Link previews need absolute image URLs, so the build
stops without it. Any value works locally, e.g. `SITE_URL=http://localhost:4321`.

## Curating

Each exhibit is two files in `src/content/exhibits/`, both named by catalog number:
`017.md` (title, alt text, caption) and `017.webp` (the image). The formats are described in
[contracts/exhibit-content.md](specs/001-gallery-mvp/contracts/exhibit-content.md).

### Publishing an exhibit

1. **Crop or cover identifying details first**, using any image editor: names, handles,
   avatars, and platform interface such as buttons, logos and reaction counts. Nothing checks
   this for you.
2. Add the image:

   ```bash
   pnpm exhibit:add ~/Downloads/some-image.png
   ```

   This assigns the next catalog number, strips all embedded metadata (EXIF, XMP, ICC, PNG
   text chunks such as AI-generator prompts), renames the file, and creates a draft entry.
   Then delete your downloaded original.
3. Open the new `src/content/exhibits/<NNN>.md` and fill it in:

   ```markdown
   ---
   status: published
   title: "Untitled Hand Study No. 4"
   image: ./043.webp
   alt: "A smiling woman holding a mug; her left hand has seven fingers fused around the handle."
   ---
   The mug is the only object in the frame rendered with conviction.
   ```

   - `alt` says literally what the image shows, for screen reader users.
   - The caption (the text below the `---`) is the critique. Critique the image and the choice
     to publish it, **never the person who posted it** (constitution Principles I and IV).
     Captions can't contain links, images or HTML.
   - `title` is optional. Without it the exhibit is shown as "Exhibit No. 043".
4. Set `status: published`, then check and build:

   ```bash
   pnpm exhibit:verify
   SITE_URL=https://your.domain pnpm build
   ```

5. Commit and deploy.

The build refuses to publish an exhibit with no image, alt text or caption, an alt text
identical to the caption, any extra field such as `source:` or `author:`, or an image that
still carries metadata.

### Editing an exhibit

Edit the `title`, `alt` or caption in its `.md` file and rebuild. The URL
(`/exhibits/<NNN>/`) never changes.

### Unpublishing an exhibit

```bash
pnpm exhibit:unpublish 17
```

This deletes the image and reduces the entry to a stub, so the page says the exhibit is no
longer available and the number is never reused. **It can't be undone.** Showing the image
again means adding it as a new exhibit.

### Editing the collection text

The introduction on the first page is `src/content/site/intro.md`, and the About page is
`src/content/site/about.md`. Together they must say that the exhibits are real images from
public posts on LinkedIn and other social media, meant to engage or inform, that grossly
failed (constitution Principle VI). Never attribute an individual exhibit to a platform.

### Things to never do

- **Never commit an image that hasn't gone through `pnpm exhibit:add`.** Git history keeps
  every committed file, including its metadata, even after you fix it.
- Never record where an image came from: no source links, account names, platforms or dates,
  anywhere in the repository (constitution Principle III).

## Testing

```bash
pnpm test         # unit tests
pnpm test:build   # builds with the test fixtures, then checks the build output
pnpm test:e2e     # browser tests and accessibility checks (needs Chromium; see below)
```

End-to-end tests need Playwright's Chromium: run `pnpm exec playwright install --with-deps chromium`.
The `--with-deps` part installs system libraries and needs root, so in the devcontainer it
belongs in the Dockerfile. Test fixtures are regenerated with `node tests/fixtures/generate.mjs`.
