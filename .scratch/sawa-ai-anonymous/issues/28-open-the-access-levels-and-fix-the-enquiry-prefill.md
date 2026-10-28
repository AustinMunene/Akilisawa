# 28: Open the access levels and fix the enquiry prefill

**Type:** grilling · HITL
**Blocked by:**
- 26 - Make the contact form actually deliver
- 27 - Purge "pilot" from the site

**Claimed by:** opencode (agent)
**Status:** closed 22 October 2026

## Question

What does "Available now" actually mean for Levels 2 and 3, and how does a visitor who clicks
"Available" end up in front of a form that works?

## The request

The client said: "anywhere that we've mentioned that the product is not available that should
change to available so that the users can be prompted to fill in the form and submit."

And chose the reading: **Levels 2 and 3 available, with honest limits**.

That phrasing is the whole ticket. "Available" here means *reachable and honestly described*, not
"every feature shipped". The honest limits stay; the "not available" label goes.

## What is there now

`src/lib/sawa/copy.ts` holds the typed §10 levels. `src/pages/SawaAi.tsx:77` renders them.

| Level | Name | Badge | CTA |
|---|---|---|---|
| 1 | Public | "Available now" | scroll to the chat |
| 2 | Registered | "Not available yet" | `/contact?reason=sawa-account-waitlist` |
| 3 | Institutional | "Not available yet" | **none** |

Level 2's body: *"Not open yet. A Sawa account will add history, check-ins and follow-ups, with
consent controls. Until then, this records your interest as a waitlist enquiry."*

Level 3's body describes deployment across employer, SACCO, insurer, government or NGO
programmes, and adds *"Institutions see aggregate insight, never private conversations."* It has
no control at all.

`sawaFork.createAccount.note` says *"Sawa accounts are not available yet. This records your
interest as a waitlist enquiry."*

## The three things that are wrong

### 1. The badges lie in the other direction once they change

A badge that says "Available now" next to a body that says "Not open yet" is worse than either
state alone. The body copy has to change with the badge, in the same edit, or the card contradicts
itself.

This is the tension the client resolved: the *label* becomes available, the *limits* stay honest.

Level 2's honest limit is that **there is no account** - no history, no check-ins, no follow-ups.
The level is available as an *enquiry* route, not as a shipped account system.

Level 3's honest limit is that **institutional deployment is arranged with the team**, not
self-serve. The level is available as a *conversation*, not as a self-serve product.

Note what this map must **not** do: the old map's out-of-scope list rules out building accounts
and history inside this map. Marking the level "Available now" does not commit anyone to building
them. It means the level is reachable and its limits are stated.

### 2. The `?reason=` prefill does not work at all

Three links across the site point at `/contact?reason=...`:

- `/contact?reason=sawa-account-waitlist` (`src/lib/sawa/copy.ts:26`)
- `/contact?reason=scoping-conversation` (`src/pages/SawaAi.tsx:218`)
- `/contact?reason=scoping-conversation` (`src/pages/Home.tsx:322`)

**`Contact.tsx` never reads the query string.** The `reason` dropdown always starts empty. The
visitor lands on a form with the reason unselected, and has to pick it again.

Worse: `sawa-account-waitlist` and `scoping-conversation` are **not in the allowlist** in
`api/contact.ts:47`. Even if the form did prefill it, the handler would answer
`400 Invalid submission.`

So the prefill needs three things, not one: `Contact.tsx` reads the param, the values are
normalised to the reason strings the form actually uses, and the allowlist covers them.

### 3. `src/lib/sawa/prompt.ts:59` tells the model to say "not available"

```
- Sawa accounts, history, check-ins and follow-ups are not available. If someone asks for an
  account or for their earlier conversations, say so plainly rather than promising a way to get
  them.
```

This is the model being told to contradict the page. It has to change with the page, or a visitor
who reads "Available now" and then asks the chatbot for an account gets told there isn't one.

`tests/prompt.test.ts:66` asserts that exact string and will need updating.

## The answer

### The badge question, settled

The ticket left this open: whether "Available now" is the right badge for a level that is
available *as an enquiry*, or whether Levels 2 and 3 should read "Available to arrange".

**Decided: "Available now" on all three.** The client chose the reading in the grilling
session - "Levels 2 and 3 available, with honest limits" - and the honest limits are
carried in each level's body rather than in its badge:

- **Level 1 Public** - "Available now. Begin a first conversation with Sawa. No account and
  no sign-in are needed..."
- **Level 2 Registered** - "Available now. A Sawa account will add history, check-ins and
  follow-ups, with consent controls. Register your interest and we will let you know when
  your account is ready."
