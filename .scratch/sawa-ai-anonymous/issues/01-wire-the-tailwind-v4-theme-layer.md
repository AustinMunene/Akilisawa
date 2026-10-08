# 01: Wire the Tailwind v4 theme layer

**Type:** task · AFK
**Blocked by:** none (can start immediately)
**Claimed by:** opencode
**Status:** closed

## Question

None. This ticket does work, not a decision — but it unblocks every UI ticket on the map, which is
why it sits at the front.

## What to build

The site's design tokens become real CSS custom properties that Tailwind can generate utilities
from, so that `bg-panel`, `text-muted`, `rounded-soft` and `shadow-float` stop silently resolving
to nothing.

## The finding

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §8 said to *verify* the Tailwind v4 config before writing the
chat. Verified. **It is not a risk — it is already broken.**

Three independent confirmations:

1. `src/styles/globals.css` contains **no** `@theme`, `@config`, `@plugin`, `@custom-variant`,
   `@source` or `@apply`. Verified by grep across `src/**/*.css` and `index.html`: zero hits.
2. `node_modules/@tailwindcss/postcss/dist/index.js` contains **zero** references to `@config`,
   `tailwind.config` or `resolveConfig`. Tailwind v4's PostCSS plugin does not auto-discover a JS
   config file.
3. Therefore `tailwind.config.cjs` — the only place tokens are mapped to utility names — is never
   loaded.

Consequence: the entire token-utility vocabulary used across all 20 pages is dead. Not degraded.
Absent.

| Class in active use | Defined only in | Resolves? |
|---|---|---|
| `bg-panel`, `bg-surface`, `bg-tint`, `bg-tintAlt`, `bg-soft`, `bg-accent`, `bg-background` | `tailwind.config.cjs` | ❌ |
| `text-muted`, `text-text`, `border-line`, `text-accent` | `tailwind.config.cjs` | ❌ |
| `rounded-soft`, `rounded-card`, `rounded-pill` | `tailwind.config.cjs` | ❌ |
| `shadow-float`, `shadow-floatHover`, `shadow-card` | `tailwind.config.cjs` | ❌ |
| `py-18`, `pt-22`, `md:pt-26` | `tailwind.config.cjs` | ❌ |
| `font-sans` → `var(--font-sans)` | `tailwind.config.cjs` | ❌ |

`Home.tsx:222` ships `className="py-18"` right now — a dead utility, live on the homepage.

What *does* work today: the `@layer base` resets (`globals.css:50`, heading clamps, body colours),
the `@layer utilities` decorative backgrounds (`globals.css:125`, `.bg-grid`, `.bg-noise`,
`.bg-gradient-wash`, `.bg-sheen`, `.section-wrap`, `.text-balance`, `.faq-panel`), and all Tailwind
v4 core utilities.

**This ticket is not cosmetic.** It is the precondition for the palette swap in ticket 09 and for
every style decision in tickets 10 through 23.

## Acceptance criteria

- [x] `@theme inline` block added to `src/styles/globals.css` mapping every token to its v4
      namespace — `--color-*` for the 10 colours, `--radius-*` for soft/card/pill,
      `--shadow-*` for float/floatHover/card, `--spacing-*` for 18/22/26/30/34, `--font-sans`.
- [x] `@theme inline` is used, **not** plain `@theme`. With `inline`, v4 emits utilities that
      reference `var(--token)` directly, so the `:root` overrides in ticket 09 cascade correctly.
      Plain `@theme` would inline the resolved value and freeze it.
- [x] `tailwind.config.cjs` deleted, and `content:` globs confirmed unnecessary — v4 auto-detects
      sources from the CSS entrypoint. Confirmed: no `@config` directive was needed, and the
      PostCSS plugin still auto-detected every source.
- [x] **Verified in `npm run dev`, not `npm run build`.** Dev CSS (53,234 bytes) contains
      `bg-panel`, `text-muted`, `rounded-soft`, `shadow-float`, `bg-tintAlt`, `rounded-pill`,
      `rounded-card`, `bg-background`, `py-18`, `font-sans`. Declarations confirmed live:
      `.bg-panel { background-color: var(--panel) }`, `.rounded-soft { border-radius: 18px }`,
      `.bg-tintAlt { background-color: var(--bg-tint-alt) }`,
      `.font-sans { font-family: var(--font-stack) }`.
- [ ] Dark-mode utilities and the token layer now agree — **deferred to ticket 09**, which owns
      the `@custom-variant dark` decision and the palette values.
- [x] `npm run build` still passes (`tsc -b && vite build`), 3.84s, 21 routes emitted.
- [ ] Regression check on all 20 routes in a real browser — **not yet done.** Needs a browser; an
      agent cannot check that sections still alternate correctly or that the returning radii and
      shadows cause no layout shift.

## What actually changed

- `src/styles/globals.css`: added `@theme inline`; renamed `:root --font-sans` → `--font-stack`;
  `body` now reads `var(--font-stack)`.
- `tailwind.config.cjs`: deleted.

## Three things the ticket got wrong or under-specified

**1. `--font-sans: var(--font-sans)` would have been a self-reference.** `:root` already declared
`--font-sans`, so declaring it again inside `@theme inline` as a reference to itself produces a
guaranteed-invalid custom property at computed-value time. Avoided by renaming the source variable
to `--font-stack` and pointing the theme at it, so `font-sans` and `body` share one source of truth
with no cycle.

**2. `--spacing-18/22/26/30/34` were never necessary.** All five values are exactly v4's dynamic
scale (`0.25rem × N`: 4.5, 5.5, 6.5, 7.5, 8.5rem). They now work because v4 computes
`calc(var(--spacing) * N)` for any number, not because the ticket asked for them. Declared anyway so
the section rhythm is legible in one place, but they resolve either way — worth knowing before
anyone treats them as load-bearing.

**3. camelCase theme keys are required, not stylistic.** The active class vocabulary is `bg-tintAlt`
and `shadow-floatHover` (SectionBackground, Section, Button, BackToTop). CSS custom properties are
case-sensitive, so `--color-tintAlt` → `.bg-tintAlt` and it works. Using the kebab-case spelling
(`--color-tint-alt`) would have emitted `.bg-tint-alt`, leaving every existing call site dead. The
kebab-case spelling is more idiomatic Tailwind; matching the codebase was the right trade here.

## Note on ticket 09

The `@theme inline` block is built so that changing `:root` restyles the whole site. Ticket 09 is now
a pure `:root` edit — no utility renames, no call-site changes, apart from splitting the accent if
Route A is chosen.
