---

description: "Task list for the Gallery MVP"
---

# Tasks: Gallery MVP

**Input**: Design documents from `/specs/001-gallery-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md, contracts/exhibit-content.md, quickstart.md

**Tests**: Included. The spec requires automated verification (SC-002 "verifiable by inspecting rendered page content and the served image files", SC-004 "verifiable by automated accessibility check"), and plan.md / quickstart.md define the test suites (V1–V21).

**Organization**: Tasks are grouped by user story so each story can be built and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- Paths are relative to the repository root (single Astro project, per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Astro project and test tooling.

- [X] T001 Create `package.json` at the repository root: `"type": "module"`, a `packageManager` field pinning the current pnpm, and `engines.node` `>=26`. Add dependencies `astro` (current stable major) and `sharp`, and devDependencies `typescript`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `node-html-parser`. Add scripts: `dev` = `astro dev`, `build` = `node scripts/verify-exhibits.mjs && astro build`, `preview` = `astro preview`, `test` = `vitest run tests/unit`, `test:build` = `SITE_URL=http://localhost:4321 EXHIBITS_DIR=tests/fixtures/exhibits pnpm build && vitest run tests/build`, `test:e2e` = `playwright test`, `exhibit:add` = `node scripts/exhibit-add.mjs`, `exhibit:unpublish` = `node scripts/exhibit-unpublish.mjs`, `exhibit:verify` = `node scripts/verify-exhibits.mjs`. Then run `pnpm install`.
- [X] T002 Create `astro.config.mjs` with `output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`, and `site` read from `process.env.SITE_URL`. Throw an error with the message "SITE_URL must be set for production builds" when `SITE_URL` is unset and the command is `build` (R12). Keep the default sharp image service.
- [X] T003 [P] Create `tsconfig.json` extending `astro/tsconfigs/strict`, and `src/env.d.ts` referencing Astro's types.
- [X] T004 [P] Create `vitest.config.ts` covering `tests/unit/**/*.test.ts` and `tests/build/**/*.test.ts` (Node environment). Build tests read `dist/` and are run only through `pnpm test:build`, which first builds with the fixtures.
- [X] T005 [P] Create `playwright.config.ts`: Chromium only, `testDir: 'tests/e2e'`, and `webServer` running `pnpm build && pnpm preview --port 4321` with `SITE_URL=http://localhost:4321` and `EXHIBITS_DIR=tests/fixtures/exhibits`, base URL `http://localhost:4321`. *(Implementation note: Astro 7's `astro preview` detaches into a locked background daemon without a terminal, so the servers use `scripts/serve-dist.mjs`, and both builds run one after the other because they share Astro's `.astro/` folder.)*
- [X] T006 [P] Append `playwright-report/`, `test-results/` and `dist-*/` to `.gitignore`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content schema, shared logic, verification, layout and fixtures that every story needs.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create `src/content.config.ts` defining two collections with Astro's `glob` loader. **`exhibits`**: pattern `*.md`, base `process.env.EXHIBITS_DIR ?? './src/content/exhibits'` (so tests can point at fixtures). The ID is the filename stem. The frontmatter schema is a **strict** zod object that fails on any unknown key (data-model.md rule 1). Fields:
  - `status`: enum `draft` | `published` | `unpublished`
  - `title`: optional, "string, 1–120 chars"
  - `image`: optional `image()` reference
  - `alt`: optional, "string, 1–500 chars"

  `alt` may be an empty string only when `status` is `draft` (freshly ingested entries). Add a `superRefine`: when `status` is `published`, `image` and a non-empty `alt` are required; when `status` is `unpublished`, `image`, `alt` and `title` must be absent. **`site`**: pattern `*.md`, base `./src/content/site`, no frontmatter fields. Create `src/content/exhibits/.gitkeep` so the real content folder exists but starts empty.
- [X] T008 [P] Implement `src/lib/exhibits.ts`:
  - `catalogNumber(id)`: parses the filename stem to an integer ≥ 1 and throws on anything that is not all digits.
  - `pad3(n)`: zero-pads to at least 3 digits.
  - `displayTitle(entry)`: returns `title ?? "Exhibit No. " + pad3(number)` (FR-012).
  - `publishedInOrder(entries)`: keeps only `published` entries and sorts by number descending (FR-001).
  - `PAGE_SIZE = 12`, and `paginate(list)` returning page slices.
  - `indexPageFor(number, orderedList)`: returns `floor(position / 12) + 1` (R5).
  - `indexPath(page)`: returns `/` for page 1 and `/page/<n>/` otherwise.
