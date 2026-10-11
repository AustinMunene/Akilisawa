# 10: Add the `/sawa-ai` route, page shell and §8 hero

**Type:** prototype · HITL
**Blocked by:**
- 09 — Set the Akili Sawa palette
- 07 — Write Sawa's voice and the six §67 answers

**Claimed by:** opencode
**Status:** code complete — visual verification outstanding

## Question

What does the front door look like — and does a visitor get to the product before reading anything?

## What to build

A `/sawa-ai` route that exists, carries the spec's hero verbatim, and puts the chat within the first
screen. The chat itself arrives in ticket 20; this ticket builds the page the chat mounts into.

## Spec source, verbatim

§8, from the blueprint:

> **Meet Sawa AI.**
> **A conversation can be a place to start.**
> Sawa AI is Akili Sawa's AI-powered wellbeing companion, designed to help people talk through what
> they are experiencing, reflect on their wellbeing and identify an appropriate next step.
> `[Talk to Sawa AI]`

The mockup carries a compressed variant at `Akili Sawa_ final site.html:62`. The full §8 sentence
about *"reflect on their wellbeing and identify an appropriate next step"* is **longer** than the
mockup's and is the more honest version — it describes what Sawa does rather than listing features.
Prefer it.

## The §67 principle, treated as an acceptance criterion

From the spec: *"A visitor should not have to read five paragraphs explaining Sawa AI before
understanding it."*

Concretely, on a 1440×900 laptop viewport and a 390×844 phone:

- [ ] The opening message and the input field are visible **without scrolling**.
- [ ] Nothing sits between the hero and the chat. No explanation band, no consent wall, no
      scroll-forcing interstitial.
- [ ] The non-clinical disclaimer is present but small (`text-xs text-muted`), and sits
      **immediately above** the CTA — the house pattern from `Home.tsx`'s hero, not in a footer.
- [ ] The §67 answers are **below** the chat, not above. Non-negotiable, per spec.

## House conventions to match exactly

The exploration mapped these precisely. Deviating is how pages stop looking like Akili Sawa.

```tsx
// Route: App.tsx is 21 lazy routes under one Layout. Add one lazy + one <Route>.
const SawaAi = lazy(() => import("./pages/SawaAi"));
<Route path="sawa-ai" element={<SawaAi />} />

// Page composition — every band gets className="pt-0" except the hero.
// Hero clears the sticky header; body bands read as continuous.
<SectionBackground variant="gradient" className="pt-24 md:pt-28">  {/* hero */}
<SectionBackground variant="mid"      className="pt-0">            {/* body bands */}

// Page header kicker — the canonical PageShell pattern, copied verbatim into
// Privacy, Terms, Faqs and Contact.
<p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
  Sawa AI
</p>
<h1 className="text-balance">Meet Sawa AI.</h1>
```

| Rule | Value |
|---|---|
| Type scale | `h1`/`h2` carry **no** Tailwind size classes — the base `clamp()` in `globals.css` handles them. Only nested headings get `text-base` / `text-xl md:text-2xl`. |
| Body | `text-base text-muted md:text-lg` for intro, `text-sm text-muted` in cards |
| Spacing | `space-y-*` / `gap-*` on the 2/3/4/6/8/10 scale only. Section-level `pt-0` / `pt-24 md:pt-28`. |
| Surfaces | `bg-white/85`, `dark:bg-panel/85`, `rounded-3xl`, `shadow-[0_8px_18px_rgba(15,23,42,0.05)]` |
| Colour | `text-text` / `text-muted` / `text-accent`. Two colours for type, nothing else. |
| Inline styles | **none.** |
| Motion | delegated to `MotionInView` / `SectionBackground`. No `motion.*` in page code. |
| Icons | inline `<svg>`, `strokeWidth 1.6`, line icons only, abstract and infrastructure-oriented |

## Acceptance criteria

- [x] `/sawa-ai` exists as a lazy route under `Layout`, and `/style-guide` is **not** in the nav
      (gap analysis Tier 7.1 — an internal reference is currently reachable). Verified: nothing in
      `navLinks` or `footerColumns` points at `/style-guide`; the route is reachable only by URL.
- [x] Hero carries §8 verbatim. Kicker `Sawa AI`, `h1` "Meet Sawa AI.", `h2` "A conversation can
      be a place to start.", the full paragraph and the `Talk to Sawa AI` CTA.
- [x] A placeholder slot where `SawaChat` mounts in ticket 20, sized so the page does not reflow
      when the real component lands. `#sawa-ai-chat` has `min-h-[20rem] md:min-h-[22rem]`, renders
      the opening line verbatim in the first bubble and a disabled composer.
- [x] §39 persistent CTA present — see ticket 11, but the hero needs its own
      `[Talk to Sawa AI]` treatment. Hero CTA scrolls the chat into view, gated on
      `useReducedMotion`.
- [x] Closing CTA band in the house pattern (prose left, one primary `ButtonLink` right), matching
      `Home.tsx:273`.
- [ ] Mobile-first verified at 390px: no horizontal scroll, tap targets at least 44px, hero type
      does not clip. **Outstanding** — needs a real browser at 390×844 and 1440×900, light and dark.
- [x] Motion respects `useReducedMotion` — the house rule in every animated component. Streaming
      chat will make this critical in ticket 20. Page code delegates to `MotionInView` /
      `SectionBackground`; the one page-level animation is the CTA scroll, gated on the hook.
- [x] Copy: British English, `wellbeing` one word, sentence case, no exclamation marks, `&` escaped
      as `&amp;`.
- [x] `npm run build` and `npm run typecheck` pass, plus `npm run lint` and `npm run test`
      (`npm run verify` is green; 2 test files, 17 tests).

## What changed

| File | Change |
|---|---|
| `src/pages/SawaAi.tsx` | New page: §8 hero, chat placeholder mount, non-clinical disclaimer above the hero CTA, closing CTA band. |
| `src/App.tsx` | Lazy `SawaAi` import and `<Route path="sawa-ai" ...>` under `Layout`. |
| `tests/sawa-ai.test.ts` | Render smoke tests via `react-dom/server` (node env, no jsdom): §8 hero verbatim, opening line verbatim, house-voice disclaimer. |

### §67 placement decision

The §8 paragraph sits **below** the chat mount, not between the heading and the conversation. This
keeps the opening message and input within the first screen at 390×844, which is the acceptance
criterion the ticket treats as non-negotiable. It is also the mockup's product-first reading. The
closing band is left empty of the §12/§13/§14 content on purpose; those tickets slot in between.


## Notes

Prototype ticket. Run impeccable's `init` first — there is **no `PRODUCT.md` or `DESIGN.md`** in
this repo, so impeccable's context loader has nothing to read and will route straight to establishing
product context. Then `document` to capture the existing token system as `DESIGN.md`, then `shape`
for this surface.

Two judgement calls worth surfacing rather than deciding alone:

- **Does the page need an `ImagePanel`?** Every current page leads with one. A chat does not need a
  stock photo of a person looking contemplative — it is the opposite of "a conversation can be a
  place to start." Skipping it is probably right. Impeccable's "design is the product" mode says the
  artifact leads and the interface recedes.
- **How tall is the chat on a phone?** A 60vh transcript with a sticky composer is the obvious
  answer, but it competes with the §67 answers below. Worth prototyping both.