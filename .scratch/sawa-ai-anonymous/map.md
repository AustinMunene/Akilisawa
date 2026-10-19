# Map: Sawa AI, anonymous and public

**Label:** `wayfinder:map`
**Created:** 5 October 2026
**Status:** in progress - UI, chat, safety and endpoint implementations are in the workspace; NVIDIA configuration, provider terms, operational escalation decisions and live human review remain open

The staging deployment details in [`HANDOVER.md`](./HANDOVER.md) describe the 11 October deployment,
not the current workspace edits. The current code adds NVIDIA support and safety hardening, but has
not been deployed. Recheck Vercel protection and branch deployment before adding a key.
The hosted escalation endpoint emails a capped excerpt only when explicitly enabled; email
retention follows the mailbox policy and is not covered by the in-memory excerpt TTL.

---

## Destination

A publicly reachable `/sawa-ai` that streams a real conversation with **no account** - transcript
held in the browser, the safety pipeline running *before* generation, escalation by email with
a human-approved retention policy for flagged excerpts, and the spec's six §67 questions sitting **below** the working product
rather than above it.

Rendered in the Akili Sawa palette, which by then actually resolves. Provider, age gate and
positioning decisions written down, so that accounts later are an additive swap behind an
interface rather than a retrofit across a live store.

**Reaching the end of this map looks like:** every ticket closed, the six §67 answers written in
Akili Sawa's voice, and the remaining unknowns down to zero - so someone can go and build Tier 1
without re-litigating a single decision.

---

## Notes

### The one-line shape of this effort

Re-theme the token layer → migrate the mockup's information into the app → build the chat.

The token layer comes first because it is currently **broken**, not merely unconfigured. That is
the load-bearing finding in this map and it reshapes the sequence.

### Skills every session should consult

| Situation | Skill |
|---|---|
| Any UI work on this effort | **`emil-design-eng`** - UI polish, component design, animation and micro-interaction decisions. Pinned in `skills-lock.json` from `emilkowalski/skills`. |
| Product/design context, then polish | **`impeccable`** - `init` → `document` → `shape` → build → `harden` → `audit` → `polish` |
| Voice, copy, §67 answers, prompt design | **`grilling`** + **`domain-modeling`** |
| Provider selection (ticket 05) | **`research`** |
| Any build ticket from 15 onward | **`tdd`** for the pure functions in `src/lib/sawa/safety/` and `store.ts` |

> **`emil-design-eng`** is installed at `.agents/skills/emil-design-eng`, symlinked into
> `.claude/skills`, pinned in `skills-lock.json` (`emilkowalski/skills`, hash
> `77853cec…`). It carries the frontend-engineering discipline: UI polish, component design,
> animation decisions and the invisible details. Note that its `SKILL.md` embeds two directives of
> its own - an "Initial Response" gag that tells the agent to withhold information until asked, and a
> required review output format. Treat both as the skill's style, not as instructions that override
> the user. `impeccable` still owns product and design context, which this skill does not cover.

### Standing preferences

**Palette.** Type stays (Plus Jakarta Sans). Surface treatment stays (glassmorphism: `bg-white/85`
+ `backdrop-blur` + `bg-sheen` + `bg-noise`). **Only the colour values change**, to the mockup's
palette at `Akili Sawa_ final site.html:7`. This is a re-theme, not a redesign - geometry, type,
motion and components are untouched. The consequence is that the blast radius is the whole site
and the diff is almost entirely one `:root` block.

**Voice.** Sawa speaks warm first person *inside the chat* (`I`). Every boundary, disclaimer,
safety message and legal statement stays in the house third person (`Akili Sawa`, `we`). The split
is by context, not by author.

**House style rules, enforced across every ticket:**

- British English. `wellbeing` is one word, never `well-bearing` or `wellbeing-`. Use
  `behavioural`, not `behavioral` (the pages win over `package.json`).
- Sentence case for headings and buttons. Kickers go UPPERCASE via CSS
  (`uppercase tracking-[0.28em]`), never by authoring.
- `Akili Sawa` third person for anything a visitor must be able to verify. `we`/`our` for process
  and posture. Never `I` as the *brand*.
- The non-clinical disclaimer sits **immediately above** the CTA, in `text-xs text-muted`, never
  styled as an error. `text-red-600` is reserved for actual validation failures, as in
  `Contact.tsx`.
