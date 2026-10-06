---

description: "Task list for the Velvet Room Visual Design feature"
---

# Tasks: Velvet Room Visual Design

**Input**: Design documents from `/specs/002-velvet-room-design/`

**Prerequisites**: plan.md, spec.md, research.md (R1–R13), data-model.md (design tokens), contracts/page-structure.md, quickstart.md (V0–V15)

**Tests**: Included. The plan and spec ask for automated checks (FR-003 click-through, FR-006 failure states, FR-007 contrast, FR-008 origins, FR-009 fonts, FR-010 no sideways scroll, FR-012 no motion, SC-001–SC-004), so each story starts with its tests, written first and shown failing.

**Organization**: Tasks are grouped by user story. Paths are repository-relative (single Astro project at the repo root).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 (gallery wall), US2 (exhibit page), US3 (phone), US4 (supporting pages)
- **(manual)**: needs a person, not the agent. These are called out because other tasks wait on them.
- **needs T005**: needs a browser in the devcontainer, which the developer enables in T005.

## Rules that apply to every task

- **Keep 001 green.** Do not change what any existing 001 test asserts. Class names and text that 001's tests rely on are listed in [contracts/page-structure.md](./contracts/page-structure.md) ("Preserved from 001").
- **No JavaScript, no third-party requests, no animation** (FR-008, FR-012). No `<script>`, `animation`, `@keyframes` or `transition` anywhere.
- **Tokens only.** Colours in `src/styles/gallery.css` come from the custom properties in [data-model.md](./data-model.md). Do not write colour literals outside `:root`. Shadows, highlights, piping, hairlines and the wall stripe use the `--shade`, `--velvet-shine`, `--piping`, `--hairline`, `--stripe` and `--rope-shade` tokens. Only `transparent`, `currentColor` and system-colour keywords such as `CanvasText` may appear as literals.
- **Layout numbers come from research R5**: 1 column below 40 rem, 2 from 40 rem, 3 from 58 rem, 4 from 76 rem; content at most 78 rem wide; cell padding 28 px (1.75 rem); gutter `max(1.75rem, 2.5vw)`.
- `gallery.css` is one file, so tasks that edit it are not marked [P] and run in the order listed. The same goes for `tests/build/room-structure.test.ts`.

---

## Phase 1: Setup (browser in the devcontainer, FR-016)

**Purpose**: Make Chromium runnable in the devcontainer so the browser-based checks (SC-001, SC-002) and 001's never-run e2e tests can run here. See research R13.

- [X] T001 In `.devcontainer/Dockerfile`, add a `USER root` step that installs Chromium's system libraries with `apt-get`, then returns to `USER dev`. Get the exact package list from `pnpm exec playwright install-deps --dry-run chromium` (do not type it from memory) and pin it in the file with a comment naming the command. First confirm `apt-get` works in the minimal `bare-devcontainer` base image. If it does not, use a multi-stage copy of the libraries from a Debian trixie stage instead and say so in a comment.
- [X] T002 [P] In `.devcontainer/devcontainer.json`, add a mount that persists `/home/dev/.cache/ms-playwright` (same style as the existing Corepack and pnpm mounts) and set `containerEnv` `PW_NO_SANDBOX=1`, because `--cap-drop=ALL` and `no-new-privileges` usually block Chromium's sandbox.
- [X] T003 [P] In `playwright.config.ts`, set `use.launchOptions.chromiumSandbox = false` only when `process.env.PW_NO_SANDBOX` is set, and leave the sandbox on otherwise. Add a one-line comment saying only the devcontainer sets it.
- [X] T004 [P] In `README.md` (Testing section), replace the note that Chromium's libraries "belong in the Dockerfile" with the actual setup: rebuild the container, then `pnpm exec playwright install chromium`, and mention `PW_NO_SANDBOX`.
- [X] T005 (manual, developer) Rebuild the devcontainer, then run `pnpm exec playwright install chromium` inside it and confirm `pnpm exec playwright test --list` works. Depends on T001–T004. Every task marked "needs T005" waits on this. Everything else can proceed before it.
- [X] T006 Record 001's e2e baseline (quickstart V0): create a throwaway git worktree of commit `db9f07f` (the last commit before any restyling), run `pnpm install` and `pnpm test:e2e` there, and write the pass/fail list to `specs/002-velvet-room-design/e2e-baseline.md`. Remove the worktree afterwards. Needs T005. Failures already present are 001's, not regressions; only fix one if it blocks a check for this feature, and report the rest.

