# 13: Add the "can and cannot do" band and the safety-flow strip

**Type:** prototype · HITL
**Blocked by:**
- 09 — Set the Akili Sawa palette
- 07 — Write Sawa's voice and the six §67 answers

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

How does the page show what Sawa is and is not — and show the safety pipeline without implying it
is already running?

## What to build

The capability-boundary band and the safety-flow strip. Together these are the site's answer to the
single hardest trust question: *"is this a real clinical tool or not?"*

## Spec source

§11 — the safety model:

> Sawa AI should not be positioned as an autonomous therapist or diagnostician.
> **The preferred model is: AI identifies patterns. Humans provide context. People make decisions.**

Where defined safety signals appear:

```
Conversation → AI signal detection → Safety rules → Triage → Human escalation where appropriate → Follow-up
```

§61 — the website must avoid *"making Sawa AI sound like an autonomous clinician"* and *"making
unsupported diagnostic claims."*

The mockup renders this as a two-column split at `Akili Sawa_ final site.html:63`: left column
*"What Sawa can and cannot do"* with the blockquote *"AI identifies patterns. Humans provide context.
People make decisions."*; right column the six-step flow as pill chips.

## The constraint that makes this tricky

This band's honesty depends on implementation landing in tickets 17 and 18. The map's sequence
deliberately puts the **content** (ticket 13) before the **product** (17, 18) — content is cheap,
additive and reviewable; the safety pipeline is neither.

So this band describes a pipeline that is specified, built and tested, but at content-ticket time not
yet deployed. Do not over-claim. The band should read as *how Sawa is built*, not *what Sawa is
currently doing to your messages*.

Copy must land on the right side of this line:

| Over-claims | Under-claims | Right |
|---|---|---|
| "Your conversation is monitored for safety signals" | "Safety rules may be added in future versions" | "Sawa AI is built with signal detection and safety rules. Where a defined signal appears, the conversation is routed for human follow-up rather than continued open-endedly." |

## What must not appear

- **No diagnostic language.** Not *"detects depression"*, *"assesses your mental state"*,
  *"identifies your condition"*. §61 forbids unsupported diagnostic claims outright.
- **No clinician framing.** §11 forbids positioning Sawa as a therapist or diagnostician.
- **No surveillance implication.** *"Every conversation is monitored"* reads as institutional
  monitoring, which §61 also forbids and which would be false anyway — the whole design keeps
  transcripts in the browser.
- **No implication that escalation is staffed.** Per ticket 08's finding, escalation is currently an
  inbox. If that is unmonitored, describing a "human escalation" pipeline on a public page is the
  most dangerous copy in the build. Resolve before writing.

## Acceptance criteria

- [ ] Capability-boundary band renders in house vocabulary, using the mockup's split as the
      structural reference.
- [ ] *"AI identifies patterns. Humans provide context. People make decisions."* appears **verbatim**.
      It is the org's core thesis and it is not ours to paraphrase.
- [ ] Six-step flow strip renders as pill chips using token colours — matching the mockup's `.flow`
      treatment, not its CSS.
- [ ] Flow strip reads as architecture, not as a live status readout.
- [ ] No diagnostic or clinician language anywhere in the copy. Reviewed against §61 line by line.
- [ ] Explains what actually happens to the transcript — in the browser, not the server — and links
      to `/privacy`.
- [ ] Escalation staffing status confirmed with the humans before this ships. If unmonitored, the
      copy describes the *mechanism* honestly and does not claim a service level.
- [ ] Responsive: chips wrap cleanly at 390px without horizontal scroll, or become a vertical list.
- [ ] Consistent with ticket 12's honesty register.
- [ ] `npm run build` and `npm run typecheck` pass.

## Notes

Prototype ticket — "how should this read" is the question. Impeccable `shape`, then `clarify`.

Design note: the flow strip is the most visually distinctive element the mockup offers, and it
transfers well — pill chips with a brand-coloured arrow separator
(`.flow span:not(:last-child)::after { content: "→" }`) suit the glassmorphic token system without
modification. It is a genuinely good pattern and unlike the mockup's colours, it has no palette
baggage.

One risk worth naming: a six-step pipeline diagram on a page where only the first step works could
read as vapourware. Consider whether the strip belongs on `/sawa-ai` at all, or whether it earns its
place more honestly on `/prevention-model` or a future security page. Worth raising with the humans
rather than deciding quietly.