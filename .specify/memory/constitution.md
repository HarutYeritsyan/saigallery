<!--
Sync Impact Report
- Version change: 3.1.0 → 3.2.0
- Rationale: MINOR bump — materially expands Principle II's guidance. The "restrained neutral
  palettes" requirement is replaced by a rule that permits a rich, period-museum palette (deep
  oxblood walls, red velvet, brass and gold) as long as every text and background pair meets WCAG
  AA. Nothing is relaxed on engagement design: the pattern prohibitions are kept in full, and a new
  rule forbids decorative motion that autoplays or loops. Prompted by the velvet room design in
  design/gallery-museum/ (feature 002).
- Modified principles:
  - II. Museum Aesthetic, Not Engagement Design — palette requirement changed from "restrained
    neutral" to "museum-period palettes allowed, WCAG AA still required"; wall-text captions and
    plaque-like metadata kept; added "no autoplaying or looping decorative motion"; rationale
    updated to say the look may be grand but must not be captivating.
- Content & Accessibility Standards — removed the phrase "within the project's muted, museum-style
  palette" so it no longer implies a muted palette; the WCAG AA requirement itself is unchanged.
- Added sections: none.
- Removed sections: none.
- Deferred / TODO items: none.
- Dependent artifacts requiring follow-up:
  - specs/002-velvet-room-design/spec.md ⚠ FR-015 depends on this amendment; the spec's
    Clarifications section already records the decision. Run /speckit-plan next.
  - specs/001-gallery-mvp/plan.md: its Principle II check row is unaffected (it covers only the
    engagement-pattern prohibitions); its project-layout note "restrained palette" for
    gallery.css and that file's own opening comment will be outdated once feature 002 ships.
  - Templates: none modified; they consume this constitution at runtime.
-->

# SAIGallery Constitution
<!-- SAIGallery: the "S" stands for "Shameful" -->

## Core Principles

### I. Curatorial Purpose Over Engagement
Every exhibited entry MUST critique the artifact — the AI-generated image's incoherence,
semantic bloat, or failure to legibly convey the author's intent — and the publication
context around it. Commentary MUST NOT be directed at the personal competence, character,
appearance, or identity of the human who published it. The subject of ridicule is always the
image and its uncurated use, never the person. The platform MUST NOT disclose or reference who
published the source image or where it came from (see Principle III); critique MUST remain
confined to the artifact itself.

**Rationale**: This distinction is what separates documented, defensible satire of a content
quality failure from harassment of an individual. It keeps the project's mission ("shame the
practice of publishing unfiltered AI slop") intact without becoming a target list of people.

### II. Museum Aesthetic, Not Engagement Design
The gallery MUST be styled as a physical museum exhibit: wall-text style captions, plaque-like
metadata, and deliberate, unhurried browsing — not as a social or consumer app. The palette MAY
be as rich as a period museum's (for example deep oxblood walls, red velvet, brass and gold),
provided every text and background pair still meets WCAG AA (see Content & Accessibility
Standards). The interface MUST NOT use engagement-optimizing patterns, including but not limited
to: infinite scroll, like/upvote counters, algorithmic "for you" recommendation feeds, autoplay
carousels, gamified sharing mechanics, or push/engagement notifications. Decorative motion MUST
NOT autoplay or loop.

**Rationale**: The project's intent is explicitly to read as a historical record of "stupidity
and slop," not to be enchanting or captivating. A grand museum setting serves that intent, since
treating these images with mock reverence sharpens the joke, so the palette is free to be
dramatic. Any design choice optimizing for time-on-site or virality works against the curatorial
message and MUST be rejected even if it is common practice for image galleries.

### III. Image-Only Presentation (Source Non-Disclosure)
Every exhibited entry MUST show only the image itself and a curatorial caption/critique.
Entries MUST NOT publicly disclose the source URL, platform name, author handle or other
identity marker, or original publication date. No private or internal record of that source
information (URL, platform, date, or author identity) MUST be retained once an entry is
curated — nothing is kept to consult later, publicly or privately. The collection-level
statement required by Principle VI (that exhibits come from LinkedIn and other social media
platforms) is not a disclosure of any entry's source: no individual entry MAY be attributed to,
labeled with, or styled to identify a specific platform.

