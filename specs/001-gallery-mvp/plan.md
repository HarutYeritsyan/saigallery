# Implementation Plan: Gallery MVP

**Branch**: `001-gallery-mvp` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-gallery-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build SAIGallery's core: a static, museum-style catalog where visitors page through exhibits
(12 per page, newest catalog number first) and open each one to see the full image, a
plaque-style curatorial caption and separate alt text. An introduction on the first index
page and an "About the collection" page, linked from every page, explain that the exhibits are
real images from LinkedIn and other social media posts that were meant to engage or inform and
grossly failed. Pages can be indexed by search engines, and shared exhibit links preview with
the exhibit's title and image. The site shows and keeps no per-exhibit source information and
offers no visitor input of any kind.

The technical approach is a zero-JavaScript Astro static site. Exhibits are Markdown files
plus images in a strict content collection. A curator ingest script re-encodes images to
strip all embedded metadata and names them by catalog number *before* they enter the
repository, and a verification step fails the build on any Principle III or completeness
violation. See [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript on Node.js 26 (devcontainer runtime)

**Primary Dependencies**: Astro (current stable major, static output, built-in image pipeline), sharp (ingest re-encoding and metadata verification)

**Storage**: Files in the repository (`src/content/exhibits/*.md` + `*.webp`). No database.

**Testing**: Vitest (unit and build-output tests), Playwright + @axe-core/playwright (end-to-end journeys and WCAG AA checks)

**Target Platform**: Any static file host serving modern evergreen browsers. Host selection and deployment are out of scope for this feature.

**Project Type**: Static website (single project)

**Performance Goals**: Index first load ≤ 1.5 MB transferred. Pages usable within 2 s on typical broadband (R9).

**Constraints**: `SITE_URL` build setting required for absolute preview-image URLs (R12). Zero client-side JavaScript, with one exception: an inline `onerror` attribute on exhibit images for the "Image unavailable" state (CSS can't detect a failed image). No `<script>` elements. No third-party requests. No forms or inputs. No embedded image metadata. WCAG AA.

**Scale/Scope**: Tens to low hundreds of exhibits. One trusted curator, with no publishing checks (spec "Curator trust"). 5 page types: index, detail, tombstone, About, 404.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against constitution v3.1.0.

| Gate | Pre-research | Post-design | Evidence |
|------|--------------|-------------|----------|
| **I. Curatorial Purpose**: critique the artifact, never the person | PASS | PASS | The curator reviews their own captions and titles before publishing. The ingest script prints a Principle I reminder, but nothing is enforced (spec "Curator trust"). The schema has no author field. |
| **II. Museum Aesthetic**: no infinite scroll, counters, feeds, autoplay, notifications | PASS | PASS | Static numbered pagination with explicit links (R5). Deterministic order for every visitor. No JS, analytics or share UI (R8). Link-preview metadata is passive markup. There are no share buttons or sharing mechanics (R12). Build-output test V11 enforces it. |
| **III. Source Non-Disclosure & Non-Retention** | PASS | PASS | Strict schema rejects unknown keys (source/url/author/date fail the build). Metadata stripped *before* commit, so git history stays clean (R3). Neutral `<NNN>` filenames. Captions may not contain links. LinkedIn is named only in collection-level prose, with no platform styling on exhibits (R10). The preview description is fixed collection text that names no platform, and preview images are metadata-free derivatives (R12, V20). Test V5 scans all output HTML and images. Cropping out identifying details in screenshots is left to the curator (R11). |
| **IV. Non-Defamation by Construction**: no visitor dispute mechanism | PASS | PASS | No forms, inputs or endpoints on any route (contracts/routes.md). Curator-only unpublish (R6). |
| **V. Simplicity & Static-First** | PASS | PASS | Static build, no server, DB, accounts or CMS. Two runtime-relevant dependencies (Astro, sharp). Playwright is test-only and justified by the accessibility MUST. |
| **VI. Found in the Wild**: collection framing, authenticity | PASS | PASS | The introduction on `/`, `/about/` linked from the shared footer on every page, and a platform-neutral framing note on every exhibit page for visitors arriving from shared links (R10, V16–V19). Authenticity and redaction are the curator's responsibility and are not system-checked. The constitution states both as curator obligations and doesn't require enforcement (R11). |
| **Content & Accessibility Standards** | PASS | PASS | `alt` required and must differ from caption (build-enforced). Axe contrast checks in e2e (V12). Image-failure state keeps text readable (V13). |
| **Development Workflow & Review Gates** | PASS | PASS | Code and policy changes go through PRs. Adding an exhibit is content, not a policy change, so the curator may commit it directly (R2). |

No violations. Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-gallery-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R12
├── data-model.md        # Phase 1: Exhibit entity, site copy, states, validation
├── quickstart.md        # Phase 1: run + validation scenarios V1–V21
├── contracts/
│   ├── routes.md            # Public pages and page-wide guarantees
│   └── exhibit-content.md   # Entry and site-copy file formats, curator commands
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
package.json                 # scripts: dev, build (verify + astro build), preview, test, test:e2e, exhibit:*
astro.config.mjs             # static output, image service config
src/
├── content.config.ts        # strict `exhibits` collection schema (data-model.md rules)
├── content/
│   ├── exhibits/            # NNN.md + NNN.webp (curated content)
│   └── site/                # intro.md, about.md (collection framing copy)
├── lib/
│   ├── exhibits.ts          # displayTitle, published ordering, pagination, indexPage for back links
│   └── image-metadata.ts    # shared "is this image clean?" check (used by verify + tests)
├── layouts/
│   └── Gallery.astro        # museum shell: header, wall typography, footer with "About the collection" link
├── components/
│   ├── ExhibitCard.astro    # index thumbnail + display title
│   ├── Plaque.astro         # caption plaque
│   ├── Pagination.astro
│   └── PageHead.astro       # title + link-preview metadata per page type (R12)
├── pages/
│   ├── index.astro          # page 1
│   ├── page/[page].astro    # pages 2..n
│   ├── exhibits/[number].astro  # published detail or unpublished tombstone
│   ├── about.astro          # "About the collection" (renders site/about.md)
│   └── 404.astro
└── styles/
    └── gallery.css          # restrained palette, AA-checked tokens

scripts/
├── exhibit-add.mjs          # ingest: re-encode, strip metadata, assign number, create draft
├── exhibit-unpublish.mjs    # tombstone an exhibit
└── verify-exhibits.mjs      # all data-model.md validation rules; runs before build

tests/
├── fixtures/                # 40-exhibit catalog + raw images carrying metadata
├── unit/                    # lib/, schema, verifier
├── build/                   # scans dist/ (V5, V9, V11, V17, V20, V21)
└── e2e/                     # Playwright journeys + axe (V1–V4, V10, V12, V13, V16)
```

**Structure Decision**: Single static-site project at the repository root, following Astro's
conventional layout. Curator tooling lives in `scripts/` as plain Node scripts invoked through
`pnpm exhibit:*`. There is no separate backend because the site accepts no input.

## Complexity Tracking

No constitution violations to justify.
