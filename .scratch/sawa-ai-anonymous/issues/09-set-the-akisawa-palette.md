# 09: Set the Akili Sawa palette

**Type:** task · AFK
**Blocked by:**
- 01 — Wire the Tailwind v4 theme layer

**Claimed by:** opencode
**Status:** code complete — visual verification outstanding

## Question

None. Values already chosen on this map. This ticket applies them.

## What to build

The site's colours become the Akili Sawa palette from the mockup, with light and dark both working
and the font stack honest about what is actually loaded.

## The decision

From the map's Notes:

> **Type stays** (Plus Jakarta Sans). **Surface treatment stays** (glassmorphism: `bg-white/85` +
> `backdrop-blur` + `bg-sheen` + `bg-noise`). **Only the colour values change**, to the mockup's
> palette at `Akili Sawa_ final site.html:7`.

This is a re-theme, not a redesign. Geometry, type scale, motion, radii, components and layout are
untouched. The diff should be almost entirely one `:root` block.

**Why this is right rather than merely acceptable:** the blue-glass direction is recent deliberate
work — `cf33d62 "major fixes and UI improvements"`, `93e84d7 "fixed global animations making them
feel abit smoother"`. Discarding it would be throwing away work. But the green/amber palette is
warmer, more human, and better suited to a product whose front door is a person having a hard
conversation. The two are separable: the surface treatment carries the modern work, the colour
carries the brand.

## Palette source

`Akili Sawa_ final site.html:7-9`, verbatim:

```css
:root{
  --brand:#0f6b5c;   /* deep green     → --accent */
  --dark:#0a4a40;    /* deep green     → --bg-tint-alt */
  --accent:#2E5E8C;  /* amber          → needs a new token; see below */
  --ink:#1b2624;     /* near-black     → --text */
  --muted:#5a6b67;   /* grey-green     → --muted */
  --bg:#fbfaf7;      /* warm off-white → --bg */
  --card:#fff;       /*                → --surface */
  --line:#e2e6e3;    /*                → --line */
  --tint:#eef5f2;    /* pale green     → --panel / --bg-tint */
}
```

**The one genuinely new decision: the app has one accent, the mockup has two.**

The React app collapses to a single `--accent` (`#2563eb`) used for links, button fills, focus
rings, active nav pills and brand colour — 15+ call sites. The mockup separates `--brand` (green,
structural) from `--accent` (amber, emphasis). The mockup's `.final` section uses amber as the CTA
fill on deep green, which is exactly the pattern the app's closing CTA band already mimics with
blue-on-blue.

Two viable routes:

| Route | Approach | Cost |
|---|---|---|
| **A — Amber becomes the accent** | `--accent:#2E5E8C`, green becomes the deep structural colour | Warm, distinctive, matches the mockup. Risk: amber on white at small sizes is a contrast problem — `#2E5E8C` on `#fbfaf7` is roughly **2.0:1**, well under WCAG AA for text. Needs a darker amber for text use. |
| **B — Green becomes the accent, amber reserved** | `--accent:#0f6b5c`, amber limited to the dark CTA band and focus accents | Highest contrast, safest, smallest diff. Less distinctive — a green site is not memorable on its own. |

Whichever is chosen, **two tokens are needed**: a fill-safe accent and a text-safe accent. The
current code assumes one accent used for both (`text-accent` for links, `bg-accent` for buttons,
`ring-accent/25` for focus). Splitting them touches many call sites, so do it deliberately, not
accidentally.

## Dark mode, currently half-wired

`src/styles/globals.css:37` defines a `.dark { … }` token block. It is **dead code**:

- There is no `@custom-variant dark` anywhere, so Tailwind's `dark:` utilities default to
  `prefers-color-scheme` — the OS media query.
- Nothing ever adds the `.dark` class. `src/components/layout/Navigation.tsx:16` reads
  `// Dark mode toggle temporarily disabled.`

Net effect: 13 `dark:` utilities across the components respond to the user's **OS** setting, while
the `.dark` token overrides do nothing. Tokens and utilities currently disagree.

