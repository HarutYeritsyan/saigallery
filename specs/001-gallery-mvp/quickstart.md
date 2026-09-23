# Quickstart & Validation Guide: Gallery MVP

How to run the site and prove each spec requirement works end to end. File formats and
routes are defined in [contracts/](./contracts/). Field rules are in
[data-model.md](./data-model.md).

## Prerequisites

- The project devcontainer (Node.js 26, Corepack-enabled pnpm).
- `pnpm install`
- `SITE_URL` set to the public base URL (any placeholder such as `http://localhost:4321` works
  locally). Production builds fail without it.
- For end-to-end/accessibility tests, a one-time browser download:
  `pnpm exec playwright install chromium`

## Run

```bash
pnpm dev          # local dev server
pnpm build        # runs exhibit:verify, then builds static files into dist/
pnpm preview      # serve dist/ locally
pnpm test         # unit tests (Vitest)
pnpm test:build   # builds with the test fixtures, then runs the build-output tests
pnpm test:e2e     # Playwright journeys + axe accessibility checks against the preview build
```

Test fixtures under `tests/fixtures/exhibits/` provide a 40-exhibit catalog (mix of titled
and untitled, plus one unpublished tombstone and one draft). They also include images
deliberately carrying EXIF, XMP and PNG "parameters" text chunks.

## Validation scenarios

| # | Scenario | How to check | Expected |
|---|----------|--------------|----------|
| V1 | Paged, calm index (US1, FR-001, SC-003) | e2e: load `/` with 40 fixtures, then scroll to the bottom | 12 exhibits, newest first (No. 040 first). No more appear until "Next" is clicked. `/page/4/` has the last 4. |
| V2 | Empty gallery (US1 sc. 3) | Build with an empty collection, then load `/` | Empty-state message, not an error. |
| V3 | Detail page (US2, FR-003) | e2e: open `/exhibits/017/` directly | Display title as heading, image with alt text, and separate caption plaque. |
| V4 | Back to the same page (US2 sc. 3) | e2e: from `/page/3/` open an exhibit, then click "Back to the gallery" | Lands on `/page/3/`. |
| V5 | No source data anywhere (FR-004, SC-002) | build-output test: scan all of `dist/` HTML for forbidden fields/patterns. Run the metadata verifier over every image in `dist/` | Zero matches. Zero images with embedded metadata. All image names are `<NNN>.<hash>.<ext>`. |
| V6 | Metadata stripped at ingest (FR-013) | `pnpm exhibit:add tests/fixtures/raw/with-exif.png`, then `pnpm exhibit:verify` | New `<NNN>.webp` has no metadata, and verify passes. Committing a raw fixture by hand makes verify (and `pnpm build`) fail. |
| V7 | Incomplete exhibit blocked (FR-009) | Set a fixture to `published` with an empty caption, then `pnpm build` | Build fails, naming the file and rule. |
| V8 | Source field rejected (Principle III) | Add `source: https://…` to a fixture's frontmatter, then `pnpm build` | Build fails on the unknown key. |
| V9 | Unpublish (FR-010) | `pnpm exhibit:unpublish 017`, build, then load `/exhibits/017/` | "No longer available" page (200). Not in the index. No 017 image in `dist/`. |
| V10 | Titles (FR-012) | e2e: an untitled fixture, then a titled one | "Exhibit No. 005" versus the custom title, on both the index and the detail page. |
| V11 | No dispute or social features (FR-002, FR-007, FR-011) | build-output test | No forms or inputs, and no counters/share/report text in any page. |
| V12 | Accessibility (FR-005, FR-006, SC-004) | e2e axe run on `/`, `/page/2/`, a detail page, a tombstone and 404. Unit test for alt ≠ caption | No serious/critical axe violations. The alt/caption check passes. |
| V13 | Image fails to load (edge case) | e2e: block the image request on a detail page | "Image unavailable" notice. Caption and alt text still readable. |
| V14 | Curator speed (SC-005) | Manual: time `exhibit:add` → write caption/alt → set published → `pnpm build` | Under 5 minutes. |
| V15 | Visitor speed (SC-001) | Manual: first visit, index → any detail page | Under 10 seconds of interaction. |
| V16 | Introduction on the entry page (FR-014, US1 sc. 5) | e2e: load `/`, then `/page/2/` | The introduction appears above the grid on `/` only. |
| V17 | About link everywhere (FR-014, SC-006, US1 sc. 6) | build-output test: every HTML file in `dist/` | Each has a link to `/about/`. `/about/` exists and is non-empty. |
| V18 | Framing is required (FR-014) | Empty `src/content/site/intro.md`, then `pnpm build` | Build fails, naming the file. |
| V19 | Framing understood (SC-006) | Manual: show index page 1 to 5 first-time visitors | At least 4 of 5 say the images came from real social media posts. |
| V20 | Link previews (FR-015, US2 sc. 5) | build-output test: read preview metadata on every page | Published exhibits have their display title, collection description, and an absolute JPEG `og:image` that passes the metadata verifier. Every other page has no `og:image`. No page has `noindex`. |
| V21 | Unpublished preview (edge case) | After V9, inspect `/exhibits/017/` metadata | No `og:image`, and the former title isn't present. |
