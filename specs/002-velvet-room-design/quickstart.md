# Quickstart & Validation Guide: Velvet Room Visual Design

How to run the site and prove each requirement of this feature. Structure rules are in
[contracts/page-structure.md](./contracts/page-structure.md); tokens are in
[data-model.md](./data-model.md). Setup is the same as
[001's quickstart](../001-gallery-mvp/quickstart.md).

## Prerequisites

- The project devcontainer (Node.js 26, pnpm through Corepack) and `pnpm install`.
- `SITE_URL` set for builds (for example `http://localhost:4321`).
- For the browser tests, a devcontainer rebuilt with Chromium's system libraries (the Dockerfile
  change in [research.md](./research.md) R13). After the rebuild, run the one-time browser download
  `pnpm exec playwright install chromium`.
- To look at the site from your own browser while developing: `pnpm dev:host`, then open
  `http://localhost:4321`.

## Run

```bash
pnpm dev:host     # dev server reachable from the host at http://localhost:4321
pnpm test         # unit tests, including the new contrast test
pnpm test:build   # fixture build, then build-output tests (structure, fonts, weight)
pnpm test:e2e     # Playwright: journeys, axe, and the no-overflow test at seven widths
```

The reference to compare against is `design/gallery-museum/preview/Main.html`, `Exhibit.html` and
`Mobile.html` (open them in a browser).

## Validation scenarios

| # | Scenario | How to check | Expected |
|---|----------|--------------|----------|
| V0 | Browser available (FR-016) | After rebuilding the container: `pnpm exec playwright install chromium`, then `pnpm test:e2e` before any restyling | Chromium starts in the container, and 001's e2e tests run. Any failures are recorded as 001's baseline. |
| V1 | Every token pair passes AA (FR-007, SC-001) | `pnpm test` | The contrast test passes for all text pairs and the focus ring, including cream text over the spotlight peak. It fails if a listed pair drops under 4.5:1 (3:1 for the ring). |
| V2 | Index parts present (US1, FR-002, SC-005) | `pnpm test:build` | Every card has one frame, pillow, nameplate and cordon; the card's text is only the display title. |
| V3 | Cordon is decorative (FR-003) | `pnpm test:build`, then click a card's edge near a post in the browser | Cordons are `aria-hidden`, text-free and never focusable, and clicking through them still follows the card link. |
| V4 | Exhibit page (US2, FR-004, FR-005) | Open `/exhibits/017/` | Title heading, framed image on a pillow, cordon in front, cream caption plaque separate from the image's alt text, framing note and back link. |
| V5 | Image failure (US2 scenario 3, FR-006) | Existing e2e V13 (blocks image requests) | "Image unavailable" visible, caption plaque visible. Then block images on `/`: every card still shows frame, pillow and nameplate. |
| V6 | No third-party requests, no scripts (FR-008, SC-003) | `pnpm test:build` and the browser network tab | No request leaves the site's origin; fonts load from `/_astro/…`; no `<script>` elements. |
| V7 | Weight (FR-014, SC-004) | `pnpm test:build` | Index page 1, its stylesheet, its fonts and its images total 1.5 MB or less. |
| V8 | No sideways scrolling (FR-010, SC-002) | `pnpm test:e2e` (`responsive.spec.ts`) | At 320, 390, 768, 1024, 1280, 1440 and 1920 px, on every page type, the page is no wider than the screen. |
| V9 | Zoom and text size (FR-011) | In a browser, zoom to 200% at 1280 px, then set the text size to 200% at 390 px | Content reflows, nothing is clipped or overlapped, all links stay reachable. |
| V10 | Phone layout (US3) | Open `/` at 390 px | One exhibit per row with pillow, plaque and a rope spanning the row, matching `Mobile.html`. |
| V11 | Forced colours (edge case, FR-007) | In a browser: Windows High Contrast, or DevTools "Emulate forced-colors: active" | Text, links and focus ring visible; frames, plaques and nameplates have visible borders. |
| V12 | Reduced motion (FR-012) | `pnpm test:build` (no `animation`, `@keyframes`, `transition` in the CSS) | Nothing animates. |
| V13 | Supporting pages (US4) | Open `/about/`, `/exhibits/042/` and `/no-such-page/` | Wall, typefaces, header and footer match the gallery; no frame, pillow or cordon. |
| V14 | Reviewer sign-off (SC-005, SC-007) | Compare each page type with the reference previews; show index page 1 to five people | Wall, frame, pillow, plaque and cordon present on all index and exhibit pages; at least 4 of 5 call it museum-like. |
| V15 | Feature 001 unaffected (FR-013, SC-006) | Run all of `pnpm test`, `pnpm test:build`, `pnpm test:e2e` | Every 001 check passes with no edits to what it asserts. |
