# Research: Velvet Room Visual Design

Decisions that turn the spec and the `design/gallery-museum/` reference into a buildable
approach. Nothing here was left as "NEEDS CLARIFICATION".

## R1. Typefaces: self-host four Latin woff2 files

- **Decision**: Commit Latin-subset woff2 files under `src/assets/fonts/`, taken from the
  Fontsource packages' published files, together with their SIL Open Font Licence text:
  Bodoni Moda 500 (15 KB) for the site name, headings and nameplates, and EB Garamond 400
  (24 KB), 600 (25 KB) and 400 italic (25 KB) for body text, captions and the intro. About 90 KB
  in total. Declare them with `@font-face` and `font-display: swap`. Fallback stacks are
  `Georgia, 'Times New Roman', serif` (body) and the same for display. Vite hashes the files and
  serves them from the site's own origin.
- **Rationale**: Meets FR-008/FR-009 (no third-party requests, fonts served from the site) and
  keeps the mockup's look. 90 KB is small against the 1.5 MB budget. Committing the files means the
  build needs no network. `swap` shows readable text at once in the fallback serif.
- **Glyph coverage**: The Latin subset covers Latin-1 and typographic punctuation such as ’ and —.
  A curator title in another script falls back to the system serif, which is acceptable.
- **Alternatives considered**: (a) Google Fonts links, as in the mockups: forbidden by FR-008.
  (b) Astro's Fonts API: downloads at build time, so builds need network and the font source is
  a moving part; no benefit for four fixed files. (c) Fontsource npm packages: pnpm 12's release-age
  rule and two more dependencies against Principle V, for files that never change. (d) System serif
  only: cheapest, but loses the Bodoni identity that carries the museum feel.

## R2. Palette tokens and contrast

- **Decision**: One set of CSS custom properties in `gallery.css` `:root`, taken from the reference
  README: wall `#3a0a12`, velvet `#9a1a2c`, gold `#d9b45b` / `#f4dc94` / `#8a6a24`, cream
  `#f1e6cf`, dim cream `#cdbf9f`, nameplate ink `#1c0f08`, caption plaque `#efe3c6` with ink
  `#241812`. Measured contrast (WCAG relative luminance):

  | Pair | Ratio | Needs |
  |------|-------|-------|
  | Cream text on wall | 13.77 | 4.5 |
  | Dim cream on wall | 9.37 | 4.5 |
  | Gold link on wall | 8.63 | 4.5 |
  | Pale gold (hover, focus ring) on wall | 12.59 | 4.5 text, 3 non-text |
  | Nameplate ink on brass | 9.48 | 4.5 |
  | Caption ink on cream plaque | 13.56 | 4.5 |
  | Velvet vs wall (decorative) | 2.08 | exempt |

- **Spotlight rule**: The soft spotlight lightens the wall behind a piece. At the exhibit page's
  peak (26% warm overlay, `#6d3f34`), cream text is 7.03:1 and dim cream is 4.79:1, but gold text
  would be only 4.41:1, which fails. So: the spotlight is defined by two tokens,
  `--spotlight-index` (0.22) and `--spotlight-exhibit` (0.26), and **only cream text may sit over a
  spotlight; no gold text or links do**. The unit test (R11) reads both tokens from the stylesheet,
  computes each peak blend over the wall and checks every text token that may sit there against it,
  so the CSS cannot drift to a stronger spotlight without failing the test.
- **Rationale**: Meets FR-007 and the constitution's AA rule (Content & Accessibility Standards).
  The mockup already keeps gold links and the intro away from the spotlight, so this only makes
  the rule explicit and testable.
- **Alternatives considered**: Dropping the spotlight (loses the "lit piece" effect for a
  problem that a single rule solves).

## R3. The cordon: per-card rope and posts, no JavaScript

- **Decision**: A `Cordon` component renders one decorative `<span aria-hidden="true">` per card
  containing an inline SVG rope and two CSS-drawn brass posts. The rope SVG uses
  `preserveAspectRatio="none"` with `vector-effect: non-scaling-stroke`, so it stretches to any
  card width without distorting its thickness. It has three strokes: a dark under-stroke, the
  gold rope and a pale dashed twist. The posts are CSS (brass gradient stem, ball finial, base
  disc) at the card's left and right edges. The grid has no column gap, so neighbouring cards'
  posts sit on the same line and read as one post. The exhibit page uses the same component once,
  spanning the figure.