- No exclamation marks. No emoji.
- Escape `&` as `&amp;` in prose.
- **Zero inline `style={{}}` in page and component code.** Tokens only.
- Layout spacing uses only the `space-y-*` / `gap-*` scale plus section-level `pt-*`. No `mb-*`.

**Verification.** `npm run build` proves nothing about the token layer - a green build silently
emits none of the token utilities. Ticket 01 must be verified in `npm run dev`. Every UI ticket
gets a `npm run dev` visual check, not a build check.

---

## Decisions so far

<!-- The index. One line per closed ticket, enough to judge relevance, then zoom the link.
     Nothing is closed yet. -->

_None. This map was charted in one session and resolved no tickets._

### Closed

| Ticket | Outcome |
|---|---|
| [01 - Wire the Tailwind v4 theme layer](./issues/01-wire-the-tailwind-v4-theme-layer.md) | `@theme inline` block added to `globals.css`; `tailwind.config.cjs` deleted. All ten token colours, three radii, three shadows, the five spacing values and `font-sans` verified live in `npm run dev`. Renamed `:root --font-sans` → `--font-stack` to avoid a self-referential custom property. Theme keys are camelCase to match the `bg-tintAlt` / `shadow-floatHover` vocabulary already in use. **Ticket 09 is now unblocked** and is a pure `:root` edit. |
| [02 - Clear the shadowed Vite config](./issues/02-clear-the-shadowed-vite-config.md) | `vite.config.js` and `vite.config.d.ts` deleted; `tsconfig.node.json` given an `outDir` so `tsc -b` can no longer regenerate them beside the source. The suggested `noEmit: true` is impossible here - TS6310 forbids disabling emit in a *referenced* project. Proven behaviourally: a `server.port` added to `vite.config.ts` moved the dev server off 5173, so Vite demonstrably reads the `.ts` now. Caught in the act during ticket 09 - every `npm run build` had been rewriting both files. |
| [19 - Build `store.ts` - `ConversationStore` / `AnonymousConversationStore`](./issues/19-build-store-ts-conversationstore-anonymousconversationstore.md) | Browser-held transcript in `sessionStorage` under `sawa.conversation:<namespace>`. Minimal `ConversationStore` (`addMessage`, `getMessages`, `getLastN`, `clear`, `isDegraded`); `ConversationMessage` carries role, content, ISO timestamp, `promptVersion` and the assistant safety tier, typed against ticket 17. Versioned payload; malformed/mismatched values discarded. Storage failures degrade to in-memory and surface via `isDegraded()` instead of white-screening. Source-level tests pin no `localStorage`, no `fetch`, no logging. `npm run verify` green (93 tests). Unblocks 20. |
| [21 - Embed Sawa on Home §3](./issues/21-embed-sawa-on-home-3.md) | `SawaChat` with `variant="inline"` mounted in a new Home §3 "Talk to Sawa" band (blueprint §40 Section 3 is the live conversational embed). One component, two mounts: no second implementation. Every existing Home band and its CTAs preserved (ticket 20's option B); `tests/home.test.ts` pins the mount, the opening line, the live-region markup, the house-voice disclaimer and the surviving pathways. `npm run verify` green (149 tests). The 390px/1440px visual pass is folded into ticket 23's screenshots. Unblocks nothing new; 22 and 23 were already open off 20. |

### Needs eyes - code complete, cannot be finished by an agent

| Ticket | What's left |
|---|---|
| [09 - Set the Akili Sawa palette](./issues/09-set-the-akisawa-palette.md) | **Route A chosen: amber accent, green structural.** `--accent` split into a fill token (`#2E5E8C`, 2.07:1 as text, fill only) and `--accent-ink` (`#234A70`, 5.34:1 worst case) - the split lives in the `@theme` namespace, so 13 `text-accent`/`ring-accent` call sites became AA-safe with no edits and `Button` was the single fill opt-in. 14 dead legacy tokens dropped. Dark palette now actually applied (`.dark` class + `@custom-variant dark`), so tokens and `dark:` utilities agree for the first time. All text pairs ≥4.5:1 on all six surfaces, measured. **Card separation resolved:** the warm palette put a white card on warm off-white at 1.035:1, so the decision was a design call, and the user chose the stronger-shadow option - `Card` is now `0 6px 14px rgba(10,26,22,.16)`, no border. Follow-on polish made every button and form field square (`rounded-none` in `Button`'s `baseStyles`, covering all 63 call sites) and gave the contact fields an explicit border, because they had `border: 0` and sat on a Card of the same white. Error text moved off `text-red-600`, which was 3.17:1 on the dark panel. Still needs a human at 1440px and 390px, light and dark. |
| [05 - Choose the model provider](./issues/05-choose-the-model-provider.md) | Research written to `research/provider-comparison.md`: four providers against zero-retention, residency, safety terms, cost, SSE streaming, dedicated classifier, Kenya transfer position and Kiswahili coverage. **Recommendation: Mistral on `api.eu.mistral.ai` primary, OpenAI `gpt-6-luna` fallback** - the pair shares Chat Completions streaming shapes, so the fallback is configuration rather than a second parser. Env vars are listed in the report. What is left for a human: the call itself, then applying for zero-data-retention (approval-gated at every vendor, and a pre-launch gate for `/privacy`) and getting the health-guidance clause confirmed in writing. **Blocks 15, 16, 17 and 18.** |
| [10 - Add the `/sawa-ai` route, page shell and §8 hero](./issues/10-add-the-sawa-ai-route-page-shell-and-8-hero.md) | Route, §8 hero (kicker, `Meet Sawa AI.`, `A conversation can be a place to start.`, full paragraph, `Talk to Sawa AI`), a sized `#sawa-ai-chat` placeholder mount carrying the opening line verbatim, the non-clinical disclaimer above the hero CTA, and the closing CTA band. The §8 paragraph sits below the chat so the opening message and input stay in the first screen at 390×844. `npm run verify` green plus `npm run build`; render smoke tests in `tests/sawa-ai.test.ts`. Needs a human at 390px and 1440px, light and dark. **Unblocks 11, 12 and 14.** |
| [12 - Build the three access levels honestly](./issues/12-build-the-three-access-levels-honestly.md) | New `Three ways to use Sawa` band: `src/lib/sawa/copy.ts` holds the typed §10 levels (Public live, Registered and Institutional described) plus the reserved fork copy for ticket 20. Level 1 ringed and badged available; Level 2 routes to `/contact?reason=sawa-account-waitlist` as waitlist capture; Level 3 has no control and no surveillance implication. `npm run verify` and `npm run build` green; render smoke tests added. Needs a human at 390px and 1440px, light and dark, and a check on the 18-and-over assumption (the age gate is not built here). |
| [13 - Add the "can and cannot do" band and the safety-flow strip](./issues/13-add-the-can-and-cannot-do-band-and-the-safety-flow-strip.md) | Capability-boundary and safety-flow band in the mockup's split: left carries the can/cannot copy with the org thesis verbatim in a `border-l-4 border-accent` blockquote and the transcript-privacy line; right carries the six-step flow (Conversation, Signal detection, Safety rules, Triage, Human support, Follow-up) as token pill chips with brand `→` separators. Copy lives beside ticket 12's in `src/lib/sawa/copy.ts`. The strip reads as architecture, not a live readout: the escalation inbox is described honestly (unstaffed-by-default), the crisis line is conceptual and consistent with `crisis-resources-v1.md` (no dispatch implication), and the browser-held transcript links to `/privacy`. `npm run verify` and `npm run build` green; render smoke tests extended. Needs a human at 390px and 1440px, light and dark. |
| [15 - Write `src/lib/sawa/prompt.ts` v1 with `promptVersion`](./issues/15-write-src-lib-sawa-prompt-ts-v1-with-promptversion.md) | `src/lib/sawa/prompt.ts` exports `PROMPT_VERSION` (`"1.0"`), `promptVersion` and the reviewable `promptV1` text. Encodes the `I` / `Akili Sawa` voice split, the no-diagnosis / no-therapy / no-medication prohibitions, the decline-and-stay-warm pattern for the name-condition trap, a reference to `docs/adr/crisis-resources-v1.md` as the only citable crisis source, the §67 constraints and safety-first ordering, with a CHANGELOG header and no secrets. `tests/prompt.test.ts` asserts all of it plus no exclamation marks/emoji and no key material; `npm run verify` green. What is left for a human: the adversarial model run, clinical sign-off, and the stamp wiring in tickets 16/17. |
| [18 - Build `escalation.ts` - `EscalationSink`, `EmailEscalationSink`, TTL'd excerpts](./issues/18-build-escalation-ts-escalationsink-emailescalationsink-ttld-excerpts.md) | `src/lib/sawa/escalation.ts` builds §3's seam: `EscalationSink.notify(signal)` with `EmailEscalationSink` as the default, an injected `EscalationTransport` (Resend intended, key stays in the api layer), and an `ExcerptStore` whose in-memory implementation enforces TTL on read and purge. Two ethics requirements are code, not comment: only one capped flagged excerpt is retained and expiry is proven by test, and every `EscalationOutcome` carries the bilingual `EXCERPT_DISCLOSURE` so the chat cannot withhold it. The alert references `crisis-resources-v1.md` rather than inlining a number, includes the reproducibility fields, coalesces repeats per conversation, and fails generically without logging. `tests/escalation.test.ts` (20 tests); `npm run verify` green (113 tests). **HITL open:** the TTL value, who reads the inbox, the ADR, and the `api/sawa.ts` wiring - and until staffing is confirmed, wiring the endpoint would make the page claim a followed-up path that does not exist. |
| [20 - Build `SawaChat.tsx` - one component, variant prop](./issues/20-build-sawachat-tsx-one-component-variant-prop.md) | `SawaChat.tsx` plus the pure engine `src/lib/sawa/chat.ts`; mounted on `/sawa-ai`. Depends only on injected seams (store, sink, fetch, endpoint) so there is no second implementation; `variant` changes density and height only. The five error states, the four safety tiers and the post-generation refusal are unit-tested; `npm run verify` green (145 tests) and `npm run build` green. **Needs a human:** a real phone pass (composer and transcript), and VoiceOver/NVDA confirmation that the throttled live region and the palette's focus rings work. |

---

## Frontier

Open, unblocked, unclaimed. Work these first; the rest is fog behind them.

| # | Ticket | Type |
|---|---|---|
| 04 | [Confirm the positioning resolution](./issues/04-confirm-the-positioning-resolution.md) | grilling · HITL |
| 06 | [Decide the age gate](./issues/06-decide-the-age-gate.md) | grilling · HITL |
| 07 | [Write Sawa's voice and the six §67 answers](./issues/07-write-sawas-voice-and-the-six-67-answers.md) | prototype · HITL |
| 08 | [Verify the Kenya crisis resource list](./issues/08-verify-the-kenya-crisis-resource-list.md) | task · HITL |
| 05 | [Confirm provider terms for real-user conversations](./issues/05-choose-the-model-provider.md) | HITL · written confirmation |
| 08 | [Sign off the Kenya crisis resource list](./issues/08-verify-the-kenya-crisis-resource-list.md) | HITL · named human |
| 18 | [Confirm escalation owner and mailbox retention](./issues/18-build-escalation-ts-escalationsink-emailescalationsink-ttld-excerpts.md) | HITL · operations |
| 22 | [Complete live chat hardening checks](./issues/22-harden-the-chat-surface.md) | task · manual |
| 23 | [Audit the deployed chat surface](./issues/23-audit-the-chat-surface.md) | task · manual |
| 24 | [Set the Sawa provider env in Preview](./issues/24-set-the-sawa-provider-env-in-preview.md) | task · Vercel |

Ticket 25's NodeNext guard is implemented. Ticket 24 requires the code to be deployed before the
NVIDIA Preview variables are added. Use synthetic prompts until NVIDIA confirms that the selected
hosted service and terms permit real wellbeing conversations.

03 is done, which unblocks 17 and 19. 19 is now closed (the store is pure client-side, so it never
depended on the provider or the crisis list in fact). 17 is code-complete but awaits clinical review.
05's research is complete and sits in **Needs eyes** above; it was run in parallel without claiming
a slot, and the decision it hands back is the humans'.

Note that 17 remains off this frontier: it is gated on 05 and 08, which need a human or a research
pass. Ticket 20 is now code-complete, which unblocks 21 (the Home §3 embed), 22 (harden) and 23
(audit); 18's HITL decisions (staffing, TTL, the ADR and the endpoint wiring) are still open and do
not block the chat from rendering the disclosure it is required to show. Ticket 21 is closed - the
chat is embedded in a new Home §3 "Talk to Sawa" band, with `tests/home.test.ts` pinning the mount
and the surviving pathways.

---

## The plan, ticket by ticket

The whole destination as 23 tickets. The Frontier above is the ready set; this is the full route.
Every edge is declared in the ticket file itself, so this table and the ticket headers cannot
disagree without it being visible.

| # | Ticket | Type | Blocked by |
|---|---|---|---|
| 01 | [Wire the Tailwind v4 theme layer](./issues/01-wire-the-tailwind-v4-theme-layer.md) | task · AFK | - |
| 02 | [Clear the shadowed Vite config](./issues/02-clear-the-shadowed-vite-config.md) | task · AFK | - |
| 03 | [Add vitest, api typecheck and real scripts](./issues/03-add-vitest-api-typecheck-and-real-scripts.md) | task · AFK | none | **closed** - vitest 5 (0 vulns), 	sconfig.api.json brings api/ under strict types, eslint flat config (correctness rules only), 14 tests on api/contact.ts, AGENTS.md, and npm run verify chaining typecheck+lint+test. Unblocks 17 and 19. |
| 04 | [Confirm the positioning resolution](./issues/04-confirm-the-positioning-resolution.md) | grilling · HITL | - |
| 05 | [Choose the model provider](./issues/05-choose-the-model-provider.md) | research · AFK | - | **ready-for-review** - `research/provider-comparison.md`; Mistral primary (`api.eu.mistral.ai`), OpenAI fallback, env vars listed. A human must make the call, then apply for zero-data-retention. Gates 15, 16, 17, 18. |
| 06 | [Decide the age gate](./issues/06-decide-the-age-gate.md) | grilling · HITL | - |
| 07 | [Write Sawa's voice and the six §67 answers](./issues/07-write-sawas-voice-and-the-six-67-answers.md) | prototype · HITL | - |
| 08 | [Verify the Kenya crisis resource list](./issues/08-verify-the-kenya-crisis-resource-list.md) | task · HITL | - |
| 09 | [Set the Akili Sawa palette](./issues/09-set-the-akisawa-palette.md) | task · AFK | 01 |
| 10 | [Add the `/sawa-ai` route, page shell and §8 hero](./issues/10-add-the-sawa-ai-route-page-shell-and-8-hero.md) | prototype · HITL | 07, 09 | **code complete** - route, §8 hero, chat placeholder mount and closing CTA band; `npm run verify` green. Needs a browser at 390px and 1440px, light and dark. |
| 11 | [Put `Talk to Sawa AI` in nav and footer site-wide](./issues/11-put-talk-to-sawa-ai-in-nav-and-footer-site-wide.md) | task · AFK | 10 |
| 12 | [Build the three access levels honestly](./issues/12-build-the-three-access-levels-honestly.md) | prototype · HITL | 07, 10 | **code complete** - three-level band, copy in `src/lib/sawa/copy.ts`; `npm run verify` green. Needs a browser at 390px and 1440px, light and dark. |
| 13 | [Add the "can and cannot do" band and the safety-flow strip](./issues/13-add-the-can-and-cannot-do-band-and-the-safety-flow-strip.md) | prototype · HITL | 07, 09 | **code complete** - capability-band and six-step flow in the mockup's split, copy in `src/lib/sawa/copy.ts`; `npm run verify` green. Needs a browser at 390px and 1440px, light and dark. |
| 14 | [Add the §67 six-question FAQ below the product](./issues/14-add-the-67-six-question-faq-below-the-product.md) | prototype · HITL | 07, 10 |
| 15 | [Write `src/lib/sawa/prompt.ts` v1 with `promptVersion`](./issues/15-write-src-lib-sawa-prompt-ts-v1-with-promptversion.md) | grilling · HITL | 05, 07 | **code complete** - `prompt.ts` exports `PROMPT_VERSION`/`promptVersion` `1.0` and `promptV1`; voice split, safety prohibitions, crisis-resources-v1 reference, §67 and safety-first encoded; `npm run verify` green. Needs clinical/HITL review and the adversarial run. |
| 16 | [Build `api/sawa.ts` - SSE streaming, key server-side, turn and IP caps](./issues/16-build-api-sawa-ts-sse-streaming-key-server-side-turn-and-ip-caps.md) | task · AFK | 05 | **code complete** - `api/sawa.ts` streams SSE (`meta`/`delta`/`done`), Mistral primary and OpenAI fallback via env, keys server-side with generic fail-closed errors, 12-turn and 40-per-IP courtesy caps (cold-start caveat commented), client-disconnect abort; `tests/sawa-api.test.ts`; `npm run verify` green. Deployed to staging and fixed in 2eca8e8 (ESM module-load crash). The duration-ceiling measurement is now blocked on 24 - no provider key in Preview. |
| 17 | [Build `src/lib/sawa/safety/` - detector, rules, bilingual lexicon, severity tiers, crisis copy](./issues/17-build-src-lib-sawa-safety-detector-rules-bilingual-lexicon-severity-tiers-crisis-copy.md) | task · AFK | 03, 05, 08 | **code complete** - five modules (`detector.ts`, `rules.ts`, `lexicon.ts`, `tiers.ts`, `crisisCopy.ts`); bilingual EN+Kiswahili lexicon with code-switched and indirect cases; four tiers with distinct behaviours; mandated crisis block verbatim from ticket 08's ADR; post-generation diagnosis/medication/therapy check; fail-closed detection; `tests/safety.test.ts` (27 tests) including the `trauma` false-positive regression and an injection that cannot suppress detection; `npm run verify` green. Needs clinical review of the tier thresholds and, per the ADR, a named human's sign-off on the resource list before the copy ships. Unblocks 18. |
| 18 | [Build `escalation.ts` - `EscalationSink`, `EmailEscalationSink`, TTL'd excerpts](./issues/18-build-escalation-ts-escalationsink-emailescalationsink-ttld-excerpts.md) | prototype · HITL | 05, 08, 17 | **code complete** - seam, in-memory TTL'd excerpt store, disclosure on every outcome, generic failures; `npm run verify` green (113 tests). HITL open: TTL, staffing, ADR, endpoint wiring. |
| 19 | [Build `store.ts` - `ConversationStore` / `AnonymousConversationStore`](./issues/19-build-store-ts-conversationstore-anonymousconversationstore.md) | task · AFK | 03 | **closed** - `ConversationStore` interface + `AnonymousConversationStore`; versioned `sessionStorage` payload under `sawa.conversation:<namespace>`, defensive storage resolution and in-memory degradation surfaced via `isDegraded()`, assistant safety-tier on the message shape; `tests/store.test.ts`; `npm run verify` green. Unblocks 20. |
| 20 | [Build `SawaChat.tsx` - one component, variant prop](./issues/20-build-sawachat-tsx-one-component-variant-prop.md) | task · AFK | 09, 10, 15, 16, 17, 18, 19 | **code complete** - `src/components/sawa/SawaChat.tsx` plus the pure engine `src/lib/sawa/chat.ts`; depends only on the ticket 19 store, ticket 18 sink, ticket 16 endpoint and ticket 17 detector, all injected seams; mounted on `/sawa-ai` (`variant="page"`); `tests/sawa-chat.test.ts` covers the markup, SSE framing, every stream outcome, the reducer, the four tiers and the five error states; `npm run verify` green (145 tests), `npm run build` green. Needs a real phone and a screen-reader pass. **Unblocks 21, 22 and 23.** |
| 21 | [Embed Sawa on Home §3](./issues/21-embed-sawa-on-home-3.md) | task · AFK | 20 | **closed** - `SawaChat` (`variant="inline"`) plus a "Talk to Sawa" band added to Home §3; existing bands untouched; `tests/home.test.ts`; `npm run verify` green (149 tests). Visual pass folded into 23. |
| 22 | [Harden the chat surface](./issues/22-harden-the-chat-surface.md) | task · AFK | 20 |
| 23 | [Audit the chat surface](./issues/23-audit-the-chat-surface.md) | task · AFK | 20 |

The load-bearing chain is **01 → 09 → 10 → 20**. Tickets 21, 22 and 23 all hang off 20, so the chat
component is the single point where the colour work, the page, the prompt, the endpoint, the safety
pipeline, the escalation seam and the transcript store are all exercised together.

Tickets marked **HITL** cannot be closed by an agent alone. Five of the eight frontier tickets are
them, which is the map's central claim about sequencing: the expensive engineering waits on cheap
human judgement.

---

## Not yet specified

Fog. In scope, but not sharp enough to ticket. It graduates as the frontier advances - pull each
patch out of this section into its own ticket the moment it can be phrased as a question.

**Rate limiting and cost**
- Whether the Home §3 embed (`/sawa-ai` ticket 21) shares the per-IP and per-conversation turn
  budget with `/sawa-ai`, or gets its own. Depends on how traffic splits between the two mounts,
  which nobody has measured.
- Whether a cheap model tier for public discovery plus a frontier tier for the safety classifier is
  needed, or whether one mid tier suffices. Depends on the unit cost ticket 05 returns.
- What "cheap model tier" actually means for answer quality on a wellbeing conversation. An
  answer that reads as dismissive costs more than the tokens saved.

**Transcript storage**
- Whether `sessionStorage` is genuinely sufficient or long conversations need IndexedDB. Depends
  on real session lengths, which needs real traffic.
- Whether Safari ITP or the Vercel SPA rewrite affects `sessionStorage` survival across tab restore
  and deep links. Untested on real devices.

**The age gate's blast radius**
- If the gate ends up excluding under-18s, Level 1 becomes adult-only and the §67 answers, the
  hero copy and the crisis copy all change together. That is a much larger content change than it
  looks, which is why ticket 06 blocks 07.
- Whether the gate is a self-declaration, a date-of-birth field, or a full consent flow.

**Escalation**
- What happens to a flagged session when the safeguarding inbox is unmonitored at the weekend. An
  escalation path with no human actually reading it is a worse failure than no path.
- Retention period for the TTL'd flagged excerpts, and who can delete them early.

**Content that surfaced but is unplaced**
- The mockup's `#portals` diagram (`Akili Sawa_ final site.html:80-154`) is the most valuable
  unbuilt asset in the repo. Whether it graduates on this map or stays Tier 6 is a scoping call.
- Whether the spec's §38 navigation restructure (add `Sawa AI`, `Human Support`) happens with
  ticket 11 or is held back until the Human Support page exists, to avoid a nav link to nowhere.

---

## Out of scope

Ruled beyond the destination. Does not graduate. Returns only if the destination is redrawn, and
then as a fresh effort rather than a resumption.

| Ruled out | Why |
|---|---|
| **Accounts, auth, identity** (gap analysis Tier 0.3) | This map's entire thesis is that accounts are *not* needed for Level 1. §10 sanctions this: Level 1 is "Discovery + low-friction initial engagement". |
| **Tenant and role data model** (Tier 0.4) | Multi-tenancy only matters at Level 3 / Institutional. Nothing here needs it. |
| **Sawa User, Professional, Institution, Intelligence, Admin portals** (Tiers 2–5) | All require identity. Deferred by design, per `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §9. |
| **Persisted conversation history** (backlog 1.7) | Explicitly the trade being made: no server-side transcripts, so no history. |
| **Check-ins, follow-ups, continuity** (§12 capabilities 2, 3, 8) | Account-gated features. |
| **WhatsApp, SMS, mobile app channels** | Gap analysis Phase 2/Tier 8. |
| **Public pricing** (§62: KES 150 / 250 / 30,000) | Unresolved content conflict (gap analysis §4.5). Not this map's job to decide. |
| **Rest of Tier 6 marketing pages** - six solution verticals, security page, responsible-AI page, dated impact timeline, named founders, case studies | Real work, no architectural dependency, parallelisable on a second track. Only the Sawa AI–adjacent slices are in scope here. |
| **Tier 7 housekeeping** - except tickets 02 and 03 | Items 7.1–7.14 remain unstarted and stay that way. |

---

## Why the sequence is what it is

The chain that matters: **01 → 09 → 10 → 20**.

Ticket 01 must come first because the token layer is dead, and ticket 09 is the palette swap that
cannot be seen until 01 makes it visible. Ticket 10 is the page the chat mounts into. Ticket 20 is
the chat.

Without 01 first, every subsequent UI ticket is spent debugging CSS that silently resolves to
nothing - which is precisely the failure mode `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §8 warned about.
The prediction in that document was correct and the risk is confirmed rather than hypothetical.

Decisions 04 through 08 fan out in parallel with the foundation and cost nothing but attention.
That is deliberate: the expensive engineering waits on cheap human judgement.
