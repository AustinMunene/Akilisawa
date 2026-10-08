# Sawa AI — Implementation Map

**Status:** in progress — tickets 01 and 02 closed, 09 code-complete pending human eyes.

This is the entry point for the anonymous, account-free Sawa AI effort. The canonical map lives with
its tickets, per the repo's local tracker convention:

| | |
|---|---|
| Canonical map | [`.scratch/sawa-ai-anonymous/map.md`](.scratch/sawa-ai-anonymous/map.md) |
| Tickets (23) | [`.scratch/sawa-ai-anonymous/issues/`](.scratch/sawa-ai-anonymous/issues/) |
| Frontier | [03–08](.scratch/sawa-ai-anonymous/map.md#frontier) — open and unblocked |

## Progress

| Ticket | State |
|---|---|
| 01 — Tailwind v4 theme layer | closed. Token utilities resolve; `tailwind.config.cjs` deleted. |
| 02 — Shadowed Vite config | closed. `vite.config.ts` is now the config Vite actually loads. |
| 09 — Akili Sawa palette | code complete. Amber accent + green structural, all text ≥4.5:1 measured. Awaiting a human look at card separation, which did collapse. |

## The destination

A publicly reachable `/sawa-ai` that streams a real conversation with **no account**. The transcript
is held in the browser, the safety pipeline runs *before* generation, escalation goes out by email
with TTL'd flagged excerpts, and the spec's six §67 questions sit **below** the working product
rather than above it.

Rendered in the Akili Sawa palette, which by then actually resolves.

## The shape of the work

Re-theme the token layer → migrate the mockup's information into the app → build the chat.

Three stages, 23 tickets, one load-bearing chain: **01 → 09 → 10 → 20**.

## The load-bearing finding

The Tailwind token layer is **broken**, not merely unconfigured. `src/styles/globals.css` declares no
`@theme` or `@config` block, so the v3 config in `tailwind.config.cjs` is never read and utilities
such as `py-18`, `bg-panel` and `rounded-soft` silently resolve to nothing. A green
`npm run build` will not reveal this — only `npm run dev` will. That is why ticket 01 must come
first.

## Where to start

1. Read the [canonical map](.scratch/sawa-ai-anonymous/map.md) — destination, decisions, fog, and what
   is explicitly out of scope.
2. Take a ticket from the [frontier](.scratch/sawa-ai-anonymous/map.md#frontier). Tickets 01, 02, 03,
   08 and 05 are agent-closable; 04, 06 and 07 need a human.
3. Claim it in the ticket header, work it, then close it in the map's Decisions section.

## Before starting UI work

Run impeccable's `init` first. There is **no `PRODUCT.md` or `DESIGN.md`** in this repo, so
impeccable has no context to load and will establish product context from scratch. Then
`document` → `shape` → build → `harden` → `audit` → `polish`.

For UI polish, component design and animation decisions, use **`emil-design-eng`** (installed at
`.agents/skills/emil-design-eng`, pinned in `skills-lock.json`).

## Two things to know before shipping anything

- **Ticket 01 is closed**: the Tailwind token layer now resolves, verified in `npm run dev`. That
  was a real defect — `bg-panel`, `text-muted`, `rounded-soft` and `shadow-float` were dead
  utilities across all 21 routes while the build stayed green. Everything else is unstarted.
- **Five frontier tickets need a human**, and two of the open questions are not engineering
  decisions: whether Akili Sawa serves individuals at all, and whether the safeguarding inbox that
  a high-severity escalation lands in is actually monitored. The second is the highest-consequence
  unknown in the effort — see ticket 18.
