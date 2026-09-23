# Feature Specification: Gallery MVP

**Feature Branch**: `001-gallery-mvp`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Build the core SAIGallery experience: a browsable, museum-style catalog of AI-generated \"slop\" images. Each entry shows only the image plus a curatorial caption/critique (per the constitution: no source URL, platform, author identity, or publication date shown or retained). Visitors browse a calm, non-infinite-scroll gallery of entries (grid or list of \"exhibits\"), open an individual entry to see it full-size with its plaque-style caption and required alt text, and there is a low-friction way for someone to submit a takedown/correction request for a specific entry by describing it. No accounts, likes, comments, or algorithmic feeds. This is the first feature spec for the project — an MVP of the gallery itself, static-first per Principle V."

*Note: the takedown/correction request path in this original description was later removed; see Clarifications.*

## Clarifications

### Session 2026-09-23

- Q: When someone submits a removal request, should the disputed exhibit stay visible until reviewed, or be hidden right away? → A: Neither — the visitor-facing removal/correction request feature is removed from the site entirely (constitution amended to v3.0.0, Principle IV "Non-Defamation by Construction"). Only the curator edits or unpublishes exhibits, on their own initiative.
- Q: Does each exhibit have its own title shown as wall-text, and where does it come from? → A: Every exhibit gets an automatic catalog number with a default numbered title (e.g., "Exhibit No. 017"); the curator may optionally set a custom title that overrides the default wherever the title is displayed.
- Q: In what order should exhibits appear in the gallery index? → A: Newest first, by descending catalog number; new exhibits appear at the top of page 1. (Refined: see Assumptions › Index order.)
- Q: Should published image files be stripped of embedded metadata (EXIF, generator prompts, original filenames) before being served? → A: Yes — strip all embedded metadata and rename every file to a neutral name (e.g., derived from the catalog number), enforced for every published image.
- Q: How should the gallery tell visitors that exhibits are real images from LinkedIn and other social media posts that failed to engage or inform? → A: A short introductory statement at the top of index page 1, plus an "About the collection" page linked from the header or footer of every page (constitution v3.1.0 Principle VI).
- Q: How should the curator confirm an image is genuine and has had names, handles, avatars and platform interface cropped out or covered? → A: No confirmation or check of any kind. The curator is trusted to publish the content they choose; authenticity and removal of identifying details are the curator's own responsibility, not verified or recorded by the system.
- Q: When an exhibit's link is shared on a social platform or found through a search engine, what should the preview show? → A: Pages are indexed by search engines, and shared exhibit links show a preview card with the exhibit's display title and image.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the exhibit floor (Priority: P1)

A visitor arrives at SAIGallery and browses a calm, paginated (not infinite-scrolling) collection of exhibited entries, presented the way a museum floor plan or gallery index would present its works — image thumbnails with minimal wall-text (the display title), no counters, no "recommended for you" ordering.

**Why this priority**: This is the entire point of the site. Without a browsable index of exhibits, there is no gallery. Every other story depends on entries being discoverable first.

**Independent Test**: Can be fully tested by loading the gallery index with a seeded set of exhibits and confirming visitors can see and page through all of them without any login, without infinite auto-loading, and without engagement UI (likes, counters, feeds).

**Acceptance Scenarios**:

