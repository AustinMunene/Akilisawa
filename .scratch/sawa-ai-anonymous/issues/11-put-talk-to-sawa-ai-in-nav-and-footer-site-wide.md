# 11: Put `Talk to Sawa AI` in nav and footer site-wide

**Type:** task · AFK
**Blocked by:**
- 10 — Add the `/sawa-ai` route, page shell and §8 hero

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

None. The spec is unambiguous; this is execution.

## What to build

The primary CTA exists on every page, as §39 requires. Currently there is **no persistent primary CTA
anywhere on the site** (gap analysis §3.1) — the single largest structural miss after the chat
itself.

## Spec source, §39

```
Primary     Talk to Sawa AI
Secondary   For Organisations
Additional  Get Support · Partner with Us · Join the Professional Network
```

The mockup's header has exactly this at `Akili Sawa_ final site.html:43`: nav links, then
`<a class="btn sm" href="#sawa-ai">Talk to Sawa AI</a>`. The footer at line 45 leads its first
column with **I need support → Talk to Sawa AI**.

## Implementation notes

`src/lib/navigation.ts` is the single source for both header and footer. Adding a nav item means
adding to `navLinks`, which feeds the desktop inline nav and the mobile drawer from the same array.

```ts
export type NavItem = { label: string; path: string };
export type FooterColumn = { title: string; links: NavItem[] };
```

Current nav, 6 items, institution-first: `For Organisations · Our Prevention Model · Insights ·
Ethics & Safeguarding · Pilots & Partnerships · Contact`. Spec §38 wants
`HOME · SOLUTIONS · SAWA AI · HUMAN SUPPORT · IMPACT · PARTNERS · ABOUT · RESOURCES · CONTACT`.

`Navigation.tsx` structure to preserve:
- `sticky top-0 z-40 border-b border-transparent backdrop-blur-xl`
- `isScrolled = scrollY > 12` swaps two background/shadow pairs
- Active pill: `rounded-full px-3 py-1 bg-accent/15 text-accent shadow-[0_8px_16px_rgba(27,49,75,0.1)] ring-1 ring-accent/20 font-semibold`
- Desktop `hidden md:flex`; mobile is a `fixed inset-0 z-50` overlay with a `w-[min(90vw,320px)]`
  sheet, dismissed by an invisible backdrop button

## The open scoping question

This map's fog flags it: **does the nav restructure happen here, or wait for a Human Support page?**

- **Option A — add `Sawa AI` only.** Nav becomes 7 items. `/sawa-ai` exists, so no link goes
  nowhere. `Human Support` waits for Tier 6.4.
- **Option B — full §38 restructure now.** Requires a `/human-support` route.
  `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §10 lists "Human Support page" under what this effort does *not*
  solve. Adding it expands scope.

**Recommendation: Option A.** A nav link to an unbuilt page is worse than a nav that lags the spec by
one item. Recommend recording Option A's deferral as a scoping note and raising a separate ticket
for the §38 restructure bundled with the Human Support page.

**Do not add a `Human Support` link pointing at `/contact`.** It would be a link that goes somewhere
unrelated, which is the same failure mode `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §7 warns about when it
forbids shipping stub sign-up forms.

## Acceptance criteria

- [ ] `Talk to Sawa AI` present in `Navigation.tsx` on every route, desktop and mobile.
- [ ] CTA uses `Button variant="primary"` — not a bespoke class string.
- [ ] Added to `footerColumns`, leading the **I need support** column, per the mockup.
- [ ] Nav restructured per Option A only; no link points at an unbuilt route.
- [ ] Mobile drawer verified: CTA reachable, tap targets at least 44px, no horizontal scroll at
      390px.
- [ ] Sticky-header behaviour intact — the CTA must not change `isScrolled` thresholds or the
      backdrop-blur stack.
- [ ] 7 nav items fit at 768px without collision, or the nav collapses to the drawer earlier.
      6 items already fit; 7 is the first genuinely tight case.
- [ ] `npm run build` and `npm run typecheck` pass.

## Notes

Worth checking against the map's Notes: the exploration found `Navigation.tsx` hardcodes rgba
backgrounds (`bg-[rgba(238,243,250,0.85)]`) and ignores the token layer entirely. Those rgba values
are tuned to the **old blue** background. The re-theme in ticket 09 will change the background
underneath them, and the header's translucency will shift with it.

Do not fix that here — it belongs with ticket 09, where the contrast of translucent surfaces against
the new warm off-white is actually being checked. But do **look** at it, because a header that
looked right on `#d7e4ff` may not on `#fbfaf7`, and the rgba values are the most likely place the
re-theme shows.