- **Why this works at every width**: The cordon never needs to know the column count. A short last
  row simply ends with its last card's right-hand post (spec edge case: partial last row). A
  single card on a page looks like a complete roped-off piece (spec edge case: fewer than one row).
- **Overflow guard**: The outermost posts stick out half a base (about 27 px) beyond the content
  edge, so the page's side gutter is at least 1.75 rem at every width. That is what keeps
  320 px screens from scrolling sideways (FR-010).
- **Non-interference**: The cordon is `pointer-events: none`, sits outside the card link and
  contains no text, so it cannot block clicks, take focus or add to the card's text
  (001's e2e test asserts the card text equals the display title exactly).
- **Alternatives considered**: (a) One SVG per row: needs the column count, which changes with
  CSS breakpoints, so it would need JavaScript or fragile duplicated markup. (b) A CSS-only rope
  (a bordered half-ellipse): resolution-independent but loses the twisted-rope detail that makes the
  cordon read as rope. (c) Posts as SVG in the stretchy graphic: they would stretch with it.

## R4. Frame, pillow, nameplate, spotlight and wall

- **Decision**: All CSS. The frame is padding with a gold gradient (`#f4dc94` → `#d9b45b` →
  `#8a6a24`) around the image. The pillow is a rounded, inset-shadowed velvet shape under the
  frame, wider than it, with a thin gold piping border and two small gold tassels; it sits behind
  the frame so the piece rests on it. The nameplate is a brass rectangle with a double inner rule
  holding the display title in the display face. The spotlight is a radial gradient behind each
  piece (R2 caps its strength). The wall is a flat oxblood with a very faint vertical silk
  stripe (1.8% white).
- **Sizing**: The frame is `min(100%, 14rem)` wide on the index, which is 224 px on desktop as in
  the mockup and shrinks on narrow cards. The pillow is the frame's width plus 2.5 rem, capped so its tassels stay inside the cell (R5). On the exhibit
  page the frame shrink-wraps the whole image (up to 36 rem wide, height capped) so any aspect
  ratio shows uncropped, and the pillow is the frame's width plus 8 rem (spec edge case: non-square
  images). The index thumbnails keep 001's square crop.
- **Alternatives considered**: Image-based textures for velvet or brass (more weight and a
  separate asset pipeline for no gain), and SVG filters for the velvet (heavier, no better).

## R5. Responsive layout

- **Decision**: The index grid is gap-free and has 1 column below 40 rem, then 2 columns from 40 rem,
  3 from 58 rem and 4 from 76 rem. The content column is at most 78 rem wide (1248 px, as in the
  mockup) with a side gutter of `max(1.75rem, 2.5vw)` (R3). Each cell has its own horizontal padding
  (28 px), so the spacing that was the grid `gap` now lives inside the cell.
- **Cell widths this gives** (viewport minus both gutters, divided by the column count): 2 columns
  at 40 rem (640 px) gives 292 px; 3 columns at 58 rem (928 px) gives about 291 px; 4 columns at
  76 rem (1216 px) gives about 289 px; 4 columns at 78 rem and wider gives 312 px. So **a cell is never
  narrower than about 290 px in any multi-column layout**. In the single-column layout the cell is the
  full width inside the gutters, from 264 px at a 320 px screen upward.
- **Padding and overhang**: The cell's padding holds the frame and the text. The pillow and its
  tassels are allowed to overhang that padding, but never the cell itself. The frame is
  `min(100%, 14rem)` of the padded content width (233 px at a 289 px cell), and the pillow is the
  frame width plus 2.5 rem, capped so its tassels stay inside the cell (cell width minus 14 px, the
  tassels reaching 7 px beyond each end). At a 289 px cell this is a 264 px pillow with the tassels
  inside the cell. At a 320 px screen (264 px cell, 208 px content) the frame is 208 px and the pillow
  is 248 px.
