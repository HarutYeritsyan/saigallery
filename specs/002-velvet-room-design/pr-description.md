# Velvet room visual design (feature 002)

Restyles every SAIGallery page as the "velvet room" from `design/gallery-museum/`: an oxblood wall, each
exhibit in a gold frame on a red velvet pillow with a brass nameplate, and a gold cordon between brass
stanchions in front of every row. The exhibit page shows one large framed piece on a pillow with the
cordon in front and the caption on a cream plaque. About, "no longer available", 404 and the empty state
share the wall, type and page furniture. Styling only: markup, content, routes, ordering and behaviour
from feature 001 are unchanged.

Spec, plan and tasks: `specs/002-velvet-room-design/`.

## Constitution review (Development Workflow & Review Gates)

Checked against constitution v3.2.0.

- **Principle II (Museum Aesthetic, Not Engagement Design), as amended in this change (v3.1.0 → v3.2.0).**
  The old wording asked for "restrained neutral palettes". It now allows a rich, period-museum palette as
  long as every text and background pair meets WCAG AA. The engagement-pattern ban is kept in full and now
  also forbids decorative motion that autoplays or loops. This design adds no counters, feeds, carousels or
  sharing, and nothing animates or transitions (a build test asserts the stylesheet has no `animation`,
  `@keyframes` or `transition`). Contrast is enforced by `tests/unit/room-contrast.test.ts`, which reads the
  real stylesheet tokens, including cream text over the brightest point of each spotlight.
- **Principle III (Source Non-Disclosure).** Nothing about sources is added. The palette carries no platform
  branding and every exhibit is styled the same. No content, metadata or image paths change.
- **Principle V (Simplicity and Static-First).** No new site dependency, script or build step. The two
  typefaces are four Latin-subset woff2 files (about 90 KB) committed under `src/assets/fonts/` with their
  SIL OFL text. The cordon is CSS plus one small inline SVG per card.
- **Principles I, IV, VI.** Unaffected: no captions, dispute controls or framing text change.

## Also in this change

- **Devcontainer** (spec FR-016): `.devcontainer/Dockerfile` now installs the system libraries Chromium needs,
  `devcontainer.json` persists the browser download and sets `PW_NO_SANDBOX=1`, and `playwright.config.ts`
  launches Chromium without its sandbox only when that variable is set. This lets the browser tests run
  inside the container. The container needs a rebuild, then `pnpm exec playwright install chromium`.
- **Tests added**: `tests/unit/room-contrast.test.ts`, `tests/build/room-structure.test.ts`,
  `tests/e2e/room.spec.ts`, `tests/e2e/responsive.spec.ts`. **Existing 001 test files extended, none of their
  assertions changed**: `tests/build/weight.test.ts` (counts fonts), `tests/build/no-source-data.test.ts`
  (scans CSS for foreign origins), `tests/e2e/a11y.spec.ts` (also at 390 px), `tests/e2e/empty.spec.ts`
  (no sideways scroll).
- **Image size hints**: the index thumbnails' `sizes` is now `14rem` and the exhibit image's is
  `(min-width: 40rem) 36rem, 100vw`, matching the new frame widths.
- The `design/gallery-museum/` canvases and previews (velvet room and the unused light option) are included as
  the visual reference.

## Testing

`pnpm test` and `pnpm test:build` pass. The browser tests (`pnpm test:e2e`, including the new
`room.spec.ts` and `responsive.spec.ts`) need the rebuilt devcontainer and had not been run when this
description was written: update this section with their result before opening the PR. Reviewer sign-off
(quickstart V14): compare each page type with `design/gallery-museum/preview/` and show index page 1 to
five people.