**Checkpoint**: Chromium starts in the container and the baseline is recorded.

---

## Phase 2: Foundational (tokens, fonts, shell, guard tests)

**Purpose**: Everything the four stories share. No story starts until this is done.

- [X] T007 [P] Add the four self-hosted font files to `src/assets/fonts/`, taken from the Fontsource packages via `https://cdn.jsdelivr.net/npm/@fontsource/…/files/`: `bodoni-moda-latin-500-normal.woff2`, `eb-garamond-latin-400-normal.woff2`, `eb-garamond-latin-600-normal.woff2`, `eb-garamond-latin-400-italic.woff2` (about 90 KB in total). Add `src/assets/fonts/OFL.txt` with the SIL Open Font Licence text and both fonts' copyright lines. Do not add npm packages.
- [X] T008 [P] Write `tests/unit/room-contrast.test.ts`: read `src/styles/gallery.css`, parse the `:root` custom properties, and assert at least 4.5:1 for cream on wall, cream-dim on wall, gold on wall, gold-hi on wall, brass-ink on gold, plaque-ink on plaque, and cream on matting; at least 3:1 for gold-hi (focus ring) on wall. Read `--spotlight-index` and `--spotlight-exhibit` from `:root` (each an `rgba()` value), blend each over the wall to get its peak colour, and assert cream and cream-dim reach 4.5:1 on both peaks (gold is deliberately not allowed over a spotlight, research R2). Add a completeness check that scans only the declarations present in the stylesheet when the test runs, and asserts every colour declaration (`color`, `background`, `background-color`, `border-color`, `box-shadow`, `outline`) uses a `var(--…)` token defined in `:root` (allowing only `transparent`, `currentColor`, `none` and system-colour keywords such as `CanvasText`), so the check passes once T010 has replaced the legacy rules and then guards every later CSS task. Run it and confirm it fails (the tokens do not exist yet).
- [X] T009 Write `tests/build/room-structure.test.ts` with a "stylesheet" block: on the fixture build in `dist/`, the built CSS declares `@font-face` for all four fonts with `font-display: swap`, every `url()` in it is same-origin or relative and points at a file that exists in `dist/`, and the CSS contains no `animation`, `@keyframes` or `transition`. Read the CSS from linked stylesheets and from inlined `<style>` blocks. Use the helpers in `tests/build/dist.ts`. Confirm it fails.
- [X] T010 Replace the whole of `src/styles/gallery.css` with the new base stylesheet, deleting every legacy rule so no rule refers to the old tokens (`--ink`, `--muted-ink`, `--accent`, `--frame`, `--gap`, and the old `--wall`/`--plaque` values). Contents: the `:root` tokens with the exact values in [data-model.md](./data-model.md) (`--wall #3a0a12`, `--velvet #9a1a2c`, `--gold #d9b45b`, `--gold-hi #f4dc94`, `--gold-lo #8a6a24`, `--cream #f1e6cf`, `--cream-dim #cdbf9f`, `--brass-ink #1c0f08`, `--plaque #efe3c6`, `--plaque-ink #241812`, `--plaque-rule #b8923f`, `--matting #24070d`, `--shade rgba(0, 0, 0, 0.5)`, `--velvet-shine rgba(255, 150, 150, 0.28)`, `--piping rgba(217, 180, 91, 0.6)`, `--hairline rgba(217, 180, 91, 0.5)`, `--stripe rgba(255, 255, 255, 0.018)`, `--rope-shade #5a3d0c`, `--spotlight-index rgba(255, 214, 150, 0.22)`, `--spotlight-exhibit rgba(255, 214, 150, 0.26)`, `--gutter: max(1.75rem, 2.5vw)`, `--measure: 38rem`, `--font-display`, `--font-body`); four `@font-face` rules with `font-display: swap` pointing at `../assets/fonts/…`; fallback stacks `Georgia, 'Times New Roman', serif`; the oxblood wall with the faint 1.8% vertical stripe; cream body text; gold links; the pale-gold 3 px focus outline with 4 px offset; and the behavioural rules that 001 needs, restyled with tokens only: `.visually-hidden`, and the `.exhibit-image` "Image unavailable" reveal (`.image-unavailable-notice` hidden by default and shown, with the image hidden, under `.image-unavailable`). The component rules (grid, cards, exhibit page, plaque, pagination) are removed here and rebuilt in the story phases, so the site is plainly styled until then. Remove the old "restrained palette" comment. Depends on T007. T008 must now pass.
- [X] T011 Restyle the shared shell. In `src/layouts/Gallery.astro` keep `.site-header`, `.site-name` and `.site-footer` with the "About the collection" link to `/about/` and only change what the design needs. In `src/styles/gallery.css` style the site name (display face, uppercase, 0.42em tracking, gold) with a double gold rule beneath, the footer hairline, and `main` at most 78 rem wide with the `--gutter` side padding. Depends on T010.
- [X] T012 [P] In `tests/build/weight.test.ts`, also count every font file that the referenced stylesheets load through `url()`, in addition to the existing images and stylesheets, and keep the 1.5 MB budget unchanged. Find the CSS whether Astro links it (`link[rel="stylesheet"]`) or inlines it as a `<style>` block, and read `url()` references from both. Add a comment that the fixture images are about 1 KB, so today the test mostly measures HTML, CSS and fonts (research R11).
- [X] T013 [P] In `tests/build/no-source-data.test.ts`, add a check that the built CSS files contain no `@import` and no `url()` with an `http:` or `https:` origin other than the test origin.