- **Rationale**: The reference only draws four columns (desktop) and one column (phone). The
  breakpoints in between are chosen so a cell always holds the 264 px pillow plus its tassels, which
  keeps the "pillow wider than the frame" look at every column count (the earlier 36 and 56 rem
  breakpoints gave 260 px and 280 px cells and would have squeezed it).
- **Alternatives considered**: `auto-fill` grid columns (simplest CSS, but the column count then
  varies continuously with the container, which is harder to test at named widths and can leave
  a column count with no matching design).

## R6. Page furniture and supporting pages

- **Decision**: The site name is uppercase, tracked, in the display face in gold, with a double gold
  rule beneath, as in the mockup. The footer keeps its hairline rule and the "About the collection"
  link. About, "no longer available", 404 and the empty state keep 001's markup and take the
  wall, cream text and gold links from the shared stylesheet, at 001's reading width (`38rem`).
  They get no frame, pillow or cordon, since there is no exhibit to show (spec User Story 4).
- **Alternatives considered**: A framed panel around the About text (extra visual weight for text
  that should read plainly).

## R7. Image-failure states

- **Decision**: Keep 001's mechanism unchanged (inline `onerror` adds the `image-unavailable`
  class on the exhibit page). Restyle so the frame, pillow and caption plaque stay in place, and the
  "Image unavailable" notice appears in cream on a dark matting colour (`#24070d`) inside the frame.
  On the index a failed thumbnail leaves the frame, pillow and nameplate in place; the browser shows
  the image's alt text inside the frame, inheriting the cream text colour (13.77:1 on the matting).
- **Rationale**: FR-006 and the spec edge case, with no new script.

## R8. Focus, hover, forced colours, reduced motion

- **Decision**:
  - **Focus**: Card links get a 3 px pale-gold outline (`#f4dc94`, 12.59:1 on the wall) with a
    4 px offset, around the whole card. All other links use the same outline.
  - **Hover**: Colour and underline changes only, no movement or fade.
  - **Forced colours** (`@media (forced-colors: active)`): Decorative backgrounds disappear there, so
    frames, plaques and nameplates get a 1 px `CanvasText` border and text uses system colours. The
    decorative cordon can vanish without loss of meaning. This is checked by hand (quickstart V11),
    since the automated runs use normal colours.
  - **Reduced motion**: Nothing animates or transitions, so there is nothing to disable. A build
    test asserts the stylesheet contains no `animation`, `@keyframes` or `transition` (constitution
    Principle II, "must not autoplay or loop").
- **Alternatives considered**: Subtle hover transitions (allowed by the constitution if they
  respect reduced motion, but they add risk and no requirement asks for them).

## R9. No new motion or engagement patterns

- **Decision**: No hover sway, no cursor-following spotlight, no counters or badges. The mockup is
  static and the site stays that way.
- **Rationale**: FR-012 and Principle II. Both effects could be revisited later as their own feature.

## R10. Colour and platform styling

- **Decision**: The palette is oxblood, velvet red and gold. It contains none of the blues, logos
  or card treatments associated with any social platform, and it is the same for every exhibit.
- **Rationale**: Principle III forbids styling any exhibit to identify a platform.

## R11. Test strategy without a browser

Most protection is browser-free so it runs anywhere, and the browser-based checks run in the
devcontainer once R13 is done.

- **Unit, `tests/unit/room-contrast.test.ts` (new)**: Reads `gallery.css`, resolves the custom
  properties, and asserts every listed text and background pair is at least 4.5:1 (3:1 for the focus
  ring). It also reads `--spotlight-index` and `--spotlight-exhibit`, blends each over the wall to get
  the peak colour, and checks each
  text token that may appear there. Adding a text colour without listing it fails a completeness
  check, because the test also greps the stylesheet for `color:` declarations that use undeclared
  tokens.
- **Build, `tests/build/room-structure.test.ts` (new)**: On the fixture build, every `.exhibit-card`
  has one frame, one pillow, one nameplate and one hidden, text-free cordon; the exhibit page has one
  framed image, pillow, cordon and caption plaque; `Cordon` output has `aria-hidden="true"`;
  stylesheet has `@font-face` for the four fonts, all same-origin, and no `animation`, `@keyframes`
  or `transition`.
