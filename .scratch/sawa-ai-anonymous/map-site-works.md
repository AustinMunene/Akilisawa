# Map: The site that actually works

**Label:** `wayfinder:map`
**Created:** 21 October 2026
**Status:** open - charted in one session after the client listed four defects on the live site

This is a **second map**, not a continuation of [`Sawa AI, anonymous and public`](./map.md). That map
built the product; this one fixes the site around it. The old map is untouched and still the
authority on the chat, the safety pipeline and the provider.

---

## Destination

A public Akili Sawa site that **reaches the people who write to it** and **describes the product as
it actually is**.

Reaching the end of this map looks like:

1. A contact-form submission lands in `smile@akilisawa.com` and the sender gets a real reply.
2. A high-severity safety signal reaches the same mailbox, and the code says so honestly when it
   cannot.
3. The word "pilot" is gone from the site, and the `/partnerships` page describes a real engagement
   rather than a promise.
4. The three access levels on `/sawa-ai` read "Available now" where that is true, and each one
   routes to a form that actually works.
5. A visitor can tell you what they think of Sawa AI, on the page, without an account.

No ticket below may leave the site in a state where it claims something it does not do.

---

## Notes

### The one-line shape of this effort

Fix the mail path → fix the words → open the form → ask for feedback.

The mail path comes first because two of the four defects are dead in production right now: every
contact-form submission is being answered with "ok" and thrown away, and every safety escalation
returns a 503. The copy work is cheap and can follow.

### Skills every session should consult

| Situation | Skill |
|---|---|
| Voice, copy, §67 answers, prompt design | **`grilling`** + **`domain-modeling`** |
| Any UI work on this effort | **`emil-design-eng`** - UI polish, component design, animation and micro-interaction decisions. |
| Any handler work | **`tdd`** for the pure functions, and the `AGENTS.md` gate (`npm run verify`) |

### Standing preferences

**Voice.** Sawa speaks warm first person *inside the chat* (`I`). Every boundary, disclaimer,
safety message and legal statement stays in the house third person (`Akili Sawa`, `we`). The split
is by context, not by author.

**House style rules, enforced across every ticket:**

- British English. `wellbeing` is one word. Use `behavioural`, not `behavioral`.
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

**Verification.** `npm run verify` is the gate: `typecheck` then `lint` then `test`. It covers
`src/` **and** `api/` (`tsconfig.api.json`). A handler that is not typechecked under
`tsconfig.api.json` does not exist. Every UI ticket also gets a `npm run dev` visual check, and
this map's copy changes get a real browser pass at 390px and 1440px, light and dark.

### Vocabulary decisions locked on 21 October 2026

These came out of the grilling session and apply to every ticket on this map.

| Was | Now | Rule |
|---|---|---|
| "pilot" | **engagement** | The word is purged site-wide. An *engagement* is a scoped, time-bound collaboration with a partner. |
| "pilot" (the rollout moment) | **deployment** | "Institutional deployment" for the act of going live. |
| "pilot" (the relationship) | **partnership** | Unchanged. |
| `/pilots` route | `/partnerships` | With a `/pilots` redirect for old links. |
| "Not available yet" | **"Available now"** | Only where the thing is genuinely reachable. The honest limits stay; the "not available" label goes. |
| `?reason=` query string | a real prefill | `Contact.tsx` must read it. Today it does not, and `api/contact.ts` would reject the value. |

### Locked decisions from the grilling session

1. **Resend scope** — fix the code *and* produce a DNS checklist. Both defects are real and
   independent: an unverified domain is an account-side action, and the silent `200 ok` is a code
   defect. Fixing one does not fix the other.
2. **Escalation recipient** — `smile@akilisawa.com`, the same mailbox as the contact form. The
   recipient becomes configurable by env var with that as the default.
3. **Feedback capture** — a dedicated `/api/feedback` endpoint, open comment only, no rating.
4. **Feedback placement** — a static band below the conversation on `/sawa-ai`, above the org CTA
   and the §67 FAQ. The §67 principle is product-first, answers-below; feedback is a coda, not a
   competitor to the product.
5. **Feedback transport** — the same Resend path, so it is fixed by the same DNS work.

---

## Decisions so far

<!-- The index. One line per closed ticket, enough to judge relevance, then zoom the link. -->

### Closed

