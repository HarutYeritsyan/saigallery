# Contract: Public Routes

Everything a visitor can reach. All routes are static, GET-only pages. The site has no
forms, no endpoints that accept input, and no client-side data fetching.

| Route | Renders | MUST NOT render |
|-------|---------|-----------------|
| `/` | The introduction from `intro.md`, above the grid (FR-014). Then index page 1: up to 12 published exhibits, newest catalog number first. Each shows a thumbnail (with the exhibit's `alt`) and its display title, linking to `/exhibits/<NNN>/`. Includes "Next" / numbered page links when there is more than one page. If there are no published exhibits: a museum-style empty state ("The gallery is being installed"), not an error. | Counters, likes, share buttons, "recommended"/"trending" sections, author/source data, auto-loading of further pages. |
| `/page/<n>/` (n ≥ 2) | Index page *n*, same layout, with Previous/Next and numbered page links. Only generated for pages that exist. | Same as `/`. |
| `/exhibits/<NNN>/` (published) | Heading = display title. Full image as a responsive picture with `alt` = exhibit alt text, and a separate caption block (plaque) with the curatorial caption. A "Back to the gallery" link to the index page containing this exhibit (R5). A one-line framing note that names no platform ("From a collection of real images found in public social media posts"), linking to `/about/` (FR-014). If the image fails to load: a visible "Image unavailable" notice, while the caption and alt text stay readable. | Source URL, platform, author, original date or original filename, anywhere in visible text, attributes, `<meta>` tags or structured data. Any dispute/report/removal control (FR-007). |
| `/exhibits/<NNN>/` (unpublished) | Plain page: "Exhibit No. <NNN> is no longer available." plus a link back to `/`. HTTP 200. | The former image, title, caption or alt. |
| `/about/` | "About the collection": the text from `about.md`, stating that exhibits are real images from actual public posts on LinkedIn and other social media, meant to engage or inform, that grossly failed (Principle VI). | Links to any specific post, profile or account. Per-exhibit platform attribution. Platform logos or brand styling. |
| `/exhibits/<NNN>/` (draft or never existed) | Not generated. The host's standard 404 page applies. The site ships a museum-styled `404.html` ("No exhibit hangs here"). | — |

## Page-wide guarantees (all routes)

- Every page, including the tombstone and 404, has an "About the collection" link to `/about/`
  in the shared footer. FR-014, SC-006.
- No page names a platform in connection with a specific exhibit. No platform logos, brand
  colors, or "social post" card styling are used for exhibits. Principle III.
- No `noindex` directive on any page (FR-015).
- Link-preview metadata (R12). None of these values may contain a source URL, platform
  attribution, author identity or original date:

  | Page | `og:title` | `og:description` | `og:image` / `twitter:card` |
  |------|------------|------------------|-----------------------------|
  | Published exhibit | Display title | Collection-level description (names no platform) | Absolute URL of the exhibit's 1200 px JPEG preview variant / `summary_large_image` |
  | Index pages, About, "no longer available", 404 | Site name (and page name) | Collection-level description | None / `summary` |

- No third-party requests (scripts, fonts, analytics, embeds). R8.
- No `<form>`, `<input>`, or `<textarea>` elements. FR-007, FR-011.
- No `<script>` elements. The only script is the inline `onerror` attribute on exhibit
  images that reveals the "Image unavailable" notice.
- Caption and label text meet WCAG AA contrast. Pages pass automated axe checks with no
  serious or critical violations. FR-006.
- Alt text and caption are exposed as separate content: the caption is never used as
  `alt`, and alt is never duplicated as visible caption. FR-005.