**Checkpoint**: `pnpm test` and `pnpm test:build` pass (T009 now passes too), and the whole site shows the oxblood wall, the fonts and the new header and footer, with plain styling below them until the stories land.

---

## Phase 3: User Story 1 - Browse the gallery wall (Priority: P1) 🎯 MVP

**Goal**: Index pages show each exhibit in a gold frame on a red velvet pillow, with a brass nameplate and a gold cordon, in 1 to 4 columns.

**Independent Test**: Load `/` (and `/page/2/`) on the fixture build at 1440 px and compare with `design/gallery-museum/preview/Main.html`: wall, frames, pillows, nameplates and cordon present, every card still links to its exhibit, paging and the About link work, and the card text is only the display title.

### Tests for User Story 1 (write first, confirm they fail)

- [X] T014 [US1] In `tests/build/room-structure.test.ts`, add an "index cards" block: every `.exhibit-card` on `/` and `/page/2/` has exactly one `.frame` containing the `img`, one `.pillow[aria-hidden="true"]`, one `.card-title`, and one `span.cordon[aria-hidden="true"]` that is a sibling of the `a` (not inside it), has no text, and contains one `svg[aria-hidden]` and two `.post` elements; the `a`'s trimmed text equals the `.card-title` text; the page has no `xmlns` other than `http://www.w3.org/`. Depends on T009.
- [X] T015 [P] [US1] Create `tests/e2e/room.spec.ts` (project `fixtures`) with two tests for `/` at 1440 px. (a) **Failed thumbnails keep their parts (FR-006, V5):** abort every image request with `page.route(/\.(webp|jpe?g|png|avif)$/, route => route.abort())`, load `/`, and assert that all 12 `.exhibit-card` elements still show a visible `.frame`, `.pillow` and `.card-title`. (b) **Cordon click-through (FR-003, V3):** for every `.cordon`, assert the computed `pointer-events` is `none` and it holds no focusable element; then take the centre of the first card's rope (`.cordon svg` bounding box), assert `document.elementFromPoint` at that point returns an element inside the card's `a` and not inside any `.cordon`, and click there and assert the URL becomes that card's `/exhibits/<NNN>/` page. Needs T005 to run; confirm it fails before T017–T020.

### Implementation for User Story 1

