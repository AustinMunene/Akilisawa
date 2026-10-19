# 22: Harden the chat surface

**Type:** task · AFK
**Blocked by:**
- 20 — Build `SawaChat.tsx` — one component, variant prop

**Claimed by:** _(unclaimed)_
**Status:** in progress

## Question

What happens on a bad connection, a very long session, an old browser, or a network that goes away
mid-answer?

## What to build

Everything that makes the chat survive contact with reality. The feature is not done until it has
been broken deliberately.

## Implementation update

Implemented in the local workspace: server-side intake and severity checks; server-side output
screening before SSE emission; 700-token output cap; age/consent gate on both mounts; idle-stream
timeout with retry; abort when the tab is backgrounded; retry without duplicating the user's turn;
and server-side escalation reclassification with a disabled-by-default switch. Focused tests cover
these seams.

Still open: simulated 2G and real mobile checks; bundle impact and low-data behaviour; an old-browser
manual check; Vercel duration measurement; durable rate limits; and key absence in the deployed
bundle after an NVIDIA Preview deployment. Output screening buffers the provider response before
progressively writing SSE chunks, so it is not provider-token streaming.

## The cases that matter here

This is a streaming conversational UI on unknown mobile networks, used by people who may be
stressed. Optimistic UI and good error copy are not polish here — they are the difference between a
usable product and an abandoned one.

| Case | Required behaviour |
|---|---|
| Connection drops mid-answer | Partial response renders, marked partial. Retry offered. User's message preserved. |
| Stream stalls (no bytes for N seconds) | Timeout with a clear message, not an infinite spinner |
| Retry after a failure | Re-sends without duplicating the user's turn in the transcript |
| Double-submit | Composer disabled while a stream is in flight. No duplicate messages. |
| Enter held down | No accidental multi-send |
| Very long session | Cap reached → clear, honest message about the cap and what to do next |
| Very long single message | Rejected before the provider call, with the limit stated |
| `sessionStorage` unavailable | Degrade to in-memory (ticket 19). No crash. |
| Old browser, no `EventSource` | Either polyfill or a `fetch`-based reader. Decide, don't leave it to break silently. |
| Tab backgrounded during a stream | Don't burn tokens generating into the void |
| Multiple tabs open | Each tab is its own conversation — `sessionStorage` gives this for free. Do not "improve" it into shared state. |

## Bundle and cost guardrails

The chat is now the heaviest thing on the site, and Home loads it too (ticket 21). So:

- [ ] Home's bundle impact measured. If the chat adds materially to the initial payload on the
      page most visitors land on, consider whether the Home embed should load lazily below the fold.
      Do not solve this by code-splitting `SawaChat` such that `/sawa-ai` pays a waterfall — balance
      it.
- [ ] No new runtime dependency added for streaming or markdown without justification.
      `EventSource` and `fetch` cover it. A markdown library is a plausible temptation (users typing
      `*bold*`) and probably not worth the payload on this page.
- [ ] Streaming disabled or degraded when the connection is slow rather than eating the user's data
      plan. Worth at least detecting `navigator.connection` and not auto-starting.
- [ ] Turn caps and message caps stated to the user, not silently enforced.

## Cross-cutting hardening

Applies to the whole feature, not just the chat:

- [ ] No PII, session content, or conversation text in client logs, `console.log`, or error reports.
      Sanitise before anything leaves the browser.
- [ ] Server errors do not leak provider internals, prompts, or stack traces to the client. Check
      the `{ message: string }` shape from ticket 16 actually holds on every error path.
- [ ] `promptVersion` present on every stored assistant turn — required for reproducibility, and it
      must survive a store round-trip.
- [ ] No secrets in the client bundle. **Re-grep for the model key after the endpoint exists.** A
      single `VITE_`-prefixed key would ship it to every visitor.
- [ ] CORS untouched — same-origin only. If someone added CORS headers to `api/sawa.ts` "to make the
      endpoint reusable", that is a security regression, not a feature.

## Acceptance criteria

- [ ] Every row in the table above implemented and covered by a test under ticket 03's harness.
- [ ] Throttled on a simulated 2G connection — the flow still completes and the user is never left
      staring at a silent spinner.
- [ ] Retry does not duplicate the user turn in the transcript.
- [ ] Long-session cap and long-message cap both produce honest user-facing copy.
- [ ] No conversation content in logs or error reports. Verified by grep, not by intention.
- [ ] Model key confirmed absent from the built client bundle. Verified against the actual build
      output.
- [ ] Home's bundle impact measured and recorded.
- [ ] Reduced-motion, focus management and live-region behaviour unchanged from ticket 20 and still
      correct after the hardening.
- [ ] `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Notes

Testing streaming failure states needs `EventSource` mocking or a `fetch`-based reader from the
start. Retrofitting that after the component is written is more work than deciding it now, and it is
the difference between this ticket being thorough and being cosmetic.

Worth resisting the urge to add a retry-with-backoff library for the double-submit case. A disabled
composer plus an in-flight ref is the entire fix.

This ticket is also where the map's fog about a quiet, unmonitored escalation path gets its practical
shape. If the chat is robust but a high-severity signal lands in an unattended inbox, the robustness
is on the wrong side of the problem. Do not let a green test suite imply the safety story is
complete.
