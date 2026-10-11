# 19: Build `store.ts` — `ConversationStore` / `AnonymousConversationStore`

**Type:** task · AFK
**Blocked by:**
- 03 — Add vitest, api typecheck and real scripts

**Claimed by:** opencode (agent)
****Status:** closed

## Question

None. The design is specified.

## What to build

The browser-held conversation store — the client half of "no account, no server transcript".

## File layout, from §4

```
src/lib/sawa/store.ts   ConversationStore interface + AnonymousConversationStore
```

## Why it is an interface, not a class

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §4:

```
┌─────────────────┐          ┌──────────────────┐        ┌──────────────┐
│ SawaChat        │          │ ConversationStore│        │  Sawa AI     │
│ (component)     │◄────────►│  (interface)     │◄──────►│  (model)     │
└─────────────────┘          └──────────────────┘        └──────────────┘
```

`SawaChat` depends on the interface, never on the implementation. That is what lets the anonymous
`sessionStorage` store be swapped for an account-backed store later **without touching the chat
component** — which is precisely what makes the current no-accounts work reversible rather than a
dead end. Ticket 20's single reusable `SawaChat` depends on this holding.

## The one genuinely controversial piece of persistence

§3, on flagged excerpts:

> *"Only the flagged session's excerpt may be retained server-side with TTL and immediate
> disclosure."*

So `AnonymousConversationStore` has **two** storage paths, and conflating them would violate the
design:

| Path | Storage | Lifetime |
|---|---|---|
| Normal conversation | `sessionStorage` | The tab. Cleared when it closes. Never sent to a server. |
| Flagged excerpt | Server-side, via ticket 18's sink | TTL-bounded. Disclosed in-transcript at the moment of flagging. |

`sessionStorage`, not `localStorage`. That is the difference between "forgets when you close the tab"
and "follows you around forever" — for a wellbeing conversation, session-scoped is the correct
default and the whole no-accounts argument rests on it.

**Storage errors are real and must be handled.** Safari in private mode, quota exhaustion, and
storage-disabled browsers all throw on `sessionStorage` access. A wellbeing product must not white-screen
because a visitor blocks storage. Degrade to in-memory and say so.

## Acceptance criteria

- [x] `ConversationStore` interface and `AnonymousConversationStore` implementation in `store.ts`.
- [x] Full transcript lives in `sessionStorage` only. No transcript POSTed to the server, ever.
- [x] Transcript survives a page refresh within the same tab, and is gone when the tab closes.
- [x] `SawaChat` depends on the interface, not the implementation.
- [x] Storage-unavailable path degrades to in-memory without crashing the UI, and the degraded state
      is not silently invisible.
- [x] Serialisation handles a malformed or partial `sessionStorage` value without throwing.
- [x] A version key on the stored payload, so a schema change does not crash the app on an old value.
      The store will change shape as features land.
- [x] Message shape carries: role, content, timestamp, `promptVersion`, and — for assistant turns —
      the safety-tier result if any.
- [x] The flagged-excerpt path is **not** implemented here. It is ticket 18's. The store's job is to
      surface when disclosure is required; the sink decides where the excerpt goes.
- [x] "Continue with Sawa" (ticket 12) reads from this store.
- [x] Tested under ticket 03's harness: round-trip, malformed value, storage unavailable, schema
      version mismatch.
- [x] No `localStorage` for conversation content. Grepable assertion.
- [x] `npm run test`, `npm run typecheck`, `npm run lint` pass.

## Outcome

`src/lib/sawa/store.ts` and `tests/store.test.ts`. `ConversationStore` is the minimal surface
(`addMessage`, `getMessages`, `getLastN`, `clear`, `isDegraded`). `AnonymousConversationStore` keys
`sessionStorage` as `sawa.conversation:<namespace>` (default `anonymous`) and stores a versioned
payload `{ version, messages }`. `ConversationMessage` carries `id`, `role`, `content`, ISO
`timestamp`, `promptVersion` and, on assistant turns, `safety: { tier, categories }` typed against
ticket 17's severity tiers — that field is the store's half of the disclosure seam; the sink is
ticket 18's.

Storage is resolved defensively (a probe write/delete catches private mode) and every read/write is
wrapped: unavailable, throwing or quota-exhausted storage degrades to in-memory and flips
`isDegraded()` true rather than throwing. Malformed JSON, a schema-version mismatch and partial
messages are all discarded silently. No `localStorage`, no `fetch` and no logging are in the file;
`tests/store.test.ts` asserts all three by reading the source. `npm run verify` green: 93 tests pass.

What ticket 19 does not do and cannot: there is no browser at the harness, so the tab-close lifetime
and Safari private-mode path are reasoned, not measured.

## Notes

The privacy claim in ticket 14's Question 5 rests entirely on this file. If someone later adds
`localStorage` "for convenience so history persists", the site's central promise quietly becomes false.
Consider a comment at the storage call site explaining why `sessionStorage` and not `localStorage` —
this is a file someone will try to "improve".

Note also that the no-accounts constraint is a *product* decision with a stated rationale in
`SAWA-AI-NO-ACCOUNTS-APPROACH.md`, not a temporary hack. The `ConversationStore` interface is what
keeps that honest: this is a deliberate swap point, not a locked-in limitation.