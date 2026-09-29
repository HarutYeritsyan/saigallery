# Data Model: Velvet Room Visual Design

**No data changes.** This feature adds no entity, field, content file or schema rule. The
`Exhibit` entity, its validation and the site copy files from
[feature 001](../001-gallery-mvp/data-model.md) are untouched, and nothing new is stored or
displayed about any exhibit. What the design adds is a small set of named visual tokens and
elements, listed here so the tasks and tests share one vocabulary.

## Design tokens

Defined once as CSS custom properties in `src/styles/gallery.css`. The contrast test reads them
from there. Values come from `design/gallery-museum/README.md`, velvet room column.

| Token | Value | Used for |
|-------|-------|----------|
| `--wall` | `#3a0a12` | Page background |
| `--velvet` | `#9a1a2c` | Pillow fill |
| `--gold` | `#d9b45b` | Links, frame mid-tone, brass fill, rope |
| `--gold-hi` | `#f4dc94` | Hover, focus ring, frame highlight, rope twist |
| `--gold-lo` | `#8a6a24` | Frame and post shading |
| `--cream` | `#f1e6cf` | Body text on the wall, headings |
| `--cream-dim` | `#cdbf9f` | Secondary text (framing note, empty state) |
| `--brass-ink` | `#1c0f08` | Nameplate text on brass |
| `--plaque` | `#efe3c6` | Caption plaque fill |
| `--plaque-ink` | `#241812` | Caption text on the plaque |
| `--plaque-rule` | `#b8923f` | Caption plaque inner rule |
| `--matting` | `#24070d` | Behind the image inside the frame, and the image-unavailable notice |
| `--spotlight-index` | `rgba(255, 214, 150, 0.22)` | Wall glow behind each index card (cream text only over it) |
| `--spotlight-exhibit` | `rgba(255, 214, 150, 0.26)` | Wall glow behind the exhibit page's piece (cream text only over it) |
| `--shade` | `rgba(0, 0, 0, 0.5)` | Drop shadows and the dark side of the pillow's inset shading |
| `--velvet-shine` | `rgba(255, 150, 150, 0.28)` | Highlight along the top of the pillow |
| `--piping` | `rgba(217, 180, 91, 0.6)` | Thin gold piping around the pillow |
| `--hairline` | `rgba(217, 180, 91, 0.5)` | Footer rule and other fine gold rules |
| `--stripe` | `rgba(255, 255, 255, 0.018)` | The faint silk stripe on the wall |
| `--rope-shade` | `#5a3d0c` | Dark under-stroke of the rope |
| `--gutter` | `max(1.75rem, 2.5vw)` | Page side padding; at least 1.75 rem so outer posts never overflow |
| `--measure` | `38rem` | Reading width for text pages (unchanged from 001) |
| `--font-display` | Bodoni Moda 500, then Georgia, serif | Site name, headings, nameplates |
| `--font-body` | EB Garamond 400 / 600 / 400 italic, then Georgia, serif | Everything else |

## Visual elements

| Element | Where | Built from | Accessibility |
|---------|-------|------------|---------------|
| Room | Every page | `--wall` background with a faint `--stripe`; cream text | AA pairs from the table above |
| Frame | Each exhibit image (index and exhibit page) | Padding with a gold gradient around the image; `--matting` behind it | Decorative; the image keeps its `alt` |
| Pillow | Under each exhibit | Rounded velvet shape with inset shadows, gold piping and two tassels | `aria-hidden`, no text |
| Nameplate | Under each index card | Brass rectangle holding the display title | The title is real text in the card link |
| Caption plaque | Exhibit page | Cream `Plaque` block with the caption | Same `.plaque` element as 001 |
| Cordon | Each index card and once on the exhibit page | `Cordon` component: stretchy inline SVG rope and two CSS posts | `aria-hidden`, `pointer-events: none`, no text, no focus |
| Spotlight | Behind each piece | Radial gradient overlay from `--spotlight-index` or `--spotlight-exhibit` | Decorative; the contrast test reads both tokens and checks cream text over each peak |
| Room furniture | Header, footer, pagination, wall text | Restyled 001 markup | Visible focus ring on every link |

## State transitions

None. The design has no stateful behaviour. The only state change on the site remains 001's
"Image unavailable" reveal, which is restyled but not changed.
