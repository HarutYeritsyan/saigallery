<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Rationale: MAJOR bump — reverses the source-disclosure requirement of Principle III from
  mandatory public citation to mandatory non-disclosure and non-retention. This is a
  backward-incompatible redefinition of a principle per this document's own versioning rules
  ("relaxing the non-defamation or source-traceability requirements" = MAJOR).
- Modified principles:
  - I. Curatorial Purpose Over Engagement — closing clause reworded; ridicule boundary no longer
    references a publicly traceable "fact that they published it," since that fact is no longer
    disclosed anywhere on the platform (Principle III).
  - III. Evidence-Based Entries (Source Traceability) → III. Image-Only Presentation (Source
    Non-Disclosure) — requirement inverted: entries MUST NOT publicly disclose source URL,
    platform, author identity, or publication date, and no private/internal record of that
    information is retained after curation either.
  - IV. Non-Defamation & Takedown Path — takedown/dispute mechanism can no longer cross-check a
    request against a maintained source record (none exists). Rewritten to rely on the requester
    identifying/describing the specific entry themselves, with a TODO flagging that a concrete
    verification process is still undesigned.
  - V. Simplicity & Static-First Delivery — removed reference to "source links" as part of the
    minimal architecture description, since Principle III now prohibits them.
- Added sections: none (no new headings; existing principles amended in place).
- Removed sections: none.
- Deferred / TODO items:
  - TODO(TECH_STACK): carried over from v1.0.0, still unresolved — no implementation stack has
    been chosen yet.
  - TODO(TAKEDOWN_VERIFICATION_PROCESS): no concrete mechanism yet exists for verifying that a
    takedown requester is the depicted author, now that no source record is retained to
    cross-check against. Must be designed before public launch. Supersedes and subsumes the
    v1.0.0 TODO(TAKEDOWN_PROCESS_OWNER) (contact mechanism), which is folded into this item since
    both the contact path and the verification method need to be designed together.
- Templates requiring follow-up: none required immediate edits; plan/spec/tasks templates
  consume this constitution at runtime and were not modified by this command.
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
curated — nothing is kept to consult later, publicly or privately.

**Rationale**: Withholding and not retaining source information removes the platform's ability
to direct traffic, harassment, or engagement toward the original poster, reinforcing Principle
I's anti-harassment stance. It also enables planned interactive features (e.g., visitors
guessing what the original post was about, based solely on the image) that depend on the
original context being genuinely unavailable rather than merely unlinked.

### IV. Non-Defamation & Author Recourse
The platform MUST provide a low-friction way for a person who believes they are the depicted
author to request correction of context or removal of an entry. Because Principle III prohibits
disclosing or retaining source URL, platform, date, or identity, the platform CANNOT cross-check
a removal request against a maintained record; a request MUST instead be resolved by the
requester identifying or describing the specific entry themselves (e.g., by describing the
image's contents), with their own supporting evidence of authorship where feasible. All captions
and labels MUST be reviewed against Principle I before publication: they may say the image is
incoherent, bloated, or poorly curated; they MUST NOT make claims about the author as a person
or their identity.

**Rationale**: Protects the platform from legal and ethical harm (defamation, harassment) while
preserving its critical mission and the non-disclosure stance of Principle III. A credible,
if necessarily unverified-by-record, dispute path is what keeps "museum of shame" a curatorial
stance rather than a liability.

TODO(TAKEDOWN_VERIFICATION_PROCESS): No concrete mechanism yet exists for verifying that a
takedown requester is in fact the depicted author, now that no source record is kept to compare
against. A submission/contact path and a verification approach (e.g., requester privately
describes distinguishing details of the original post for one-time comparison before any record
is discarded, or removal is granted on request without contestable verification, accepting some
risk of bad-faith takedowns) must both be designed before public launch.

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

## Content & Accessibility Standards

Every image MUST include descriptive alt text summarizing what is literally depicted, separate
from its curatorial caption, so screen reader users receive the same factual content as
sighted users. Caption and label text MUST meet WCAG AA contrast requirements even within the
project's muted, museum-style palette. Accessibility MUST NOT be sacrificed for aesthetic
austerity.

## Development Workflow & Review Gates

Any change to curatorial policy or entry criteria (Principles I, III, IV) MUST be reviewed
explicitly against those principles before merge, and the review MUST be documented in the
pull request description. Any UI or design change MUST be checked against Principle II; a
change that measurably increases session length, return-visit rate, or sharing virality as its
stated goal MUST be rejected regardless of engineering quality. Architectural additions MUST be
checked against Principle V's simplicity bar.

## Governance

This constitution supersedes ad hoc practice for SAIGallery. Amendments require a written
rationale (what changed and why) and a version bump following semantic versioning:

- **MAJOR**: Backward-incompatible removal or redefinition of a principle (e.g., relaxing the
  non-defamation or source-traceability requirements).
- **MINOR**: A new principle or materially expanded section is added.
- **PATCH**: Wording clarifications or non-semantic refinements.

All pull requests MUST verify compliance with the Core Principles above; unjustified complexity
or engagement-pattern additions MUST be flagged in review. Use this file as the source of truth
for runtime development guidance until a separate agent-specific guidance file supersedes it.

**Version**: 2.0.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
