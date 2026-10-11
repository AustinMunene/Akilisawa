# 12: Build the three access levels honestly

**Type:** prototype · HITL
**Blocked by:**
- 10 — Add the `/sawa-ai` route, page shell and §8 hero
- 07 — Write Sawa's voice and the six §67 answers

**Claimed by:** opencode
**Status:** code complete — visual verification outstanding

## Question

How do three access levels read on a page where only one of them works?

## What to build

The §10 access-levels section, presented so a visitor can tell exactly what exists today and what
does not — without a single broken promise.

## Spec source, §10

| Level | Who | Gets |
|---|---|---|
| **1 Public** | Anyone | Low-friction first conversation |
| **2 Registered** | Sawa User | History, check-ins, follow-ups, consent controls |
| **3 Institutional** | Enrolled via programme | Programme check-ins, benefits, support pathways |

The mockup renders these as three cards at `Akili Sawa_ final site.html:64`.

## The honesty constraint — this is the ticket's real work

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §7 is blunt:

> **`Create your Sawa account`** → routes to `/contact` as waitlist capture. Do **not** ship a stub
> sign-up form that goes nowhere. Reserve the copy so it does not promise functionality that does
> not exist.

So Level 2 and Level 3 are **not shipped**. They are described. The hard part is describing them
without either lying or apologising.

| Failure mode | Example |
|---|---|
| **Promising what does not exist** | A "Create account" button that goes nowhere. Explicitly forbidden. |
| **Over-hedging** | *"An account system is planned but may never be built."* Nobody trusts that. |
| **Hiding it** | Showing only Level 1 and pretending the other two do not exist. Loses the spec's whole story. |

`/contact` already gatekeeps intake for institutions — *"We prioritise organisational, research, and
partnership-related enquiries."* — and has a 6-branch conditional form. It is a real destination and
a genuine waitlist surface, so routing there is honest.

## The fork

§9 requires the interface to offer, after the first exchange:

```
Continue with Sawa
   or
Create your Sawa account
```

Both must be real:

- **`Continue with Sawa`** → reopens the browser-held transcript. Genuinely works today. The
  mockup's own note says so: *"Continue with Sawa or Create your Sawa account"* after *"the live
  Sawa AI service"*.
- **`Create your Sawa account`** → routes to `/contact` as waitlist capture. No stub form.

## Copy constraints

| Level | Register | Must |
|---|---|---|
| 1 Public | `Akili Sawa`, present tense | Be inviting. This one is live — say so |
| 2 Registered | `Akili Sawa`, future-leaning | Not available yet. Route to `/contact`. No fake CTA |
| 3 Institutional | `Akili Sawa` | Third person, "enrolled through an employer, SACCO, insurer, government or NGO programme". Never imply monitoring (§61: *"Giving institutions the impression they can monitor individual employees"*) |

Level 3 needs care. §10 says institutions receive *"appropriate aggregate information rather than
unrestricted access to private conversations"*, and the mockup repeats it: *"Institutions do not see
private conversations."* This map does not build Level 3 at all — so the card must not imply an
institution can enrol anyone tomorrow.

## Acceptance criteria

- [x] Three levels rendered in house `Card` vocabulary, with Level 1 visually marked as available.
      Level 1 carries a `ring-accent` outline and an `Available now` badge; Levels 2 and 3 carry
      `Not available yet`.
- [x] No control on the page implies a capability that does not exist. Level 3 has no CTA at all
      (the institutional contact path stays with the existing closing band); Level 2's only control
      routes to `/contact`.
- [x] `Create your Sawa account` → `/contact?reason=sawa-account-waitlist`, clearly framed as
      waitlist capture ("Until then, this records your interest as a waitlist enquiry").
- [~] `Continue with Sawa` — the store (ticket 19) is not ready, so per the ticket this belongs to
      ticket 20. The reserved fork copy (`Continue with Sawa`, `Create your Sawa account`) now lives
      in `src/lib/sawa/copy.ts:sawaFork` for ticket 20 to wire to `AnonymousConversationStore`.
- [x] Level 3 copy contains no surveillance implication. States "Institutions see aggregate insight,
      never private conversations."
- [x] Decision (from ticket 04) reflected: individuals and institutions, public `/sawa-ai`.
- [x] Consistent with ticket 06's age gate outcome — Level 1 states it is for adults aged 18 and
      over. **Assumption flagged:** the age gate itself is not built here; this is the intended
      audience, not enforcement. Adjust the wording if the humans pick a different threshold.
- [ ] Mobile: three cards stack cleanly at 390px, tap targets at least 44px. Cards are
      `grid md:grid-cols-3` (single column below `md`); CTAs carry `min-h-[44px]`. **Needs a browser
      at 390px and 1440px, light and dark.**
- [x] Copy review against the map's house rules: British English, sentence case, no exclamation
      marks, `&amp;`. All three levels stay in the house third person (`Akili Sawa`) per voice-v1.
- [x] `npm run verify` green (20 tests) and `npm run build` green.

## What changed

| File | Change |
|---|---|
| `src/lib/sawa/copy.ts` | New. Typed `accessLevels` (Level 1 Public, Level 2 Registered, Level 3 Institutional) and the reserved `sawaFork` copy (`Continue with Sawa` / `Create your Sawa account`) for ticket 20. Copy only. |
| `src/pages/SawaAi.tsx` | New `Three ways to use Sawa` band between the hero and the closing CTA, mapping over `accessLevels` into house `Card`s. Level 1 ringed and badged available; Level 2 links to `/contact` as waitlist; Level 3 has no control. |
| `tests/sawa-ai.test.ts` | Three render smoke tests: three levels with only Level 1 available, the waitlist route, and the no-surveillance institutional line. |

### Reading of the three levels

The spec §10 table is the source of truth (Public / Registered / Institutional), which is what the
mockup at `Akili Sawa_ final site.html:64` renders as "Three ways to use Sawa". One level works; two
are described. Nothing forces an account, and no control promises a capability the build does not
have.

## Notes

Prototype ticket — the question is genuinely "how do three things read when one works", which is a
copy and layout question. Impeccable's `shape` and then `clarify`.

Worth noting the tension the humans should see: this section's job is partly to make Akili Sawa
*look* like it has a platform while being honest that it does not yet. That is a legitimate
marketing posture — the mockup already labels its own data "sample data" and its prices
"illustrative", which is the house precedent. Match that honesty. Do not let the copy drift toward
implying capability.

`Akili Sawa_ final site.html:154` sets the precedent in one line: *"All names and figures are sample
data. Prices shown are potential commercial structures."*