| Ticket | Outcome |
|---|---|
| [26 - Make the contact form actually deliver](./issues/26-make-the-contact-form-actually-deliver.md) | **Closed 22 October 2026.** The silent-failure defect is gone. `api/_mail.ts` is now the single place that talks to Resend, and it checks `result.error` on every send - the SDK resolves with `{ data: null, error }` rather than throwing, which is why the old `try/catch` could never fire and the handler answered `200 ok` on every failed send. Addresses resolve from `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` / `SAWA_ESCALATION_TO`, all defaulting to `smile@akilisawa.com`. The escalation path is now on by default (`SAWA_ESCALATION_ENABLED` is an off switch, not an opt-in) and the two mail paths share one mailbox. Failure semantics decided: the team copy is load-bearing (its failure fails the request), the visitor's acknowledgement is best-effort (its failure does not, because the enquiry already landed and a retry would duplicate it). The contact form's own crisis guard was also replaced: it was a flat list of ten words including "trauma" and "emergency", so a B2B enquiry about a trauma-informed programme was rejected. It now uses the same safety lexicon as the chat and refuses only on the tiers that mean the person needs help rather than a reply. `docs/adr/mail-delivery-contract-v1.md` records the contract. **Still human: ticket 30, the domain verification.** |
| [27 - Purge "pilot" from the site](./issues/27-purge-pilot-from-the-site.md) | **Closed 22 October 2026.** The word is gone from the site. `/pilots` became `/partnerships` with an edge redirect in `vercel.json` plus an in-app `<Navigate>` fallback, so a bookmarked link still lands on the page. The word "pilot" now means "engagement" (the scoped collaboration), "deployment" (going live) or "partnership" (the relationship). The contact form's reason string moved with the API allowlist - both now read from a shared list in `src/lib/contact.ts`, so the dropdown and the handler cannot drift apart again. `docs/adr/vocabulary-engagement-v1.md` records the vocabulary. |
| [28 - Open the access levels and fix the enquiry prefill](./issues/28-open-the-access-levels-and-fix-the-enquiry-prefill.md) | **Closed 22 October 2026.** All three access levels read "Available now" and each has a way to act on it. Level 2 routes to the account enquiry and Level 3 to the deployment enquiry, and `Contact.tsx` now reads the `?reason=` slug and preselects it - the prefill used to be ignored entirely, and the values it carried were not in the API's allowlist either. The `?reason=` slugs the site had already published resolve as aliases. The prompt was reconciled with the page and bumped to `1.4`, because it used to tell the model to say accounts "are not available" while the page said the opposite. |
| [29 - Ask for feedback on the Sawa AI page](./issues/29-ask-for-feedback-on-the-sawa-ai-page.md) | **Closed 22 October 2026.** A feedback band sits below the conversation and above the organisation CTA on `/sawa-ai`, with a dedicated `/api/feedback` endpoint. Open comment only, no rating. The endpoint never carries the transcript - it reads the comment and the page, and ignores anything else sent - and a comment carrying crisis content is refused, pointed at the crisis resources, and never emailed, using the same bilingual lexicon the chat uses. `docs/adr/feedback-capture-v1.md` records the decision. **Found and fixed a pre-existing safety gap along the way: see ticket 31.** |
| [30 - Verify the Resend domain and publish the DNS checklist](./issues/30-verify-the-resend-domain-and-publish-the-dns-checklist.md) | **Checklist published 22 October 2026; the verification itself is still human.** `docs/resend-domain-verification.md` has the record-by-record instructions, the exact SPF replacement string, the verification commands and the troubleshooting order. The env vars the code needs are set in Vercel (Preview and Production). What is left needs the Resend dashboard and the `rcnoc.com` DNS zone: add the domain, add the DKIM record Resend generates, edit the SPF record to add `include:spf.resend.com`, verify. **Until that is done, nothing the site sends is delivered, and the honest 500 is the correct behaviour.** |
| [31 - Inflected crisis language missed the safety lexicon](./issues/31-inflected-crisis-language-missed-the-safety-lexicon.md) | **Closed 22 October 2026.** Found while building ticket 29: the feedback guard depends on the safety lexicon, and the lexicon only listed one form of each phrase. "ninataka kufa" (I really want to die) and "nimekujikata" (I have cut myself) classified as `low`, so no crisis copy and no escalation - under-classifying distress, the failure the pipeline refuses to make. The inflected forms are now listed explicitly, in both languages, with the false-positive cases pinned alongside. The lexicon is gated on clinical review, so the one behaviour this did NOT change is recorded as a known limitation in the ticket rather than quietly altered. |

### Needs eyes - code complete, cannot be finished by an agent

| Ticket | What's left |
|---|---|
| [30 - Verify the Resend domain](./issues/30-verify-the-resend-domain-and-publish-the-dns-checklist.md) | The DNS work itself. The checklist is written; the records have to be added by a human with access to the Resend dashboard and the `rcnoc.com` nameservers. |
| [31 - The indirect-reference euphemisms](./issues/31-inflected-crisis-language-missed-the-safety-lexicon.md) | The `indirect` euphemisms are matched on the phrase alone, so "joining my brother" fires on a social invitation as readily as on the crisis it exists to catch. Narrowing it is a clinical judgement about when an ambiguous euphemism counts, so it is pinned as a known limitation and left for the lexicon's clinical review rather than changed in a copy fix. |

---

## Frontier

_All five tickets are worked. 30 needs a human for the DNS records; 31 needs a human for
the clinical judgement._

