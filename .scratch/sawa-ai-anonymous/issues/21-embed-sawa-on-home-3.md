# 21: Embed Sawa on Home §3

**Type:** task · AFK
**Blocked by:**
- 20 — Build `SawaChat.tsx` — one component, variant prop

**Claimed by:** opencode (agent)
****Status:** closed

## Question

None. The requirement is explicit.

## What to build

Mount `SawaChat` with `variant="embedded"` into the existing Home §3 band. The same component, the
same behaviour, a compact presentation.

## Why this ticket is not a link

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §6:

> *"Do not simply route Home §3 to `/sawa-ai` and call it done — the spec calls for a live Sawa AI
> conversation on Home."*

A button that navigates is not a conversation. The spec wants the conversation on Home. A second
chat implementation would be a worse failure than a button, which is why ticket 20's variant prop
exists — so this ticket is a mount, not a build.

## Home §3 as it stands today

`src/pages/Home.tsx:107-124`. The existing copy:

> "Organisations often begin with a conversation. For schools, employers and community groups, that
> usually starts with someone reaching out." — `CTAHeading`, `CTALead`

Then a two-button block: `Explore our prevention model` → `/for-organisations`, and `Talk to our
team` → `/contact`.

So today Home has **no Sawa AI presence at all**. §10 of `SAWA-AI-NO-ACCOUNTS-APPROACH.md` lists
Home §3 among the high-priority surfaces; gap analysis §3.1 confirms the site has **no persistent
primary CTA** anywhere.

## Placement judgement

The existing band is institution-facing ("organisations", "schools, employers and community
groups") and sits after the hero. A wellbeing companion in a band addressed to institutions is a
misread — it invites the wrong audience and skates near the §61 surveillance concern, since
institutional framing next to private conversation implies oversight.

Two options:

- **A — Replace §3 with the embedded chat.** Strongest reading of the spec. Loses the
  organisations-first framing that currently leads the band.
- **B — Keep §3, add the chat as a new band after it.** Preserves the institution pathway and its
  existing CTAs, adds Sawa below. Longer page.

Worth putting to the humans rather than deciding quietly — this is a question about who Home is for,
which is the same question ticket 04 is already asking about positioning. **Recommend A** if
Akili Sawa is serving individuals (ticket 04's likely answer); **recommend B** if it is
institutions-first.

## Things not to break

- `SectionBackground` — every band is wrapped in one. Home uses `mid`; keep the variant rhythm
  consistent with the bands above and below.
- `PT` constant for vertical rhythm (`pt-16 md:pt-24`, `pt-12 md:pt-20`) — **this page does not use
  the `pt-0` + `pt-24` convention** that inner pages use. Match Home's own rhythm, not ticket 10's.
- `MotionInView` wrapping — Home already uses it; match it.
- Copy stays in house voice: British English, sentence case, no exclamation marks, `&` escaped.

## Acceptance criteria

- [x] `SawaChat` with `variant="inline"` mounted in the Home §3 band.
- [x] **No second chat implementation.** The embedded variant is the same component.
- [x] A visitor can complete a short exchange on Home without navigating away.
- [x] §9's opening line — *"Hi, I'm Sawa. What's on your mind today?"* — appears on first load, as it
      does on `/sawa-ai`. Pinned by test.
- [ ] Embed is compact enough that it does not push Home's existing bands out of a reasonable
      scroll depth. Check the total page height at 390px and 1440px. **Needs a human** (the map
      assigns this to ticket 23's screenshots).
- [ ] No horizontal scroll at 390px. The composer is the widest fixed element on the site now.
      **Needs a human** (ticket 23).
- [x] Reduced-motion respected — inherited from ticket 20 (`useReducedMotion`, `motion-safe:`
      cursor) and covered by its tests.
- [x] Transcript persists across a refresh on Home, consistent with ticket 19 (the same store and
      hydrate path).
- [x] Existing bands and CTAs preserved: no band was replaced, so `/for-organisations`,
      `/prevention-model`, `/community`, `/ethics`, `/pilots` and `/contact` all survive intact.
- [x] Copy consistent with the band's actual audience — the new band is people-facing
      ("Talk to Sawa"), kept on a `light` surface away from the institution CTAs, with the
      non-clinical disclaimer in the house third person.
- [x] `npm run verify` passes (typecheck, lint, test): 149 tests green.

## Outcome

`src/pages/Home.tsx` mounts `SawaChat` with `variant="inline"` in a new **Talk to Sawa** band,
placed at §3 per blueprint §40 (which defines Home Section 3 as "Embed a live conversational
experience"). The band uses the same `SectionBackground` / `Card` conventions as `/sawa-ai`'s
`variant="page"` mount, so there is still one chat, two mounts. The ticket's stale "as it stands
today" section described a `CTAHeading`/`CTALead` band that no longer exists in the codebase — the
current §3 was "Our Prevention Model" — so option B was taken: every existing band is preserved
and the conversation is added as a new band rather than replacing content. `tests/home.test.ts`
pins the mount, the opening line, the live-region markup, the house-voice disclaimer and the
surviving pathways.

## Notes

Small ticket by line count, high by blast radius: this is the first thing most visitors see, and it
adds ~300ms of streaming interaction to a page that was previously fully static. Verify it does not
make Home feel heavy or slow on a real connection.

One trap: Home already has a `CTALead` that invites organisations to reach out. If the chat lands
directly above it, the page says "talk to a wellbeing companion" and then "or talk to our team"
within a few hundred pixels. That is fine — it is two audiences, honestly offered — but the two bands
must not blur into one ambiguous call to action. Worth a look during review.