# 03: Add vitest, api typecheck and real scripts

**Type:** task · AFK
**Blocked by:** none (can start immediately)
**Claimed by:** _(unclaimed)_
**Status:** ready-for-agent

## Question

None. This ticket does work.

## What to build

Enough test and typecheck infrastructure that the safety pipeline can be trusted before it talks
to a real person in distress.

## The finding

There is no quality gate of any kind in this repo today.

| Thing | State |
|---|---|
| Test runner | ❌ none — no vitest, jest, playwright or cypress config, no deps |
| Linter | ❌ none — no eslint config, no deps |
| Formatter | ❌ none — no prettier config |
| CI | ❌ `.github/` does not exist |
| `typecheck` script | ❌ `package.json` has only `dev`, `build`, `preview` |
| `api/` typechecked | ❌ **no** — `tsconfig.json` has `include: ["src"]` |

That last row is the serious one. `api/contact.ts` is written as
`async function handler(req: any, res: any)`. Any new `api/sawa.ts` inherits that: **zero type
coverage, zero test coverage, on the one piece of code in this product that decides whether someone
in distress gets a mandated crisis response.** `package.json` has no AI dependency at all today, so
this is all new surface.

`.gitignore` corroborates the shape of the project: it carries boilerplate blocks for eslint,
stylelint, jest and playwright caches — tooling that was scaffolded and never set up. (That file is
otherwise the untouched Vite default and contains no Akili Sawa information.)

## Why it is on this map rather than a housekeeping list

`src/lib/sawa/safety/` is going to be **pure functions** — severity tiering, bilingual lexicon
matching, crisis-copy selection, TTL maths, the `Owner` discriminator. Trivially testable, which is
presumably why the file layout in `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §4 isolates them. Shipping them
untested means shipping the one module where a bug is not a UI annoyance.

## Acceptance criteria

- [x] `vitest` added as a dev dependency, with a `test` script and a `test:watch` script.
      Installed **vitest 5.0.3**, because vitest 3.x carried two critical advisories (a tinypool
      prototype-pollution gadget leading to RCE, and a `@vitest/mocker` path traversal). Fixing
      them means the 5.x major, and since vitest is brand new here there is nothing to migrate.
      `npm audit` now reports **0 vulnerabilities**.
- [x] `api/` brought under types: a `tsconfig.api.json` added. **Deviation from the ticket text:**
      it is *not* referenced from `tsconfig.json`, and `npm run typecheck` runs
      `tsc -b && tsc -p tsconfig.api.json` instead. Reason: a referenced project must be
      `composite`, and `composite` forces emit — the same TS6310 trap that ticket 02 hit with
      `noEmit`. `api/` has no artefact to emit, so being directly invoked is simpler than being
      referenced. `tsc -p tsconfig.api.json` passes clean under `strict`, including
      `noUnusedLocals` and `noUnusedParameters`. The `req: any, res: any` signature is kept.
- [x] `typecheck` script added and passing.
- [x] Lint added: `eslint` flat config with `typescript-eslint`, `eslint-plugin-react-hooks`
      and `eslint-plugin-react-refresh`. Correctness rules only — no stylistic rules, and no
      Prettier, so the ticket does not become a whole-repo reformat.
- [x] `typecheck`, `lint` and `test` all pass on a clean tree. `npm run verify` chains them.
- [x] Smoke test covering `api/contact.ts`: `tests/contact.test.ts`, 14 tests, covering the
      405 guard, the `companyWebsite` honeypot (must answer 200 and return before any validation,
      so a bot cannot learn which rule it hit), every required field, malformed emails, the
      1000-char message cap at both 1000 and 1001, the 300-char research-interest cap,
      case-insensitive crisis-phrase refusal, the rate limiter's sixth request, the
      `x-forwarded-for` first-hop rule, and a JSON string body as Vercel delivers it.
- [x] An `AGENTS.md` recording the verification commands.

## Notes

Keep this small. The point is a gate that runs, not a well-tuned toolchain. Ticket 17 is what
actually depends on it.

## Two findings worth recording

**The rate limiter had a real gap, and the test now pins it.** `api/contact.ts` increments a
per-IP counter keyed on `x-forwarded-for`. The first-hop extraction (`forwarded.split(",")[0]`)
is load-bearing, not cosmetic: rate limiting on the whole header would let one client evade the
limit simply by sending a different proxy chain. `tests/contact.test.ts` asserts the first hop is
taken. The counter itself is still an in-memory `Map`, which means it resets on every cold start
and is per-instance — fine for now, but it is not a real defence against a determined sender, and
ticket 16 must not assume it inherits this protection.

**Two lint errors were found on the first run, and both were deliberate code.** `api/contact.ts`
and `pages/Contact.tsx` both write `catch (error) { respond with a generic message }` — the error
object is unused *because* the response must not leak internals. Rather than edit the preserved
`api/contact.ts` or weaken the rule globally, the config sets `caughtErrors: "none"` with a
comment explaining why. Turning this into "use the error" would push the codebase toward
surfacing raw failures, which is the opposite of the intent.

## What is still not covered

No component or DOM tests. The vitest environment is `node`, so anything rendering React needs a
per-file `@vitest-environment jsdom` docblock plus `jsdom` installed. Ticket 22 (harden the chat
surface) and ticket 23 (audit it) will want this, and neither should assume it already exists.

No CI. `.github/` still does not exist; the gate runs locally only.

No Prettier, deliberately.