- **Level 3 Institutional** - "Available now. Akili Sawa can be deployed through an
  employer, SACCO, insurer, government or NGO programme..."

The badge and the body now agree on every card, which was the risk the ticket named: "A
badge that says 'Available now' next to a body that says 'Not open yet' is worse than
either state alone."

The word "waitlist" is gone from the site. The account level routes to a **Sawa Account
Enquiry**, and the institutional level got a control it never had - "Discuss a deployment" -
so all three levels have a way to act on them.

### The prefill, fixed

`Contact.tsx` now reads the `?reason=` query string and preselects the matching option.
The mapping is by **slug**, not by the literal option text, so the URL and the copy can
move independently.

| Slug | Preselects |
|---|---|
| `partnership` | Partnership Discussion |
| `institutional-deployment` | Institutional Deployment Enquiry |
| `sawa-account` | Sawa Account Enquiry |
| `research`, `workforce`, `general`, `media`, `insurance` | the matching option |

**The aliases matter.** The site had already published `/contact?reason=sawa-account-waitlist`
and `/contact?reason=scoping-conversation`, so both resolve - to "Sawa Account Enquiry" and
"Partnership Discussion" respectively. A visitor who followed an old link still lands on the
right question. An unrecognised slug leaves the dropdown on "Select one" rather than
silently choosing something the visitor did not ask for.

Every value the form can now produce is in the API's allowlist, because both sides read the
same shared list in `src/lib/contact.ts`.

### The prompt, reconciled

`src/lib/sawa/prompt.ts` used to tell the model: "Sawa accounts, history, check-ins and
follow-ups are not available." That contradicted the page, and a visitor who read
"Available now" and then asked the chatbot for an account would have been told there
isn't one.

The prompt now says Sawa is available to talk to now, and that someone asking about an
account can register their interest through the contact page. **The prompt version was
bumped to 1.4**, because the repo's own rule is that when the prompt changes, the stamp
changes - and the stamp is the only record kept, because zero retention means there is no
server-side transcript to reconstruct a reply from.

Two more places said "may be sent" about the escalation, on the theory that no inbox was
configured. One is now configured, so the safety-flow copy and the §67 answers say the
flagged message **is** sent. The "not monitored for emergencies and no immediate response
is guaranteed" caveat is unchanged, because nobody has confirmed staffing. `docs/adr/67-answers-v1.md`
was amended to match what the page now says.

## What to do

1. **Rewrite the three level bodies** so the badge and the body agree. "Available now" plus the
   honest limit.
2. **Give Level 3 a CTA.** It has none today. It should route to a contact form with the
   institutional reason pre-selected.
3. **Make the prefill real.** `Contact.tsx` reads `?reason=`, maps it to a form option, and
   selects it. Decide whether the mapping is by slug (`scoping-conversation`) or by the literal
   option text, and make `api/contact.ts`'s allowlist cover every value the UI can produce.
4. **Reconcile the prompt** with the page, and update `tests/prompt.test.ts`.
5. **Update `tests/sawa-ai.test.ts`**, which currently asserts
   `expect(html.match(/Not available yet/g)?.length).toBe(2)`.

## The decision that is still open

Whether "Available now" is the right badge for a level that is available *as an enquiry*. There are
two defensible answers:

- **"Available now"** on all three, with the body doing the qualifying. Simple, and the client's
  literal request.
- **"Available now"** on Level 1, and something like **"Available to arrange"** on Levels 2 and 3.
  Still not "not available", still routes to a form, but does not claim a self-serve product that
  does not exist.

The client chose "Levels 2 and 3 available, with honest limits", which points at the first. But
this is a copy judgement on a wellbeing site, and a badge that over-claims is the kind of thing
this codebase is deliberately careful about. **Settle it before writing the copy**, and record the
reasoning in the ticket answer.

## Acceptance

- [x] No "not available" or "Not available yet" string remains on `/sawa-ai`.
- [x] The badge and the body agree on every level card.
- [x] Every level that routes somewhere routes to a form that pre-selects a reason the API accepts.
- [x] `tests/sawa-ai.test.ts` and `tests/prompt.test.ts` updated and green.
- [x] `npm run verify` passes.
- [x] A browser pass at 390px and 1440px, light and dark.

## Worth considering, not in scope here

- The contact form requires Organisation, Role/Title and Work Email. A Level 2 or Level 3 visitor
  who is an individual, not an organisation, will bounce. The form's shape is worth a look once
  these levels start sending real traffic through it.
- The crisis-language filter in `api/contact.ts` matches the bare words "trauma" and "emergency",
  and will reject legitimate B2B enquiries. Gap-analysis item **7.10**. More traffic through this
  form makes that sharper.