The mockup already solves this (`Akili Sawa_ final site.html:8-9`): a `prefers-color-scheme: dark`
media query plus a `[data-theme="dark"]` manual override. Adopt that shape:

```css
:root { /* light values */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* dark values */ } }
:root[data-theme="dark"] { /* dark values */ }
```

Delete the dead `.dark` block. Add `@custom-variant dark` only if a class toggle is wanted later —
otherwise the `prefers-color-scheme` default is already correct and nothing needs adding.

Dark values from `Akili Sawa_ final site.html:8`:

```css
--ink:#eef3f1; --muted:#a3b3ae; --bg:#101816; --card:#17221f; --line:#2a3833; --tint:#14201d;
```

## Font stack

`--font-sans` currently declares `"Satoshi", "Plus Jakarta Sans", "Inter", "Poppins", system-ui,
sans-serif`. **Only Plus Jakarta Sans is actually loaded** — `index.html` fetches exactly that one
family, weights 400/500/600/700. Satoshi, Inter and Poppins are never fetched, so every one of them
is a wasted lookup that silently falls through to `system-ui`.

Trim to `"Plus Jakarta Sans", system-ui, sans-serif`. Closes gap analysis Tier 7.14. The mockup's
Georgia / Trebuchet pairing is **not** being adopted — the decision was to keep the fonts we have.

## Route chosen

**Route A — amber accent, green structural.** Confirmed with the humans before implementation.

## What changed

| File | Change |
|---|---|
| `src/styles/globals.css` | `:root` and `.dark` rewritten to the mockup palette; `--accent` split into `--accent` (fill) and `--accent-ink` (text); `--brand` / `--brand-dark` added; `@custom-variant dark` added; `::selection`, `.bg-gradient-wash`, `.dark .bg-sheen`, `.dark .faq-panel details` re-themed off their hardcoded blues |
| `src/components/ui/Button.tsx` | primary variant: `bg-accent` → `bg-accent-fill`, ink `#0b1220` → `#1b2624`, shadow re-tinted green |
| `src/components/layout/Navigation.tsx` | header rgba `238,243,250` → `251,250,247` (was tuned to the old blue); active-pill shadow re-tinted |
| `src/components/layout/SectionBackground.tsx` | dark gradient overlay `rgba(10,14,22,*)` → `rgba(16,24,22,*)` |
| `index.html` | pre-paint script sets `.dark` from `localStorage` or `prefers-color-scheme` |

## The accent split, and why it cost one call site

The split lives in the **namespace mapping**, not at the call sites:

```css
--color-accent: var(--accent-ink);   /* text-accent, ring-accent */
--color-accent-fill: var(--accent);  /* bg-accent-fill */
```

`text-accent` and `ring-accent` occur 13 times across 7 files. Pointing `--color-accent` at the
ink token made all 13 AA-safe with **zero edits**. `bg-accent` as a fill occurred exactly once
(`Button.tsx:22`), so the split has a single opt-in site. Grep first, then split — that ordering is
what kept this cheap.

## Measured contrast

Every text pair, every surface. All pass WCAG AA 4.5:1.

| | `#fbfaf7` | `#f0f2ec` | `#e3ede7` | `#d2e3db` | `#ffffff` | worst |
|---|---|---|---|---|---|---|
| `--text #1b2624` | 14.91 | 13.80 | 12.99 | 11.67 | 15.56 | **11.67** |
| `--muted #4c5c58` | 6.75 | 6.25 | 5.89 | 5.29 | 7.05 | **5.29** |
| `--accent-ink #234A70` | 6.82 | 6.31 | 5.94 | 5.34 | 7.11 | **5.34** |
| `--brand #0f6b5c` | 6.14 | 5.68 | 5.35 | 4.81 | 6.41 | **4.81** |

Dark mode, worst case `--panel #1b2724`: text 14.0, muted 7.2, amber ink 7.15, brand mint 8.2.
Button primary: `#1b2624` on `#2E5E8C` = **7.22:1**.

