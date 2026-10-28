# 27: Purge "pilot" from the site

**Type:** task · AFK
**Blocked by:** none

**Claimed by:** opencode (agent)
**Status:** closed 22 October 2026

## Question

What replaces "pilot" everywhere it appears, and does the `/pilots` route survive the rename?

## The decision

The client asked for the "Pilot" to be removed from "Pilot and Partnerships" wording, and chose
the thorough reading: **purge the word entirely, site-wide**.

The word appears **60 times** across `src/`. It does three different jobs, and each needs a
different replacement:

| Role | Example | Replacement |
|---|---|---|
| The scoped, time-bound collaboration | "Akili Sawa is engaged in paid pilots with insurance and financial institutions" | **engagement** |
| The rollout moment | "Institutional pilots underway" | **deployment** |
| The relationship | "Pilots & Partnerships" | **partnership** (unchanged) |

"Engagement" is the load-bearing word. It means a real, scoped partner collaboration without
promising something unbuilt, and it is not a synonym for "pilot" with the letters changed.

## The answer

**The vocabulary, as decided in the grilling session:** an **engagement** is the scoped,
time-bound collaboration; a **deployment** is the act of going live; a **partnership** is
the relationship and was never the problem. `docs/adr/vocabulary-engagement-v1.md` records
it.

### What was done

**The route.** `/pilots` is now `/partnerships`, with `src/pages/Partnerships.tsx` in place
of `src/pages/Pilots.tsx`. The redirect is in **two** places, and both are needed:

- `vercel.json` redirects `/pilots` to `/partnerships` at the edge, before any JavaScript
  runs, so a visitor with a bookmark or a shared link lands on the new page rather than on
  a client-side route that has to boot first.
- `src/App.tsx` keeps an in-app `<Navigate to="/partnerships" replace />` as the fallback
  for local development and for any host that does not read `vercel.json`.

**The copy.** Every instance of "pilot" is gone from the rendered site. The nav and footer
now read "Partnerships"; the page h1 is "Partnerships, Engagements, and Learning
Collaborations"; "What We Mean by Pilots" became "What We Mean by an Engagement"; the
four-step pathway is "Initial Conversation, Scoping & Design, Agreement & Governance,
Delivery & Learning"; and the closing CTA asks "Ready to scope an engagement?".

**The contact form.** The reason string moved from "Pilot or Partnership Discussion" to
"Partnership Discussion", and it moved **in the handler too** - the API's allowlist is
built from the same shared list in `src/lib/contact.ts` that the dropdown is built from.
That is the durable part of this fix: the reason reaches the email subject line, so the
dropdown and the allowlist drifting apart is a real failure mode, not a theoretical one.

**The FAQ.** "Partnerships & Pilots" became "Partnerships & Engagements", and "What does a
typical pilot involve?" became "What does a typical engagement involve?". The "Are pilots
paid?" question was **kept**, as "Are engagements paid?" - a prospective partner asking
whether the work is paid is exactly the visitor that page is for.

### The one thing deliberately left

`IMPLEMENTATION-GAP-ANALYSIS.md` and `SAWA-AI-IMPLEMENTATION-MAP.md` still refer to
`/pilots`. They are historical planning documents, not the site, and rewriting them would
misrepresent what those documents said at the time. The site's own docs are current.

## What to do

### The route

`/pilots` becomes `/partnerships`. `src/pages/Pilots.tsx` becomes `src/pages/Partnerships.tsx`,
`src/App.tsx` gets the new lazy import and route, and every internal link moves.

**Add a `/pilots` redirect.** The old URL is in bookmarks, in shared links and in the
`IMPLEMENTATION-GAP-ANALYSIS.md` references. A visitor who follows one should land on the new page,
not on a 404. `vercel.json` already carries a rewrite block; the redirect belongs either in
`vercel.json` or as a `<Navigate>` route in `App.tsx` - pick one and say which in the answer.

### The copy

The `/partnerships` page, after the rewrite:

