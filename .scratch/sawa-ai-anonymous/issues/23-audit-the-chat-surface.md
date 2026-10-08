# 23: Audit the chat surface

**Type:** task · AFK
**Blocked by:**
- 20 — Build `SawaChat.tsx` — one component, variant prop

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

Does what shipped actually match what the spec said — on the page, in the accessibility tree, and in
the safety behaviour?

## What to build

The final verification pass. This is where claims in this map get checked against the running product
rather than against the tickets.

## Spec compliance

`IMPLEMENTATION-GAP-ANALYSIS.md` §2 lists the Tier 4 gaps as closed by this work. Verify each against
the live site, not the diff:

| Requirement | Verify |
|---|---|
| Persistent primary CTA (§39) | `Talk to Sawa AI` in nav and footer on every route |
| §67 placement | Product before explanation. Scroll from the top and confirm. |
| All six §67 questions present | Not four. `IMPLEMENTATION-GAP-ANALYSIS.md:197` is wrong; the spec says six. |
| §12 safety flow | The pipeline is described accurately, and does not claim what is not running |
| §11 boundary | No autonomous-clinician framing anywhere in copy |
| §61 | No diagnostic claims, no unsupported clinical promises, no surveillance implication |
| §9 opening line | Verbatim: *"Hi, I'm Sawa. What's on your mind today?"* |
| §10 access levels | Level 1 presented as available; 2 and 3 not overstated |
| Zero-retention provider | Ticket 05's decision actually implemented, not just chosen |
| No transcripts on the server | Verified by inspecting requests, not by reading code |
| No accounts, no auth, no portal | Grep for it and confirm none appeared |

## Accessibility audit

Do this manually as well as with tooling. A streaming chat is exactly where automated a11y checks
pass and the experience is still broken.

- [ ] Keyboard-only pass through a full conversation. Enter, Shift+Enter, Escape, tab order, focus
      visibility.
- [ ] Screen reader pass (VoiceOver on Safari, or NVDA on Firefox). Confirm streamed responses are
      announced **once on completion**, not per token, and not at all.
- [ ] Focus never jumps when a message arrives. Confirm while typing in the composer.
- [ ] Auto-scroll does not fight a user reading back.
- [ ] Contrast checked against the **new palette** from ticket 09 — including the streaming cursor,
      focus rings, and the amber accent if route A was taken. Amber on warm off-white is the known
      risk.
- [ ] Reduced-motion honoured with the OS setting on, not just simulated.
- [ ] Zoom to 200% without loss of content or function.
- [ ] axe or equivalent run, with results triaged rather than filed.

## Safety audit

The checks that only make sense against a running product:

- [ ] Run ticket 15's adversarial set through the live endpoint. Record **actual** behaviour.
- [ ] Every severity tier produces its designed response, with the right resources cited.
- [ ] A high-severity signal stops open-ended continuation. Confirm it visually, not just in a unit
      test.
- [ ] Crisis copy is **verbatim** from §2. Diff it character by character. Paraphrased crisis copy is
      a real failure mode.
- [ ] Only verified resources from ticket 08 are cited. Sawa invents no helpline number — test this
      by asking it for one and reading what it says.
- [ ] The in-transcript disclosure appears in the moment, in `Akili Sawa` third person, when a
      signal fires.
- [ ] §61's prohibitions re-read against every string the model can emit, not only the UI copy.
- [ ] Sawa declines to name or imply a condition when asked directly, and stays warm while doing it.

## Verification by observation

- [ ] Screenshots at 1440px and 390px, light and dark, for `/sawa-ai` and Home §3.
- [ ] Full end-to-end read of both pages as a first-time visitor. Not a feature checklist — read the
      prose and ask whether it would make you trust this organisation with something real.
- [ ] The "would I use this at 2am" test. On a real phone, on mobile data.

## Acceptance criteria

- [ ] Every row above verified and the result recorded — pass or fail, not "looks good".
- [ ] Failures become tickets, not footnotes. A discovered defect is a ticket with a blocker edge, the
      same as anything else.
- [ ] Accessibility findings listed explicitly, including the ones not fixed and why.
- [ ] Safety findings listed explicitly. No safety finding is silently deferred.
- [ ] Screenshots attached to the ticket.
- [ ] A single written verdict: does this page do what `SAWA-AI-NO-ACCOUNTS-APPROACH.md` claims? If
      the answer is no, say which claim and why.

## Notes

The last criterion is the one that matters. This map makes strong claims — no accounts, no server
transcripts, no diagnostic capability, no surveillance. Those claims are visible on the page and
therefore testable. If the product cannot back them, the fix is in the product or the copy, and
finding that out here is the cheapest it will ever be.

One specific thing to look at: whether the escalation story on the page matches what ticket 18
actually built. §11's pipeline implies a human follows up. If the sink is an unattended inbox, the
page and the product disagree, and that is a finding for this ticket rather than a matter of taste.