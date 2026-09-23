<!--
Sync Impact Report
- Version change: 3.0.0 → 3.1.0
- Rationale: MINOR bump — adds a new principle (VI) requiring the gallery to frame its exhibits,
  as a collection, as real images found in public social media posts (LinkedIn and other
  platforms) that were meant to engage or inform and failed. No existing principle is removed or
  relaxed: per-exhibit source non-disclosure (Principle III) is unchanged and clarified.
- Modified principles:
  - III. Image-Only Presentation (Source Non-Disclosure) — clarified that the collection-level
    provenance statement required by Principle VI is not a disclosure of any individual entry's
    platform; per-entry platform attribution remains prohibited.
- Added sections:
  - VI. Found in the Wild (Collection Provenance) — site-wide framing requirement plus an
    authenticity rule (every exhibit is a genuine, publicly posted image; nothing fabricated;
    only metadata removal, re-encoding, and cropping/redaction of identifying details allowed).
- Development Workflow & Review Gates: Principle VI added to the curatorial-policy review list.
- Removed sections: none.
- Deferred / TODO items:
  - none. (TODO(TECH_STACK) from v1.0.0 no longer appears in the body; the Gallery MVP plan
    settles the stack as an Astro static site.)
- Dependent artifacts requiring follow-up:
  - specs/001-gallery-mvp/spec.md ⚠ has no requirement for collection-level framing text or for
    an authenticity check at curation; plan/contracts need a matching framing element.
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
The gallery MUST be styled as a physical museum exhibit: restrained neutral palettes, wall-text
style captions, plaque-like metadata, and deliberate, unhurried browsing — not as a social or
consumer app. The interface MUST NOT use engagement-optimizing patterns, including but not
limited to: infinite scroll, like/upvote counters, algorithmic "for you" recommendation feeds,
autoplay carousels, gamified sharing mechanics, or push/engagement notifications.

**Rationale**: The project's intent is explicitly to read as a historical record of "stupidity
and slop," not to be enchanting or captivating. Any design choice optimizing for time-on-site
or virality works against the curatorial message and MUST be rejected even if it is common
practice for image galleries.

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
sighted users. Caption and label text MUST meet WCAG AA contrast requirements even within the
project's muted, museum-style palette. Accessibility MUST NOT be sacrificed for aesthetic
austerity.

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

**Version**: 3.1.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-23
