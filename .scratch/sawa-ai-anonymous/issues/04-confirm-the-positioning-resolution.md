# 04: Confirm the positioning resolution

**Type:** grilling · HITL
**Blocked by:** none (can start immediately)
**Claimed by:** _(unclaimed)_
**Status:** closed

## Question

Does building `/sawa-ai` commit Akili Sawa to serving **individuals** as well as institutions - and
if so, what does that mean for every other page on the site?

## Why this is HITL and not a technical ticket

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §8 decision 1 puts it bluntly: *"Building `/sawa-ai` **is** the
decision - it selects 'institutions **and** people' over institutions-only. Ship it knowingly, not
as a side effect of writing code."*

It cannot be settled by an agent. It is a statement about who the organisation is, and only the
founders can make it.

## The conflict

`IMPLEMENTATION-GAP-ANALYSIS.md` §4.1 - the blueprint and the built site say different things and
both cannot ship:

| | Blueprint | Live site |
|---|---|---|
| Primary statement | *"Akili Sawa helps organisations engage people early, understand emerging wellbeing needs, connect people to appropriate human support and generate privacy-conscious institutional intelligence."* | *"Preventive Mental Well-being, Before Crisis"* |
| Hero | *"Mental wellbeing infrastructure for the people who matter to your organisation."* | *"Preventive Mental Well-being, Before Crisis"* |
| Consumer statement | *"Sawa AI gives people a simple place to start a conversation."* | **absent** - no consumer product exists |
| Audience | Person + professional + institution (§68) | Institutions only |

The gap analysis's own summary: *"The blueprint requires a consumer-facing product on the front
door. The current site is B2B-only. This is the decision that determines everything else."*

## What is actually at stake

This map is scoped to Tier 1 minus 1.5 and 1.7 - the public conversational experience. That *is*
the people-facing surface. So the positioning question cannot be deferred past this map; it is
load-bearing for the hero copy, the §67 answers, and the nav restructure.

## Things worth putting to the humans in the room

- The homepage hero is specified as institution-first (*"for the people who matter to your
  organisation"*). A `/sawa-ai` page aimed at individuals sits awkwardly beside it. Does the hero
  change, or does the site carry two doors?
- `package.json` still describes the brand as a "climate-resilient therapy marketplace" - which
  §61 explicitly forbids presenting Akili Sawa as. Worth correcting regardless of how this resolves.
- The built-in tension: `/contact` says *"We prioritise organisational, research, and
  partnership-related enquiries."* That gatekeeps intake for a site whose front door is now a
  wellbeing chat. Does that line survive?
- Is a person who starts in `/sawa-ai` and wants a human being pointed at `/contact` the intended
  flow? If yes, `/contact`'s institutional prioritisation is actively in the way.

## Acceptance criteria

- [x] The resolution is written down in a form that survives the session - an ADR at
      `docs/adr/`, plus a `GLOSSARY.md` entry if new domain terms emerge.
- [x] It states explicitly whether Akili Sawa serves individuals publicly, and from which page.
- [x] It names which existing pages change as a result, so tickets 11 and 12 are not guessing.
- [ ] `IMPLEMENTATION-GAP-ANALYSIS.md` §4.1 is annotated as resolved, and Tier 0.1 ticked off.
- [x] If the answer is "institutions only", this map is mis-scoped and the human says so - in which
      case close this map and re-chart against a different destination. That is a legitimate
      outcome, not a failure.

## Resolution (applied)

- Q1: A - Individuals + institutions; /sawa-ai is public.
- Q2: B - Soften /contact to accommodate individuals routed from /sawa-ai.
- Q3: A - Update package.json to match spec (infrastructure + wellbeing chat; remove therapy marketplace language).
- Home hero, nav, /contact will reflect dual audience; ADR positioning-v1.md to be created.

## Notes

Call the Skill tool for both `grilling` and `domain-modeling` per the map's Notes. Do not answer
the positioning question on the humans' behalf.