# 18: Build `escalation.ts` — `EscalationSink`, `EmailEscalationSink`, TTL'd excerpts

**Type:** prototype · HITL
**Blocked by:**
- 05 — Choose the model provider
- 08 — Verify the Kenya crisis resource list
- 17 — Build `src/lib/sawa/safety/` — detector, rules, bilingual lexicon, severity tiers, crisis copy

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

Who actually receives a high-severity escalation, and what happens on a Sunday night?

## What to build

The seam where a `SafetySignal` becomes a human notification, plus the one and only place Akili Sawa
persists anything a user wrote.

## File layout, from §4

```
src/lib/sawa/escalation.ts   EscalationSink interface + EmailEscalationSink
```

## The interface is a seam for a reason

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §3 defines it as an interface so the sink can be swapped — an
email sink now, a real case-management system later, without touching the detector:

```
┌─────────────────────────────────────────────┐
│  src/lib/sawa/                              │
│  ├─ prompt.ts       ← ticket 15             │
│  ├─ safety/         ← ticket 17             │
│  └─ escalation.ts   ← THIS TICKET           │
└─────────────────────────────────────────────┘
```

## The retention question is the ethically load-bearing one

§3's three requirements, verbatim in intent:

1. **Immediate disclosure.** The user is told, in the chat, that a flagged excerpt may be kept and
   used for follow-up. This is not a privacy-policy footnote. It appears in the transcript, in the
   moment, in house third person — ticket 05's `AnonymousConversationStore` surfaces it.
2. **Strictly scoped excerpts.** Only the flagged session's excerpt. Never a full transcript. Never
   another conversation. Never anything user did not write in the flagged turn or its immediate
   context.
3. **Short TTL.** Expiry is enforced, not aspirational.

The disclosure text is part of the product, not part of the sink. Write it in ticket 05 and wire it
here.

## The design question nobody has answered

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §3 assumes:

> *"a Resend alert to a configurable safeguarding inbox"*

**Nobody has said that inbox is monitored.** This is the map's open fog and it is the single largest
unresolved risk in the product.

Consider what ships if this ticket is built as specified and the inbox is unattended:

| | |
|---|---|
| The user | Was told a human might follow up |
| The page | Describes a human escalation pipeline |
| The signal | Was detected, classified high, and emailed |
| The inbox | Receives it at 02:14 on Sunday |
| The outcome | **The failure is invisible, and the site has claimed a safety system it does not have** |

That is worse than shipping no escalation at all, because it produces the appearance of care. An
**unmonitored inbox is a more dangerous artefact than no path**, and this is worth saying plainly to
the humans rather than discovering it later.

Three viable directions:

- **A — Confirm staffing.** Name who watches it, during what hours, and what happens outside them.
  Make the copy match.
- **B — Honest degradation.** Route high severity to *client-side mandated crisis copy only*, and
  make no claim about human follow-up. Safest, but abandons §11's pipeline.
- **C — Out-of-hours path.** Pair the inbox with a channel that is actually staffed at 3am, or state
  on the page that follow-up happens in business hours.

Do not resolve this by choosing quietly. It is a HITL ticket for exactly this reason.

## Acceptance criteria

- [ ] `EscalationSink` interface in `escalation.ts`, with `EmailEscalationSink` as the default
      implementation.
- [ ] Sink is replaceable without modifying `detect.ts` or `crisisCopy.ts` — the interface earns its
      place.
- [ ] Only **flagged-session excerpts** are retained. Full transcripts are never persisted.
- [ ] TTL is enforced in code, not documented as an intention. A test proves expiry.
- [ ] The in-chat disclosure (ticket 05) is emitted whenever a signal fires, in the transcript, in
      `Akili Sawa` third person.
- [ ] Alert contains: `promptVersion`, tier, timestamp, conversation id, and the capped excerpt.
      Everything ticket 05 requires for reproducibility.
- [ ] Alert does **not** contain the model key, and does not contain other users' data.
- [ ] Alert is not a firehose — an unattended inbox is also a spam-filter problem. Confirm rate
      limits on the alerting path.
- [ ] TTL duration decided with the humans, and tied to something real (a follow-up SLA) rather than
      picked as a round number.
- [ ] Endpoint wiring in ticket 16's `api/sawa.ts` calls the sink on `SafetySignal`.
- [ ] Tested under ticket 03's harness, including a high-severity signal end to end.
- [ ] Recorded as an ADR: what is retained, for how long, who can read it, and what happens when the
      inbox is unattended.

## Notes

Prototype + grilling ticket, and the grilling is the point. Before implementation, resolve: who reads
the alert, within what timeframe, and what is the fallback if that person does not respond? Those
three answers determine whether the page copy in tickets 13 and 14 is honest.

Sequencing note: this ticket is blocked by 17, not the other way round. Detection determines what an
escalation even contains. But the *design* work here — staffing, TTL, disclosure copy — can start
immediately, and ticket 08's findings feed directly into it. Do not wait to begin thinking about it.

One more consideration the humans should see: `EmailEscalationSink` puts a human's email client in the
critical path of a safety system. That is fine as a starting point and a poor end state. The seam
exists so it can be replaced; write it that way now rather than treating the inbox as the design.