- [X] T009 [P] Implement `src/lib/image-metadata.ts`, exporting `inspectImage(path)`. It returns a list of problems, using `sharp(path).metadata()` to flag any `exif`, `xmp`, `iptc` or `icc` buffer. For PNG files it also scans the raw bytes for `tEXt`, `iTXt` and `zTXt` chunks. For WebP it scans for `EXIF` and `XMP ` RIFF chunks. It must work from both Node scripts and Vitest.
- [X] T010 Implement `scripts/verify-exhibits.mjs` (depends on T009). It reads the directory given by `EXHIBITS_DIR` (default `src/content/exhibits`) and `src/content/site/`, and enforces every rule in data-model.md "Validation summary":
  1. Unknown frontmatter key.
  2. `published` without image, non-empty alt, or non-empty caption. Drafts with empty `alt` and an empty caption are valid.
  3. `alt` equal to the caption (trimmed, case-insensitive).
  4. Image filename ≠ `<NNN>.webp` matching the entry, or `inspectImage` reports metadata.
  5. `unpublished` entry still has an image file, caption, alt or title.
  6. Caption contains a Markdown link, image, or raw HTML.
  7. `intro.md` or `about.md` missing or empty.

  Also flag stray image files that have no matching entry. It prints one line per violation (`<file>: <rule>`) and exits 1 on any violation, 0 otherwise. The shared `inspectImage` logic may be duplicated as a small `.mjs` helper if importing TypeScript is not possible from the script.
- [X] T011 [P] Create `src/styles/gallery.css` with design tokens for a restrained neutral museum palette (wall, plaque, ink and muted-ink colors). Every text/background pair must meet WCAG AA contrast (≥ 4.5:1 for body text). Include styles for the grid (2/3/4 columns responsive), plaque, pagination, footer, and the `.image-unavailable` state.
- [X] T012 [P] Create `src/components/PageHead.astro`. Props: `title`, optional `image` (`ImageMetadata`), and `kind` (`exhibit` | `collection`). It renders `<title>`, a meta description with the fixed collection-level description constant (exported from `src/lib/site.ts`, created in this task; it MUST name no platform, e.g., "A museum of real AI-generated images found in public social media posts, where they were meant to engage or inform and grossly failed."), `og:title`, `og:description`, `og:type`, `og:url` (absolute, from `Astro.site`) and `twitter:card`. When `kind` is `exhibit` and `image` is given, it generates a 1200 px-wide JPEG via `getImage({ src: image, width: 1200, format: 'jpeg' })` and emits an absolute `og:image` with `twitter:card` `summary_large_image`. Otherwise there is no `og:image` and `twitter:card` is `summary` (R12, contracts/routes.md). When `Astro.site` is unset (only possible in `pnpm dev`), it omits `og:url` and `og:image`. It never emits `noindex` (FR-015).
- [X] T013 Create `src/layouts/Gallery.astro` (depends on T011, T012). It sets `lang="en"`, imports `gallery.css`, and renders `PageHead` from props. The header holds the site name linking to `/`. A `<main>` slot follows. The footer contains an "About the collection" link to `/about/` on **every** page (FR-014, SC-006). No scripts, no third-party requests, no forms.
- [X] T014 [P] Create `src/content/site/intro.md` (2–4 sentences) and `src/content/site/about.md` (a few short paragraphs). Both are plain Markdown with no frontmatter and no links to any post or profile. Together they must state that the exhibits are real images from actual public posts on LinkedIn and other social media, published to engage an audience or convey useful information, and selected because they grossly failed. They must not attribute any exhibit to a platform (FR-014, constitution Principle VI).
- [X] T015 [P] Create `tests/fixtures/generate.mjs`. It uses sharp to write 40 plain generated test images and entries into `tests/fixtures/exhibits/`: `001`–`040` published, a mix with and without `title`, each with a distinct caption and alt. `017` gets a custom title. Add `041.md` as a draft and `042.md` as an unpublished tombstone. It also writes raw images carrying metadata into `tests/fixtures/raw/`:
  - `with-exif.jpg`, using sharp `withExif`
  - `with-xmp.webp`, using sharp `withXmp`
  - `with-params.png`, with a PNG `tEXt` chunk named `parameters`, inserted by hand with a correct CRC

  Every metadata field written into these raw images contains the marker string `SOURCE-MARKER`, so tests can prove it never reaches the repository or the build output.

  Commit the generated fixture files so tests don't depend on running the generator.
