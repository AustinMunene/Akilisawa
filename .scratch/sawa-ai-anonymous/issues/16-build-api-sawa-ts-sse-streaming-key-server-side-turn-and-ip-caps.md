# 16: Build `api/sawa.ts` — SSE streaming, key server-side, turn and IP caps

**Type:** task · AFK
**Blocked by:**
- 05 — Choose the model provider (research done; the provider decision itself is a human gate)

**Claimed by:** _(unclaimed)_
****Status:** closed
response-duration ceiling, measured) cannot be closed from the repo; see Outcome.

## Question

None. The design is specified. This ticket builds it.

## What to build

The serverless streaming endpoint that powers the chat, with the model key never leaving the server
and the worst case per visitor bounded.

## File layout, from §4

```
api/sawa.ts    ← this ticket
```

## House conventions to reuse from `api/contact.ts`

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §4 says reuse rather than reinvent. Verbatim conventions:

```ts
const getClientIp = (req: { headers: Record<string, string | string[]> }) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim();
  return "unknown";
};
```

- Signature: `export default async function handler(req: any, res: any)`
- Resend client instantiated **inside** the handler, not at module scope
- Env vars from `process.env`
- Error shape: always `{ message: string }` — never an array of field errors
- Status codes used: `200`, `400`, `405`, `429`, `500`
- Method guard first → rate limit → parse → validate → env check → work
- **No CORS headers.** Same-origin only by design. Do not add them.

## The rate-limiting warning — do not copy the existing limiter

`api/contact.ts:17-19`:

```ts
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();
```

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §6 is explicit:

> *"The in-memory `Map` in `api/contact.ts:19` is **best-effort only**. Serverless instances do not
> share memory and the map dies on cold start. Do not copy that approach for a paid, unauthenticated
> endpoint. Use a KV store, or lean on provider-side rate limits and treat the in-process limiter as a
> courtesy."*

That is correct and the reasoning holds: an in-memory map gives no real protection on Vercel. Use
provider-side rate limits as the real control, keep an in-process limiter as a courtesy, and be
explicit in comments about which is which.

## Required controls, from §6

| Control | Purpose |
|---|---|
| Max turns per conversation | Bounds worst case per visitor |
| Message cap per IP | Bounds worst case per source |
| Cheap model tier for the public level | Public discovery does not need the frontier model |
| Server-side key only | **Never ship the model key to the client** |

The fourth is the security boundary of this product. The key must never appear in a client bundle,
in `VITE_*` env vars, or in any log.

## Streaming specifics

- SSE via `Content-Type: text/event-stream`, with `Cache-Control: no-cache` and
  `Connection: keep-alive`. Vercel serverless has a response-duration ceiling — confirm the current
  limit and design within it, or use a streaming-friendly provider shape.
- Handle client disconnect mid-stream (`req.on("close")`) and stop billing. A dropped connection that
  keeps generating is a direct cost leak on a public endpoint.
- Sanitise the conversation id. It is visitor-supplied if generated client-side, and it appears in
  escalation alerts.
- Cap message length **before** the provider call, not after.
- Intake checks run **before** generation, per §2 — length cap, prompt-injection check,
  PII-solicitation check. The safety detector runs in parallel with the LLM call on the user turn
  (`api/sawa.ts` owns the wiring; ticket 17 owns the detector).

## Acceptance criteria

- [x] `api/sawa.ts` streams tokens over SSE.
- [x] Model key read from `process.env`, referenced only in this file, never in `src/`.
- [x] Per-conversation turn cap enforced and the cap-exceeded response is graceful and honest —
      not a bare `429` mid-conversation. The user should be told what happened and what to do.
- [x] Per-IP message cap enforced.
- [x] Method guard → rate limit → parse → validate → env check ordering matches `api/contact.ts`.
- [x] `getClientIp` reused verbatim.
- [x] Error shape is always `{ message: string }`; status codes limited to 200/400/405/429/500.
- [x] No CORS headers added.
- [x] Client disconnect stops generation and billing.
- [x] `api/` typechecks (ticket 03's `tsconfig.api.json`).
- [x] Under ticket 03's test harness: method guard, turn cap, IP cap, oversized message, missing env
      var, provider timeout, provider error — each with an asserted status and message shape.
- [ ] Confirm the streaming path works under the Vercel response-duration ceiling, measured not
      assumed. (Not closeable from the repo — needs a preview deploy.)
- [x] Turn cap value justified against ticket 05's cost model, not guessed. (12 turns, per
      `research/provider-comparison.md`.)
- [x] `npm run build` and `npm run typecheck` pass.

## Notes

Note the ordering consequence in §2: safety detection runs **in parallel with** the LLM call on the
user turn, but a **high-severity** signal short-circuits and stops open-ended continuation. The
wiring for that belongs here; the detector itself is ticket 17. Budget for the endpoint to be able to
abandon an in-flight stream and emit mandated crisis copy instead — that is not an error path, it is
a designed path.

Cost note: this is the ticket where the "cheap model tier" question in the map's fog starts to have
an answer. Whether one tier suffices for both conversation and safety classification is an input to
ticket 17's design, so flag it back if the provider's tiers differ sharply.

## Outcome

Built as `api/sawa.ts` with `tests/sawa-api.test.ts`; `npm run verify` (typecheck, lint, test) is
green.

- **SSE.** `text/event-stream` with `Cache-Control: no-cache`, `Connection: keep-alive` and
  `X-Accel-Buffering: no` (so a proxy does not buffer the stream). The first event is
  `{ type: "meta", promptVersion }`, then `{ type: "delta", text }` per chunk, then
  `{ type: "done", promptVersion }`. The version comes from ticket 15's `promptVersion`.
- **Providers.** `SAWA_MODEL_PROVIDER` selects Mistral (default) or OpenAI; Mistral and OpenAI
  share the Chat Completions delta shape, so one parser serves both and the fallback is env
  configuration. OpenAI carries `store: false` and `stream_options.include_usage` per the ZDR note
  in the research. Keys, base URL and model all come from `process.env`, only in this file.
- **Fail closed.** A missing key, base URL or model is a generic `500`; the message never names the
  provider. Provider non-OK and provider timeout (default 25 s, `SAWA_PROVIDER_TIMEOUT_MS`
  override) are the same generic `500` before any bytes stream. A mid-stream failure emits an SSE
  `error` event instead, because the status line is already sent.
- **Caps.** 12 turns per conversation and 40 messages per IP per day, both in in-memory `Map`s that
  die on cold start — commented as courtesy controls, with provider-side limits named as the real
  budget control. The turn-cap response is a `429` with an honest, actionable message, not a bare
  one.
- **Privacy.** The request body is never logged. `promptV1` is injected as the system message and
  history is truncated to the last 24 messages and 1000 characters each. The conversation id is
  sanitised to `[A-Za-z0-9_-]{8,64}` because it appears in escalation alerts.
- **Not closed:** the Vercel response-duration measurement, which needs a preview deploy. The
  design already streams as it reads and abandons the upstream request on `req.on("close")`, which
  is the ticket's stated mitigation.

The safety detector is deliberately not wired here; ticket 17 owns it and will run before/parallel
to generation, per §2. The endpoint is shaped to let ticket 20 abandon an in-flight stream and emit
mandated crisis copy, but that path lands with 17.