### Three values changed from the mockup, and why

1. **`--accent` split.** Mockup amber `#2E5E8C` is **2.07:1** on `#fbfaf7` — the ticket's warning was
   right. `--accent-ink #234A70` is a darkened sibling of the same hue at 5.34:1 worst case.
2. **`--muted #4c5c58`, not the mockup's `#5a6b67`.** The mockup value drops to **4.22:1** on the
   deepest band. The darker value passes everywhere.
3. **Band ladder rebuilt.** The mockup's `--tint #eef5f2` against a warm neutral computes to
   **1.003:1** — a warm neutral and a pale green share luminance, so a hue-only shift is invisible.
   Contrast ratios cannot see hue. The ladder was made monotonic instead.

## The finding this ticket predicted would happen

It happened. Measured card separation:

| | blue baseline | warm `#fbfaf7` |
|---|---|---|
| white card on page background | **1.278:1** | **1.044:1** |
| panel on page background | 1.192:1 | 1.031:1 |

A white 85% card on `#fbfaf7` is a **1.5% luminance difference** — effectively invisible. On blue it
was a 28% step. The blue palette was carrying the card boundaries; the warm palette does not.

Band-to-band separation was also rebuilt to be monotonic in luminance, worst neighbour step 1.06:1
(blue baseline was 1.13:1).

**Not resolved here, and it is a design decision rather than a palette one.** The card edges now rest
entirely on `shadow-[0_8px_18px_rgba(15,23,42,0.05)]` and the sheen overlay. That may be sufficient —
glassmorphism is *supposed* to separate by shadow, and a shadow reads more clearly on a light ground
than on saturated blue. But it is unverified, and the honest options are:

- **Leave it.** Shadows carry it. Zero cost. Needs one look at a real browser to confirm.
- **Add a hairline.** `border border-line/70` on `Card`, matching the mockup's flat bordered language
  and `--line #e2e6e3` (1.21:1 on the page). Cheap, and restores a hard edge.
- **Deepen `--bg`** to `#ebe8dd`, which returns card-on-bg to 1.227:1 — but that abandons the warm
  off-white the humans chose.

Raised for the humans rather than chosen silently.

## Deviation: `.dark` class instead of `[data-theme]`

The ticket specified the mockup's `prefers-color-scheme` + `[data-theme="dark"]` shape. Implemented
as a **`.dark` class** instead, because the codebase already has six `.dark &hellip;` utility rules
(`.dark .bg-grid`, `.dark .bg-sheen`, `.dark .bg-gradient-wash`, `.dark .faq-panel details`) that a
`data-theme` attribute would leave dead. One class satisfies both the token block and the utility
rules; `data-theme` satisfies only one.

`@custom-variant dark (&:where(.dark, .dark *))` makes all 12 `dark:` utilities follow the same
class. Verified: `.dark\:bg-panel\/85:where(.dark,.dark *)` in the built CSS. Previously they
responded to `prefers-color-scheme` while the tokens did not.

The override mechanism the mockup wanted is preserved via `localStorage["akisawa-theme"]`, read by
the pre-paint script in `index.html`. No UI toggle is wired — `Navigation.tsx:16` still has its
dark-mode toggle commented out, so this only enables an override nobody can yet set.

## Follow-up: the navbar did not match the body, and neither did half the page

Reported after the palette landed. The navbar was the visible symptom; tracing it turned up three
more layers that were still carrying the blue palette, because they were never tokens — they were
hardcoded `rgba()` in places this ticket's file list did not name.