- [X] T016 [P] Unit tests for `src/lib/exhibits.ts` in `tests/unit/exhibits.test.ts`:
  - `displayTitle`: custom title vs "Exhibit No. 005".
  - `pad3`: 7 → "007", 1234 → "1234".
  - Ordering: 40 → 1, excluding draft and unpublished.
  - `paginate`: 40 items → pages of 12/12/12/4.
  - `indexPageFor`: No. 040 → 1, No. 028 → 2, No. 004 → 4.
- [X] T017 [P] Unit tests for the verifier in `tests/unit/verify-exhibits.test.ts`. It runs `scripts/verify-exhibits.mjs` against temporary copies of the fixtures and asserts exit 0 for the clean fixtures. It asserts exit 1, naming the file, for each of:
  - a `source:` key (V8)
  - a published entry with an empty caption (V7)
  - alt equal to the caption
  - a raw `with-params.png` copied in as `043.png`
  - a caption containing a link
  - an empty `intro.md` (V18)
  - a tombstone that still has an image

**Checkpoint**: `pnpm exhibit:verify` passes on the fixtures and `pnpm test` passes the unit tests. User stories can start.

---

## Phase 3: User Story 1 - Browse the exhibit floor (Priority: P1) 🎯 MVP

**Goal**: Visitors page through published exhibits, newest first, 12 per page. Page 1 opens with the collection introduction, and an About page explains where the images come from.

**Independent Test**: With the 40-exhibit fixture set, `/` shows the introduction and exhibits No. 040–029. "Next" leads to `/page/2/`, and nothing auto-loads. `/page/4/` holds 4 exhibits. `/about/` exists and every page links to it. An empty collection shows the empty state.

### Tests for User Story 1

> Write these first and confirm they fail before implementing.

- [X] T018 [P] [US1] E2E test in `tests/e2e/browse.spec.ts`:
  - **V1:** `/` has exactly 12 exhibit cards and the first is No. 040. After scrolling to the bottom and waiting, the count is still 12. "Next" navigates to `/page/2/`, and `/page/4/` has 4 cards.
  - **V16:** the introduction text is present on `/` and absent on `/page/2/`.
  - **V10 (index side):** fixture 017 shows its custom title, and an untitled fixture shows "Exhibit No. 0NN".
  - **US1 scenario 2:** cards show only the image and display title.
- [X] T019 [US1] E2E empty-state test in `tests/e2e/empty.spec.ts` (V2). Add a second Playwright project and `webServer` entry to `playwright.config.ts` (port 4322). It runs `pnpm exec astro build --outDir dist-empty && pnpm exec astro preview --outDir dist-empty --port 4322` with `SITE_URL=http://localhost:4322` and `EXHIBITS_DIR` pointing at an empty temporary directory, so it never overwrites the main `dist/`. The test asserts that `/` shows the empty-state message "The gallery is being installed" with HTTP 200.
- [X] T020 [P] [US1] Build-output test in `tests/build/site-wide.test.ts`. It parses every `*.html` in `dist/` with `node-html-parser` and asserts:
  - **V17:** each has an `a[href="/about/"]`.
  - **V11:** no `<form>`, `<input>` or `<textarea>`, and no text matching `/\b(likes?|views?|shares?|report|dispute|removal request)\b/i` outside exhibit captions.
  - **R8:** no `<script src>` or `<link href>` pointing to another origin.
  - **FR-015:** no `noindex` anywhere.

### Implementation for User Story 1

