# Akili Sawa — Implementation Gap Analysis

**Date:** 1 October 2026
**Sources compared:**
1. `AKILI SAWA WEBSITE, DIGITAL PLATFORM & PORTAL ARCHITECTURE.docx` — 73-section product blueprint (the spec)
2. `Akili Sawa_ final site.html` — single-file interactive prototype / "live guide" (design reference)
3. `D:\Projects\Akilisawa` — the actual React application (what is really built)

---

## How to read this

| Status | Meaning |
|---|---|
| **BUILT** | Exists in the React app as working, navigable content |
| **PARTIAL** | Exists but does not meet the spec, or is a stub |
| **PROTOTYPE** | Designed in the HTML mockup only — not implemented in the app |
| **MISSING** | Does not exist in any form |
| **NOT YET DUE** | Explicitly deferred by the spec to Phase 2/3 |

---

## 1. Executive summary

The React application is a **credible, well-built public marketing site**. It is **not** the platform the blueprint describes.

The blueprint's central thesis (§7, §67) is:

> "Sawa AI should be both a public-facing product **and** a core platform capability… A visitor should not have to read five paragraphs before understanding it. They should be able to click *Talk to Sawa AI* and then experience the product."

None of that exists today. There is no conversational interface, no authentication, no accounts, no portals, no dashboards, no backend beyond one contact endpoint.

The current site is positioned as a **non-clinical, ethical, prevention-first B2B advisory** — the brand in `package.json` is even "climate-resilient therapy marketplace." The blueprint requires a shift to **AI-enabled wellbeing infrastructure** with a live conversational product on the front door.

### The gap in one line

> **The app delivers roughly Section 38–45 of the blueprint (the public website) at maybe 60% completeness, and Sections 7–37 and 46–52 (the platform) at 0%.**

### Headline numbers

| Layer | Spec sections | Implemented |
|---|---|---|
| Public website | §38–45, §60–61, §66 | ~6 of 14 priority pages, several partial |
| Sawa AI (product) | §7–12 | 0% |
| Sawa User | §13 | 0% |
| Sawa Professional | §15–18 | 0% |
| Sawa Institution | §19–20, §55 | 0% |
| Sawa Intelligence | §21–22 | 0% |
| Sawa Admin | §23–24 | 0% |
| Sawa Partner | §25 | NOT YET DUE (Phase 2) |
| Sawa Research | §30 | NOT YET DUE (Phase 2) |
| Sawa Insurance | §36 | NOT YET DUE (Phase 3) |
| Sawa SACCO | §35 | NOT YET DUE (Phase 3) |
| Sawa Payments | §37, §51 | NOT YET DUE (Phase 3) |
| Cross-cutting (privacy/security/responsible AI) | §46–49 | PARTIAL — prose exists, architecture does not |

---

## 2. What already exists (do not rebuild)

### 2.1 Infrastructure

| Item | State |
|---|---|
| React 19 + Vite 7 + TypeScript + Tailwind v4 + react-router-dom 7 + framer-motion 12 | Working |
| 19 lazy-loaded routes under a shared `Layout` | Working |
| Design system: CSS-variable tokens, fluid `clamp()` type scale, `Section`, `Card`, `Button`, `ImagePanel`, `IconContainer`, `Badge`, `MotionInView` primitives | Working |
| `api/contact.ts` — Vercel serverless, Resend, rate limiting, honeypot, validation | Working (the **only** backend code) |
| `vercel.json` SPA rewrite | Working |
| Page transitions, scroll restoration, back-to-top, background layers | Working |
| 21 image assets in `public/` | Present |

### 2.2 Content that already satisfies spec requirements