| Cause | Fix |
|---|---|
| Header background was a hardcoded `rgba(251,250,247,α)` with **no dark variant** — a cream bar across a dark page. Also painted a 72%-opaque band at scroll-top, over a hero that `bg-gradient-wash` had turned pale green, so the navbar read as a separate strip. | Transparent at rest so the hero paints through; `bg-background/85` when scrolled. `bg-background` is the page's **own** token, so it flips to `#101816` in dark mode with no `dark:` variant needed. |
| `.bg-sheen` **light mode** was never converted — still `#ebf1f8` → `#dce6f0`. It overlays every `neutral`/`mid`/`soft`/`tint` section at 35%, so most of the page carried a cool wash. | Warm: `#fdfcf9` → `#f0f4ee` → `#d2e3db`. |
| `.bg-grid` used `rgba(11,18,32,·)` (light) and slate-400 `rgba(148,163,184,·)` (dark). | `rgba(10,26,22,·)` light, brand mint `rgba(125,196,174,·)` dark. |
| Shadow tokens were slate-900 `rgba(15,23,42,·)`. Invisible on blue; a grey-blue smudge on warm off-white, which is what made the glass cards look dirty. | `rgba(10,26,22,·)` — shadows tinted with the page's own hue. |
| `Card` and `ImagePanel` hardcoded `bg-white/85` / `bg-white/80` and slate shadows. | `bg-surface/85` / `bg-surface/80`, warm shadows. |
| Logo was `brightness-0` (forced black) with no dark handling — invisible on a dark header. | Added `dark:invert`. |
| Mobile menu button `bg-white/70` and panel `bg-white/95` had no dark variants. | `bg-surface/70`, `bg-surface/95`. |

### Tailwind was scanning the planning docs

`.shadow-[0_8px_16px_rgba(27,49,75,0.1)]` kept appearing in the built CSS **after** that value had
been deleted from every source file. Repo-wide search found no occurrence anywhere. The class was
being generated because Tailwind v4's automatic source detection scans the whole project root —
including `.scratch/`, where these tickets quote class strings verbatim as evidence.

Fixed by scoping detection explicitly:

```css
@import "tailwindcss" source(none);
@source "../../index.html";
@source "../**/*.{ts,tsx}";
```

Dead CSS fell from **42,584 → 37,367 bytes** (−5.2 KB, −12%). Verified the old utilities are gone
and that a regression sweep of every token utility referenced in `src/` still emits. Worth noting
this bug class is invisible by construction: the build stays green, the CSS only gets *bigger*, and
the resurrected classes are plausible-looking. Documentation should not be able to affect a
stylesheet.

Also confirms `bg-background/85` survives `@theme inline`: Tailwind emits the bare `var(--bg)`
fallback plus a `@supports`-guarded `color-mix(in oklab, var(--bg) 85%, transparent)`. The alpha is
not silently dropped — worth knowing, because a dropped modifier would have made the navbar opaque
in exactly the way that caused the original complaint.

### Verification note

Three checks in this pass produced **false results** and were corrected:

- Searching the minified bundle for `rgba(235, 241, 248)` — the minifier emits `rgba()` as hex8
  (`#fdfcf98c`), so every such search returns "not found" regardless of the truth. Now scans hex8.
- A regex asserting the navbar utility emitted, built with `[regex]::Escape` over an already-escaped
  string — matched nothing, then a second malformed regex reported 0 `dark:` utilities in dev when
  there were 13. Prod and dev both re-verified by substring count.
- Inspecting `dist/assets` for stale files, on the assumption a hashed filename could be stale. Only
  one file existed and it was current; the real cause was the source-detection issue above.

## Card separation, measured from pixels

