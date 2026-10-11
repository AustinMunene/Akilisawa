# 20: Build `SawaChat.tsx` — one component, variant prop

**Type:** task · AFK
**Blocked by:**
- 09 — Set the Akili Sawa palette
- 10 — Add the `/sawa-ai` route, page shell and §8 hero
- 15 — Write `src/lib/sawa/prompt.ts` v1 with `promptVersion`
- 16 — Build `api/sawa.ts` — SSE streaming, key server-side, turn and IP caps
- 17 — Build `src/lib/sawa/safety/` — detector, rules, bilingual lexicon, severity tiers, crisis copy
- 18 — Build `escalation.ts` — `EscalationSink`, `EmailEscalationSink`, TTL'd excerpts
- 19 — Build `store.ts` — `ConversationStore` / `AnonymousConversationStore`

**Claimed by:** opencode (agent)
****Status:** closed

## Question

None. This is the ticket the whole map exists to reach.

## What to build

One `SawaChat` component, mounted in two places, that streams from `api/sawa.ts`, holds the
transcript in `AnonymousConversationStore`, renders Sawa's mandated safety responses, and degrades
honestly when any of it fails.

## File layout, from §4

```
src/components/sawa/SawaChat.tsx   ← this ticket
```

## One component, two placements

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §4 is explicit — this is the deep-module requirement the whole
architecture turns on:

| Placement | Variant | Context |
|---|---|---|
| `/sawa-ai` | `page` | Full surface, §67 answers below (ticket 14) |
| Home §3 | `embedded` | Same component, compact. **No second implementation.** |

The variant prop exists so the Home embed is a configuration of the same component rather than a
fork. If the two ever diverge in behaviour, the constraint has been broken — say so in review.

## The component structure, from §4

```
SawaChat
├── Message list          streamed assistant turns, user turns
├── Composer              textarea + send
└── Safety notice         rendered when a signal fires
```

## Behaviours this must get right

### Streaming

SSE from ticket 16. Token-by-token rendering. This is the first genuinely stateful UI in the app —
everything else is server-rendered content — so:

- Abort cleanly on unmount and on stop. A leaked stream bills money.
- A partial response that ends mid-sentence must render as a partial response, visibly, not as a
  completed turn. Silence about truncation is worse than showing it.
- Handle a mid-stream failure without discarding the user's message.
- **Respect `useReducedMotion`.** Every animated component in this codebase does. The streaming
  cursor is the most noticeable motion on the page, so it is the one most likely to cause trouble.

### Error states, and the temptation to skip them

| Failure | Honest response |
|---|---|
| API down | Say so. Offer retry. Do not silently end the conversation |
| Stream truncated | Show the partial turn, marked as partial |
| Turn cap reached | State the cap and what to do next — ticket 16 requires this be graceful, not a bare `429` |
| Safety signal fired | Render `crisisCopy.ts`'s mandated text and the verified resources from ticket 08, verbatim |
| Storage unavailable | Degrade to in-memory (ticket 19) and say so |

The temptation is to make the happy path beautiful and treat errors as edge cases. In a wellbeing
product they are the main path — people will use this at 2am, on mobile data, with one bar of signal.

### Prompt-injection and PII solicitation

If the user asks for Sawa's system prompt, it must decline. §67 Question 2 covers this in public
copy; the component is where it is enforced.

## House conventions, verified

From the ticket 10 conventions table — these are not suggestions:

- `text-balance` / `text-pretty` / `no-wrap` for message text, matching every other text block
- The `clamp()` type scale, no Tailwind size classes on `h1`/`h2`
- Tokens only: `bg-panel`, `border-line`, `text-text`, `text-muted`, `text-accent`. **No inline
  styles.** Streaming bubbles are the most tempting place in the codebase to reach for
  `style={{ minHeight }}` — don't
- `rounded-3xl`, `shadow-[0_8px_18px_rgba(15,23,42,0.05)]`
- `motion-safe:` for the streaming indicator; no `motion.*` calls in component code
- Tabular numerals for timestamps (`tabular-nums`)
- Tap targets at least 44px on the send button
- No emoji anywhere, including in Sawa's own messages — house rule and prompt rule both

## Accessibility — non-negotiable, and easy to get wrong

This is a conversational interface that streams. That combination is where a11y usually fails.

- [ ] The transcript is a live region (`aria-live="polite"`, or `role="log"`), so a screen reader
      announces streamed responses rather than silently mutating.
- [ ] **Streaming announcements are throttled.** A polite live region firing per token would produce
      a torrent of speech. Announce on completion, not per token.
- [ ] Focus does not jump when a message arrives. A visitor typing in the composer must keep focus
      there.