- [X] T021 [P] [US1] Create `src/components/ExhibitCard.astro`. Props: entry. It renders a link to `/exhibits/<NNN>/` containing an Astro `<Image>` thumbnail (widths ≤ 480 px, `loading="lazy"` except for the first row, `alt` = the exhibit's alt) and the display title as wall text. It shows nothing else: no caption, counts or source data (US1 scenario 2).
- [X] T022 [P] [US1] Create `src/components/Pagination.astro`. Props: `currentPage` and `totalPages`. It renders Previous / numbered / Next links using `indexPath()`, marks the current page with `aria-current="page"`, and renders nothing when `totalPages` is 1. Links only, no JavaScript (FR-001).
- [X] T023 [US1] Create `src/pages/index.astro` (depends on T021, T022). It loads `exhibits` and uses `publishedInOrder` and `paginate` to render page 1 inside `Gallery` (collection preview, `kind="collection"`). It renders `intro.md` above the grid (FR-014). With no published exhibits, it renders the empty state "The gallery is being installed" instead of the grid (US1 scenario 3).
- [X] T024 [US1] Create `src/pages/page/[page].astro` (depends on T023). `getStaticPaths` generates pages 2..n only, each rendering the same grid and pagination without the introduction.
- [X] T025 [P] [US1] Create `src/pages/about.astro`. It renders `about.md` inside `Gallery` with the title "About the collection" and a collection preview (FR-014, contracts/routes.md `/about/`).

**Checkpoint**: T018–T020 pass. The index, paging, introduction and About page work on their own; exhibit links 404 until US2.

---

## Phase 4: User Story 2 - View a single exhibit (Priority: P1)

**Goal**: Each published exhibit has its own page with a responsive full image, a separate caption plaque, alt text, a "Back to the gallery" link to the right index page, and link-preview metadata. Unpublished exhibits show "no longer available".

**Independent Test**: Opening `/exhibits/017/` directly shows its custom title, image with alt, and caption plaque, with no source data in the markup. Its back link goes to `/page/2/`. Its preview metadata includes a metadata-free JPEG. `/exhibits/042/` (tombstone) shows "no longer available" with no image. `/exhibits/041/` (draft) is a 404.

### Tests for User Story 2

- [X] T026 [P] [US2] E2E test in `tests/e2e/exhibit.spec.ts`:
  - **V3:** `/exhibits/017/` has an `h1` with its custom title, an image whose `alt` equals the fixture alt, and a plaque containing the caption, which is not used as `alt`.
  - **V4:** from `/page/3/`, open the first card; "Back to the gallery" returns to `/page/3/`.
  - **V13:** with `page.route` aborting image requests, "Image unavailable" is visible and the caption is still readable.
  - **US2 scenario 4:** no dispute or report control.
  - **US2 scenario 6:** the framing note "From a collection of real images found in public social media posts" is visible, links to `/about/`, and names no platform.
  - **Tombstone:** `/exhibits/042/` shows "Exhibit No. 042 is no longer available." and a link to `/`, with HTTP 200.
  - **Draft:** `/exhibits/041/` returns 404 and shows "No exhibit hangs here".
- [X] T027 [P] [US2] Build-output test in `tests/build/no-source-data.test.ts`:
  - **V5:** every `dist/**/*.html` contains no `http(s)` URL except the site's own origin, and none of the fixture-injected source markers (the fixture generator writes marker strings such as `SOURCE-MARKER` only into the raw test images). Every image file under `dist/` passes `inspectImage`, and every exhibit image filename matches `/^\d{3,}\.[\w-]+\.(webp|jpe?g|png|avif)$/`.
  - **V9:** no emitted image file name starts with `042.`.
- [X] T028 [P] [US2] Build-output test in `tests/build/previews.test.ts`:
  - **V20:** each published exhibit page has `og:title` equal to its display title, `og:description` equal to the collection description, an absolute `og:image` ending in `.jpg`/`.jpeg` whose file passes `inspectImage`, and `twitter:card` `summary_large_image`. Index, About, tombstone and 404 pages have no `og:image` and `twitter:card` `summary`. On every page, `og:description` and the meta description match none of `/linkedin|facebook|instagram|twitter|x\.com|tiktok|reddit|threads/i` (Principle III).
  - **V21:** the tombstone page `/exhibits/042/` has no `og:image`, no `<img>`, and no heading other than "Exhibit No. 042". The full unpublish-then-rebuild case is covered in T034.

### Implementation for User Story 2

- [X] T029 [P] [US2] Create `src/components/Plaque.astro`. It renders the curatorial caption (the entry's rendered Markdown body) in a `<figcaption>`-style plaque block, visually and semantically separate from the image's alt (FR-005).
- [X] T030 [US2] Create `src/pages/exhibits/[number].astro` (depends on T029). `getStaticPaths` covers all `published` and `unpublished` entries, never `draft`.
  - **Published:** `Gallery` with `PageHead kind="exhibit" image={entry.image}`. The `h1` shows the display title. The `<figure>` contains an Astro `<Picture>` (responsive variants up to 1600 px, `alt` = entry alt) plus `Plaque`. A "Back to the gallery" link points to `indexPath(indexPageFor(number, publishedInOrder(all)))`. Below the plaque, a one-line framing note names no platform: "From a collection of real images found in public social media posts", linking to `/about/` (FR-014, US2 scenario 6).
  - **Unpublished:** the plain text "Exhibit No. <NNN> is no longer available." with a link to `/`, a collection preview, and no image or former title (FR-010, R6).
- [X] T031 [US2] Add the image-failure state to `src/pages/exhibits/[number].astro`. Wrap the picture in a container holding a visually hidden "Image unavailable" notice. On the `<img>`, add an inline `onerror` attribute that adds `.image-unavailable` to the container, and add the matching CSS in `src/styles/gallery.css` so the notice shows and the broken image hides. This is the only script on the site: no `<script>` elements (spec edge case, V13).
- [X] T032 [P] [US2] Create `src/pages/404.astro` using `Gallery` with a collection preview and the message "No exhibit hangs here", plus a link to `/` (contracts/routes.md).

**Checkpoint**: T026–T028 pass. US1 and US2 together give visitors the full gallery.

---

## Phase 5: User Story 3 - Curator publishes a new exhibit (Priority: P3)

**Goal**: The curator adds an exhibit with one command, which strips metadata and assigns the next catalog number, then writes the caption and alt and sets it to published. The curator can also unpublish. No authenticity or redaction checks (spec "Curator trust").

**Independent Test**: Running `pnpm exhibit:add tests/fixtures/raw/with-exif.jpg` in a temporary copy of the fixtures creates `043.webp` with no metadata and `043.md` as a draft. After filling in alt and caption and setting it to published, `pnpm build` succeeds and No. 043 is first on `/`. `pnpm exhibit:unpublish 043` then makes `/exhibits/043/` show "no longer available" with no image emitted.

### Tests for User Story 3

- [X] T033 [P] [US3] Integration test in `tests/unit/exhibit-add.test.ts`. It runs `scripts/exhibit-add.mjs` with `EXHIBITS_DIR` set to a temporary copy of the fixtures.
  - **V6:** for each of `with-exif.jpg`, `with-xmp.webp` and `with-params.png`, the output `<NNN>.webp` passes `inspectImage`, and its number is `max(existing, including 042 tombstone) + 1`. The new `.md` has `status: draft` and `image: ./<NNN>.webp`. Neither file contains the input filename, and stdout includes the crop/cover reminder line.
  - A non-image input exits non-zero and creates no files.
- [X] T034 [P] [US3] Integration test in `tests/unit/exhibit-unpublish.test.ts`. On a temporary fixture copy, it runs `scripts/exhibit-unpublish.mjs 017`. The image file is deleted and `017.md` is exactly the tombstone `---\nstatus: unpublished\n---\n`. The verifier passes. After a build of that directory into its own temporary output folder (`pnpm exec astro build --outDir <tmp>/dist` with `SITE_URL=http://localhost:4321` and `EXHIBITS_DIR` set to the temporary copy, never the shared `dist/`), `/exhibits/017/` contains neither fixture 017's former custom title nor an `og:image` (V21), and no file under that output folder has a name starting with `017.` (V9). Running the script again, or on `999`, exits non-zero.

### Implementation for User Story 3

- [X] T035 [US3] Implement `scripts/exhibit-add.mjs` (contracts/exhibit-content.md). It takes one path argument and reads `EXHIBITS_DIR` (default `src/content/exhibits`). It computes the next number as `max(all *.md stems) + 1`, including tombstones and drafts. It decodes the image with sharp, calls `.rotate()` to apply orientation before the metadata is dropped, re-encodes to WebP at quality 90 **without** `withMetadata`, writes `<NNN>.webp`, then checks the result with `inspectImage` and deletes it and exits 1 if anything remains. It writes `<NNN>.md` containing `status: draft`, `image: ./<NNN>.webp` and `alt: ""`, followed by an empty body for the caption. Its output lists the number, the created paths, a Principle I caption-review reminder, and a one-line reminder to crop or cover names, handles, avatars and platform interface before ingest and to delete the downloaded original. It must never write the input path, filename or any metadata anywhere, and must not prompt for anything.
- [X] T036 [P] [US3] Implement `scripts/exhibit-unpublish.mjs`. It takes a catalog number argument (accepting `17` or `017`), exits 1 if `<NNN>.md` is missing or already `unpublished`, deletes `<NNN>.webp` if present, and rewrites `<NNN>.md` as the tombstone `status: unpublished` only (R6).
- [X] T037 [P] [US3] Write the curator guide in `README.md` at the repository root:
  - Prerequisites.
  - Publishing steps: crop/cover identifying details → `pnpm exhibit:add` → write alt and caption (Principle I) → set `status: published` → `pnpm build` → commit.
  - Unpublishing (one-way).
  - Editing titles and captions.
  - Editing `intro.md` and `about.md`.
  - The `SITE_URL` requirement.
  - Warnings: never commit an image that hasn't been through `exhibit:add` (git history keeps it), and there are no authenticity or redaction checks.

**Checkpoint**: T033–T034 pass, and the Independent Test above works end to end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T038 [P] Accessibility e2e test in `tests/e2e/a11y.spec.ts` (V12). It runs `@axe-core/playwright` with WCAG 2 AA tags on `/`, `/page/2/`, `/about/`, `/exhibits/017/`, `/exhibits/042/` and a 404 URL, and asserts no `serious` or `critical` violations (FR-006, SC-004). Fix any contrast issues in `src/styles/gallery.css`.
- [X] T039 [P] Build-output test in `tests/build/weight.test.ts` (R9). The total bytes of `dist/index.html` plus the images and CSS it references for the first viewport are ≤ 1.5 MB with the fixture set.
- [ ] T040 Run the full validation: `pnpm exhibit:verify`, then `pnpm test`, then `pnpm test:build`, then `pnpm test:e2e`. Fix any failures.
- [ ] T041 Do the manual checks from quickstart.md and record the results in `specs/001-gallery-mvp/quickstart.md` under a new "Results" heading:
  - V14: curator publish in under 5 minutes.
  - V15: index → detail in under 10 seconds.
  - V19: 4 of 5 visitors understand the framing.
  - R9: a throttled "Fast 3G"-style load of `/` in browser dev tools shows usable content within 2 s on broadband and nothing broken on the throttled run.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: none. T001 first; T002–T006 after T001.
- **Foundational (Phase 2)**: needs Setup. T007 first (schema); T008, T009, T011, T012, T014, T015 in parallel; T010 after T009; T013 after T011 and T012; T016 after T008; T017 after T010 and T015.
- **US1 (Phase 3)** and **US2 (Phase 4)**: both need only Foundational. They're independent of each other: US1 cards link to US2 pages, but each story is tested on its own.
- **US3 (Phase 5)**: needs Foundational (T009 `inspectImage`, T010 verifier). It's independent of US1/US2 for its own tests. Its end-to-end independent test uses the pages from US1/US2.
- **Polish (Phase 6)**: after the stories in scope are done.

### Within each story

Tests first (they should fail), then components, then pages. Tasks marked [P] touch different files.

### Parallel opportunities

- Setup: T003, T004, T005, T006 together after T001.
- Foundational: T008, T009, T011, T012, T014, T015 together after T007.
- US1: T018 and T020 (tests) together, T019 after T005, then T021, T022, T025 together, then T023, then T024.
- US2: T026, T027, T028 together, then T029 and T032 together, then T030, then T031.
- US3: T033 and T034 together, then T035, T036, T037 together.
- With two developers, US1 and US2 can proceed in parallel after Phase 2.

## Parallel Example: User Story 2

```text
# Tests together:
T026 tests/e2e/exhibit.spec.ts
T027 tests/build/no-source-data.test.ts
T028 tests/build/previews.test.ts

# Then independent components together:
T029 src/components/Plaque.astro
T032 src/pages/404.astro
```

## Implementation Strategy

### MVP first

1. Phase 1 → Phase 2 (checkpoint: verifier and unit tests green).
2. Phase 3 (US1) + Phase 4 (US2): both are P1, and together they're the smallest thing worth showing a visitor. Validate with T018–T020 and T026–T028.
3. **Stop and demo**: the gallery works with fixture content. Curator content can be added by hand, as long as images are already clean, because the verifier enforces it.

### Incremental delivery

1. Add US3 (curator tooling) so real exhibits can be ingested safely. This is required before real content is published, because hand-cleaning images is error-prone.
2. Polish: accessibility, weight, full run, manual checks.

### Notes

- Never commit an image to `src/content/exhibits/` that didn't come from `exhibit:add` (research R3).
- Fixture content lives only under `tests/fixtures/`. `src/content/exhibits/` starts empty (with a `.gitkeep`) until the curator adds real exhibits.