| Spec requirement | Existing implementation | Verdict |
|---|---|---|
| §33 Community (Acucu & Aguka, intergenerational) | `/community` — 4-stage community delivery model, consent principles, low-resource/fragile context guidance | **BUILT, exceeds spec** |
| §42 Mission | `About.tsx` — Mission + Vision cards | **BUILT** |
| §43 Vision | `About.tsx` | **BUILT** |
| §45 Contact (identify visitor purpose) | `/contact` — 6-branch conditional form, routing the visitor by intent | **BUILT, exceeds spec** |
| §44 Resources (partial) | `/insights` + 3 long-form articles (Preventive Layer of Care, Behavioural Follow-Through, Ethical Delivery in Fragile Contexts) | **PARTIAL** |
| §46 Privacy architecture (as prose) | `/privacy` | **PARTIAL** |
| §61 "What the website should avoid" — non-clinical framing, no diagnostic claims, no surveillance framing | Enforced consistently across every page | **BUILT** |
| §31 Impact (as narrative) | `/evidence-impact` + `/pilots` | **PARTIAL** |
| §5 Core support journey (as static diagram) | `/prevention-model` — 3-stage model (Early Support → Behavioural Follow-Through → Escalation & Referral) | **PARTIAL** — this is the *digital-only* variant of the spec's 6-step journey (`Opt in → Engage → Detect → Triage → Escalate → Follow up`). The spec version includes **Detect** and **Triage**, which are AI steps. Needs reconciling. |

**Bottom line: the marketing layer is real work and should be preserved, not replaced.**

---

## 3. Requirement-by-requirement status

### 3.1 Public website

#### §38 / §66 — Navigation & priority pages

Spec navigation: `HOME · SOLUTIONS · SAWA AI · HUMAN SUPPORT · IMPACT · PARTNERS · ABOUT · RESOURCES · CONTACT`

Current navigation (`src/lib/navigation.ts`): `For Organisations · Our Prevention Model · Insights · Ethics & Safeguarding · Pilots & Partnerships · Contact`

| Spec priority page (§66) | Current route | Status |
|---|---|---|
| Home | `/` | **PARTIAL** — messaging does not match §40 (see §4.1) |
| **Sawa AI** | — | **MISSING** |
| Solutions | `/for-organisations` | **PARTIAL** — one combined page, not six verticals |
| **Human Support** | — | **MISSING** |
| **Employers** | — | **MISSING** |
| **SACCOs** | — | **MISSING** |
| **Insurers** | — | **MISSING** |
| **Government** | — | **MISSING** |
| Impact | `/evidence-impact` | **PARTIAL** |
| Partners | `/pilots` | **PARTIAL** |
| **Cyber4Africa** | — | **MISSING** |
| About | `/about` | **PARTIAL** — Team section is an empty container |
| Resources | `/insights` | **PARTIAL** |
| Contact | `/contact` | **BUILT** |
| Privacy | `/privacy` | **PARTIAL** — no controller, dates, jurisdiction |
| **Security & Responsible AI** | `/ethics` + `/safeguarding-framework` | **PARTIAL** — split across two pages, no security page |

#### §40 — Homepage structure (10 required sections)

| # | Spec section | Status |
|---|---|---|
| 1 | Hero: *"Mental wellbeing infrastructure for the people who matter to your organisation."* + `[Talk to Sawa AI]` `[For Organisations]` | **PARTIAL** — current H1 is *"Preventive Mental Well-being, Before Crisis"*. Neither CTA button can exist yet. |
| 2 | *"Mental wellbeing should not begin at crisis"* — explain early engagement | **BUILT** (as "Our Prevention Model") |
| 3 | **Talk to Sawa — embed a LIVE conversational experience** | **MISSING** — the single highest-priority gap |
| 4 | How Akili Sawa works: Engage → Understand → Detect → Triage → Escalate → Follow up | **PARTIAL** — 3 stages only; Detect/Triage absent |
| 5 | Human support — therapists, clinicians, community support | **PARTIAL** — `/prevention-model` mentions escalation; no Human Support page |
| 6 | Built for institutions: Employers, SACCOs, Insurers, Government, NGOs | **PARTIAL** — 4 cards, wrong segments (adds "Researchers & Funders", "Communities"; **omits SACCOs and Government**) |
| 7 | Sawa Intelligence — show institutional dashboard/analytics | **MISSING** |
| 8 | Building trusted AI — feature Cyber4Africa, AI Hub for Sustainable Development, UNDP, Cyber 4.0, Cisco | **MISSING** |
| 9 | Our impact — evidence and case studies | **PARTIAL** |
| 10 | Start the conversation — `Talk to Sawa AI` + `Partner with Akili Sawa` | **PARTIAL** |

