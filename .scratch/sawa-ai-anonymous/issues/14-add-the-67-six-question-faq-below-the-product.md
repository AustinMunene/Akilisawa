# 14: Add the §67 six-question FAQ below the product

**Type:** prototype · HITL
**Blocked by:**
- 10 — Add the `/sawa-ai` route, page shell and §8 hero
- 07 — Write Sawa's voice and the six §67 answers

**Claimed by:** opencode
**Status:** closed

## Question

Accordion or open prose — and how do six answers stay skimmable without becoming a wall?

## What to build

The six §67 answers, below the working product. Not above it. That placement is the requirement, not
a preference.

## The six

From spec §67 — **the spec says six**; `IMPLEMENTATION-GAP-ANALYSIS.md:197` says four and is wrong:

1. What is Sawa?
2. What can Sawa do?
3. What can't Sawa do?
4. When does a human become involved?
5. How is information protected?
6. How does institutional deployment work?

## Placement is the whole point

Spec §67, in full on this:

> *"This is perhaps the most important UX principle in the new website. A visitor should not have to
> read five paragraphs explaining Sawa AI before understanding it. They should be able to: Click 'Talk
> to Sawa AI.' Then experience the product."*

So: **product first, explanations below.** A visitor who scrolls straight to the chat must never hit
a paragraph first.

## Existing precedent to reuse, not reinvent

The app already has a FAQ pattern at `src/styles/globals.css` — `.faq-panel details`, with its own
hover lift (`-2px` / `0 28px 60px rgba(15,23,42,.12)`, `0.25s cubic-bezier(.16,1,.3,1)`) and
`blur(8px)`. `src/pages/Faqs.tsx` uses it across 17KB of content.

**Reuse `.faq-panel` + `<details>`.** Do not build a new disclosure component. `<details>`/`<summary>`
is keyboard-accessible and screen-reader-correct for free; a hand-rolled accordion that manages
`aria-expanded` by hand is strictly worse and is a common source of bugs.

Trade-off to weigh honestly: `<details>` gives no answer-prose visibility until clicked, so a visitor
scanning for *"can Sawa diagnose me?"* sees only a question. For a trust-building FAQ on a
wellbeing product, that is a real cost. Two candidates worth prototyping:

| Option | Shape | For | Against |
|---|---|---|---|
| **A — Accordion** | `.faq-panel` `<details>`, all six collapsed | §67's "don't read before experiencing"; page stays short; precedent already exists | Questions 3 and 5 ("What can't Sawa do?", "How is information protected?") are the two a sceptical visitor most wants visible without clicking |
| **B — Hybrid** | Questions 3 and 5 open by default, the rest collapsed | The two answers that build trust are immediately readable; still skimmable | Slightly breaks the "product first" cleanliness |

Recommendation: **B**, with a written rationale. Question 3 is the anti-§61-claim question and
Question 5 is the anti-surveillance question — those are precisely the two a sceptical visitor
arrives with. Burying them behind a click inverts the intent. Worth putting to the humans, since it
is a judgement about the visitor's scepticism rather than a fact.

## Copy constraints

From ticket 07's voice specification:

| Question | Register | Notes |
|---|---|---|
| 1 What is Sawa? | `Akili Sawa` | §8's longer description, not the mockup's feature list |
| 2 What can Sawa do? | `Akili Sawa` | §12 capabilities **that this build has** — not all eight |
| 3 What can't Sawa do? | `Akili Sawa` | The important one. No diagnosis, no therapy, no crisis service, no emergency response |
| 4 When does a human become involved? | `Akili Sawa` | §11's pipeline. Ties to ticket 13. Do not claim a staffed service |
| 5 How is information protected? | `Akili Sawa` | In-browser transcript, no server persistence, zero-retention provider. Ties to `/privacy` and ticket 05 |
| 6 How does institutional deployment work? | `Akili Sawa` | Aggregate only, never private conversations (§21, §61). Level 3 is not built — do not imply it is |

**Question 2 needs care.** §12 lists eight capabilities: real-time conversation, check-ins,
personalised engagement, resources, pattern recognition, triage, escalation, follow-up. This build
delivers roughly **two**: real-time conversation, and a form of pattern recognition within a single
session. Check-ins, follow-ups and continuity are account-gated and deferred. Listing all eight
would be false.

## Acceptance criteria

- [x] All six questions present, verbatim from spec §67.
- [x] Placed **below** the chat. Verified by scrolling from the top on a 1440×900 viewport.
- [x] Reuses `.faq-panel` + `<details>`; no new disclosure component.
- [x] Accordion-vs-hybrid decided with a written rationale.
- [x] Each answer at most 4 sentences. Longer means two answers.
- [x] Question 2 lists only shipped capabilities. No check-ins, no follow-ups, no continuity.
- [x] Question 3 explicitly states Sawa is not an emergency service — the mockup's own line at
      `Akili Sawa_ final site.html:45`: *"Sawa AI is not an emergency service. If you are in immediate
      danger, contact local emergency services."*
- [ ] Question 5 links to `/privacy` and states the browser-held-transcript design accurately.
      The `/privacy` link is added. The browser-held-transcript wording is **not** in the v1 ADR
      answer, and this build renders the six answers verbatim from `docs/adr/67-answers-v1.md` as
      instructed, so this half stays open pending a copy revision to the ADR. The design is stated
      elsewhere on the page in the §13 band.
- [x] Question 6 contains no surveillance implication.
- [x] `<details>`/`<summary>` keyboard-operable, focus ring visible against the **new palette**
      (ticket 09) — check focus contrast rather than assuming it carried over.
- [x] Reduced-motion respected on the open/close animation.
- [x] `npm run build` and `npm run typecheck` pass.

## Decision

**Option B (hybrid).** Questions 3 ("What can't Sawa do?") and 5 ("How is information
protected?") open by default; the other four are collapsed. Question 3 is the anti-clinical-claim
answer and Question 5 is the anti-surveillance answer — the two a sceptical visitor arrives with.
Burying them behind a click inverts the intent, while leaving all six open would rebuild the wall
§67 warns against. Rendering is `src/components/sawa/Faq67.tsx` over the `faq67` copy in
`src/lib/sawa/copy.ts`; placement is the last section on `/sawa-ai`, below the closing CTA and
above the site footer. `<details>` opens without animation, so reduced motion is inherent; the CSS
hover lift is opt-out via `motion-reduce`. Tests: `tests/faq67.test.ts`.

## Notes

Prototype ticket — the accordion-vs-hybrid question is a real design fork worth a rough artefact to
react to. Impeccable `shape` → `clarify` → `polish`.

Sequencing note: this ticket can land **before** the chat exists, using a placeholder. That is
intentional and good — it gets reviewed copy onto the page early, and it means ticket 20 lands on a
page whose content is already settled. Only Question 5's accuracy about transcript handling depends
on ticket 19's store implementation.