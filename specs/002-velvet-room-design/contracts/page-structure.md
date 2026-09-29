# Contract: Page Structure and Preserved Hooks

What every page must contain after the velvet room restyle, and which parts of 001's markup must
not change because 001's tests and spec depend on them. Routes, content and page-wide guarantees
are unchanged: see [001 routes](../../001-gallery-mvp/contracts/routes.md). This file only adds
what the design introduces.

## Preserved from 001 (MUST NOT change)

| Hook | Used by | Rule |
|------|---------|------|
| `.exhibit-grid` > `li.exhibit-card` > `a` > `img` | e2e browse, US1 | One card per published exhibit, 12 per page. The `a` still links to `/exhibits/<NNN>/` and contains the image (with its `alt`) and the display title. |
| Card text = display title only | e2e browse (exact text match) | The card's visible text is exactly the display title. No number line, badge or other text. The cordon adds none. |
| `.card-title` | styling | The display title's element. |
| `.wall-text` | e2e browse | The intro block, on index page 1 only. |
| `.site-footer` with a link "About the collection" → `/about/` | build, e2e | On every page. |
| `.exhibit-image img`, `.image-unavailable`, `.image-unavailable-notice` | e2e exhibit | Same classes and the same inline `onerror`. The notice text stays "Image unavailable". |
| `.plaque` | e2e exhibit, build scan | The caption plaque only. Nothing else may use this class (the build scan removes `.plaque` before checking for engagement wording). |
| `.framing-note` with a link to `/about/`, `.back-link` | e2e exhibit | Same text and links. |
| `h1` per page | e2e exhibit | The display title on exhibit pages. |
| `.pagination` links "Previous", "Next", page numbers | e2e browse | Same text and `aria-current="page"`. |
| Empty state text "The gallery is being installed" | e2e empty | Same text. |
| No `<script>`, `<form>`, `<input>`, `<button>`; no `http(s)` URL to another origin | build | Unchanged. Inline SVG uses no `xmlns` attribute, or only `http://www.w3.org/`, which the build test allows. |

## New in this feature

### Index card (`li.exhibit-card`)

```text
li.exhibit-card
├── a                      (existing link, gets the focus ring)
│   ├── span.frame         gold frame around the img          [decorative wrapper]
│   │   └── img            unchanged: src, srcset, alt, loading
│   ├── span.pillow        aria-hidden="true"                 [decorative, no text]
│   └── span.card-title    display title, inside the brass nameplate
└── span.cordon            aria-hidden="true", no text        [see Cordon]
```

Exactly one `.frame`, one `.pillow`, one `.card-title` and one `.cordon` per card.

### Cordon

```text
span.cordon[aria-hidden="true"]
├── span.post.post-left
├── svg (rope: 3 paths, preserveAspectRatio="none", aria-hidden)
└── span.post.post-right
```

No text nodes. `pointer-events: none`. Never focusable. Used once per index card and once on the
exhibit page (spanning the figure).

### Exhibit page

```text
main
├── h1                     display title (existing)
├── figure.exhibit-figure
│   ├── div.exhibit-mount               shrink-wrapping stage for one piece
│   │   ├── div.exhibit-image           existing block: img + notice, now the gold frame
│   │   └── span.pillow                 aria-hidden
│   ├── span.cordon                     aria-hidden, spans the figure
│   └── figcaption.plaque               existing caption plaque, cream (Plaque.astro renders the figcaption itself)
├── p.framing-note                      existing
└── p.back-link                         existing
```

### Supporting pages

About, "no longer available", 404 and the empty state keep their current markup. They get the room
wall, cream text, gold links, the display/body typefaces and the shared header and footer. They
have no `.frame`, `.pillow` or `.cordon`.

## Style guarantees

- Every text and background pair used in the stylesheet meets WCAG AA (unit-tested against the
  tokens in [data-model.md](../data-model.md)); gold text never sits over the spotlight.
- The stylesheet contains no `animation`, `@keyframes` or `transition`.
- All `@font-face` sources are same-origin files from the site's own build; no `@import` and no
  `url()` to another origin.
- The page never scrolls sideways at any width from 320 px to 1920 px; the side gutter is at
  least 1.75 rem.
- Under `forced-colors: active`, frames, plaques and nameplates have a visible border and all text
  uses system colours.