#### §44 — Resources (six required content types)

| Required | Status |
|---|---|
| Insights | **BUILT** — 3 articles |
| Stories (human/community stories) | **MISSING** |
| Unfiltered Minds (long-form publication) | **MISSING** |
| Guides (practical wellbeing resources) | **MISSING** |
| Reports (programme & institutional reports) | **MISSING** |
| News (company announcements) | **MISSING** |

#### §41 — About page (9 required elements)

Mission ✅ · Vision ✅ · Founders ❌ · Team ❌ (**section is literally empty**) · Advisory/research network ❌ · Community ❌ (no link out) · Technology ❌ · Partnerships ❌

> The HTML prototype names the three founders. The React app has none.

#### §31 / §32 — Impact & case studies

Spec requires a dated journey: 2018 · 2023 · 2023–2025 Embu · 2024 Presidential Innovation Awards (Health) · 2025 · 2026. All metrics must carry **date, population, definition, source**.

Current `/evidence-impact` deliberately withholds metrics ("comprehensive metrics will be shared as pilots mature") and `/pilots` anonymises partners under NDA. This is a defensible editorial stance but it is a **direct conflict with the spec** and needs an explicit decision.

| Case study required (§32) | Status |
|---|---|
| Embu | **MISSING** |
| Acucu & Aguka | **PARTIAL** — narrative on `/community`, no case study |
| SACCO programmes | **MISSING** |
| Employer programmes | **MISSING** |
| Cyber4Africa | **MISSING** |

#### §26–29 — Partnerships & Cyber4Africa

| Required | Status |
|---|---|
| §26 Ecosystem categories: Technology & AI, Cybersecurity, Health & Professionals, Government, Finance, Development, Research, Community | **MISSING** |
| §27 Cyber4Africa dedicated case study | **MISSING** |
| §28 Cybersecurity story: security by design, data protection, AI security, cyber governance, operational resilience, trust | **MISSING** |
| §29 Partnership language taxonomy: Customers / Direct partners / Programme relationships / Ecosystem organisations / Supporters | **PROTOTYPE ONLY** — the HTML mockup has this exact 4-card taxonomy; not implemented |

#### §46–49, §60–61 — Trust, privacy, security, responsible AI

| Required | Status |
|---|---|
| §46 Four data contexts: Individual / Professional / Institutional / Research | **MISSING** |
| §46 Governing principle: `Need → Role → Consent → Purpose → Audit` | **PROTOTYPE ONLY** — present in mockup |
| §47 Security controls (12 listed: RBAC, auth, encryption, audit logging, minimisation, secure SDLC, incident response, retention, backup/recovery, AI security, vendor management) | **MISSING** as architecture; partial as prose |
| §48 Responsible AI governance (9 listed) | **PARTIAL** — `/ethics` covers scope boundaries well; no bias/false-positive/explainability/model-update governance |
| §60 Five trust pillars: Evidence, People, Technology, Security, Partnerships | **PARTIAL** — no People pillar (no founders/team), no Security pillar page |
| §39 Persistent CTAs: Talk to Sawa AI (primary) · For Organisations (secondary) · Get Support · Partner with Us · Join the Professional Network | **MISSING** — no persistent primary CTA exists anywhere |

---

### 3.2 Sawa AI — the product (§7–12) — **0% implemented**

This is the spec's most emphatic section and the app's largest hole.

