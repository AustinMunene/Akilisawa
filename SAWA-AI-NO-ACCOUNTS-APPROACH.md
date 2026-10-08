# Sawa AI Without Accounts — Implementation Approach

**Date:** 2 October 2026
**Status:** Proposal — not yet agreed
**Related:** [`IMPLEMENTATION-GAP-ANALYSIS.md`](./IMPLEMENTATION-GAP-ANALYSIS.md) (Tier 1, §7–12, §39, §67)

---

## Summary

The gap analysis lists Sawa AI (spec §7–12) as 0% implemented and blocks Tier 1 behind
Tier 0.3 (auth + backend, effort **L**). This document proposes shipping **Tier 1 minus
1.5 and 1.7** — the public conversational experience — without user accounts, while
keeping the architectural seams honest so accounts become an additive swap rather than
a rewrite.

The spec already sanctions this. §10 defines Level 1 Public Sawa AI as *"Discovery +
low-friction initial engagement"* with no onboarding requirement. Levels 2 and 3 are where
accounts appear.

**Effort:** roughly one focused build, not the L-sized auth track.
**Blocked on:** the provider decision (§5) and the two open decisions in §8.

---

## 1. The one decision that shapes everything: don't persist transcripts

For the anonymous public level, keep the conversation **in the browser**
(`sessionStorage`) and store nothing server-side.

This is the largest single design call in the approach and should be made deliberately:

| Consequence | Detail |
|---|---|
| Avoids premature sensitive data | No store of health-adjacent conversation data exists before the §24 AI governance console does. Your §46 privacy architecture and §60 Security pillar claims stay literally true rather than aspirational. |
| Real privacy story | "We don't keep it" is a genuine differentiator for a prevention-first, non-clinical product, and it is consistent with the posture already enforced across every page (§61). |
| Accounts become a migration | Later, history becomes "write the transcript you already hold into the datastore on account creation" — a clean, one-directional move rather than a retrofit across a live store. |

**Exception — flagged sessions.** A safety escalation needs *something* for a human to act
on. Store only the last few messages of a flagged session, with a TTL, in a KV or Postgres
table, and say so in the transcript at the moment it happens. Silent retention of a distress
conversation would contradict the rest of this document.

---

## 2. The safety pipeline (§11) runs *before* generation, not after

You cannot rely on the model to self-report distress. Ordering is the whole design:

```
user message
  │
  ├── deterministic intake        length cap · prompt-injection check · PII-solicitation check
  │
  ├── signal detection             ← runs FIRST, on the user turn, in parallel with the LLM call
  │
  ├── if high severity ──────────► short-circuit
  │                                  • mandated response + Kenya crisis resources
  │                                  • stop open-ended conversational continuation
  │                                  • emit SafetySignal → EscalationSink
  │                                  • log capped transcript excerpt with TTL
  │
  └── else ─────────────────────► stream the reply
                                   │
                                   └── post-generation check
                                         did the reply cross into diagnosis / therapy territory?
```

### The detector must be model-based, not keyword matching

`api/contact.ts:21` (`sensitivePhrases`) is the anti-pattern to **not** copy forward. It
rejects any B2B enquiry containing `"trauma"` or `"emergency"` — which, in a wellbeing
product, is a large fraction of legitimate traffic. Tier 7.10 already flags it for removal.

For Sawa AI specifically:

- Use a small **classifier call** (or a dedicated safety model) with a deterministic regex
  pass underneath as a cheap floor.
- The lexicon must be **bilingual** from day one. §2.8 of the backlog specifies
  English/Kiswahili, and a substring list cannot cover Kiswahili distress language.
- Severity must be tiered. One classifier confidence threshold cannot distinguish
  "I am very tired" from "I have been thinking about ending my life" — and treating both
  identically will burn the escalation channel's credibility.

---

## 3. Escalation without a portal

"Human escalation" (§11) does not require the Sawa Admin console to be real. Today it is a
Resend alert to a configurable safeguarding inbox carrying:

- conversation id
- timestamp
- signal category and severity
- capped transcript excerpt

That is a genuine human path and satisfies §11 in the absence of Tier 5.

Emit through an interface so the transport is swappable:

```ts
interface EscalationSink {
  notify(signal: SafetySignal): Promise<void>
}
```

- `EmailEscalationSink` — now
- `QueueEscalationSink` — later, backed by the §23/§24 AI governance console

---

## 4. File layout

```
api/sawa.ts                          SSE streaming endpoint; model key server-side only
src/lib/sawa/prompt.ts               versioned system prompt (a reviewable artefact)
src/lib/sawa/safety/detect.ts        signal detection
src/lib/sawa/safety/rules.ts         deterministic safety rules
src/lib/sawa/safety/crisisCopy.ts    mandated responses + crisis resources
src/lib/sawa/store.ts                ConversationStore interface + AnonymousConversationStore
src/lib/sawa/escalation.ts           EscalationSink + EmailEscalationSink
src/components/sawa/SawaChat.tsx     the single chat component
```

### The seam that makes accounts additive

`ConversationStore` takes an owner discriminator:

```ts
type Owner =
  | { type: "anonymous" }
  | { type: "user"; id: string };

interface ConversationStore {
  load(owner: Owner): Promise<Transcript>;
  save(owner: Owner, transcript: Transcript): Promise<void>;
}
```

`AccountConversationStore` is then a new implementation behind the same interface. No call
site in the chat UI changes.

### Reuse rather than reinvent

- **One chat component, two mounts.** `SawaChat` renders in `/sawa-ai` and in the Home §3
  embed (backlog 1.8). A `variant` prop covers the difference. Do not build it twice.