1. **Given** the gallery contains 40 published exhibits, **When** a visitor loads the gallery index, **Then** they see a bounded first page of exhibits (not all 40 auto-loaded, not infinite scroll) with a clear, deliberate way to move to the next page.
2. **Given** a visitor is browsing the index, **When** they view any exhibit thumbnail, **Then** they see only the image and minimal identifying wall-text (the exhibit's display title) — no like counts, view counts, author name, or source link.
3. **Given** the gallery has zero published exhibits, **When** a visitor loads the index, **Then** they see a museum-appropriate empty state (not an error).
4. **Given** exhibits No. 001 through No. 040 are published, **When** a visitor loads the first page of the index, **Then** Exhibit No. 040 appears first and the exhibits continue in descending catalog-number order.
5. **Given** a first-time visitor loads index page 1, **When** the page renders, **Then** a short introductory statement above the exhibits explains that the collection consists of real images found in public posts on LinkedIn and other social media, meant to engage or inform, that grossly failed to do so.
6. **Given** a visitor is on any page of the site (index, exhibit, or "no longer available"), **When** they look for context about the collection, **Then** a link to the "About the collection" page is present in the page's header or footer.

---

### User Story 2 - View a single exhibit (Priority: P1)

A visitor selects an exhibit from the index and views it full-size on its own page, alongside its plaque-style curatorial caption/critique and its accessibility alt text — the same depth of experience as standing in front of a single museum placard.

**Why this priority**: Tied with browsing as core to the product: the individual exhibit page is where the curatorial critique (the actual "shame the practice" content) is delivered. The index alone doesn't deliver the mission; the detail view does.

**Independent Test**: Can be fully tested by opening any single published exhibit directly (via its own URL) and confirming the image, caption, and alt text render correctly with no source metadata present anywhere in the page (visible or in markup).

**Acceptance Scenarios**:

1. **Given** a published exhibit, **When** a visitor opens it, **Then** they see the full image, its plaque-style curatorial caption, and no source URL, platform name, author identity, or original publication date anywhere on the page or in the page's underlying markup.
2. **Given** a published exhibit, **When** a screen reader user opens it, **Then** the descriptive alt text (factual description of what's depicted) is announced separately from the curatorial caption (the critique).
3. **Given** a visitor is viewing an exhibit, **When** they want to return to browsing, **Then** they can navigate back to the index without losing their place (e.g., returning to the same page of results).
4. **Given** a visitor is viewing an exhibit, **When** they look for a way to dispute, report, or request removal of it, **Then** no such mechanism is offered anywhere on the page.
5. **Given** a published exhibit's link is shared on a social platform, **When** the platform builds its link preview, **Then** the preview shows the exhibit's display title and its cleaned image, with a description that names no platform and contains no source URL, author identity, or original publication date.
6. **Given** a visitor arrives directly on an exhibit page (e.g., from a shared link), **When** the page renders, **Then** a one-line framing note that names no platform tells them the exhibit comes from a collection of real images found in public social media posts, and links to the "About the collection" page.

---

### User Story 3 - Curator publishes a new exhibit (Priority: P3)

The platform's curator (site maintainer) adds a new exhibit — image, curatorial caption, and accessibility alt text — so it becomes visible to visitors, and does so without needing to retain or later expose the image's source URL, platform, author identity, or publication date.

**Why this priority**: Necessary for the gallery to have content at all, but it is a low-frequency, maintainer-only workflow (not a visitor-facing feature) and can reasonably be satisfied by the simplest possible mechanism for an MVP, so it is lower priority than the visitor-facing experience it supports.

**Independent Test**: Can be fully tested by having the curator publish one new exhibit (image + caption + alt text) and confirming it appears correctly in the index (Story 1) and detail view (Story 2), with no source metadata captured or stored anywhere in the process.

**Acceptance Scenarios**:

1. **Given** the curator has an image, a curatorial caption, and alt text ready, **When** they publish it as a new exhibit, **Then** it appears in the gallery index and has its own detail page.
2. **Given** the curator is publishing an exhibit, **When** they complete the publishing step, **Then** no source URL, platform name, author identity, or original publication date has been entered, stored, or retained anywhere in the process.
3. **Given** the curator is publishing an exhibit, **When** they prepare its caption, **Then** the caption has been reviewed against the constitution's Principle I (critique of the image only, no claims about the author as a person) before it goes live.
4. **Given** the curator publishes an exhibit without a custom title, **When** it appears in the index and detail view, **Then** it is shown under its default numbered title; **and when** the curator later sets a custom title, **Then** the custom title replaces the numbered title everywhere it is displayed.

---

### Edge Cases

- What happens when an exhibit's image fails to load? The page MUST still render the caption and alt text, with a clear visual indication that the image is unavailable (not a broken-image icon with no context).
- What happens when the curator unpublishes an exhibit? Visitors who had the exhibit's direct URL MUST see a plain "no longer available" state, not an error, and it MUST NOT remain reachable from the index.
- What happens to link previews after an exhibit is unpublished? Its "no longer available" page MUST carry no preview image or former title. Previews already cached by external platforms are outside the site's control.
- How does the system handle an exhibit's caption without an image (e.g., a curator publishing incomplete content)? An exhibit MUST NOT go live without both an image and a caption; incomplete entries stay unpublished.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a browsable index of published exhibits, divided into deliberately-navigated pages (e.g., pagination or a "load more" the visitor explicitly triggers), never an auto-loading infinite scroll. Exhibits MUST be ordered by descending catalog number (newest first), identically for every visitor.
- **FR-002**: The system MUST NOT display engagement metrics (likes, view counts, shares) or algorithmic/personalized ordering anywhere in the index or detail views.
- **FR-003**: Each exhibit MUST have its own individually addressable detail view showing the full image, its curatorial caption, and its accessibility alt text.
- **FR-004**: The system MUST NOT display, or retain in any store the system controls, an exhibit's source URL, source platform name, author identity/handle, or original publication date, at any point after curation.
- **FR-005**: Every exhibit MUST include descriptive alt text (factual description of what's depicted) distinct from its curatorial caption (the critique), satisfying the constitution's accessibility standard.
- **FR-006**: Caption and label text MUST meet WCAG AA contrast requirements within the gallery's visual design.
- **FR-007**: The system MUST NOT offer visitors any mechanism to dispute, report, or request correction or removal of an exhibit (constitution Principle IV).
- **FR-008**: The system MUST allow the curator to publish a new exhibit (image + curatorial caption + alt text) and to unpublish or edit the caption of an existing exhibit.
- **FR-009**: The system MUST prevent an exhibit from being publicly visible unless it has both an image and a curatorial caption.
- **FR-010**: When an exhibit is unpublished, the system MUST stop listing it in the index and MUST show a plain "no longer available" response for its direct URL, without exposing an error.
- **FR-011**: The system MUST NOT require visitor accounts or logins, and MUST NOT offer comments or any social feature.
- **FR-012**: Every exhibit MUST be assigned a unique catalog number when it is first added to the collection (before it is published). A number MUST never be reused once its exhibit has been published, including after unpublishing. Its display title MUST be the curator's custom title when one is set, and otherwise a default numbered title derived from the catalog number (e.g., "Exhibit No. 017"). The display title MUST appear on the index and as the heading of the detail view.
- **FR-013**: Every published image file MUST have all embedded metadata removed (e.g., camera/EXIF data, AI-generator prompts or settings, software/tool names, embedded dates or authorship fields) and MUST be served under a neutral filename that carries no trace of its original filename (e.g., derived from the catalog number). An image that has not been cleaned MUST NOT be publishable.
- **FR-014**: Index page 1 MUST open with a short introductory statement, and the site MUST have an "About the collection" page, linked from the header or footer of every page. Together they MUST state that the exhibits are real images found in actual public posts on LinkedIn and other social media platforms, published to engage an audience or convey useful information, and selected because they grossly failed to do so. Every exhibit page MUST also show a one-line framing note that names no platform (e.g., "From a collection of real images found in public social media posts"), linking to the About page, so visitors arriving from a shared link get the context too. None of these MAY attribute any individual exhibit to a specific platform (constitution Principles III and VI).
- **FR-015**: All public pages MUST be indexable by search engines. Each published exhibit page MUST provide link-preview information showing its display title and its cleaned image (FR-013), with a description that is either the collection-level description or a caption excerpt. The description MUST name no platform and MUST never contain a source URL, author identity, or original publication date, because it appears next to that specific exhibit's image. Index, About, and "no longer available" pages MUST use a collection-level preview with no exhibit image.

### Key Entities

- **Exhibit**: A single published entry in the gallery. Attributes: catalog number (unique, never reused), optional custom title (overrides the default numbered title when set), image, curatorial caption/critique text, accessibility alt text, publish status (draft/published/unpublished; drafts are never public). Explicitly excludes: source URL, source platform, author identity, original publication date — these are never captured as attributes of this entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can go from landing on the gallery index to viewing a full exhibit detail page in under 10 seconds of interaction.
- **SC-002**: 100% of published exhibit pages contain zero instances of source URL, source platform name, author identity, or original publication date, verifiable by inspecting rendered page content and the served image files (embedded metadata and filenames).
- **SC-003**: The gallery index never auto-loads more than one page of exhibits without an explicit visitor action, across 100% of index page loads.
- **SC-004**: 100% of published exhibits have non-empty alt text distinct from their caption, verifiable by automated accessibility check.
- **SC-005**: The curator can publish a new, fully compliant exhibit (image + caption + alt text, no source metadata) in under 5 minutes.
- **SC-006**: 100% of site pages link to the "About the collection" page, and in informal testing at least 4 of 5 first-time visitors, after viewing only index page 1, correctly say the exhibited images came from real social media posts.

## Assumptions

- **Curation model**: For this MVP, exhibits are added by a single trusted curator (the site maintainer); there is no public/crowdsourced submission path for new exhibits in this feature. The site has no visitor-facing input of any kind.
- **Curator trust**: The system does not verify, prompt for, or record that an exhibit is a genuine image from a real post, or that identifying details (names, handles, avatars, platform interface) were cropped out or covered. Both are the curator's own responsibility under constitution Principles III and VI, handled before the image is added.
- **Defamation safeguard**: Per constitution v3.1.0 Principle IV, pre-publication caption review by the curator is the sole defamation safeguard; there is no takedown, dispute, or correction path for visitors or depicted authors.
- **Index order**: Catalog numbers reflect the order exhibits were added, not published. A draft that is published after a newer exhibit appears below that exhibit in the index.
- **Scale**: MVP is sized for a modest catalog (tens to low hundreds of exhibits) and light traffic; no requirement here for large-scale concurrency, matching Principle V's static-first, non-speculative-scale posture.
- **No search/filter/tagging**: Out of scope for this MVP; browsing is a simple paginated index only.
- **No multi-curator/roles**: Out of scope for this MVP; a single curator identity is assumed, with no distinct admin-permission tiers.