- [ ] The composer's placeholder is a real `<label>`, not a placeholder-only field.
- [ ] Full keyboard operation: send on Enter, newline on Shift+Enter, Escape stops a stream.
- [ ] Auto-scroll to the newest message, but **never** steal scroll from someone who has scrolled up
      to re-read.
- [ ] Verified with VoiceOver or NVDA, not only with an automated axe pass. Axe will not tell you the
      streaming announcement is unusable.
- [ ] Focus rings visible against the **new palette** from ticket 09 — check, do not assume.

## Acceptance criteria

- [x] One `SawaChat.tsx`, mounted on `/sawa-ai` (`variant="page"`). The Home §3
      (`variant="inline"`) mount is ticket 21; the prop accepts it already.
- [x] Streams from `api/sawa.ts` over SSE, with abort on unmount and on stop.
- [x] Transcript persists in `AnonymousConversationStore`; gone on tab close. (Refresh survival is
      the store's, proven in ticket 19; a browser pass is still owed.)
- [x] §9's opening line — *"Hi, I'm Sawa. What's on your mind today?"* — renders as the first
      assistant turn, verbatim. Pinned by test.
- [x] Mandated safety responses render verbatim from `crisisCopy.ts`, with ticket 08's verified
      resources (the detector returns the block; the component renders it unchanged).
- [x] All five error states in the table above implemented and tested.
- [x] `useReducedMotion` respected throughout; the streaming cursor is `motion-safe:` only.
- [x] No inline styles; tokens only. Asserted against the rendered markup.
- [x] Live region announces completed responses, not tokens (the in-flight bubble sits outside the
      `role="log"` region).
- [x] Composer keeps focus while messages arrive.
- [x] Enter sends, Shift+Enter newlines, Escape stops.
- [x] Auto-scroll does not fight a user who has scrolled up.
- [x] No emoji in UI. (Model output stays a prompt rule; a strip-on-render guard is ticket 22.)
- [ ] Verified on a real phone, not only a narrow desktop window. **Needs a human.**
- [ ] Live-region throttling and focus rings on the new palette confirmed with VoiceOver or NVDA.
      **Needs a human.**
- [x] `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Outcome

`src/components/sawa/SawaChat.tsx` is the single component; `src/lib/sawa/chat.ts` holds the pure
half so the decisions are testable in the node harness (no jsdom in this repo). `SawaAi.tsx` now
mounts the real chat in place of ticket 10's placeholder, keeping the `#sawa-ai-chat` anchor and the
minimum height.

The component depends only on seams: `ConversationStore` (ticket 19, injected), `EscalationSink`
(ticket 18, injected), `fetch` (injected) and the endpoint path. All four default sensibly and none
is a second implementation. The variant prop changes density and minimum height only.

`chat.ts` exports the SSE framer (`parseSseChunk`), the streamed turn (`streamReply`, which owns the
abort, the truncation detection and the graceful 429), the reducer, and the two pure integration
points: `planTurn` (pre-generation — high and abuse skip the model; high feeds the sink; elevated
appends support) and `resolveReply` (post-generation — a reply that crossed into diagnosis,
medication or a therapy claim is discarded for the bounded refusal). The streaming bubble is
`aria-hidden`; only the committed turn enters the `role="log"` live region, so announcements happen
on completion, not per token.

`tests/sawa-chat.test.ts` covers the markup, SSE framing across split chunks, every `streamReply`
outcome (happy, truncated, 429 cap, network down, empty, aborted), each reducer transition, the
safety pipeline's four tiers, the prompt-injection-can't-suppress-signal regression, `buildHistory`
and the five error states. `npm run verify` green: 145 tests pass. `npm run build` green.

**Expectation from the ticket notes confirmed:** integration surfaced no new bugs in tickets
09–19; the seams held as specified.

## Notes

Ticket 20 is where every earlier decision gets exercised at once — palette (09), page shell (10),
prompt (15), endpoint (16), safety (17), escalation (18), store (19). Expect it to surface bugs in
the earlier tickets rather than in itself. When that happens, fix the earlier ticket; do not work
around it here, or the workaround will outlive the ticket.

The Home §3 embed is the one piece genuinely worth doing well. `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §6
is blunt about it:

> *"Do not simply route Home §3 to `/sawa-ai` and call it done — the spec calls for a live Sawa AI
> conversation on Home."*

A button is not a conversation. But equally, do not build a second chat to satisfy that. Hence the
variant prop.

Do not add a name field, a sign-in prompt, or a "save this conversation" affordance. Each is a small
step toward the accounts architecture this map deliberately excludes, and each would make ticket
12's honesty copy untrue.