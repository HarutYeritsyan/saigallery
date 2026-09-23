# Contract: Exhibit Content Files & Curator Commands

The interface between the curator and the site. The build enforces every rule here
(see [data-model.md](../data-model.md) for field rules).

## File layout

```text
src/content/exhibits/
├── 001.md      # entry (frontmatter + caption body)
├── 001.webp    # cleaned image; absent for drafts not yet imaged and for unpublished tombstones
├── 002.md
└── ...
```

## Entry file format

Published exhibit:

```markdown
---
status: published
title: "Untitled Hand Study No. 4"   # optional; omit to use "Exhibit No. 017"
image: ./017.webp
alt: "A smiling woman holding a coffee mug; her left hand has seven fingers fused around the handle."
---
The mug is the only object in the frame rendered with conviction. Everything that should
hold it has been improvised.
```

Unpublished tombstone (all other fields removed by `exhibit:unpublish`):

```markdown
---
status: unpublished
---
```

**Forbidden**: any other frontmatter key (e.g., `source`, `url`, `author`, `platform`,
`date`, `credit`). Also forbidden in the body: links, images and raw HTML.

## Curator commands

| Command | Behavior | Output / exit status |
|---------|----------|----------------------|
| `pnpm exhibit:add <path-to-image>` | Assigns the next catalog number (R4), re-encodes the image without metadata as `<NNN>.webp`, and creates `<NNN>.md` with `status: draft`, the image reference, and empty `alt`/caption placeholders. Never reads or records the input path, filename or metadata into the entry. | Prints the new number, the paths created, and the Principle I caption-review reminder. Exits non-zero if the input isn't a decodable image. |
| `pnpm exhibit:unpublish <NNN>` | Deletes `<NNN>.webp` and rewrites `<NNN>.md` as a tombstone. | Exits non-zero if the entry doesn't exist or is already unpublished. |
| `pnpm exhibit:verify` | Runs every validation rule in data-model.md against all entries. Also runs automatically before `pnpm build`. | Lists each violation with file and rule. Exits non-zero on any violation. |

The ingest script never offers flags or prompts for source information. It asks nothing
about authenticity or redaction and records nothing about them (spec "Curator trust"). Its only
output beyond the paths is one line of reminder text: crop or cover any names, handles, avatars
or platform interface *before* ingest, and delete the downloaded original afterwards.

## Site copy files

```text
src/content/site/
├── intro.md    # short introduction shown above the grid on index page 1
└── about.md    # full "About the collection" text, rendered at /about/
```

Both are plain Markdown with no frontmatter. The build fails if either is missing or empty.
