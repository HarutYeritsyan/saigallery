# Implementation Plan: Velvet Room Visual Design

**Branch**: `002-velvet-room-design` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-velvet-room-design/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Restyle every SAIGallery page as the "velvet room" from `design/gallery-museum/`: an oxblood wall,
each exhibit in a gold frame on a red velvet pillow with a brass nameplate, and a gold cordon
between brass stanchions in front of every row. The exhibit page shows one large framed piece on
a pillow with the cordon in front and the caption on a cream plaque. About, "no longer
available", 404 and the empty state share the wall, type and page furniture. Markup, content,
routes, ordering and behaviour from feature 001 stay as they are, so 001's tests keep passing.

This is a styling change on the existing zero-JavaScript Astro site, with three moving parts:

1. **Everything is CSS and inline SVG.** Frames, pillows, plaques, spotlight and posts are CSS.
   The rope is a small inline SVG that stretches to its card. No JavaScript and no image files.
2. **The cordon is built per card, not per row.** Each card carries its own rope segment with a
   post at each edge, and cards touch, so neighbouring posts coincide. This works at any column
   count and ends a short last row cleanly, without knowing how many columns are showing.
3. **Two typefaces are self-hosted** (four Latin-subset woff2 files, about 90 KB, committed to
   the repository), which keeps the "no third-party requests" rule.

Contrast is protected by a browser-free unit test over the colour tokens, and the browser-based
checks run locally once the devcontainer is rebuilt with the system libraries Chromium needs
(spec FR-016). See [research.md](./research.md).

## Technical Context

**Language/Version**: CSS, Astro components (TypeScript frontmatter) on Node.js 26. Same toolchain as 001.

**Primary Dependencies**: None added. Astro and sharp are unchanged. Fonts are committed woff2 files, not npm packages.

**Storage**: N/A. The design adds four font files and their licence text under `src/assets/fonts/`.

**Testing**: Vitest (new contrast and build-structure tests; the weight test is extended), Playwright + axe (new no-overflow test at seven widths; the existing accessibility test also runs at a phone width). Chromium runs inside the devcontainer after a Dockerfile change (R13), so 001's e2e tests run there too.

**Target Platform**: Any static host and modern evergreen browsers, as in 001. Layouts are checked from 320 to 1920 px wide. Development happens in the devcontainer (Debian trixie, Node 26), which gains Chromium's system libraries.

**Project Type**: Static website (single project). Restyle of an existing project.

**Performance Goals**: Index page 1 stays within 1.5 MB (SC-004), counting the stylesheet and the font files that CSS references. Fonts add about 90 KB.

**Constraints**: Zero client-side JavaScript beyond 001's inline `onerror` on exhibit images. No third-party requests, including fonts. WCAG AA for every text and background pair, including over the spotlight. No animation. Class names and text content that 001's tests rely on are preserved (see [contracts/page-structure.md](./contracts/page-structure.md)).

**Scale/Scope**: 5 page types plus the empty state, in four column layouts (1 to 4). About 1 stylesheet, 1 new component, 4 edited components and pages, 4 font files, and a small devcontainer change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against constitution v3.2.0 (Principle II amended for this feature, 2026-09-23).

| Gate | Pre-research | Post-design | Evidence |
|------|--------------|-------------|----------|
| **I. Curatorial Purpose** | PASS | PASS | Styling only. No captions, titles or content change. |
| **II. Museum Aesthetic, Not Engagement Design** (as amended) | PASS | PASS | Museum styling with a rich palette, which v3.2.0 allows if WCAG AA holds (R2, contrast test). Wall-text intro, plaques and numbered pagination kept. No counters, feeds, carousels or sharing. Nothing animates or loops (R9). |
| **III. Source Non-Disclosure & Non-Retention** | PASS | PASS | Nothing about sources is added. The red and gold palette carries no platform branding, and exhibits get no platform styling (R10). No content or metadata paths change. |
| **IV. Non-Defamation by Construction** | PASS | PASS | No forms, inputs or dispute controls. The build test that forbids them still runs. |
| **V. Simplicity & Static-First** | PASS | PASS | No new site dependency, script or build step. Fonts are plain files (R1). The cordon is CSS plus one small inline SVG (R3). The devcontainer gains OS libraries for the existing test-only Playwright dependency (R13); nothing changes in what ships. |
| **VI. Found in the Wild** | PASS | PASS | The intro on page 1, the About link on every page and the exhibit framing note stay, restyled only (contracts/page-structure.md). |
| **Content & Accessibility Standards** | PASS | PASS | Every token pair is checked for AA in a unit test, including text over the spotlight peak (R2, R11). Alt text and caption stay separate. Focus and forced-colors handling are specified (R8). |
| **Development Workflow & Review Gates** | PASS | PASS | Design change checked against Principle II above. The review goes in the pull request description. |

No violations. Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-velvet-room-design/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R12
├── data-model.md        # Phase 1: no data changes; design tokens and visual elements
├── quickstart.md        # Phase 1: run + validation scenarios V0–V15
├── contracts/
│   └── page-structure.md    # Per-page markup and class contract, preserved 001 hooks
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
.devcontainer/
└── Dockerfile               # EDIT: install Chromium's system libraries as root (FR-016, R13)
playwright.config.ts         # EDIT: sandbox switch for containers that block Chromium's sandbox (R13)
README.md                    # EDIT: Testing section describes the container setup
design/gallery-museum/       # visual reference (unchanged); README caveats are resolved by this plan
src/
├── assets/
│   └── fonts/               # NEW: bodoni-moda-500, eb-garamond-400/600/400-italic (latin woff2) + OFL.txt
├── layouts/
│   └── Gallery.astro        # header (site name + double rule), footer band; room wrapper
├── components/
│   ├── ExhibitCard.astro    # frame + pillow + brass nameplate + cordon around the existing link
│   ├── Cordon.astro         # NEW: decorative rope segment with two brass posts (aria-hidden)
│   ├── ExhibitFloor.astro   # unchanged markup; grid becomes gap-free so posts meet
│   ├── Plaque.astro         # cream caption plaque (same markup, new styling)
│   └── Pagination.astro     # unchanged markup, restyled
├── pages/
│   ├── exhibits/[number].astro  # framed mount + pillow + cordon around the existing image block
│   ├── about.astro, 404.astro, index.astro, page/[page].astro   # markup unchanged
└── styles/
    └── gallery.css          # rewritten: tokens, @font-face, room, frame, pillow, plaque, cordon, layout

tests/
├── unit/room-contrast.test.ts       # NEW: token pairs and both spotlight peaks ≥ 4.5:1
├── build/room-structure.test.ts     # NEW: per-card parts, cordon hidden and text-free, fonts same-origin
├── build/weight.test.ts             # EDIT: also counts fonts referenced from CSS
├── build/no-source-data.test.ts     # EDIT: CSS is scanned for foreign origins as well
└── e2e/
    ├── room.spec.ts                 # NEW: failed thumbnails keep their parts; cordon never blocks clicks
    ├── responsive.spec.ts           # NEW: no horizontal overflow at 320…1920 px on every page type
    └── a11y.spec.ts                 # EDIT: also run at a phone viewport
```

**Structure Decision**: No new project or layer. The design lives in one stylesheet and one new
presentational component, on top of 001's Astro layout. The reference mockups stay in `design/`
as documentation and are not built or shipped.

## Complexity Tracking

No constitution violations to justify.
