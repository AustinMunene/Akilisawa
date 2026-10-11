# Handover: staging deploy, 11 October 2026

**Label:** `wayfinder:handover`
**Branch:** `staging` (three commits ahead of `main`)
**Picking up:** read this, then [`map.md`](./map.md).

Work paused here deliberately. Everything below is verified against the live deployment
unless the line says otherwise.

---

## Where the code is

| Commit | What |
|---|---|
| `76b0454` | Theme layer wired, dark mode fixed, verification gate added |
| `e6a54c5` | Sawa AI built — tickets 09, 10, 12, 13, 15–21 |
| `2eca8e8` | Fix: `api/sawa.ts` died at module load under ESM |

`main` is untouched at `58a03f2`, so `akilisawa.com` still serves the pre-staging build.
`npm run verify` is green: 149 tests across 10 files. `npm run build` passes.

## Where it is deployed

| URL | State |
|---|---|
| `https://akilisawa-staging.vercel.app` | **live** — the link given to the client |
| `https://akilisawa-git-staging-austins-projects-98147b9e.vercel.app` | live, same deployment |
| `https://staging.akilisawa.com` | **not resolving** — added in Vercel, DNS never added |

Both working URLs are branch aliases, not per-commit URLs: every push to `staging`
redeploys to the same address.

### Two deployment facts that need undoing later

1. **Vercel Authentication is OFF.** It was on (Standard Protection), which would have shown
   the client a login wall. Turning it off makes every preview readable by anyone with the
   URL. Turn it back on at Settings → Deployment Protection once the client signs off.

2. **`staging.akilisawa.com` sits in the project as Invalid Configuration.** It needs one
   record, at the host running `rs61.rcnoc.com` / `rs62.rcnoc.com` — not in Vercel:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `staging` | `e38b25801127f9e4.vercel-dns-017.com.` |

   Harmless while it sits there, and it lights up on its own if the record ever appears.
   Remove the domain from the project if the subdomain is not wanted.

---

## The blocker: Sawa has no provider key

The chat renders and the endpoint works. It cannot answer, because no model provider is
configured in the Preview environment. The visible symptom is the notice in the chat:

> Sawa is unavailable right now. Please try again.

That is `GENERIC_ERROR`, the deliberate fail-closed path in `api/sawa.ts` when
`resolveProviderConfig()` returns `null`. It is correct behaviour, not a defect.

Verified against the live deployment:

| Request | Response | Meaning |
|---|---|---|
| `GET /api/sawa` | `405` | method guard runs |
| `POST` with `{"conversationId":"x"}` | `400 Invalid submission.` | payload validation runs |
| `POST` with a valid body | `500 Sawa is unavailable right now.` | reached the env check |

So the request travels the whole path — method guard, IP cap, parse, sanitisers — and stops
exactly where it should when the key is absent.

### To unblock

Set these in Vercel → Settings → Environment Variables, **scoped to Preview** (Production too,
when this reaches `main`). Ticket 05 settled on Mistral primary with OpenAI as the fallback,
but the provider decision is still a human gate — confirm it before pasting keys.

| Variable | Needed | Note |
|---|---|---|
| `MISTRAL_API_KEY` | yes | all three Mistral vars are required together, or config resolves to `null` |
| `MISTRAL_BASE_URL` | yes | `https://api.eu.mistral.ai` per ticket 05 |
| `MISTRAL_MODEL` | yes | |
| `SAWA_MODEL_PROVIDER` | no | set to `openai` to switch; then the three `OPENAI_*` vars apply instead |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` | no | only read when the provider is `openai` |
| `SAWA_PROVIDER_TIMEOUT_MS` | no | falls back to the module default |
| `RESEND_API_KEY` | separate | the contact form and the escalation sink. Absent on Preview, so the contact form answers "Email service not configured" |
| `RESEND_FROM_EMAIL` | no | defaults to `no-reply@akilisawa.com` |

Apply for zero-data-retention with whichever provider is chosen — ticket 05 flags this and it
is not done.

### Blocked behind the key

- **Ticket 16** wants a preview deploy to measure the Vercel function duration ceiling. Cannot
  be measured until a real stream runs.
- No end-to-end exercise of the safety pipeline against a live model has happened. Every
  safety test to date is unit-level.

---

## What `2eca8e8` fixed, and the gap it exposed

`/api/sawa` returned `500 FUNCTION_INVOCATION_FAILED` on every request, including a `GET`
that should have been `405` — the function was dying before the handler ran. The Vercel
runtime log:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'/var/task/src/lib/sawa/prompt' imported from /var/task/api/sawa.js
```

`package.json` sets `"type": "module"`, so Vercel compiles the handler to ESM, and Node's ESM
resolver does no extension guessing on relative specifiers. The import needed `.js`.

**The part that matters more than the fix:** `npm run verify` was green on code that could not
start. `tsconfig.api.json` resolves with `moduleResolution: "Bundler"`, under which the
extensionless specifier typechecks correctly, and vitest imports the TypeScript directly rather
than the deployed module graph. Typecheck and the ESM runtime genuinely disagree about what a
valid import is.

This is the shape of the gap ticket 03 was written to close, one layer down: `api/` went from
untyped to typed, but is still unexercised *as deployed*. Any future handler importing across
the `api/` ↔ `src/` boundary fails identically, passes every local check, and only reveals
itself on deploy. `api/sawa.ts:26` is currently the only such import.

See ticket 25.

---

## One thing to look at, not yet confirmed

In the client-facing screenshot of `/sawa-ai`, the two user bubbles read as dark text on the
navy fill, close to illegible. The code does not explain it: `SawaChat.tsx:112` is
`bg-accent-fill text-white dark:text-[#0e1a26]`, and in light mode that is white on `#2E5E8C`,
about 5.8:1. There is no opacity or pending state on the bubble.

For the `dark:` variant to apply, `.dark` must be on `<html>` — `@custom-variant dark` at
`globals.css:69` binds it to the class, correctly — in which case the page ground would also be
dark, and in the screenshot it is light. So the two observations contradict each other.

Possibilities, in the order worth checking: a screenshot compression artifact; a stale
`akisawa-theme` value in `localStorage` interacting with the pre-paint script in `index.html`;
or something real that the static read missed. Open `/sawa-ai`, send a message, and inspect the
bubble's computed colour before treating this as a defect — or as nothing.

---

## Suggested order when picking up

1. Confirm the provider decision (ticket 05 is `ready-for-review` and gates everything).
2. Set the Preview env vars. The chat starts answering.
3. Measure the duration ceiling — closes ticket 16.
4. Check the bubble legibility question above.
5. Ticket 25, so the ESM class of failure cannot recur silently.
6. Re-enable Vercel Authentication when the client review is finished.