- [X] T016 [P] [US1] Create `src/components/Cordon.astro`: a `<span class="cordon" aria-hidden="true">` containing `<span class="post post-left">`, an inline `<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">` with three `<path>` strokes (a dark under-stroke, the gold rope, and a pale dashed twist, all with `vector-effect="non-scaling-stroke"` and no `xmlns` attribute), and `<span class="post post-right">`. No text. Follow contracts/page-structure.md "Cordon".
- [X] T017 [US1] Restructure `src/components/ExhibitCard.astro` per contracts/page-structure.md "Index card": inside the existing `a`, wrap the `Image` in `<span class="frame">`, add `<span class="pillow" aria-hidden="true">`, and keep `<span class="card-title">`; add `<Cordon />` after the `a`. Keep the `li.exhibit-card`, the link `href`, the `Image` props (`widths`, `sizes`, `loading`, `alt`) and the display title unchanged. Depends on T016.
- [X] T018 [US1] In `src/styles/gallery.css`, build the layout: `.exhibit-grid` with no column gap and **1 column below 40 rem, 2 columns from 40 rem, 3 from 58 rem, 4 from 76 rem**; each `.exhibit-card` is `position: relative` with 1.75 rem (28 px) horizontal padding, so cells are never narrower than about 290 px in any multi-column layout (research R5). Depends on T011.
- [X] T019 [US1] In `src/styles/gallery.css`, style the piece: `.frame` (width `min(100%, 14rem)` of the padded content, padding with the gold gradient `--gold-hi` → `--gold` → `--gold-lo`, `--matting` behind the image, square image crop kept from 001), `.pillow` (velvet fill with inset highlight and shade, 1 px gold piping, two small gold tassels reaching 7 px beyond each end, width `min(frame width + 2.5rem, cell width − 14px)` so the tassels stay inside the cell, allowed to overhang the cell padding, placed behind the frame and overlapping its lower edge), `.card-title` as the brass nameplate (`--gold` fill, `--brass-ink` text, display face, double inner rule), and a radial-gradient spotlight on the cell built from `--spotlight-index` (cream text only over it). Depends on T018.
- [X] T020 [US1] In `src/styles/gallery.css`, style the rest of the page: `.cordon` (`position: absolute`, `pointer-events: none`, above the pillow and never over text; posts as CSS with a brass gradient stem, ball finial and base disc, at the card's left and right edges so neighbours coincide; rope SVG stretched across the card), `.wall-text` as a cream italic inscription at 38 rem, `.pagination` links in gold with the current page in cream bold, `.empty-state` in cream-dim, the card-link focus ring around the whole card, hover as colour or underline only, and an `@media (forced-colors: active)` block giving `.frame`, `.card-title` and `.plaque` a 1 px `CanvasText` border. Depends on T019.
- [X] T021 [US1] Visual check against the reference (needs T005 for screenshots; otherwise ask the developer to look): run the site with `pnpm dev:host`, capture `/` at 1440, 1024 and 768 px with Playwright, compare with `design/gallery-museum/preview/Main.html`, and adjust CSS until wall, frame, pillow, nameplate and cordon match. Also check a short last row, a page with one to three exhibits, and a long custom title in the nameplate (it must wrap, not overflow).
- [X] T022 [US1] Run `pnpm test`, `pnpm test:build`, and (needs T005) `pnpm exec playwright test tests/e2e/browse.spec.ts tests/e2e/empty.spec.ts tests/e2e/room.spec.ts`. Everything must pass, including T014, T015 and 001's exact card-text assertions.

**Checkpoint**: The gallery wall is complete and deployable on its own. This is the MVP.

---

## Phase 4: User Story 2 - View a single exhibit in the spotlight (Priority: P1)

**Goal**: The exhibit page shows one large framed piece on a pillow with the cordon in front, the caption on a cream plaque, and the framing note and back link below.

**Independent Test**: Open `/exhibits/017/` on the fixture build and compare with `design/gallery-museum/preview/Exhibit.html`: title heading, framed uncropped image, pillow, cordon, cream caption plaque separate from the alt text, framing note, back link, and a working "Image unavailable" state.

### Tests for User Story 2 (write first, confirm they fail)

- [X] T023 [US2] In `tests/build/room-structure.test.ts`, add an "exhibit page" block for `/exhibits/017/`: `figure.exhibit-figure` contains one `.exhibit-mount` holding `.exhibit-image` (with the `img` and the `.image-unavailable-notice`) and one `.pillow[aria-hidden="true"]`, then one `span.cordon[aria-hidden="true"]` with no text, then one `figcaption.plaque`; exactly one element on the page has class `plaque`; the caption text does not contain the image's `alt`; the `img` keeps its `alt` and the inline `onerror`. Depends on T014.

### Implementation for User Story 2

- [X] T024 [US2] Restructure `src/pages/exhibits/[number].astro` per contracts/page-structure.md "Exhibit page": inside `figure.exhibit-figure`, wrap the existing `.exhibit-image` block and a new `<span class="pillow" aria-hidden="true">` in `<div class="exhibit-mount">`, then `<Cordon />`, then the existing `<Plaque>`. Keep the `h1`, the `Image` props, the `onerror` attribute, the "Image unavailable" notice, `.framing-note` and `.back-link` unchanged, and leave the tombstone branch as it is. Depends on T016.
- [X] T025 [US2] In `src/styles/gallery.css`, style the exhibit page: `h1` in the display face; `.exhibit-figure` with a spotlight built from `--spotlight-exhibit` (cream text only over it); `.exhibit-mount` shrink-wrapped (`width: fit-content`, image at most 36 rem wide and at most 80 vh tall, shown whole with `object-fit: contain`, so any aspect ratio is uncropped); `.exhibit-image` as the gold frame with `--matting` behind the image; the exhibit-page `.pillow` at frame width plus 8 rem, capped so its tassels stay inside the figure; the cordon spanning the figure at `min(100%, 56rem)` in front of the pillow; `.plaque` cream (`--plaque`, `--plaque-ink`) with the `--plaque-rule` double inner rule and the 38 rem measure; the `.image-unavailable` notice in cream on `--matting`; `.framing-note` and `.back-link` in cream-dim and gold, outside the spotlight. Depends on T020.
- [X] T026 [P] [US2] In `specs/002-velvet-room-design/contracts/page-structure.md`, correct the exhibit page tree so the caption element reads `figcaption.plaque`, matching `src/components/Plaque.astro`, which renders the `figcaption` itself with class `plaque`. Do not change `Plaque.astro`.
- [X] T027 [US2] Visual and edge check (needs T005 for screenshots): compare `/exhibits/017/` at 1440 and 390 px with `design/gallery-museum/preview/Exhibit.html`. Then, in a scratch directory, generate one wide and one tall exhibit image with sharp, build with `EXHIBITS_DIR` pointing at a copy containing them, and confirm the frame and pillow adapt and the image is uncropped. Also check the image-unavailable state by blocking image requests. Adjust CSS as needed.
- [X] T028 [US2] Run `pnpm test`, `pnpm test:build`, and (needs T005) `pnpm exec playwright test tests/e2e/exhibit.spec.ts`. All must pass, including T023.

**Checkpoint**: Both P1 stories work. The two main page types carry the full design.

---

## Phase 5: User Story 3 - Visit on a phone (Priority: P2)

**Goal**: The same room in one column from 320 px up, with no sideways scrolling and legible text at any width from 320 to 1920 px and at 200% zoom, including when the web fonts do not load.

**Independent Test**: At 320, 390, 768, 1024, 1280, 1440 and 1920 px, every page type is no wider than the screen, and `/` at 390 px matches `design/gallery-museum/preview/Mobile.html`.

### Tests for User Story 3 (write first)

- [X] T029 [P] [US3] Create `tests/e2e/responsive.spec.ts` (project `fixtures`) with three tests. (a) **No sideways scroll:** for each width in 320, 390, 768, 1024, 1280, 1440, 1920 and each of `/`, `/page/2/`, `/exhibits/017/`, `/exhibits/042/`, `/about/` and `/no-such-page/`, assert `document.documentElement.scrollWidth <= window.innerWidth`; at 390 px also assert every `.exhibit-card` `.pillow` and its tassels lie within the card. Also assert the column count changes at the breakpoints: 1 column at 390 px, 2 at 700 px, 3 at 960 px, 4 at 1280 px (compare distinct `.exhibit-card` left offsets on the first row). (b) **Blocked fonts (FR-009):** abort `**/*.woff2` requests, then at 320 and 1440 px on `/` and `/exhibits/017/` assert there is no sideways scroll and every `.card-title` has `scrollWidth <= clientWidth + 1` (the fallback serif still fits its nameplate). (c) **Forced colours:** `page.emulateMedia({ forcedColors: 'active' })` on `/` and `/exhibits/017/`, then assert `.frame`, `.card-title` and `.plaque` have a computed `border-top-width` greater than 0.
- [X] T030 [P] [US3] In `tests/e2e/a11y.spec.ts`, run the existing page list a second time at a 390 × 844 viewport (same axe tags, same "no serious or critical" assertion), without changing the existing desktop runs.
- [X] T031 [P] [US3] In `tests/e2e/empty.spec.ts` (project `empty`, port 4322), add a check that the empty gallery has no sideways scroll at 320, 390 and 1440 px.

### Implementation for User Story 3

- [X] T032 [US3] In `src/styles/gallery.css`, tune the small-screen rules until T029–T031 pass: one column below 40 rem with the frame at `min(100%, 14rem)` of the padded content (208 px at a 320 px screen) and the pillow capped so its tassels stay inside the cell (248 px at 320 px); `--gutter` never below 1.75 rem so the outer posts (about 27 px each) stay inside the screen; smaller site-name tracking and heading sizes on narrow screens; wrapping for long words in nameplates and plaque text (`overflow-wrap: anywhere`); text sized in `rem` throughout so it scales; fallback-font metrics that keep nameplate text inside its box. Depends on T025.
- [ ] T033 [US3] Verify (needs T005): run `pnpm test:e2e` for T029–T031 and fix any overflow. Then check by hand at 200% browser zoom on a 1280 px screen and with browser text size at 200% on a 390 px screen (quickstart V9, a manual criterion), and compare `/` at 390 px with `design/gallery-museum/preview/Mobile.html` (V10).

**Checkpoint**: All page types are usable from 320 to 1920 px, with or without the web fonts.

---

## Phase 6: User Story 4 - Supporting pages share the room (Priority: P3)

**Goal**: About, "no longer available", 404 and the empty gallery use the same wall, type and furniture, with no pillow or cordon.

**Independent Test**: Open `/about/`, `/exhibits/042/` and `/no-such-page/` and confirm the room's wall, fonts, header, footer and colours, and that axe reports no contrast failures.

### Tests for User Story 4 (write first)

- [X] T034 [US4] In `tests/build/room-structure.test.ts`, add a "supporting pages" block for `/about/`, `/exhibits/042/` and `/404.html`: each has an `h1`, the shared `.site-header` and `.site-footer` with the About link, and no `.frame`, `.pillow` or `.cordon`; `/exhibits/042/` still has no `img` in `main` and its text still reads "Exhibit No. 042 is no longer available." Depends on T023.

### Implementation for User Story 4

- [X] T035 [US4] In `src/styles/gallery.css`, style the text pages: `.prose` at the 38 rem measure in cream with the body face, `h1` sizing on these pages, links in gold, `.empty-state` in cream-dim, and the tombstone and 404 link spacing. Leave `src/pages/about.astro`, `src/pages/404.astro` and the tombstone markup unchanged. Depends on T032.
- [X] T036 [US4] Verify: run `pnpm test:build` for T034 and (needs T005) `pnpm exec playwright test tests/e2e/a11y.spec.ts`; compare the three pages by eye for consistency with the gallery (quickstart V13).

**Checkpoint**: The whole site, including its least-visited pages, sits in one room.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T037 [P] In `specs/001-gallery-mvp/plan.md`, change the project-layout note for `gallery.css` from "restrained palette, AA-checked tokens" to "velvet room palette (feature 002), AA-checked tokens". In `specs/002-velvet-room-design/plan.md`, add `tests/e2e/room.spec.ts` to the project structure tree, described as "NEW: failed thumbnails keep their parts; cordon never blocks clicks".
- [X] T038 [P] In `design/gallery-museum/README.md`, add a short "Status" note: the velvet room is implemented by feature 002, and the caveats about Google Fonts, the four-column cordon and placeholder images are resolved there (self-hosted fonts, per-card cordon, real images). Keep the light option documented as unused.
- [X] T039 Run the full suite (needs T005): `pnpm test`, `pnpm test:build`, `pnpm test:e2e`. Confirm every 001 check passes, compare against `specs/002-velvet-room-design/e2e-baseline.md`, and run `git diff` on `tests/` to confirm no existing assertion was changed: only additions and the **four** edits to existing 001 test files listed in T012 (`weight.test.ts`), T013 (`no-source-data.test.ts`), T030 (`a11y.spec.ts`) and T031 (`empty.spec.ts`). The other test files (`room-contrast.test.ts`, `room-structure.test.ts`, `room.spec.ts`, `responsive.spec.ts`) are new. This covers FR-013, SC-006 and quickstart V15.
- [ ] T040 Walk the quickstart validation table in [quickstart.md](./quickstart.md): V0–V8, V10, V12 and V13 are covered by tests (V3 click-through and V5 thumbnail failure by `room.spec.ts`, the blocked-fonts case by `responsive.spec.ts`); do V9 (zoom), V6 (network tab shows no off-origin request and fonts served from `/_astro/`) and, if not fully covered by T029, V11 (forced colours) by hand, and note any result that needs follow-up.
- [ ] T041 (manual, developer) Reviewer sign-off (V14, SC-005, SC-007): compare each page type with the reference previews, and show index page 1 to five people, asking whether it looks like a museum. Record the result in the pull request.
- [X] T042 Prepare the pull request description with the review that constitution v3.2.0 requires for a design change: the design is checked against Principle II (palette allowed, WCAG AA enforced by `tests/unit/room-contrast.test.ts`, no engagement patterns, nothing animates), Principle III (no platform styling), and Principle V (no new site dependency). Also note the devcontainer change. Keep the Sync Impact Report comment at the top of `.specify/memory/constitution.md`, as the previous amendment commits did.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: T001–T004 can start at once (T002–T004 in parallel). T005 is manual and needs them. T006 needs T005.
- **Foundational (Phase 2)**: needs no browser, so it can start immediately, even while T005 is pending. It blocks all stories. Order: T007, T008, T012 and T013 in parallel, then T009, then T010 (after T007 and T008), then T011.
- **User stories** need Phase 2:
  - **US1 (P1)** first. It creates the shared `Cordon`, frame and pillow styling.
  - **US2 (P1)** needs T016 (Cordon) and T020 (cordon, frame and pillow CSS) from US1, so it follows US1.
  - **US3 (P2)** tunes what US1 and US2 built, so it follows both. Its test tasks (T029–T031) can be written earlier, in new files, but they only pass once T032 is done.
  - **US4 (P3)** needs only Phase 2 and the CSS file order, so its test (T034) can be written any time after T023, and its CSS follows T032 because the file is shared.
- **Polish (Phase 7)**: needs all stories. T039 and T040 need T005.

### Tasks that need T005 (the container rebuild)

T006, T015 (to run), T021 (screenshots), T022 (e2e part), T027 (screenshots), T028 (e2e part), T029–T031 (to run), T033, T036 (e2e part), T039 and T040. The agent can do all other work first and leave these until the developer has rebuilt.

### Within each story

Tests first (and failing), then components, then CSS, then the visual check, then the test run.

### Parallel opportunities

- Phase 1: T002, T003, T004 together.
- Phase 2: T007, T008, T012, T013 together (four different files).
- Phase 3: T015 (a new e2e file) with T014 and T016 (a test in a different file and a new component).
- Phase 5 tests: T029, T030, T031 together (three different files).
- Polish: T037 and T038 together.
- Not parallel: anything touching `src/styles/gallery.css` (T010, T011, T018–T020, T025, T032, T035) or `tests/build/room-structure.test.ts` (T009, T014, T023, T034).

### Parallel example: Foundational start

```bash
Task: "Add the four self-hosted font files and OFL.txt in src/assets/fonts/"          # T007
Task: "Write tests/unit/room-contrast.test.ts (failing)"                               # T008
Task: "Extend tests/build/weight.test.ts to count font files"                          # T012
Task: "Extend tests/build/no-source-data.test.ts to scan CSS for foreign origins"      # T013
```

---

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 T001–T004 (and ask the developer for T005 early, since it is a wait).
2. Phase 2 Foundational.
3. Phase 3 User Story 1, then **stop and validate**: the gallery wall looks like the reference, and 001's tests still pass. This alone gives the site its new identity.

### Incremental delivery

1. Setup and Foundational, then US1 (MVP).
2. US2: the exhibit page, so a shared link lands in the same room.
3. US3: phone and small-screen hardening, backed by the responsive tests.
4. US4: the supporting pages.
5. Polish, the full run and the sign-off.

### Notes

- Commit after each task or small group. The four stories are independent enough to ship in order.
- Verify each test fails before its implementation.
- A design change is only "done" when T039 shows 001's checks unchanged and T041 has the reviewer's sign-off.