**Rationale**: Withholding and not retaining source information removes the platform's ability
to direct traffic, harassment, or engagement toward the original poster, reinforcing Principle
I's anti-harassment stance. It also enables planned interactive features (e.g., visitors
guessing what the original post was about, based solely on the image) that depend on the
original context being genuinely unavailable rather than merely unlinked.

### IV. Non-Defamation by Construction
The platform MUST NOT offer a visitor-facing correction, dispute, or removal request mechanism.
Because no after-the-fact correction path exists, every caption and label MUST be reviewed
against Principle I before publication, and that review is the platform's sole defamation
safeguard: captions may say the image is incoherent, bloated, or poorly curated; they MUST NOT
make claims about the author as a person, their identity, their intent beyond what the image
itself shows, or any fact that is not verifiable from the image alone. An entry whose caption
cannot pass this review MUST NOT be published. The curator MAY still edit or unpublish an entry
on their own initiative.

**Rationale**: With source information neither disclosed nor retained (Principle III), the
exhibited image is anonymous on the platform and a requester's claim of authorship cannot be
checked against anything. The project therefore relies on prevention rather than remedy:
confining every statement to the artifact itself means there is nothing about a person to
correct.

### V. Simplicity & Static-First Delivery
The implementation MUST default to the simplest architecture that satisfies a browsable image
catalog with curatorial captions (no source links, per Principle III) over speculative
scalability, personalization, or social features. New complexity — user accounts, comment
threads, recommendation engines, real-time features — MUST be explicitly justified against the
curatorial mission before being added, and MUST be checked against Principle II for
engagement-pattern regressions.

**Rationale**: SAIGallery is a curated satirical catalog, not a social platform. Keeping the
architecture minimal keeps it maintainable and prevents scope creep into exactly the kind of
engagement-driven product the project exists to criticize.

### VI. Found in the Wild (Collection Provenance)
The gallery MUST make clear to every visitor, before or while they view exhibits, that the
collection consists of real images that were published in actual public posts on LinkedIn and
other social media platforms, where they were meant to engage an audience or convey useful
information, and that each was chosen because it grossly failed to do so. This framing MUST be
present on the gallery's entry point and reachable from every exhibit page. Every exhibit MUST be
a genuine image the curator found in such a public post; the curator MUST NOT fabricate,
generate, or alter an image to create an exhibit. The only permitted changes are removing
embedded metadata, re-encoding, and cropping or redacting to remove identifying information
(names, handles, avatars, platform interface elements) as Principle III requires.

**Rationale**: The critique only lands if visitors know these images were not made up for the
joke: someone chose to publish each one to a professional or social audience as if it were
engaging or informative. Stating this once, for the collection as a whole, gives visitors the
context to judge the lack of sense and taste without pointing at any individual post or person
(Principles I and III).

## Content & Accessibility Standards

Every image MUST include descriptive alt text summarizing what is literally depicted, separate
from its curatorial caption, so screen reader users receive the same factual content as
sighted users. Caption and label text MUST meet WCAG AA contrast requirements whatever the
palette. Accessibility MUST NOT be sacrificed for aesthetic effect.

## Development Workflow & Review Gates

Any change to curatorial policy or entry criteria (Principles I, III, IV, VI) MUST be reviewed
explicitly against those principles before merge, and the review MUST be documented in the
pull request description. Any UI or design change MUST be checked against Principle II; a
change that measurably increases session length, return-visit rate, or sharing virality as its
stated goal MUST be rejected regardless of engineering quality. Architectural additions MUST be
checked against Principle V's simplicity bar.

## Governance

This constitution supersedes ad hoc practice for SAIGallery. Amendments require a written
rationale (what changed and why) and a version bump following semantic versioning:

- **MAJOR**: Backward-incompatible removal or redefinition of a principle (e.g., relaxing the
  non-defamation or source non-disclosure requirements).
- **MINOR**: A new principle or materially expanded section is added.
- **PATCH**: Wording clarifications or non-semantic refinements.

All pull requests MUST verify compliance with the Core Principles above; unjustified complexity
or engagement-pattern additions MUST be flagged in review. Use this file as the source of truth
for runtime development guidance until a separate agent-specific guidance file supersedes it.

**Version**: 3.2.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-23
