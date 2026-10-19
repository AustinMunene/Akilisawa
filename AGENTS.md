# AGENTS.md

How to verify work in this repository. There was no such file before ticket 03, which
meant there was no documented way to check your own work — so if you change anything,
run the gate below before reporting it done.

## The gate

```bash
npm run verify
```

That is `typecheck` then `lint` then `test`, in that order. Run it from a clean tree.
All three must pass.

Individually:

| Command | What it covers |
|---|---|
| `npm run typecheck` | `tsc -b` (the app, `src/`) then `tsc -p tsconfig.api.json` (the serverless `api/` functions) |
| `npm run lint` | `eslint .` — flat config, correctness rules only |
| `npm run test` | `vitest run`, once, non-interactive |
| `npm run test:watch` | `vitest` in watch mode, for while you work |
| `npm run test:coverage` | `vitest run --coverage` (v8 provider) |
| `npm run build` | `tsc -b` then `vite build` — the production bundle |
| `npm run dev` | Vite dev server |
| `npm run preview` | Serve the last production build |

`npm run typecheck` and `npm run build` are not interchangeable: `build` only runs
`tsc -b`, which covers `src/` and not `api/`. To check the API functions you need
`npm run typecheck`.

## Layout

- `src/` — the React app (Vite, React Router, Tailwind v4).
- `api/` — Vercel-style serverless handlers. These are **not** covered by `tsconfig.json`;
  they are covered by `tsconfig.api.json`. Adding a handler without checking it is the
  failure mode ticket 03 existed to close.
- `tests/` — `vitest`, `node` environment. One file per area, e.g. `tests/contact.test.ts`.
- `.scratch/sawa-ai-anonymous/` — the tracker for the Sawa AI build. `map.md` is the
  index; `issues/` holds one file per ticket with its question, decision and acceptance
  criteria. Read the ticket before you start the work and update it when you finish.

## Conventions

- TypeScript `strict` is on, including `noUnusedLocals` and `noUnusedParameters`.
- British English, sentence case. No exclamation marks, no emoji in copy.
- An unused `catch (error)` is allowed by the lint config and that is intentional:
  handlers respond with a deliberately generic message rather than leaking internals.
- No `any` restrictions — `@typescript-eslint/no-explicit-any` is off because the
  serverless handler signature (`req: any, res: any`) is house style until
  `@vercel/node` is introduced.
- API handlers run as ESM on Vercel. Relative imports from `api/` into `api/` or
  `src/` use `.js` specifiers, which NodeNext typechecking resolves to the TypeScript source.
- Colour comes from the token layer in `src/styles/globals.css` (`@theme inline`), not
  literal hex in components. Dark mode is a `.dark` class on `<html>`, set before paint.
- Do not commit `dist/`, `coverage/` or `node_modules/`.
