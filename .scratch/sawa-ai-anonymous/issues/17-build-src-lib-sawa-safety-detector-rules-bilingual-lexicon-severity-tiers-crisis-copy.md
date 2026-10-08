# 17: Build `src/lib/sawa/safety/` — detector, rules, bilingual lexicon, severity tiers, crisis copy

**Type:** task · AFK
**Blocked by:**
- 03 — Add vitest, api typecheck and real scripts
- 05 — Choose the model provider
- 08 — Verify the Kenya crisis resource list

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

None. The design is specified. This is the highest-consequence code in the product.

## What to build

The safety pipeline that decides whether a conversation continues, gets a mandated response, or is
routed for human follow-up.

## File layout, from §4

```
src/lib/sawa/safety/detect.ts      signal detection
src/lib/sawa/safety/rules.ts       deterministic safety rules
src/lib/sawa/safety/crisisCopy.ts  mandated responses + crisis resources
```

## Ordering is the design

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §2, restated because it is the load-bearing constraint:

> **You cannot rely on the model to self-report distress. Ordering is the whole design.**

```
user message
  ├── deterministic intake     length cap · prompt-injection check · PII-solicitation check
  ├── signal detection          ← runs FIRST, on the user turn, in parallel with the LLM call
  ├── if high severity ──────► short-circuit
  │                             • mandated response + Kenya crisis resources
  │                             • stop open-ended conversational continuation
  │                             • emit SafetySignal → EscalationSink
  │                             • log capped transcript excerpt with TTL
  └── else ─────────────────► stream the reply
                               └── post-generation check
                                     did the reply cross into diagnosis / therapy territory?
```

Note the two distinct checks: **pre-generation** signal detection on the user turn, and a
**post-generation** check on Sawa's own reply. The second catches Sawa crossing into diagnosis or
therapy territory — §11's prohibition, enforced rather than trusted.

## The anti-pattern not to copy

`api/contact.ts:21` (`sensitivePhrases`) is named in §2 as the thing **not** to carry forward:

> *"It rejects any B2B enquiry containing `"trauma"` or `"emergency"` — which, in a wellbeing product,
> is a large fraction of legitimate traffic."*

A blocklist that rejects the words people use when they most need to be heard is the exact inversion
of a safety system. Note also that the correct behaviour there is *escalate*, not *reject* — rejection
is for malformed requests, and this product should never reject a message for being painful.

## Required pieces

### Bilingual lexicon, from day one

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §2: *"Build a **bilingual** crisis lexicon from day one."* Not
English now, Swahili later. Kiswahili is the language most likely to be used at the moment of crisis,
and a lexicon that misses it misses the people it exists for.

### Severity tiers

Detection must classify, not just flag. At minimum: **low** (distress, no immediate risk — continue,
watch), **elevated** (continue with care, offer human support), **high** (short-circuit, mandated
crisis response, escalate). §2's severity tiers also carry a *"malicious or high-volume"* class for
the spam and abuse shapes.

Bilingual detection is the hard part: code-switching mid-sentence (`"nimekuwa vizuri sana but I'm so
tired"`), and indirect reference ("I am thinking of joining my brother" — the euphemism that means
something very different from its surface reading). Word lists will not catch that. Plan for a
model-assisted pass over the deterministic rules, not a word list alone.

### Mandated crisis copy

In `crisisCopy.ts`, with the **exact** response text from §2 — verbatim, not paraphrased. It opens
with *"It sounds like you might be thinking about suicide"* and lists the Kenya crisis resources from
ticket 08. It is copied from a spec, not written by an engineer or a model.

**The resources in that copy come from ticket 08's human-verified list.** Nothing else. Not the
model's knowledge, not a guess, not a plausible-looking number. An invented helpline is worse than
no helpline.

## Acceptance criteria

- [ ] `detect.ts`, `rules.ts`, `crisisCopy.ts` exist as separate modules per §4.
- [ ] Detection runs **before** generation, on the user turn, in parallel with the LLM call.
- [ ] High severity short-circuits: mandated response emitted, open-ended continuation stopped.
- [ ] Post-generation check exists and runs on Sawa's own reply before it is streamed to the client.
- [ ] Crisis copy is **verbatim** from §2, in `crisisCopy.ts`, and cites only ticket 08's verified
      resources.
- [ ] Lexicon is bilingual (English + Kiswahili) from the first commit. Code-switched and indirect
      cases covered, not just literal keywords.
- [ ] Severity tiers implemented as a real classification with distinct behaviours, each
      human-verified.
- [ ] **Every tier has a test case**, and the tests assert the tier *and* the response behaviour —
      which resources were cited, whether generation was stopped, whether a signal was emitted.
- [ ] False-positive cases tested explicitly: a wellbeing enquiry containing "trauma" must be
      answered, not rejected. This is the `api/contact.ts` anti-pattern as a regression test.
- [ ] Tested against ticket 03's harness, including a prompt-injection attempt that tries to suppress
      detection.
- [ ] Reviewed by someone clinically qualified, if available. §24's governance console will need this.
- [ ] `npm run test`, `npm run typecheck`, `npm run lint` pass.

## Notes

This is the one ticket in the map where an agent should be reluctant to proceed alone. The code is
tractable; the **thresholds are not** — how much signal counts as "elevated", what the false-positive
rate is tolerable when the cost of a miss is a person's life and the cost of a false positive is an
unnecessary crisis response, is a judgement that belongs to someone with clinical expertise.

Get that judgement in writing, record it, and encode it as tier definitions. Otherwise the next
engineer to touch these thresholds will silently move them.

The map's fog flags that no escalation path is currently staffed. The tier logic does not depend on
that being resolved, but the *behaviour* does: `high → escalate` is only honest if someone receives
the escalation. Ticket 18 is where that bites.