**I cannot view images** — this model has no image input — so the "needs eyes" criterion was
approached numerically instead. Chrome (found at `C:\Program Files\Google\Chrome\Application\`)
renders the real page and harness through `puppeteer-core`, and `pngjs` reads the screenshot
pixels. Everything below is measured off composited pixel values, not off CSS declarations.

Setup lives outside the repo, in `%TEMP%\opencode\cardcheck\` — `harness.html` (candidate
treatments, using the real built CSSheet), `measure.js`, `probe2.js`.

Two metrics. **fill ΔL%** is the luminance difference between the card's interior and the bare
ground beside it — the flat-field separation. **edge peak %** is the largest single-pixel luminance
step scanning across the card's left edge at mid-height — what actually makes the boundary read.

| Treatment | fill ΔL% | card/ground | edge peak % |
|---|---|---|---|
| **A · current** — `surface/85` + `0 8px 18px / 0.05` | 3.51 | 1.035 | 8.65 |
| A2 · current fill, shadow removed | 3.51 | 1.035 | 3.51 |
| J · + hairline `border-line/45` | 3.51 | 1.035 | 9.78 |
| C · opaque `surface` (alpha 1.0) | 4.40 | 1.044 | 9.54 |
| H · shadow `0 6px 14px / 0.11` | 3.51 | 1.035 | 13.79 |
| B · + hairline `border-line/70` | 3.51 | 1.035 | 15.05 |
| I · shadow `0 6px 14px / 0.16` | 3.51 | 1.035 | **17.74** |
| G · current, but on a `--bg-tint` band | 14.43 | 1.165 | 18.92 |
| D · deepened ground `#ebe8dd` | 16.62 | 1.194 | 20.66 |
| F · **old blue ground**, shadow removed | **19.20** | 1.234 | 19.20 |
| E · old blue ground (calibration) | 19.20 | 1.234 | 22.98 |

### What this settles

**The collapse is real and it is 5.5×.** Fill separation on the warm ground is 3.51% luminance
against the blue palette's 19.20%. Same white card, same 85% alpha, same shadow — only the ground
changed.

**The shadow is doing real work, so "leave it to the shadow" is defensible but not sufficient.**
A2 vs A isolates it: removing the shadow drops the edge from 8.65% to 3.51%. The shadow supplies
roughly **2.5× the edge signal** the fill does. But the blue palette got 19.20% from the fill
*alone* (row F) and the shadow added only ~20% on top. So the edge went from fill-dominated to
shadow-dominated, and total definition fell from 22.98% to 8.65% — a **2.7× reduction**.

For scale: a 45%-alpha hairline measures 9.78%, i.e. the current 8.65% edge is about as weak as a
barely-there 1px line. It is not invisible, but it is soft.

**Making the fill opaque is not the answer.** C gains 0.89 points of edge for giving up the
translucency the whole surface treatment depends on. Rejected.

**The problem is narrower than "cards".** Row G: the same card on a `--bg-tint` band measures
14.43% fill / 18.92% edge — perfectly healthy. Only cards sitting directly on `--bg` are affected,
which narrows the fix to wherever that happens.

### Recommendation

**Option I — tighten and strengthen the shadow to `0 6px 14px / 0.16`, no border.** It reaches
17.74% edge definition, essentially matching what the blue palette got from its fill alone, and it
keeps the glassmorphism. The brief was explicit: keep the surface treatment, change the colours.
Adding a hard border (B, 15.05%) is a *shape*-language change, not a colour change, and would
fight the frosted-glass look on every card.

If 0.16 reads as too heavy in situ, H (0.11, 13.79%) is the middle step. Option B is the fallback
if the glass look is less important than crispness.

Not applied — this is an aesthetic fork with two defensible answers, and the numbers narrow it to
these three but cannot pick between them. Awaiting a human choice.

### Two probe errors worth recording

Both produced confident wrong answers before being caught:

1. Screenshot probe reported the card's `boxShadow` as four fully transparent layers — "the card has
   no shadow". Wrong: the computed value was truncated to 90 characters by the probe's own
   `.slice(0, 90)`, cutting off the fifth layer, which is the real one. The card does carry
   `rgba(10, 26, 22, 0.05) 0px 8px 18px`.
2. Same probe reported `cardVsParent: 1.000`, implying the card is invisible. Also wrong: Tailwind v4
   emits `color-mix(in oklab, …)`, which Chrome computes to `oklab(…)`, and the probe's colour
   parser only matched `rgba?(…)` — so every card and section background was silently skipped and
   the compositing stack collapsed to a single flat colour. Only real pixel sampling gave usable
   numbers.

A third, from the edge scan: the first ±24px window crossed the row's label text, so it measured
glyph edges — rows E and F returned byte-identical gradients despite one having a shadow and the
other not, which is what exposed it.

## Acceptance criteria

- [x] `:root` carries the mockup's palette, mapped onto the app's token surface. The 14 dead legacy
      tokens (`--bg-primary`, `--accent-blue`, `--border-subtle`, …) were dropped: verified zero
      references anywhere in `src/`, and TSX never touches raw `var(--…)` at all — only utilities.
- [x] Accent split into fill-safe and text-safe variants, contrast measured and recorded above.
      No token used for text falls below 4.5:1 on any surface; large display text well above 3:1.
- [x] Dead `.dark` block replaced with the mockup's dark palette, and the class is now actually
      applied. Token layer and `dark:` utilities agree for the first time.
- [x] `--font-sans` trimmed to Plus Jakarta Sans + system-ui (done in ticket 01).
- [x] Verified in `npm run dev`: 53,613 bytes of CSS, all token utilities emitted, all ten palette
      values present, no residual blue (`238,243,250` / `10,14,22` / `#d7e4ff` / `#c5d7ff` /
      `#afc6ff` / `37, 99, 235` all confirmed gone).
- [x] `bg-white/85` surfaces re-checked — separation **did** collapse; measured above and escalated
      rather than quietly adjusting opacity.
- [x] `npm run build` passes, which runs `tsc -b` before `vite build`. There is **no `typecheck`
      script** in `package.json` — only `dev`, `build` and `preview` — so any earlier claim of
      "npm run typecheck passes" was unfounded. Type checking is run directly with
      `npx tsc -b --force`, which passes. Ticket 03 is where real scripts get added.
- [ ] **Visual check outstanding.** Needs a real browser at 1440px and 390px, light and dark, on
      `/`, `/contact`, `/about`. Measured checks pass — CSS emits, every text pair ≥4.5:1, the
      card-shadow decision is applied, and the Puppeteer probes in the polish note above confirm
      geometry — but nobody has looked at the result. Judgement calls (does the stronger shadow
      read correctly, do square controls sit right against the still-rounded 24px Card) need eyes.
- [ ] Ships in the same commit as ticket 01 — neither is committed yet.

## Notes

Do not port the mockup's CSS wholesale. It is a different design system: flat surfaces, 14px radii,
`Trebuchet MS`, and no dark-mode token discipline. Take its **colour values only**.

Everything structural stays: `SectionBackground`'s 10 variants, `Card`'s `bg-white/85` +
`rounded-3xl`, `Badge`, `Button`'s three variants, `MotionInView`, the `ENTRY_EASE` curve, the
`clamp()` type scale. That work is good and is not in scope here.

### Post-palette polish: square controls and readable form fields

Follow-on from the card-shadow decision, at the user's request.

- Contact form: the shared `inputClass` in `Contact.tsx` now uses `rounded-none` plus an
  explicit `border border-line` and `bg-surface/90 dark:bg-panel/90`. Previously the fields
  had `border: 0` and no radius, so on a Card (itself `bg-surface/85`) the field had almost
  no visible edge - measured 1.03:1. Input text is `--text`: 15.56:1 light, 13.75:1 dark.
- Error text: `text-red-600` was replaced by an `errorClass` of
  `text-red-700 dark:text-red-400`. red-600 measured 3.17:1 on the dark panel, below AA for
  12px text; red-700 is 6.52:1 light and red-400 is 5.57:1 dark.
- Buttons: `Button`'s `baseStyles` changed `rounded-soft` to `rounded-none`, which covers all
  63 `<Button>` / `<ButtonLink>` call sites. The Navigation hamburger and desktop nav links
  and `BackToTop` also changed to `rounded-none`. Only four real `<button>` elements exist in
  the app; the earlier count of 70 was a case-insensitive regex matching `<ButtonVariant>`.
- Verified: `npx tsc -b --force` and `npm run build` pass, the required utilities emit, and
  Puppeteer reports 0px radii with a 1px border on the sampled inputs in both themes.
- Still open: human visual review at 1440px and 390px, light and dark.
