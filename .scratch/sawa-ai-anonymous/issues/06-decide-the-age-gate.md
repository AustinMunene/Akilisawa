# 06: Decide the age gate

**Type:** grilling · HITL
**Blocked by:** none (can start immediately)
**Claimed by:** _(unclaimed)_
**Status:** closed

## Question

What age gate, if any, sits in front of the public Sawa AI conversation — and who signs it off?

## Why this blocks ticket 07

If the gate excludes under-18s, then Level 1 is adult-only, and the hero copy, the six §67 answers
and the crisis copy all change together. The fog section on this map flags that as "a much larger
content change than it looks". Settle it before writing the voice.

## The issue

A public wellbeing chat in Kenya intersects the **Children Act 2022** on counselling minors without
consent. `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §8 decision 3:

> *"Decide before public launch, not after the first incident."*

That framing is right and worth preserving. The cost asymmetry is brutal: a gate you did not need
costs a bad first session and some bounce; a gate you needed and did not have is a safeguarding
incident involving a child, on an AI product, in a country that has just written a specific statute
about it.

## Options worth putting to the humans

| Option | Shape | Cost |
|---|---|---|
| **No gate** | Anyone may talk | Statutory exposure. Also: what does a wellbeing product say to a 13-year-old, and does the crisis copy work for them? |
| **Self-declaration** | "I am 18 or over" checkbox | Light friction. Legally weaker — self-declaration is weak evidence of consent. |
| **Date of birth** | Blocks under-18 entirely | Strongest simple option. Loses the prevention-first ambition for younger people, which is arguably where prevention matters most. |
| **Age gate + consent flow** | Gate, then explicit terms acceptance | Most defensible. Most friction. Most content to write. |
| **Differentiated** | Younger users get a restricted prompt set, no personalised engagement, different crisis routes | Best product outcome. Most work. |

## Acceptance criteria

- [x] Legal basis identified and recorded — who is the Akili Sawa contact for this question, and has
      they been asked? If this needs external advice, that is a `task` the humans must action first.
- [x] Gate mechanism chosen, or explicitly declined, **with the reasoning written down**.
- [x] The decision covers the Home §3 embed (`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §4 says one
      component mounts in two places) — a gate on a full page is not automatically a gate on an
      embed.
- [x] If the gate collects a date of birth, that is personal data — confirm the handling is covered
      by `/privacy`, which currently does not name a controller, dates or jurisdiction (gap analysis
      §3.1).
- [x] Copy implications handed to ticket 07 as a constraint.
- [x] Recorded as an ADR at `docs/adr/`.

## Resolution (applied)

- D1: A - Named contact required; external legal advice: Y (action before launch). Contact: CEO/leadership (to be recorded in ADR).
- D2: D - Age gate + consent (defensible). Applies Kenya context.
- D3: Y - Gate applies to Home embed.
- D4: A - If DOB collected, never stored server-side; client-only gate state in sessionStorage; no DOB persisted. /privacy must be updated if DOB used.
- D5: Age gate copy plain, English+Kiswahili, third person per voice-v1 where boundaries appear.

## Notes

This is not an engineering question. An agent cannot assess statutory exposure, and should not try.
Call the Skill tool for `grilling` and `domain-modeling`.

Worth noting in the conversation: the spec's own framing (§10) is that Level 1 is *discovery and
low-friction initial engagement*, and §61 warns against making the product sound clinical. An
aggressive gate works against both. There is a defensible middle path, but it is the humans' to
choose.