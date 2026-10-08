# 12: Build the three access levels honestly

**Type:** prototype · HITL
**Blocked by:**
- 10 — Add the `/sawa-ai` route, page shell and §8 hero
- 07 — Write Sawa's voice and the six §67 answers

**Claimed by:** _(unclaimed)_
**Status:** blocked

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

- [ ] Three levels rendered in house `Card` vocabulary, with Level 1 visually marked as available.
- [ ] No control on the page implies a capability that does not exist.
- [ ] `Create your Sawa account` → `/contact`, clearly framed as waitlist capture.
- [ ] `Continue with Sawa` wired to the real `AnonymousConversationStore` (ticket 19) and confirmed
      to work, not merely to render. Wire it in ticket 20 if the store is not ready; this ticket owns
      the copy and the card layout, ticket 20 owns the behaviour.
- [ ] Level 3 copy contains no surveillance implication.
- [ ] Decision (from ticket 04) reflected: if Akili Sawa is **not** serving individuals, this section
      does not ship as-is.
- [ ] Consistent with ticket 06's age gate outcome — Level 1's description must state who it is for.
- [ ] Mobile: three cards stack cleanly at 390px, tap targets at least 44px.
- [ ] Copy review against the map's house rules: British English, sentence case, no exclamation
      marks, `&amp;`.

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