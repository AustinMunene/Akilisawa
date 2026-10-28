# Vocabulary: engagement, not pilot (v1)

Status: adopted (2026-10-21)
Source: ticket 27, the "site that actually works" map

## Decision

The word "pilot" is purged from the site. A scoped, time-bound collaboration with a partner is an
**engagement**. The relationship is a **partnership**. The act of going live is a **deployment**.
The `/pilots` route becomes `/partnerships`, with a redirect from the old path.

## Rationale

"Pilot" carried a specific promise - a time-bound test of an intervention, with defined success
measures, before a wider rollout. The site's own FAQ asked "Are pilots paid?", so the word was
doing commercial work, not decoration.

The client asked for it to go. The question that had to be answered before it could be replaced
was what an *engagement* means, because a synonym for "pilot" would have changed nothing. An
engagement is a scoped, time-bound collaboration with a partner on defined success measures. It
does not promise a research phase, a pilot phase and a rollout as separate stages, and it does not
imply that the partner is being experimented on.

The three roles were split deliberately. "Engagement" is the work. "Partnership" is the
relationship, and it was never the problem - "Pilots & Partnerships" was a compound where only one
half was. "Deployment" covers the act of going live, which is what the old copy called a "pilot
phase".

## Consequences

- The contact form's reason string changes, which changes `api/contact.ts`'s allowlist. The two
  must move together or every submission of that reason is rejected.
- "Are engagements paid?" stays. A prospective partner asking whether the work is paid is exactly
  the visitor that page is for.
- `IMPLEMENTATION-GAP-ANALYSIS.md` and `SAWA-AI-IMPLEMENTATION-MAP.md` still refer to `/pilots`.
  They are historical planning documents, not the site.

## Notes

The word was never wrong in every context. It was wrong as a category of work, and the site's
vocabulary now says what it means. Removing it entirely was the client's decision, taken with the
"purge it site-wide" option in front of them.