| Requirement | Status | Notes |
|---|---|---|
| §7 Sawa AI is a **product**, not a feature | ❌ | No presence on the site at all |
| §8 Hero: "Meet Sawa AI. A conversation can be a place to start." | ❌ | |
| §9 **Live conversational interface** on the website — visitor has a real initial interaction, then `Continue with Sawa` or `Create your Sawa account` | ❌ | Mockup has a hardcoded 2-message fake (`setTimeout` reply). Not a real interface. |
| §10 **Three access levels** — Public / Registered / Institutional | ❌ | No auth, no accounts, no tiers |
| §11 **Safety model** — Conversation → AI signal detection → Safety rules → Triage → Human escalation → Follow-up | ❌ | |
| §12 Capabilities: real-time conversation, check-ins, personalised engagement, resources, pattern recognition, triage, escalation, follow-up | ❌ | |

### 3.3 Sawa User (§13) — **0% implemented**

Mockup specifies 7 areas: Dashboard · Profile · Sawa AI (start/continue/history) · Check-ins (scheduled + self-initiated) · Human support (request/referral/appointment) · Follow-up · Privacy (consent, data prefs, comms prefs, export/delete).

**Nothing exists.** No auth, no routes, no data layer.

### 3.4 Sawa Professional (§15–18) — **0% implemented**

Mockup specifies: Dashboard · Referrals · Sessions · Cases · Availability · Payments · Profile (verification status) · Training.

Spec §17 adds a critical requirement: **AI-generated observations must be visually distinguished from professional assessment.**

**Nothing exists.** No therapist-facing public presence either — §15 asks for "a dedicated public presence" with the message *"Human support when technology is not enough."*

### 3.5 Sawa Institution (§19–20) — **0% implemented**

Mockup: Dashboard (aggregated only) · Population (invite/import + participation) · Engagement · Support · Reports (monthly/quarterly/annual/custom) · Billing.

**Nothing exists.** §62 commercial model (KES 150/person/year access, KES 250/session, KES 30,000/yr intelligence report) is not represented anywhere.

### 3.6 Sawa Intelligence (§21–22) — **0% implemented**

Spec: a *module inside Sawa Institution*, producing `Dashboard → Analysis → Report → Programme Action`. Must answer: what are people experiencing, where are emerging needs, which groups are engaging, what support is requested, are interventions reaching people, what has changed.

Explicitly **must not** become institutional surveillance (§4 Layer 4, §21, §7, §61).

**Nothing exists.**

### 3.7 Sawa Admin (§23–24) — **0% implemented**

Internal console: Users · Institutions · Professionals · Cases · Programmes · **AI Governance** (signals, escalations, human reviews, model performance, false positives/negatives, bias indicators, safety incidents, model updates).

**Nothing exists.**

### 3.8 Platform architecture (§49, §51–53) — **0% implemented**

| Requirement | Status |
|---|---|
| §51 Common infrastructure modules (14): identity, auth, consent, profiles, Sawa AI, data layer, professional network, institution mgmt, referrals, escalation, reporting, payments, notifications, security, audit | ❌ |
| §52 **Multi-tenant architecture** with strict per-institution data isolation | ❌ |
| §53 **One identity → multiple authorised programme relationships** (individual + employee of A + SACCO B member + Insurer C policyholder + community participant) | ❌ |
| §7 Platform roots: **AI + Data + Governance** (Identity / Detection-Triage / Analytics-Reporting / Privacy-Security-Audit) | ❌ |
| §73 Governance roots: **AI · DATA · HUMAN NETWORK**, then GOVERNANCE (Privacy • Security • AI Safety) | ❌ |

The HTML mockup's `#portals` route renders a *diagram* of this. That diagram is the most valuable asset in the mockup and is the natural spec for the real portal shell.

---

## 4. Content conflicts requiring a decision

These are not "missing pages." They are places where the built site and the blueprint **say different things**, and both cannot ship.

### 4.1 Brand positioning

| | Blueprint | Current site |
|---|---|---|
| Primary statement | *"Akili Sawa helps organisations engage people early, understand emerging wellbeing needs, connect people to appropriate human support and generate privacy-conscious institutional intelligence."* | *"Preventive Mental Well-being, Before Crisis"* |
| Homepage hero | *"Mental wellbeing infrastructure for the people who matter to your organisation."* | *"Preventive Mental Well-being, Before Crisis"* |
| Consumer statement | *"Sawa AI gives people a simple place to start a conversation."* | *(absent — no consumer product exists)* |
| Short brand | *"Mental wellbeing infrastructure for the people who matter to your organisation."* | *(absent)* |
| Target audience | Person + professional + institution (§68) | Institutions only |

