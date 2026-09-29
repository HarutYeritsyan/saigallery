# Feature Specification: Velvet Room Visual Design

**Feature Branch**: `002-velvet-room-design`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Velvet room visual design for SAIGallery. Restyle the gallery wall, exhibit page, about and 404 pages, and phone layout to match design/gallery-museum/ (Main, Exhibit and Mobile, the dark \"velvet room\" option; ignore the Light* files, and see design/gallery-museum/README.md for tokens and caveats). Oxblood wall, red velvet pillow under each exhibit, gold-framed images, brass plaques, gold cordon between brass stanchions. All text must meet WCAG AA. Keep zero client-side JavaScript, no third-party requests, and the existing exhibit behaviours (plaque separate from alt text, \"Image unavailable\" state, pagination)."

## Clarifications

### Session 2026-09-23

- Q: The velvet room's saturated oxblood, red, and gold palette is not a "restrained neutral palette" as constitution Principle II is worded. Amend the constitution, adjust the design, or ship as an exception? → A: Amend Principle II to allow a rich, period-museum palette while keeping its ban on engagement patterns (MINOR bump to v3.2.0); the design goes ahead as drawn.
- Q: Where must the browser-based checks (accessibility scan, no sideways scrolling from 320 to 1920 px) run before this feature is done? → A: In the project's own development container, which is to be given the system libraries a real browser needs, so all checks run locally (Option B).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the gallery wall in the velvet room (Priority: P1)

A visitor lands on SAIGallery and sees a room from a grand museum rather than a plain web page. The wall is deep oxblood. Each exhibit hangs in a gold frame and rests on a red velvet pillow, as if it were a crown jewel, with a brass plaque beneath it giving its title. A gold rope runs between brass posts across the front of each row of exhibits, as if the pieces were behind a cordon. The introductory statement reads as an inscription on the wall, and the page links stay easy to find and use.

**Why this priority**: The gallery wall is the first thing every visitor sees and the place where the design's central idea (worthless images treated with mock reverence) is delivered. If only this story shipped, the site would already have its new identity.

**Independent Test**: Can be fully tested by loading index page 1 with a seeded set of published exhibits at a desktop width and comparing it with the "Gallery wall" reference in `design/gallery-museum/` (Main): wall, frames, pillows, plaques and cordon are all present, every exhibit is still reachable, and paging and the About link still work.

**Acceptance Scenarios**:

1. **Given** the gallery has published exhibits, **When** a visitor loads index page 1 on a desktop-width screen, **Then** the page shows an oxblood wall, and every exhibit appears in a gold frame resting on a red velvet pillow with a brass plaque carrying its display title.
2. **Given** a row of exhibits is on screen, **When** the visitor looks at the row, **Then** a gold cordon with brass posts spans the front of the row, and it never covers, cuts off, or blocks clicking any exhibit, plaque text, or link.
3. **Given** index page 1 is loaded, **When** the page renders, **Then** the introductory statement about the collection (feature 001, FR-014) is shown as wall text in the room's cream text colour, and the page still offers explicit page-to-page navigation and a link to "About the collection".
4. **Given** a visitor moves through the page with a keyboard, **When** any link receives focus, **Then** a clearly visible focus indicator appears against the oxblood wall.
5. **Given** the gallery has zero published exhibits, **When** a visitor loads the index, **Then** the empty state appears inside the same room styling and reads as a deliberate museum message, not an error.

---

### User Story 2 - View a single exhibit in the spotlight (Priority: P1)

A visitor opens one exhibit and sees it presented like a single showpiece: large, in a gold frame, lit by a soft spotlight on the oxblood wall, resting on a velvet pillow with the gold cordon in front. Below it, the curatorial caption sits on a cream plaque, clearly separate from the image. The framing note and the way back to the gallery remain below.

**Why this priority**: The exhibit page is where the curatorial critique is delivered, and it is the page visitors reach from shared links. It must carry the same identity as the wall and keep every behaviour it has today.

**Independent Test**: Can be fully tested by opening any published exhibit directly and comparing it with the "Exhibit page" reference (Exhibit): framed image, pillow, cordon, cream caption plaque, framing note and back link are present, and the image's descriptive text is still exposed separately from the caption.

**Acceptance Scenarios**:

1. **Given** a published exhibit, **When** a visitor opens its page on a desktop-width screen, **Then** the exhibit's display title is the page heading, and the full image appears in a gold frame on a velvet pillow with the gold cordon in front of it.
2. **Given** a published exhibit, **When** the page renders, **Then** the curatorial caption appears on its own cream plaque, visually separate from the image, and a screen reader user still hears the image's descriptive text separately from that caption.
3. **Given** an exhibit's image fails to load, **When** the page renders, **Then** the frame, pillow, and caption still appear, and a clearly visible "Image unavailable" notice replaces the image in a legible, in-style way.
4. **Given** a visitor arrives directly on an exhibit page, **When** the page renders, **Then** the one-line framing note (feature 001, FR-014) and a link back to the gallery are visible and legible below the plaque.
5. **Given** an exhibit that has been unpublished, **When** a visitor opens its address, **Then** they see the plain "no longer available" message in the room styling, with no exhibit image or former title.

---

### User Story 3 - Visit on a phone (Priority: P2)

A visitor on a phone gets the same room in a single column: one exhibit at a time, each on its pillow with its brass plaque, the cordon spanning the width of the screen, and all text comfortably readable.

**Why this priority**: A large share of shared-link traffic arrives on phones, but the desktop design defines the identity, so phone comes second.

**Independent Test**: Can be fully tested by loading index page 1 and an exhibit page at phone widths (down to 320 px wide) and comparing them with the "Phone" reference (Mobile): one column, no sideways scrolling, and all pieces of the design present.

**Acceptance Scenarios**:

1. **Given** a phone-width screen, **When** a visitor loads index page 1, **Then** exhibits appear one per row, each in its frame, on its pillow, with its plaque, and a cordon spans the row.
2. **Given** any page at any width from 320 px to 1920 px, **When** it renders, **Then** the page never scrolls sideways and no text is cut off or overlapped by a design element.
3. **Given** a visitor enlarges text or zooms the page to 200%, **When** the page reflows, **Then** all content and controls remain reachable and readable.

---

### User Story 4 - Supporting pages share the room (Priority: P3)

The "About the collection" page, the "no longer available" page, and the "not found" page all sit in the same oxblood room, with the same header, footer, typography, and colours, so visitors never feel they have left the museum.

**Why this priority**: These pages are visited less often, but a mismatch would break the illusion. They need only the wall, type, and page furniture, not the pillows and cordon.

**Independent Test**: Can be fully tested by opening the About page and a non-existent address and confirming both use the room's wall, typefaces, and link colours, and that their text passes the contrast requirement.

**Acceptance Scenarios**:

1. **Given** a visitor opens the "About the collection" page, **When** it renders, **Then** its text appears on the oxblood wall in the room's typefaces at a comfortable reading width, with the site header and footer.
2. **Given** a visitor opens an address that does not exist, **When** the "not found" page renders, **Then** it shows its existing message and link back to the gallery in the room styling.

---

### Edge Cases

- **Custom or long titles**: A curator-set title much longer than "Exhibit No. 017" must wrap inside its brass plaque without overflowing, being cut off, or colliding with the pillow or cordon.
- **Non-square images**: The design mockups show square images. A wide or tall image on the exhibit page must still appear whole (not cropped), with the frame and pillow adjusting to it.
- **Partial last row**: When the final row of a page has fewer exhibits than the row above, the cordon must end neatly at the last occupied position instead of dangling over empty space.
- **Fewer exhibits than one row**: With only one to three published exhibits, the gallery must still look intentional.
- **Fonts unavailable**: If the room's typefaces cannot be shown, fallback serif faces must keep the layout intact with no overlapping or unreadable text.
- **Forced high-contrast or custom colour settings**: Text, links, and the focus indicator must stay visible when a visitor's system overrides page colours.
- **Reduced motion**: Nothing in the design may animate. If any transition is added later, it must respect the visitor's reduced-motion setting.
- **Image failure on the index**: An exhibit whose thumbnail fails to load must still show its frame, pillow, and plaque so the row stays intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every public page (index, exhibit, "no longer available", About, "not found") MUST use the room's look: the oxblood wall, cream body text, gold accents, and the room's typefaces, as defined by the tokens in `design/gallery-museum/README.md` for the velvet room option.
- **FR-002**: On the index, each exhibit MUST be shown in a gold frame resting on a red velvet pillow, with a brass plaque beneath it giving the exhibit's display title and nothing else, as feature 001 requires of an index card (its User Story 1, scenario 2).
- **FR-003**: On the index, a gold cordon with brass posts MUST span the front of each row of exhibits, and on the exhibit page a cordon MUST stand in front of the pillow. The cordon is decorative: it MUST be hidden from assistive technology, MUST NOT intercept clicks or keyboard focus, and MUST NOT cover any text or link.
- **FR-004**: The exhibit page MUST show the full, uncropped image large in a gold frame on a velvet pillow, with a soft spotlight effect on the wall behind it, and MUST show the curatorial caption on a separate cream plaque.
- **FR-005**: The curatorial caption MUST remain visually and semantically separate from the image's descriptive (alternative) text, as required by feature 001 (FR-005); this restyle MUST NOT merge or replace either.
- **FR-006**: The "Image unavailable" state on exhibit pages MUST keep working and MUST be clearly visible in the room styling. A failed image on the index MUST still leave its frame, pillow, and plaque in place.
- **FR-007**: All text MUST meet WCAG 2.2 AA contrast (at least 4.5:1, or 3:1 for large text) against the surface it sits on, including text on the wall, on brass plaques, and on cream plaques. Every keyboard focus indicator MUST have at least 3:1 contrast against its surroundings. Decorative elements (frames, pillows, rope, posts) are exempt.
- **FR-008**: The design MUST NOT add any client-side JavaScript beyond what feature 001 already permits, and MUST NOT make any request to a third-party host, including for typefaces, styles, images, or icons. Every asset MUST be served from the site itself.
- **FR-009**: The room's two typefaces (a high-contrast display serif for the site name, headings, and plaque titles; a book serif for body text and captions) MUST be served from the site itself. If they cannot be shown, fallback serif faces MUST keep the layout functional.
- **FR-010**: The layout MUST adapt from wide desktop screens down to phone screens 320 px wide. At phone widths exhibits MUST appear one per row as in the phone reference. At every width the page MUST NOT scroll sideways, and no design element MUST overlap or hide text.
- **FR-011**: Content and controls MUST remain usable and readable when text is enlarged or the page is zoomed to 200% (WCAG reflow and resize-text).
- **FR-012**: The design MUST NOT introduce any engagement-optimizing pattern (constitution Principle II): no counters, carousels, autoplay, or animation. Any transition added later MUST respect the visitor's reduced-motion setting.
- **FR-013**: All behaviour, content, and ordering defined by feature 001 MUST remain unchanged: newest-first order, explicit pagination, display titles, the collection introduction on index page 1 and About link on every page, the exhibit framing note, the "no longer available" behaviour, link-preview information, and the absence of any per-exhibit platform attribution or styling (constitution Principle III).
- **FR-014**: Pages MUST stay within the page-weight limit the site already enforces for feature 001, including the cost of the typefaces and any decorative artwork.
- **FR-015**: The constitution's Principle II MUST be amended (MINOR bump, v3.2.0) before implementation so that it allows a rich, period-museum palette such as the velvet room's, while keeping its ban on engagement-optimizing patterns. The restyle MUST comply with Principle II as amended.
- **FR-016**: The project's development container MUST be able to run a real browser, so the accessibility scan and the no-sideways-scroll check (SC-001, SC-002) can be run locally as part of verifying this feature. This includes the end-to-end tests that feature 001 already has but that could not run in the container.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of page types (index, exhibit, "no longer available", About, "not found", empty gallery) pass an automated accessibility check with zero contrast failures, at both a desktop and a phone width, run in the project's development container.
- **SC-002**: At every screen width from 320 px to 1920 px, 100% of page types show no sideways scrolling and no text hidden or overlapped by a design element, verified by automated checks run in the project's development container.
- **SC-003**: The built site contains zero third-party requests and zero new scripts, verifiable by inspecting every built page and its referenced assets.
- **SC-004**: Index page 1 with a full page of exhibits stays within the existing page-weight limit of 1.5 MB.
- **SC-005**: A reviewer comparing each restyled page type against the design reference finds all five signature elements present (oxblood wall, gold frame, velvet pillow, brass plaque, gold cordon) on 100% of index and exhibit pages, and finds the room's wall and typefaces on 100% of supporting pages.
- **SC-006**: Every acceptance check from feature 001 that covers visitor-facing behaviour still passes with no changes to what it asserts.
- **SC-007**: In informal testing, at least 4 of 5 first-time visitors shown index page 1 describe it as looking like a museum or gallery display.

## Assumptions

- **Reference source**: `design/gallery-museum/` (velvet room: `Main`, `Exhibit`, `Mobile`; the `preview/` renders show them in a browser). Where the site's real content differs from a mockup's placeholder content (exhibit images, pagination, titles), the real content wins and only the styling is taken from the reference.
- **Single design**: Only the dark velvet room is being built. The light "salon blanc" option stays in the repository as a reference and is not implemented.
- **Placeholder images**: The mockups use plain squares in place of exhibits; the real exhibit images are used in the site, in any aspect ratio the collection contains.
- **Plaque contents**: The plaque shows the display title only. The reference mockups also print a small "No. 001" line above the title; that line is left out, because the default title already contains the number and feature 001 limits a card to the image and its display title. Changing how titles are chosen is out of scope.
- **Column counts**: The reference defines four columns on desktop and one on phones. Intermediate widths use whatever column count keeps exhibits and cordon comfortable; the planning step decides the exact breakpoints.
- **Room for supporting pages**: The About, "no longer available", and "not found" pages get the wall, typefaces, header and footer but no pillow or cordon, because they have no exhibit to display.
- **No motion**: The mockups are static; this feature adds no hover, sway, or spotlight-following effects.
- **Typefaces**: The display and body serifs named in the reference README are the intended faces, served from the site itself. If they cannot fit the weight limit (FR-014), a system serif stack is acceptable, and this is a planning decision.
- **Scope**: No change to content, data, curator tooling, routes, or link-preview information. This is a styling and layout change only.
- **Dependency**: Feature 001 (Gallery MVP) is the behavioural baseline and must be present. The Principle II amendment (FR-015) must be in place before implementation. The development container must be rebuilt with browser system libraries (FR-016) before the browser-based checks can be run.
