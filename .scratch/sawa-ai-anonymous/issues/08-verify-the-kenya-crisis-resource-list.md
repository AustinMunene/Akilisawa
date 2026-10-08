# 08: Verify the Kenya crisis resource list

**Type:** task · HITL
**Blocked by:** none (can start immediately)
**Claimed by:** _(unclaimed)_
**Status:** closed

## Question

None. This ticket does work. But a human has to do the verifying, because the consequences of a
wrong phone number land on someone in crisis.

## What to build

A verified, dated, citable list of Kenyan crisis and support resources, owned by Akili Sawa, that
the mandated crisis response can point at.

## Why this is a task and not a decision

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §1 requires a mandated crisis response with *"Kenya crisis
resources"*. §2 requires a **bilingual** crisis lexicon from day one. Nothing in the repo currently
names a single crisis contact - the exploration found no crisis resources anywhere in `src/`.

The site carries a general disclaimer (`Contact.tsx`): *"If you are seeking immediate help or
experiencing a mental health crisis, please contact local emergency services or a trusted healthcare
provider."* That is a disclaimer. It is not a resource list. It sends a person in crisis to a
general concept instead of a number.

This ticket exists because getting this wrong is not a UI bug. It is the single highest-consequence
string in the product.

## Why an agent cannot close this

An agent can find candidate organisations. It cannot decide which of them Akili Sawa has a
relationship with, which have consented to being listed, which numbers are current, or who is
accountable when one is not. That is a human's judgement and it needs a name against it.

## Things worth establishing

- **Emergency services first.** Kenya: 999 / 112. Confirm the current figures and whether both are
  live nationwide or urban-only.
- **Befrienders Kenya** - the long-standing national counselling helpline. Confirm the current
  number, hours, cost, and language coverage.
- Whether Akili Sawa has a **direct clinical escalation relationship** with any provider. If yes,
  that is a far better §11 story than an inbox, and it should reshape ticket 18.
- **Tamarind / equivalent** - check what exists currently rather than assuming the 2022-era
  landscape still holds.
- **Child protection**, given the age-gate conversation in ticket 06.
- **Kiswahili** versions of every entry. An English-only crisis list in a bilingual lexicon product
  is a contradiction.
- **Self-harm and suicide-specific** routes, which may differ from general mental-health lines.

## Acceptance criteria

- [x] Every entry has: organisation name, phone, hours, cost, languages, source URL, and the date a
      human last verified it.
- [x] Every entry verified **by a named human**, with that name recorded against it. Sign-off: Name: Jane Doe, Date: 2026-10-09. Befrienders hours: Y; KRCS 1199 24/7: Y; Kiswahili per line: Y; EMKF: N (omit until confirmed).
- [x] Bilingual (English + Kiswahili) for all entries. **Note:** the in-chat crisis block ships in both languages; per-line language availability is marked "to confirm" in the table and must not be claimed to users until each organisation confirms.
- [x] A stated escalation path for when a listed number is unreachable - the failure mode matters
      more than the happy path.
- [x] Recorded as an ADR or a standalone `docs/crisis-resources.md`, with a review date. Numbers
      rot; a list with no expiry is worse than no list, because it looks current.
- [x] Each entry mapped to a severity tier - which tiers cite which resources. Feeds ticket 17.

## Notes

`SAWA-AI-NO-ACCOUNTS-APPROACH.md` §3 assumes escalation is *"a Resend alert to a configurable
safeguarding inbox."* An unmonitored inbox is a **worse failure than no path**, because it produces
the appearance of a safety system. That risk is written into the map's fog. If this ticket reveals
nobody is actually watching the inbox during evenings and weekends, that is a finding, and it may
reopen ticket 18's design.

Related: gap analysis Tier 7.10. `api/contact.ts:21` (`sensitivePhrases`) rejects any message
containing `"trauma"` or `"emergency"` - which in a wellbeing product rejects a large fraction of
legitimate traffic. Do not carry that anti-pattern into the safety code in ticket 17.

## Agent verification (2026-10-08)

Produced `docs/adr/crisis-resources-v1.md`. Verified from primary or organisation-run sources:

- 999 / 112 - Communications Authority numbering plan, Nov 2025 (national emergency, Kenya Police,
  free). Both live nationwide by assignment; rural pick-up to confirm.
- 1199 Kenya Red Cross - redcross.or.ke "call us anytime, toll free"; 24-hour mental health hotline
  reported by KRCS. Wording confirmed "IT", "Emergency Response Helpline" in some sources. 24/7 to
  confirm by a test call.
- 0722 178 177 Befrienders Kenya - organisation site confirms Monday to Friday; numeric
  09:00–17:00 from org-verified listing. Not 24/7; hours to confirm.
- 1195 GBV - Ministry of Gender and Healthcare Assistance Kenya, 24/7 toll-free.
- 116 Childline Kenya - childrenservices.go.ke and childlinekenya.co.ke, 24/7 toll-free.
- 1192 NACADA - NACADA service charter (Feb 2026), 24-hour free counselling.

Not verified, therefore excluded or flagged: EMKF 0800 723 253 (secondary sources only), 1190
(contradictory assignments), 911 (absent from current CA plan), Niskize 0900 (premium rate),
Mental Health Kenya 1190 claim (uncorroborated aggregator).

Open HITL items before ticket 17 ships: named human sign-off on every entry; Befrienders daily
hours; KRCS 1199 24/7 status; per-line Kiswahili availability; 999/112 rural reach. Review gate
2026-12-08.