**The blueprint requires a consumer-facing product on the front door. The current site is B2B-only.** This is the decision that determines everything else.

### 4.2 Audience segments on Home §6 and `/for-organisations`

- Blueprint §34: **Employers, SACCOs, Insurers, Government, NGOs & Development, Universities & Research**
- Current site: Insurance & Financial Institutions, Employers, Researchers & Funders, Communities

**SACCOs and Government are missing.** Communities appear on the current site but are not a §34 solution vertical.

### 4.3 The support journey

- Blueprint §5: `Opt in → Engage → Detect → Triage → Escalate → Follow up` (6 steps, AI-dependent)
- Current `/prevention-model`: `Early Support → Behavioural Follow-Through → Escalation & Referral` (3 steps, human-dependent)

The current model is coherent and well-written but omits the AI layer the platform is built around. Recommend: **keep `/prevention-model` as-is and add the full 6-step journey as a distinct "How Akili Sawa works" section** (§40 Section 4), so the digital-human and AI-human models both appear.

### 4.4 Impact metrics vs. NDA

Blueprint §31 demands dated, sourced metrics and five named case studies. The current site withholds both under NDA and pilot-maturity rationale.

**Decision needed:** which programmes can be named? Embu is government-supported — is it publishable? Presidential Innovation Awards 2024 is a public award and appears safe to state. Resolve before building §31/§32.

### 4.5 Commercial model

§62 prices (KES 150/person/year, KES 250/session, KES 30,000/year) appear **nowhere** on the current site. §61 explicitly forbids the homepage being primarily about pricing — but the B2B pages need it. Decide whether pricing appears publicly, behind a "request pricing" gate, or not at all.

---

## 5. Implementation backlog

### Tier 0 — Unblocks the product (do first)

| # | Item | Spec | Effort |
|---|---|---|---|
| 0.1 | Decide and write down the positioning resolution (§4.1) | §3 | S |
| 0.2 | Decide publishable case studies + metrics (§4.4) | §31 | S |
| 0.3 | Add auth + backend (Supabase/Firebase/Auth0 — none present today). Identity, sessions, role claims | §51, §53 | L |
| 0.4 | Design the tenant + role data model. One person, many programme memberships. Strict isolation | §52, §53 | L |
| 0.5 | Fix Tailwind v4 config risk: `tailwind.config.cjs` is v3-format and may not be loading under v4, leaving `rounded-soft`, `shadow-floatHover`, `bg-panel`, `text-muted`, `bg-tintAlt` undefined. Verify against a live build | — | S |

### Tier 1 — Sawa AI (Phase 1, §7–12)

| # | Item | Spec |
|---|---|---|
| 1.1 | `/sawa-ai` page with spec hero copy (§8) | §8 |
| 1.2 | Real streaming chat component. Not the mockup's `setTimeout` | §9 |
| 1.3 | Post-conversation fork: `Continue with Sawa` / `Create your Sawa account` | §9 |
| 1.4 | The four explanatory questions as an FAQ block on the page | §67 |
| 1.5 | Three access levels wired to real auth state | §10 |
| 1.6 | Safety pipeline: signal detection → safety rules → triage → escalation queue | §11 |
| 1.7 | Persist conversation history, private to user | §13 |
| 1.8 | Embed live Sawa on Home §3 | §40 |
| 1.9 | Persistent primary CTA `Talk to Sawa AI` in nav + footer on every page | §39 |

### Tier 2 — Sawa User (Phase 1, §13)

2.1 Dashboard (check-in, follow-ups, appointments) · 2.2 Profile (details, prefs, language, channels) · 2.3 Conversation history · 2.4 Check-ins (scheduled + self-initiated) · 2.5 Human support (request → referral → appointment) · 2.6 Follow-up · 2.7 Privacy & consent (incl. export/delete) · 2.8 i18n — **English/Kiswahili** (mockup specifies this; nothing supports it today)

