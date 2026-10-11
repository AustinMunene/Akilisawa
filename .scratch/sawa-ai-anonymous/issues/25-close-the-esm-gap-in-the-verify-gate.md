# 25: Close the ESM gap in the verify gate

**Type:** task · AFK
**Blocked by:** none

**Claimed by:** _(unclaimed)_
**Status:** open

## Question

Should `tsconfig.api.json` move to `moduleResolution: "NodeNext"`, or is a note in `AGENTS.md`
enough?

Recommendation: change the resolution. A rule the compiler enforces beats a rule a human has to
remember, and this one failed silently in production the first time it was exercised.

## Why it exists

`2eca8e8` fixed `/api/sawa` returning `500 FUNCTION_INVOCATION_FAILED` on every request,
including a `GET` that should have returned `405`. The function was dying at module load. The
Vercel runtime log:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'/var/task/src/lib/sawa/prompt' imported from /var/task/api/sawa.js
```

`package.json` sets `"type": "module"`. Vercel compiles the handler to ESM, and Node's ESM
resolver does not guess extensions on relative specifiers. `api/sawa.ts:26` needed `.js`.

**The gap, not the bug:** `npm run verify` was green on code that could not start.

- `tsconfig.api.json` sets `moduleResolution: "Bundler"`, under which the extensionless
  specifier is valid TypeScript.
- vitest imports the `.ts` source directly, so no test touches the deployed module graph.

Typecheck and the ESM runtime disagree about what a valid import is, and the gate believes the
typecheck. This is the shape of the problem ticket 03 existed to close, one layer down: `api/`
went from untyped to typed, but is still unexercised *as deployed*.

Any future handler importing across the `api/` ↔ `src/` boundary fails identically, passes
every local check, and surfaces only on deploy. `api/sawa.ts:26` is currently the only such
import, so the blast radius is one line today and grows with every handler added.

## What to do

1. Change `tsconfig.api.json` to `"moduleResolution": "NodeNext"` with `"module": "NodeNext"`.
   Extensionless relative imports then become a compile error, so `npm run typecheck` catches
   this class before a push.
2. Fix whatever that surfaces. Expect it to flag `api/sawa.ts:26` only.
3. Record the rule in `AGENTS.md` under Conventions — relative imports inside `api/`, and from
   `api/` into `src/`, carry the `.js` extension, because the deployed handler is ESM.
4. Consider whether `tsconfig.json` (the app side) should state the same thing. Vite does not
   care, which is exactly why the habit does not form on its own.

## Acceptance

- Removing the `.js` from `api/sawa.ts:26` fails `npm run typecheck`.
- `npm run verify` and `npm run build` still pass with the extension in place.
- The convention is written in `AGENTS.md`, with the reason, not just the rule.

## Worth considering, not in scope here

Nothing in the gate exercises a built artefact against a Node runtime. A smoke test hitting
`/api/sawa` after deploy — expecting `405` on `GET` — would have caught this in seconds and
would catch the next module-load failure whatever its cause. That is a bigger change than this
ticket and should be its own.
