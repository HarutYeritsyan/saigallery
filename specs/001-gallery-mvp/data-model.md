# Data Model: Gallery MVP

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

The MVP has one entity, Exhibit, plus two pieces of site copy. There is no database: each Exhibit is a Markdown file plus an image
file in the repository's `exhibits` content collection (see
[contracts/exhibit-content.md](./contracts/exhibit-content.md) for the exact file format).

## Exhibit

| Field | Type | Source | Required | Rules |
|-------|------|--------|----------|-------|
| `number` | integer ≥ 1 | Filename stem (`017.md` → 17) | Always | Assigned when the draft is created (FR-012). Unique (filesystem-enforced). Never reused once published: published and unpublished entry files are never deleted (R4). Displayed zero-padded to at least 3 digits. |
| `status` | `draft` \| `published` \| `unpublished` | Frontmatter | Always | See state transitions below. |
| `title` | string, 1–120 chars | Frontmatter | Optional | If absent, the display title is `Exhibit No. <NNN>` (FR-012). Must pass Principle I review. |
| `image` | image file (`<NNN>.webp`, same folder) | Frontmatter reference | When `published` | Filename MUST equal the catalog number. MUST contain no EXIF/XMP/IPTC/ICC data or text chunks (FR-013). |
| `alt` | string, 1–500 chars | Frontmatter | When `published` | Literal description of what the image depicts (FR-005). MUST NOT equal the caption text. |
| caption | Markdown body | File body | When `published` | Non-empty after trimming (FR-009). Plain prose, emphasis and paragraphs only: no links, images, or raw HTML. |

**Derived values** (computed at build time, never stored):

- `displayTitle` = `title ?? "Exhibit No. " + pad3(number)`
- `previewImage` = a 1200 px-wide, metadata-free JPEG variant of `image`, used only in link-preview metadata (R12).
- `indexPage` = `floor(position / 12) + 1`, where `position` is the exhibit's 0-based position among published exhibits sorted by `number` descending (R5).

**Explicitly absent** (FR-004, constitution Principle III): source URL, source platform,
author name/handle/identity, original publication date, original filename, curation notes
about origin. The schema is **strict**: any unrecognized frontmatter key fails the build, so
none of these can be added by accident.

## Site copy (collection framing, FR-014)

| Item | File | Rules |
|------|------|-------|
| Introduction | `src/content/site/intro.md` | Required and non-empty. Plain prose, 2–4 sentences. Shown on index page 1 only. |
| About the collection | `src/content/site/about.md` | Required and non-empty. Plain prose and headings, with no links to any post or profile. Rendered at `/about/`. |

The curator owns both texts. Together they must say that exhibits are real images from actual
public posts on LinkedIn and other social media, meant to engage or inform, and chosen because
they grossly failed (constitution Principle VI). The build checks only that the files exist and
are non-empty. The wording itself isn't machine-checked.

## State transitions

```text
            exhibit:add              set status: published
  (none) ──────────────▶ draft ──────────────────────────▶ published
                                                               │
                                          exhibit:unpublish    │
                                                               ▼
                                                          unpublished
                                             (image deleted, caption/alt/title cleared)
```

| From | To | Trigger | Effect on the site |
|------|----|---------|--------------------|
| — | `draft` | `pnpm exhibit:add <image>` | None. No page generated. |
| `draft` | `published` | Curator sets `status: published` after writing caption and alt | Appears first on index page 1 and gets `/exhibits/<NNN>/`. Build fails if image, caption or alt is missing or invalid. |
| `published` | `published` | Curator edits caption, alt or title | Updated on the next build. URL unchanged. |
| `published` | `unpublished` | `pnpm exhibit:unpublish <NNN>` | Removed from the index. The detail URL shows "no longer available". No image is emitted. |
| `draft` | (deleted) | Curator deletes the draft files | Allowed only for drafts, which never had a public URL. Their number may then be reused. |
| `unpublished` | any | — | Not allowed (one-way). Re-exhibiting means ingesting again under a new number. |

## Validation summary (build fails on any violation)

1. Unknown frontmatter key → fail (Principle III guard).
2. `published` without `image`, non-empty `alt`, or non-empty caption → fail (FR-009, FR-005).
3. `alt` equal to caption (trimmed, case-insensitive) → fail (FR-005, SC-004).
4. Image filename ≠ catalog number, or image carries any embedded metadata → fail (FR-013).
5. `unpublished` entry still has an image, caption, alt or title → fail (R6).
6. Caption contains a link, image, or raw HTML → fail (no outbound source links, Principle III).
7. `intro.md` or `about.md` missing or empty → fail (FR-014).

Not validated, by decision (spec "Curator trust"): whether an image is genuine, and whether
identifying details were cropped out or covered.