### Tier 3 — Sawa Professional (Phase 1, §15–18)

3.1 Public therapist-facing page — *"Human support when technology is not enough"* · 3.2 Application + onboarding pipeline: identity → qualifications → registration → expertise → languages → availability → location → agreements · 3.3 Workspace: dashboard, referrals, sessions, cases, availability, payments, profile, training · 3.4 **Separate AI-observation styling from professional assessment** · 3.5 Session/session-note records + outcome + follow-up · 3.6 Escalation and closure

### Tier 4 — Sawa Institution + Intelligence (Phase 1/2, §19–22)

4.1 Institution onboarding + contract + tenant provisioning · 4.2 Population import/invite · 4.3 Aggregated dashboard (**enforce the privacy boundary in code**) · 4.4 Engagement + support reporting · 4.5 Report generation: monthly/quarterly/annual/custom · 4.6 Sawa Intelligence module · 4.7 Health Intelligence Report product (§22) · 4.8 Billing per §62

### Tier 5 — Sawa Admin (Phase 1, §23–24)

5.1 Users, institutions, professionals, cases, programmes · 5.2 **AI governance console** (§24) · 5.3 Safeguarding case management

### Tier 6 — Website completion (parallelisable, low-risk)

| # | Item | Spec |
|---|---|---|
| 6.1 | **Cyber4Africa case study page** — cohort framing, AI Hub for Sustainable Development, UNDP, Cyber 4.0, Cisco | §27 |
| 6.2 | **Security page** — 12 controls, stated as architecture not compliance page | §47 |
| 6.3 | **Security & Responsible AI page** — 9 governance items, AI signal vs professional judgement vs diagnosis | §48 |
| 6.4 | **Human Support page** | §15 |
| 6.5 | Six solution pages: Employers, SACCOs, Insurers, Government, NGOs & Development, Universities & Research | §34 |
| 6.6 | Partnership language taxonomy UI (5 categories) | §29 |
| 6.7 | Ecosystem categories section | §26 |
| 6.8 | Four data-contexts + `Need → Role → Consent → Purpose → Audit` section | §46 |
| 6.9 | Sawa Intelligence preview on Home §7 | §40 |
| 6.10 | Foundational "How Akili Sawa works" 6-step journey | §40 §5 |
| 6.11 | Named founders + team, advisory/research network | §41 |
| 6.12 | Dated impact timeline + 5 case studies | §31, §32 |
| 6.13 | Resources expansion: Stories, Unfiltered Minds, Guides, Reports, News | §44 |
| 6.14 | Real `/portals` page — promote the mockup's diagram to a real page | §49, §51 |

### Tier 7 — Housekeeping

7.1 Remove `/style-guide` from public routing (internal reference leaking) · 7.2 Fill the empty Team container in `About.tsx` · 7.3 Delete the empty leftover `div` in `Ethics.tsx` · 7.4 Fix `Home.tsx` `?reason=` param that `Contact.tsx` never reads · 7.5 Swap `Community.tsx` remote WordPress image for the local `public/acucu-and-aguka.jpg` · 7.6 Delete dead `src/lib/images.ts` and `src/components/sections/Hero.tsx` · 7.7 Repair truncated `README.md` (ends mid-code-block); document `RESEND_API_KEY` · ~~7.8 Delete stale `vite.config.js` / `vite.config.d.ts`~~ **DONE (ticket 02)** — both deleted, and `tsconfig.node.json` given an `outDir` so `tsc -b` can no longer regenerate them next to the source; `vite.config.ts` verified to be the config Vite actually loads · 7.9 Make `smile@akilisawa.com` configurable via env in `api/contact.ts` · 7.10 Replace the blunt keyword content filter in `api/contact.ts` (matches "trauma" and "emergency" — will reject legitimate B2B enquiries) · 7.11 Add SEO meta per route · 7.12 Update `package.json` description (still describes a therapy marketplace) · ~~7.13 Enable or delete the dead `.dark` palette~~ **DONE (ticket 09)** — enabled, not deleted: `.dark` class set pre-paint in `index.html`, `@custom-variant dark` added so tokens and `dark:` utilities agree · 7.14 Load the fonts you declare, or delete the three that aren't loaded