| # | Ticket | Type |
|---|---|---|
| 30 | [Verify the Resend domain and publish the DNS checklist](./issues/30-verify-the-resend-domain-and-publish-the-dns-checklist.md) | task · HITL |
| 31 | [Inflected crisis language missed the safety lexicon](./issues/31-inflected-crisis-language-missed-the-safety-lexicon.md) | research · HITL |

**26 and 30 are the same failure seen from two ends**, and only one end is closed. 26 is the
code half and it is done: the handler no longer reports a success it did not achieve. 30 is
the account and DNS half and it cannot be finished by an agent: it needs a human with
access to the Resend dashboard and the `rcnoc.com` nameservers, where the records for
`akilisawa.com` are actually managed. Until 30 is done, the contact form is a form that
goes nowhere, and 26's honest 500 is the correct behaviour of a site that has been told
its mail works.

**31 was found while building 29**, not planned. The feedback guard reuses the safety
lexicon, so the gap in the lexicon became a gap in the guard. It is fixed, but the one
behaviour it did not change is recorded for clinical review.

### The plan, ticket by ticket

| # | Ticket | Type | Blocked by |
|---|---|---|---|
| 26 | [Make the contact form actually deliver](./issues/26-make-the-contact-form-actually-deliver.md) | task · AFK | - |
| 27 | [Purge "pilot" from the site](./issues/27-purge-pilot-from-the-site.md) | task · AFK | - |
| 28 | [Open the access levels and fix the enquiry prefill](./issues/28-open-the-access-levels-and-fix-the-enquiry-prefill.md) | grilling · HITL | 26, 27 |
| 29 | [Ask for feedback on the Sawa AI page](./issues/29-ask-for-feedback-on-the-sawa-ai-page.md) | prototype · HITL | 30 |
| 30 | [Verify the Resend domain and publish the DNS checklist](./issues/30-verify-the-resend-domain-and-publish-the-dns-checklist.md) | task · HITL | - |

---

## Not yet specified

Fog. In scope, but not sharp enough to ticket. It graduates as the frontier advances - pull each
patch out of this section into its own ticket the moment it can be phrased as a question.

**The gap between "sent" and "delivered"**
- The contact form sends two emails: one to the team, one to the visitor. Which of them is the
  one that must not fail? Right now the handler treats a failure of either as a failure of the
  whole submission, so a visitor whose mailbox rejects the reply loses their enquiry to the team
  as well. Worth deciding separately, and it is a real question, not a hypothetical.
- Resend gives a delivery webhook. Nobody has decided whether the site should act on it, or
  whether the team checks the mailbox by hand.

**Inbox reality**
- `smile@akilisawa.com` is a Zoho mailbox (the MX records point at `mx.zoho.com`). Nobody has
  confirmed what else is in it, who reads it, or how quickly. The feedback band and the escalation
  alert both land there, and the site's copy will claim a human is watching.
- The `SAWA_ESCALATION_ENABLED` flag defaults to off. Whether escalation should be on by default
  in production, and what the page should say while it is off, is a separate decision from the
  wiring.

**Contact form shape**
- The form requires Organisation, Role/Title and Work Email, which is right for a business
  enquiry and wrong for an individual who just wants to ask a question. Now that the access
  levels will route people here, the shape may need to branch. Depends on what 28 lands.
- The crisis-language filter in `api/contact.ts` matches the bare words "trauma" and "emergency",
  which will reject legitimate B2B enquiries. Gap-analysis item 7.10. Not this map's job, but 28
  will increase traffic through this form.

**Feedback, once it exists**
- Whether to show the visitor how many people have given feedback, or a running summary of what
  people said. Depends on volume nobody has.
- Whether feedback should ever be tied to a conversation. The page is account-free, so probably
  not - but "the chat felt unhelpful" without the chat is much less useful to whoever reads it.

---

## Out of scope

Ruled beyond the destination. Does not graduate. Returns only if the destination is redrawn, and
then as a fresh effort rather than a resumption.

| Ruled out | Why |
|---|---|
| **Building the Sawa account** | The site's whole thesis is that Level 1 needs no account. Marking a level "Available now" does not mean building accounts - it means the level is reachable and its limits are stated honestly. 28 decides what that means in copy. |
| **Sawa history, check-ins and follow-ups as shipped features** | Same reason. The access levels describe what the levels are; they do not commit the team to building account-gated features inside this map. |
| **A post-conversation in-chat feedback prompt** | The client chose a static band below the conversation. An in-chat prompt would compete with the product and need new chat state. Returns only if the band is shown not to work. |
| **A separate safety escalation inbox** | The client chose `smile@akilisawa.com` for both. A dedicated urgent mailbox is a good idea and is not this map's decision. |
| **Replacing Zoho, or changing `akilisawa.com`'s mail provider** | 30 changes DNS records to *add* Resend. It does not migrate the mailbox. The MX records stay at Zoho. |
| **The `Sawa AI, anonymous and public` map** | That map owns the chat, the safety pipeline, the provider decision and the clinical gates. This map does not reopen them. It only changes what the site *says* about them. |