- **Build, weight (edit)**: `weight.test.ts` also adds every font file that the built CSS
  references, so the 1.5 MB budget covers them. It must find that CSS whether Astro links it
  (`link[rel="stylesheet"]`) or inlines it (`<style>` in the page, which Astro does for small
  stylesheets), and read `url()` references from both. Two limits to know: the fixture images are
  tiny (about 1 KB each, like the site's current exhibits), so today this test effectively measures
  HTML, CSS and fonts, and the 1.5 MB budget will only bite once real photographs arrive. The
  ceiling stays as it is. `no-source-data.test.ts` also scans CSS for foreign
  `url()` and `@import` origins.
- **E2E, `responsive.spec.ts` (new)**: At 320, 390, 768, 1024, 1280, 1440 and 1920 px, for the
  index, an exhibit, About, a tombstone, the 404 page and the empty gallery, asserts
  `document.documentElement.scrollWidth <= innerWidth`. `a11y.spec.ts` also runs at 390 px.
  These run in the devcontainer after the rebuild in R13.
- **Manual**: Reviewer comparison against the reference (SC-005), forced-colours check and 200% zoom
  check (quickstart V9, V11, V12).
- **Alternatives considered**: Screenshot regression (needs baseline images and a browser, adds
  maintenance, and Principle V argues against the tooling).

## R12. Ordering and rollout

- **Decision**: One pull request from this feature branch. Order of work: first the container
  change (R13) and a baseline run of 001's existing e2e tests, then tokens and fonts (with the
  contrast test), then the shared layout and supporting pages, then the exhibit card and cordon,
  then the exhibit page, then the responsive and weight tests. Every step keeps 001's tests green.
- **Rationale**: The shared shell and tokens are needed by everything else and are the lowest-risk
  change, so problems surface early.

## R13. Running Chromium in the devcontainer (spec FR-016)

- **Decision**: Add a root `RUN` step to `.devcontainer/Dockerfile` that installs the system
  libraries Playwright's Chromium needs on Debian trixie. The exact package list is taken from
  `pnpm exec playwright install-deps --dry-run chromium` (it prints the `apt-get` command for this
  OS), not typed from memory, and pinned in the Dockerfile. The browser binary itself is
  downloaded by the `dev` user with `pnpm exec playwright install chromium`, which needs no root,
  and its cache directory gets a mount like the existing Corepack and pnpm ones so a rebuild does
  not re-download it. The README's Testing section is updated to say so.
- **Sandbox risk**: The container runs with `--cap-drop=ALL` and `no-new-privileges`, and Docker's
  default profile often blocks the user namespaces Chromium's sandbox uses, so Chromium may refuse
  to start with "no usable sandbox". If so, `playwright.config.ts` launches Chromium with the
  sandbox disabled, controlled by an environment variable that only the devcontainer sets (so it
  stays on everywhere else). The container itself is the isolation boundary here.
- **Base image risk**: The base image is a minimal, verified `bare-devcontainer` image. The Dockerfile
  change must first confirm `apt-get` works there; if it does not, the fallback is a multi-stage
  copy of the libraries from a Debian stage. This is checked when the task is done, before any
  restyling starts.
- **Baseline first**: 001's e2e tests have never run in this container. They are run once before
  any restyling, so any failures that already exist are recognised as 001's and are not mistaken for
  regressions from this feature. Fixing a 001 failure is in scope only when it blocks a check for
  this feature; anything else is reported.
- **Who does what**: Editing the Dockerfile, config and README is a task in this plan. **Rebuilding
  the container is done by the developer** (it is a VS Code / devcontainer action outside the
  session), so the task list marks it as a manual step that the browser-based tasks wait on.
- **Rationale**: FR-016 and the clarification of 2026-09-23. Without it SC-001 and SC-002 cannot
  be verified anywhere, since the repository has no CI.
- **Alternatives considered**: (a) CI: none exists, and setting one up is a larger, separate change.
  (b) Manual checks only: leaves the two hardest-to-eyeball criteria unverified. (c) Running as root
  or granting extra capabilities to make the sandbox work: weakens the container's hardening
  (`--cap-drop=ALL`) for a test tool.