| Now | Then |
|---|---|
| h1 "Pilots, Partnerships, and Learning Collaborations" | "Partnerships, Engagements, and Learning Collaborations" |
| "What We Mean by Pilots" | "What We Mean by an Engagement" |
| "Pilots are structured, time-bound collaborations designed to test..." | "Engagements are structured, time-bound collaborations designed to test..." |
| "Insurance & Financial Services Pilots" | "Insurance & Financial Services Engagements" |
| "Insurance & Financial Institution Pilots" | "Insurance & Financial Institution Engagements" |
| "Pilot phase (partner names confidential)" | "Engagement phase (partner names confidential)" |
| "Step 2 - Scoping & Design: Definition of pilot structure..." | "Definition of engagement structure..." |
| "Step 4 - Pilot Delivery & Learning" | "Engagement Delivery & Learning" |
| "Ready to scope a pilot?" | "Ready to scope an engagement?" |
| "Start with a structured, ethical, prevention-first pilot." | "Start with a structured, ethical, prevention-first engagement." |

Then the other pages:

- `src/lib/navigation.ts` - "Pilots & Partnerships" in both the nav and the footer.
- `src/pages/Home.tsx` - "Partner on evidence-led pilots that capture behavioural...", the
  "Pilots, Partnerships & Evidence" h2, "We co-design pilots with aligned partners...", and the
  "Explore Pilots & Partnerships" CTA.
- `src/pages/ForOrganisations.tsx` - "Explore Pilots & Partnerships", "Claims-adjacent prevention
  pilots", "Explore Insurance Pilots", "Discuss a Workforce Pilot", "Pilot Design", "Run pilots
  with safeguarding protocols", "Pilots & Partnerships" h2, "We co-design pilots in confidence".
- `src/pages/About.tsx` - two CTAs and "Institutional pilots underway".
- `src/pages/EvidenceImpact.tsx` - two CTAs, "Pilot evaluations", "Institutional uptake through
  paid pilots and research collaborations", "as pilots mature and", "Ready to design
  evidence-forward pilots?".
- `src/pages/Ethics.tsx` - "research partners may support oversight on specific pilots", one CTA.
- `src/pages/PreventionModel.tsx` - one CTA.
- `src/pages/Insights.tsx` - "pilots, research collaborations, and system design work".
- `src/pages/Faqs.tsx` - the "Partnerships & Pilots" section heading, "What does a typical pilot
  involve?", "Pilots are:", "Are pilots paid?", "Many pilots are paid engagements", and "A pilot or
  partnership discussion" in the contact list.
- `src/pages/Contact.tsx` - the "Pilot or Partnership Discussion" dropdown option, and the hero
  paragraph "preventive mental wellbeing pilots, partnerships, and learning collaborations".

**The contact form option is a special case.** "Pilot or Partnership Discussion" is a **string
that `api/contact.ts` matches against an allowlist**. Changing it in the UI without changing it in
the handler makes every one of those submissions a `400 Invalid submission`. The two must move
together, and the new string needs to be added to `reasonVariants.partnership` in
`api/contact.ts:34`.

**`api/contact.ts` also has copy to change**, not just the allowlist: the partnership responder
template says "We have received your enquiry regarding a potential collaboration or pilot."

## The "Are pilots paid?" FAQ

This one needs a judgement, not a find-and-replace. The answer currently says "Many pilots are paid
engagements, particularly with institutional partners." Rewritten as engagements, the question
becomes "Are engagements paid?" - which is a fine question and has the same answer. Do not drop the
question: a prospective partner asking whether the work is paid is exactly the visitor this page
is for.

## Acceptance

- [x] `grep -ri "pilot" src/ api/ tests/` returns nothing in user-visible copy. The only
      remaining hits are the `/pilots` redirect route, the slug alias, and code comments.
- [x] `/partnerships` renders; `/pilots` redirects to it, at the edge and in the app.
- [x] The contact form still accepts a submission with the renamed reason, and the internal
      email subject still reads sensibly.
- [x] `npm run verify` passes.
- [x] A browser pass at 1440px and 390px, light and dark, on `/partnerships` and on the pages
      that link to it.

## Worth considering, not in scope here

- `IMPLEMENTATION-GAP-ANALYSIS.md` and `SAWA-AI-IMPLEMENTATION-MAP.md` reference `/pilots` and the
  old nav. They are historical planning documents, not the site. Leave them, or update them, but
  decide rather than drift.
- The client asked only for the word. Whether the *page* should exist at all - `/for-organisations`
  already covers employer, insurer and researcher pathways - is a separate question.
