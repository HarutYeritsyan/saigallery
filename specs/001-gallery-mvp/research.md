# Research: Gallery MVP

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-23

Each entry resolves an open item from the plan's Technical Context or from the spec's
remaining low-impact gaps (page size, fate of an unpublished exhibit's image).

## R1. Site architecture and framework

- **Decision**: A fully static site built with Astro (current stable major at implementation
  time), TypeScript, managed with pnpm via Corepack, on Node.js 26 (the devcontainer's runtime).
  No server, no database, no client-side framework. Pages ship zero JavaScript by default.
- **Rationale**: The repository scaffolding already commits to Astro (devcontainer comments,
  `astro-build.astro-vscode` extension, Astro entries in `.gitignore`, `pnpm astro` in the
  permission policy). A static build satisfies every functional requirement: the catalog is
  small, changes only when the curator publishes, and has no visitor input at all
  (constitution v3.0.0 Principle IV removed the only visitor-facing write path). This is the
  literal reading of Principle V ("static-first").
- **Alternatives considered**:
  - *Server-rendered app with a database and admin UI*: rejected. Adds hosting, auth for the
    curator, and a data store that would itself need Principle III auditing, for a
    single-curator, low-frequency workflow.
  - *Hand-written HTML*: rejected. Pagination, responsive images, and build-time validation
    would all be re-implemented by hand.
  - *Other static generators (Eleventy, Hugo)*: viable, but the project is already set up
    for Astro, and Astro's content collections give schema validation for free.

## R2. How the curator publishes (content storage)

- **Decision**: Exhibits live in the repository as an Astro content collection: one Markdown
  file per exhibit (frontmatter = structured fields, body = curatorial caption) next to its
  cleaned image, both named by catalog number (`src/content/exhibits/017.md`,
  `src/content/exhibits/017.webp`). Publishing is: run the ingest script → review caption →
  commit → build/deploy.
- **Rationale**: Git is the simplest "CMS" for one trusted curator (spec Assumptions), gives
  an audit trail, and costs nothing to host. Per the spec's "Curator trust" assumption, the
  curator may commit exhibits directly: no pull request, confirmation step or other check is
  required to publish. SC-005 (publish in under 5 minutes) is achievable: one script invocation plus writing the caption.
- **Alternatives considered**: headless CMS (external service, third party holding content,
  account needed — rejected under Principle V); JSON/YAML data file for all exhibits (merge
  conflicts, and captions are prose better suited to Markdown bodies).

## R3. Stripping embedded metadata and neutral filenames (FR-013)

- **Decision**: Clean at **ingest**, before anything enters the repository, and **verify at
  build**:
  1. `pnpm exhibit:add <path-to-image>` decodes the image and re-encodes it with `sharp` to
     WebP (quality 90), without carrying over any metadata (EXIF, XMP, IPTC, ICC profile,
     PNG text chunks such as generator "parameters"). It writes it as `<NNN>.webp`, never
     using the original filename.
  2. A verification step (`scripts/verify-exhibits.mjs`) runs before every build and in the
     test suite. It fails if any exhibit image carries EXIF/XMP/IPTC/ICC data or text
     chunks, or if its filename is not exactly the catalog number.
  3. Astro's image pipeline then derives display variants from the already-clean file.
     Output names are `<NNN>.<hash>.webp`, so no original filename can appear.
- **Rationale**: Cleaning at ingest (not only at build) matters because the repository is
  itself a "store the system controls" (FR-004). If raw files were committed and cleaned only
  at build, the metadata would persist in git history. Re-encoding is more reliable than
  selectively deleting tags: it drops every chunk type, including ones not anticipated.
- **Alternatives considered**: `exiftool -all=` (external binary not in the devcontainer;
  selective tag removal can miss vendor chunks); relying only on Astro's build-time
  transform (leaves raw originals in the repo and, depending on configuration, emits the
  original file into the build output).
- **Residual risk**: a curator could commit a raw file by hand, bypassing the script. The
  build-time verification catches this before deploy. The curator guide warns never to
  commit an uncleaned file, because git history would retain it even after a fix.

## R4. Catalog numbers and titles (FR-012)

- **Decision**: The catalog number is the exhibit's content ID (the filename stem, 3-digit
  zero-padded, growing naturally past 999). The ingest script assigns
  `max(existing numbers, including unpublished tombstones) + 1` when the draft is created
  (spec FR-012: assigned when added). The index order therefore reflects when exhibits were
  added, not published (spec "Index order" assumption). Entry files are never
  deleted, so numbers are never reused. The display title is `title` if set, else
  `Exhibit No. <NNN>`. Detail URLs use the number only (`/exhibits/017/`), so renaming the
  title never changes the address.
- **Rationale**: Deriving the number from the filename makes uniqueness structural
  (the filesystem forbids duplicates). Keeping tombstones makes "never reused" hold without a
  separate registry.
- **Alternatives considered**: title-based slugs in URLs (break when the curator sets a
  custom title later); a separate counter file (a second source of truth that can drift).

## R5. Index pagination, order and "return to the same page" (FR-001, US2 scenario 3)

- **Decision**: Static pagination with 12 exhibits per page (a 4×3 grid on desktop): `/` is
  page 1, `/page/2/`, `/page/3/`, etc. Order is by descending catalog number. Each detail
  page's "Back to the gallery" link points to the index page containing that exhibit. The
  build computes that page from the exhibit's position in the ordered list, so no browser
  history or client state is needed.
- **Rationale**: Numbered pages with explicit next/previous links satisfy FR-001 and SC-003
  with zero JavaScript. 12 per page keeps the floor calm (Principle II) and divides evenly
  into 2-, 3- and 4-column layouts. Computing the back link at build time is deterministic
  and testable.
- **Known limitation**: if an exhibit is published between a visitor opening the index and
  following a back link, the exhibit may have shifted to the next page. This is acceptable
  for an MVP with low publishing frequency.
- **Alternatives considered**: "load more" button (needs JavaScript and client state for
  back navigation); relying on browser history (fails when the detail page is opened directly
  from a shared link).

## R6. Lifecycle of drafts and unpublished exhibits (FR-009, FR-010)

- **Decision**: Three statuses: `draft`, `published`, `unpublished`.
  - `draft`: no page is generated at all. It exists so the ingest script can create the entry
    before the caption is written.
  - `published`: the schema requires image, non-empty caption and non-empty alt text. The
    build fails otherwise (FR-009).
  - `unpublished`: `pnpm exhibit:unpublish <NNN>` **deletes the image file and clears the
    caption, alt text and title**, leaving a tombstone (`number` + `status`). The detail URL
    renders a plain "This exhibit is no longer available" page (HTTP 200, since static hosts
    can't reliably return 410, and the spec requires "not an error"). It is excluded from the
    index. Unpublishing is one-way: re-exhibiting means ingesting it again under a new number.
- **Rationale**: Deleting the content on unpublish guarantees the image can't leak into the
  build output via the asset pipeline. It also avoids keeping content the site no longer
  shows. It resolves the spec's open question about unpublished images. The file stays in git
  history, which is acceptable: it holds no source metadata (R3), so Principle III is met.
- **Alternatives considered**: keeping unpublished content in place and hiding it (risk of
  emitting the image asset, and indefinite retention of undisplayed content); deleting the
  whole entry (the direct URL would become a 404, violating FR-010, and the number could be
  reused, violating FR-012).

## R7. Testing strategy

- **Decision**:
  - **Vitest** for unit tests: title derivation, ordering/pagination/back-link math, content
    schema, and the metadata/filename verifier (run against fixture images that do contain
    EXIF/XMP/PNG text chunks).
  - **Build-output tests** (Vitest over `dist/`): no source-like fields or forbidden words in
    markup, no forms, no `<script>` beyond Astro defaults, unpublished exhibits have no
    emitted image, and every published image in `dist/` passes the metadata verifier
    (SC-002).
  - **Playwright + @axe-core/playwright** for end-to-end journeys (US1–US3 acceptance
    scenarios) and WCAG AA checks (FR-006, SC-004), against `astro preview`.
- **Rationale**: The constitution makes accessibility, including contrast, a MUST, and
  contrast can only be checked reliably in a rendering browser. Everything else is covered by
  fast Node-only tests.
- **Alternatives considered**: pa11y (overlaps with axe; another browser wrapper);
  html-validate only (cannot check contrast).

## R8. Third-party requests, analytics and hosting

- **Decision**: No analytics, no tracking pixels, no third-party fonts, scripts or embeds.
  Fonts, if any, are self-hosted. The build output is plain static files that any static host
  can serve. Choosing and configuring the host is out of scope for this feature.
- **Rationale**: Analytics exist to optimize engagement metrics, which Principle II forbids
  as a goal. Third-party requests also leak visitor data for no curatorial benefit. Keeping
  deployment host-agnostic follows Principle V.
- **Alternatives considered**: privacy-friendly analytics (still a step toward measuring
  "session length / return visits", which the Development Workflow gate rejects as goals).

## R9. Performance targets

- **Decision**: Every page is a static file. The index serves responsive thumbnails
  (≤ 480 px wide variants, lazy-loaded below the first row). Detail pages serve a responsive
  full image (variants up to 1600 px). Target: index page transfers ≤ 1.5 MB on first load,
  and pages are usable within 2 s on a typical broadband connection.
- **Rationale**: Supports SC-001 (index → detail in under 10 s of interaction) with a wide
  margin, without adding any runtime infrastructure.

## R10. Collection framing: introduction and About page (FR-014, Principle VI)

- **Decision**: The framing text lives in two curator-editable Markdown files in a `site`
  content collection: `src/content/site/intro.md` (2–4 sentences, rendered above the grid on
  index page 1 only) and `src/content/site/about.md` (rendered at `/about/`). The shared
  `Gallery.astro` layout puts an "About the collection" link in the footer of every page,
  including the tombstone and 404 pages. Every published exhibit page also shows a fixed
  one-line note that names no platform ("From a collection of real images found in public
  social media posts"), linking to `/about/`, for visitors who arrive from a shared link. The build fails if either file is missing or empty.
  Initial copy is drafted during implementation and states the four facts FR-014 requires:
  real images, actual public posts on LinkedIn and other social media, meant to engage or
  inform, and selected because they grossly failed.
- **Rationale**: Keeping the text in content files lets the curator reword it without touching
  templates. Putting the link in the layout (rather than in each page) makes "every page" true
  by construction, and a build-output test verifies it (SC-006). LinkedIn is named only in
  prose. No platform logos, colors, or post-card styling are used anywhere, so no individual
  exhibit reads as attributed to a platform (Principle III).
- **Alternatives considered**: hard-coding the text in templates (every rewording becomes a
  code change); a site-wide subtitle only (rejected in clarification, too terse to carry the
  "meant to engage or inform, and failed" message); an entrance page (rejected in
  clarification, since it adds a step before the gallery).

## R11. Authenticity and identifying details in images

- **Decision**: The system does **not** check, prompt for, or record authenticity or the
  removal of identifying details (spec "Curator trust" assumption). The curator crops or
  covers names, handles, avatars and platform interface *before* running `exhibit:add`, using
  whatever image tool they like. The ingest script only strips metadata and renames. It prints
  one line of reminder text (no prompt, no stored flag).
- **Rationale**: This is the user's explicit decision. Automated detection of usernames or UI
  in screenshots (OCR, template matching) would be unreliable and complex, which Principle V
  rejects anyway.
- **Accepted risk**: an exhibit that still shows identifying details would be published as-is.
  The only remedy is the curator noticing and unpublishing or re-ingesting it.

## R12. Search indexing and link previews (FR-015)

- **Decision**:
  - No `noindex` anywhere. Pages carry standard link-preview metadata (Open Graph and
    `twitter:card` tags), generated by one shared head component.
  - **Published exhibit pages**: `og:title` is the display title, `og:image` is a 1200 px-wide
    JPEG derived from the cleaned image, `twitter:card` is `summary_large_image`, and
    `og:description` is the fixed collection-level description, which names no platform:
    it sits next to one specific exhibit's image, so naming LinkedIn there would label that
    exhibit (Principle III).
  - **Index, About, "no longer available" and 404 pages**: collection title and description
    only, with no `og:image`.
  - The public base URL comes from a required build setting (`SITE_URL`), because preview
    images need absolute URLs. A production build fails if it's missing.
- **Rationale**:
  - The spec allows the description to be the collection text or a caption excerpt. The
    collection text is chosen because it's constant, needs no truncation rules, and can't
    carry anything a caption review missed.
  - JPEG is used for the preview variant because not every social platform accepts WebP for
    previews. The variant is derived from the already-cleaned file and re-encoded without
    metadata, so FR-013 still holds and the verifier checks it in the build output (V5).
  - Emitting no exhibit image on tombstone pages means a platform that re-scrapes an
    unpublished exhibit gets no image. Previews it cached earlier are outside the site's
    control (spec edge case).
- **Alternatives considered**:
  - Caption excerpt as the description: spreads critique text into the source platforms' feeds
    without its museum context, and needs truncation rules.
  - Generating a composed "museum card" preview image: extra build machinery. Principle V says
    no until a need is shown.
  - A sitemap: not needed for a catalog this small, and adds nothing FR-015 requires.