- **Reuse the existing serverless conventions** in `api/contact.ts`: the Resend client,
  the `getClientIp` helper (`api/contact.ts:102`), the method guard, the error shape.
- **Reuse the design system.** `Section`, `Card`, `Button`, `Badge`, and the CSS-variable
  tokens are all live. The chat is built from `--panel`, `--surface`, `--muted`, `--accent`
  like everything else.

---

## 5. Model provider choice determines what you can claim

This is open question 5 in the gap analysis, and it is more load-bearing than it appears.

**Recommendation:** consume an external provider. Do not train in-house at this stage.
But select on these terms:

- **Zero-retention / no-training-on-input.** Without this, §46 and §60 claims are false.
- **Data residency** you can name in the privacy page.
- **Explicit safety and escalation terms** that support the §11 model.
- **Cost profile** for an anonymous public endpoint (§6).

Choosing the provider determines what §11 and §24 can honestly claim. This is a compliance
decision before it is a technical one.

### Version the prompt

Write the system prompt as a **versioned, reviewable file** and stamp `promptVersion` on
every response and every safety signal. This is:

- the seed of the §24 AI governance console (signals, model performance, model updates)
- the mechanism for reproducing why a given response was produced
- the enforcement point for §17 — AI observation must be visually and structurally
  distinguishable from professional assessment

---

## 6. Cost and abuse surface

An anonymous public LLM endpoint is a cost-amplification and abuse vector. This is a real
argument *for* eventually requiring accounts — but not a reason to delay day one.

Mitigations needed at launch:

| Control | Purpose |
|---|---|
| Max turns per conversation | Bounds the worst case per visitor |
| Message cap per IP | Bounds the worst case per source |
| Cheap model tier for the public level | Public discovery doesn't need the frontier model |
| Server-side key only | Never ship the model key to the client |

### Rate limiting caveat

The in-memory `Map` in `api/contact.ts:19` is **best-effort only**. Serverless instances
do not share memory and the map dies on cold start. Do not copy that approach for a paid,
unauthenticated endpoint. Use a KV store, or lean on provider-side rate limits and treat the
in-process limiter as a courtesy.

---

## 7. What the visitor actually sees

| Spec | Implementation |
|---|---|
| §8 hero — *"Meet Sawa AI. A conversation can be a place to start."* | `/sawa-ai` page hero, verbatim |
| §9 live interface | Real streaming chat. Not the mockup's `setTimeout` fake (`Akili Sawa_ final site.html:160`) |
| §9 fork | `Continue with Sawa` / `Create your Sawa account` — see below |
| §67 explanatory content | The six questions as an FAQ block *below* the working product, not above it |
| §39 persistent CTA | `Talk to Sawa AI` in nav and footer, site-wide |

### The fork is honest, not faked

- **`Continue with Sawa`** → reopens the browser-held transcript. Genuinely works today.
- **`Create your Sawa account`** → routes to `/contact` as waitlist capture. Do **not**
  ship a stub sign-up form that goes nowhere. Reserve the copy so it does not promise
  functionality that does not exist.

---

## 8. Decisions required before starting

| # | Decision | Why it blocks |
|---|---|---|
| 1 | **§4.1 positioning.** Building `/sawa-ai` *is* the decision — it selects "institutions **and** people" over institutions-only. | Ship it knowingly, not as a side effect of writing code. |
| 2 | **Model provider** (§5) | Determines prompt design, safety-rule feasibility, §11 and §24 claims, and unit cost. |
| 3 | **Age gate.** A public wellbeing chat in Kenya intersects the Children Act 2022 on counselling minors without consent. | Decide before public launch, not after the first incident. |

### And one thing to verify first

**Tier 0.5 — the Tailwind v4 config.** `tailwind.config.cjs` is v3-format and may not load
under Tailwind v4. The chat UI is built almost entirely from your design tokens
(`--panel`, `--muted`, `--accent`, `--line`). If `bg-panel`, `text-muted` or `rounded-soft`
resolve to nothing, you will spend the build debugging CSS instead of product.

Check this before writing the component, not during.

---

## 9. Deliverable sequence

| Step | Output |
|---|---|
| 1 | Verify Tailwind v4 tokens resolve in a live build (Tier 0.5) |
| 2 | Choose provider. Write `prompt.ts` v1 as a reviewable artefact with `promptVersion` |
| 3 | `api/sawa.ts` — SSE streaming, key server-side, turn caps, IP caps |
| 4 | `safety/` — detector, rules, crisis copy, bilingual, severity-tiered |
| 5 | `escalation.ts` — `EmailEscalationSink` via Resend, TTL'd flagged-transcript capture |
| 6 | `store.ts` + `SawaChat.tsx` — anonymous store, one component |
| 7 | `/sawa-ai` route: hero, chat, fork, §67 FAQ |
| 8 | Embed on Home §3; add the persistent CTA to nav and footer |
| 9 | Age-gate decision; abuse and cost monitoring |

**Deferred, by design:** 1.5 (three access levels wired to real auth), 1.7 (persisted
history), and all of Tier 2.

---

## 10. What this does *not* solve

Stated plainly so it is not mistaken for more than it is:

- **No history.** Leaving the browser loses the conversation. That is the trade in §1.
- **No check-ins, follow-ups, or continuity** (§12 capabilities 2, 3, 8). A single
  conversation is genuinely all this delivers.
- **No institutional path.** Level 3 (§10) is untouched.
- **No escalation queue.** Alerts go to an inbox, not a triage console with SLAs.
- **No i18n.** English only, despite §2.8. The safety lexicon being bilingual is a
  prerequisite for that, not a consequence of it.