### Tier 8 — Later phases

| Phase | Items | Spec |
|---|---|---|
| 2 | Sawa Partner · Sawa Research · advanced Sawa Intelligence | §25, §30, §64 |
| 3 | Sawa Insurance · Sawa SACCO · Sawa Payments | §35–37, §65 |
| — | WhatsApp + SMS channels · Sawa mobile app | §6 Layer 1 |

---

## 6. Architecture summary

```
AKILI SAWA
├── PUBLIC WEBSITE                    [BUILT ~60%]  ← React app, 19 routes
├── SAWA CORE                         [MISSING]
│   ├── Identity & Authentication     [MISSING]  one identity, many programme roles
│   ├── Consent & Profiles            [MISSING]  Need → Role → Consent → Purpose → Audit
│   ├── Sawa AI (detect / triage)     [MISSING]
│   ├── Data layer (multi-tenant)     [MISSING]  strict per-institution isolation
│   ├── Referrals / Escalation        [MISSING]
│   ├── Notifications                 [MISSING]
│   ├── Payments                      [MISSING]  Phase 3
│   └── Audit & Security              [MISSING]
├── PHASE 1
│   ├── Sawa User                     [MISSING]
│   ├── Sawa Professional             [MISSING]
│   ├── Sawa Institution              [MISSING]
│   └── Sawa Admin                    [MISSING]
├── PHASE 2
│   ├── Sawa Intelligence (advanced)  [NOT YET DUE]
│   ├── Sawa Partner                  [NOT YET DUE]
│   └── Sawa Research                 [NOT YET DUE]
└── PHASE 3
    ├── Sawa Insurance                [NOT YET DUE]
    ├── Sawa SACCO                    [NOT YET DUE]
    └── Sawa Payments                 [NOT YET DUE]
```

**Rule from §51, restated because it is easy to get wrong:** these must not become eleven separate applications. Every portal is an experience and module on one common core.

---

## 7. The three central experiences (§68)

| Who | Their line | Their path | Today |
|---|---|---|---|
| The person | *"I need somewhere to start."* | Sawa AI → Sawa User → Human Support | **Broken at step one.** No Sawa AI exists. |
| The professional | *"I need to support this person."* | Sawa Professional | **Does not exist.** |
| The institution | *"I need to understand and support my population."* | Sawa Institution → Sawa Intelligence | **Does not exist.** Only marketing copy about it. |

---

## 8. Recommended sequence

1. **Settle §4 content conflicts** — one working session, written outcome. Everything downstream depends on it.
2. **Tier 0.3–0.5** — auth, tenant model, Tailwind verification. Without these, every portal build is throwaway.
3. **Tier 1 (Sawa AI)** — this is the product and the front door. It is also the only thing that makes the rest of the site true.
4. **Tier 6 in parallel** — a second track. These are marketing pages with no architectural dependency; they can ship while the platform is being built, and they carry the Cyber4Africa / security / responsible-AI narrative that §27, §47, §48 and §60 depend on.
5. **Tier 2 → 5** — User, Professional, Institution, Admin.
6. **Tier 7** — housekeeping, any time.

---

## 9. Open questions

1. Are Embu, the Presidential Innovation Award and Acucu & Aguka publishable by name? (§4.4)
2. Do public prices (KES 150 / 250 / 30,000) appear on the site, behind a gate, or not at all? (§4.5)
3. Which backend/auth provider? None is currently chosen or installed.
4. Who are the founders, team and advisory network? (§41 — the mockup has three names; the app has none)
5. Is Sawa AI being built in-house or consumed from an external model provider? This determines §11 safety-rule design and §24 governance.
6. Which channel ships first after web — WhatsApp, SMS, or app? (§6 Layer 1)
7. Does `/prevention-model` (3 stages) stay as-is alongside the 6-step platform journey, or get replaced? (§4.3)
