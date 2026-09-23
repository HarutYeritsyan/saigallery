# Gallery museum design canvases

Visual-design explorations for SAIGallery, made with Claude's Design canvas (2026-09-23).
Brief: a museum in the spirit of *How to Steal a Million*, with each exhibit treated like a crown on a
red velvet pillow behind a golden cordon.

These are design references, not site code. Nothing under `src/` uses them yet.

Canvas (private to its owner): https://claude.ai/artifact/JVjhc3H5ZqdHvxxzbrsRjH

## Options

| Option | Files | Idea |
| --- | --- | --- |
| **Velvet room** (dark) | `Main`, `Exhibit`, `Mobile` | Oxblood wall, red velvet pillows, brass plaques, gold cordon between brass stanchions. |
| **Salon blanc** (light) | `LightMain`, `LightExhibit`, `LightMobile` | Off-white wall; red appears as full-width header/footer bands and the pillows. |

Each option has three artboards: gallery wall (1440 x 1660), exhibit page (1440 x 1560) and phone (390 x 1500).
`canvas.json` is the canvas index (artboard positions and notes). The `.dc.html` files are the artboard sources.
They need the Design canvas runtime (`./support.js`) to render: the wall and velvet colours are template holes
(`{{wall}}`, `{{velvet}}`) filled in by that runtime, so opened directly in a browser they show without their colours.

For a plain browser view, open the standalone renders in `preview/` (for example `preview/Main.html`). They are
generated from the `.dc.html` files with the tweak defaults filled in: `node design/gallery-museum/build-previews.mjs`.
The canvas link above remains the source of truth.

## Tokens

| Token | Velvet room | Salon blanc |
| --- | --- | --- |
| Wall | `#3a0a12` (alts `#15141a`, `#0e2b26`) | `#f1ece3` (alts `#ffffff`, `#e8e1d5`) |
| Velvet / bands | `#9a1a2c` (alts `#5e1b45`, `#12523f`) | same |
| Text | cream `#f1e6cf` | ink `#241812` |
| Links | gold `#d9b45b`, hover `#f4dc94` | crimson `#8a1526`, hover `#5f0d1a` |
| Gold ramp (frames, rope, posts, plaques) | `#f4dc94` / `#d9b45b` / `#8a6a24` | same |
| Brass plaque ink | `#1c0f08` | same |
| Caption plaque | `#efe3c6`, ink `#241812`, rule `#b8923f` | same |

Type: Bodoni Moda 500 for the site name, titles and plaque names; EB Garamond 400/600/italic for body and captions.
The site name is uppercase with 0.42em tracking.

## Caveats

- **Fonts load from Google Fonts** in the mockups. The 001 plan forbids third-party requests, so a real
  implementation must self-host the fonts (and count them against the page-weight budget) or use a system serif.
- **Exhibit images are CSS placeholders** (a flat square with a pale circle), not the real `src/content/exhibits` images.
- **The cordon is drawn for exactly four columns.** The real grid is 2, 3 or 4 columns depending on width, so
  the implementation needs a rule for where the posts and rope go at each width.
- Pagination in the mockups is illustrative ("1 2 3 Next"), not the real page count.
- Contrast: gold on the velvet-room wall is about 8:1 and plaque ink on brass about 9:1. The salon blanc pairs
  were not measured.
