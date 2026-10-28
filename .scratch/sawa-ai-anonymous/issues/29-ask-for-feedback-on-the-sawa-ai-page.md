# 29: Ask for feedback on the Sawa AI page

**Type:** prototype · HITL
**Blocked by:**
- 30 - Verify the Resend domain and publish the DNS checklist

**Claimed by:** opencode (agent)
**Status:** closed 22 October 2026

## Question

How does a visitor tell you what they think of Sawa AI, and what should the form actually ask?

## The decision

The client chose:

- **A dedicated `/api/feedback` endpoint**, not a new reason on the contact form.
- **Open comment only**, no rating, no star widget.
- **A static band below the conversation** on `/sawa-ai`, not an in-chat prompt.
- **The same Resend path** as everything else, so it is fixed by the same DNS work.

## Where it goes

Current page order on `/sawa-ai`:

```
hero → §10 access levels → §13 capability band → the conversation → org CTA → §67 FAQ
```

The feedback band slots **between the conversation and the org CTA**.

That position is deliberate. The §67 principle in this repo is product-first, answers-below, and
the FAQ is deliberately last. A feedback prompt inside or immediately under the chat competes with
the product itself - the visitor is there to use Sawa, not to rate it. A band below the chat is
reached *after* the product has had its moment, so it reads as a coda rather than a competitor.

The org CTA and the FAQ both stay after it. A visitor who wants to complain about the chat and a
visitor who wants to deploy Sawa are both served, in that order.

## Why a dedicated endpoint, and what it must do

The contact form is **organisational** in shape - Organisation, Role/Title, Work Email,
Organisation Type. It is the wrong instrument for a person who just used a wellbeing chat and
wants to say something. Forcing feedback through it means asking a stressed or satisfied person
for a job title.

So: `api/feedback.ts`, its own handler, its own validation, its own rate limit.

### The safety constraint, which is the real design work

Feedback from someone who just used a wellbeing chat **can contain crisis content**. Someone who
found Sawa unhelpful, or who is still in a bad way, may write their feedback into the comment box.

The contact form already has the right pattern: `api/contact.ts:21` holds a list of sensitive
phrases, and `:227` refuses a submission containing one, answering with a pointer to emergency
services rather than an email.

The feedback endpoint needs the equivalent guard, and it must be **stricter** than the contact
form's, for two reasons:

1. **The contact form's filter is too blunt.** It matches the bare words "trauma" and "emergency",
   which is why gap-analysis item 7.10 exists. For feedback, where a comment is a free-text
   wellbeing statement, those words are likely to appear legitimately. The filter has to detect
   crisis *intent*, not crisis vocabulary.
2. **Feedback is less supervised than an enquiry.** A contact form is read by a business team. A
   wellbeing comment from a person who is not doing well is exactly the message a mailbox can sit
   on unopened for a week.

The reuse option is `src/lib/sawa/safety/detector.ts`, which already runs the bilingual EN +
Kiswahili lexicon and assigns severity tiers. Using it on a feedback comment means the same
tiering logic governs both the chat and the feedback box, and one place decides what counts as a
crisis. The detector is currently written to run on a *chat turn* with a `conversationId`, so
whether it can be reused directly for a form field is a real question - answer it before designing
around it.

If a comment is refused, the response must point to the same crisis resources the chat uses, from
`docs/adr/crisis-resources-v1.md`. It must not email the comment anywhere. It must not log it.

### The shape of the request

Open comment only, so the payload is small. But the endpoint can carry more than the comment:

- The comment itself, length-capped.
- Where on the page the visitor was (the page is the only page, but the variant may matter later -
  `SawaChat` is mounted on `/sawa-ai` as `variant="page"` and on Home as `variant="inline"`).
- A coarse, non-identifying timestamp, so the team can see whether feedback is trickling in or
  arriving in a burst.

It must **not** carry the conversation transcript. The site's whole position is that the transcript
is held in the browser and never reaches the server. A feedback endpoint that ships the transcript
would break that promise on the one page where the promise is most visible. If a comment says "the
chat was unhelpful", that is what arrives. Nothing more.

### Delivery

The same Resend path, the same recipient (`smile@akilisawa.com`), the same error-checking that
ticket 26 establishes. **If 26's shared transport exists, 29 should use it rather than opening a
second path** - two mail paths means two places for the silent-failure bug to live.

## The answer

### The guard: reuse the chat's own lexicon, minus the chat's own rules

The ticket asked the real question: "The detector is currently written to run on a chat
turn with a conversationId, so whether it can be reused directly for a form field is a real
question - answer it before designing around it."

**Answered: no, `detectUserTurn` is the wrong tool, and the right seam is narrower.**

`detectUserTurn` runs two things: the **lexicon** (does this text carry crisis content) and
the **intake rules** (is this a prompt injection, is it soliciting someone's personal
details, is it too long). The intake rules are about a conversation with a model. A
feedback comment reaches no model, so flagging "remember my name" as an intake issue would
reject a perfectly ordinary comment.

So `classifyCrisisContent(text)` was added to the safety module: the lexicon and the
tiering, and nothing else. One place decides what counts as a crisis, and the chat and
the feedback box are governed by the same rule.

**The gap this exposed is the real story.** The lexicon listed one form of each phrase, so
"ninataka kufa" (I really want to die) and "nimekujikata" (I have cut myself) classified
as `low` - no crisis copy, no escalation. That is under-classifying distress, the failure
the pipeline refuses to make, and it was live in the **chat** as well as the feedback box.
It is fixed, and it is ticket 31.

### What was built

**`api/feedback.ts`** - a dedicated endpoint, not a new reason on the contact form. The
contact form is organisational in shape (Organisation, Role/Title, Work Email); asking a
person who has just used a wellbeing chat for a job title is the wrong instrument.

| Behaviour | Rule |
|---|---|
| Comment | Required, trimmed, capped at 2000 characters |
| Transcript | Never carried. The request is read for `comment` and `page` and nothing else, so a client that tried to smuggle the transcript through would be ignored |
| Crisis content | A `high` tier comment is refused with `support: true`, pointed at the crisis resources, and **not** emailed |
| Delivery | The shared transport from ticket 26, to the same team mailbox |
| Rate limit | 5 per 10 minutes per IP, its own store |
| Provider failure | A 500, never a false success |

**`src/components/sawa/SawaFeedback.tsx`** - the band. It sits between the conversation and
the organisation CTA, above the §67 answers. The `support` flag is what lets it tell a
crisis refusal apart from a broken form: the first shows the support copy, the second
shows one generic sentence, which is the house pattern the contact form already uses.

The band says what happens to the comment and what does not ("It is not linked to your
conversation, and the conversation itself is never sent"), and it does not promise a reply
("We may not be able to reply to every comment"). The page is account-free, so a comment
cannot be tied to a person or answered as a support channel, and the copy does not
pretend otherwise.

**`docs/adr/feedback-capture-v1.md`** records the decision.

### Verified in the browser

At 1440px and 390px: the band renders, the crisis comment is refused with the support
copy, and an ordinary comment with no mail service configured fails **honestly** rather
than claiming success.

## What to do

1. Decide the exact copy for the band: the heading, the prompt, the input's placeholder and
   label, the button, and the success state.
2. Decide the guard: reuse the safety detector, or write a narrower crisis-intent check.
3. Build `api/feedback.ts` on the shared transport from 26, with its own rate limit.
4. Build the band component, placed between the conversation and the org CTA on `/sawa-ai`.
5. Test it: the render, the happy path, the crisis-language refusal, the rate limit, and the
   provider-rejection path.

## Acceptance

- [x] The band renders between the conversation and the org CTA, and a browser pass at 390px and 1440px
      is done in light and dark.
- [x] A comment is delivered to the recipient, or the visitor is told it was not, honestly.
- [x] A comment containing crisis content is refused, points to the crisis resources, and is not
      emailed or logged.
- [x] The request carries no transcript.
- [x] `npm run verify` passes.

## Worth considering, not in scope here

- Whether to show how many people have given feedback, or a running summary of what people said.
  Depends on volume nobody has.
- Whether feedback should ever be tied to a conversation. The page is account-free, so probably
  not - but "the chat felt unhelpful" without the chat is much less useful to whoever reads it.
- An in-chat prompt. The client chose a static band. This returns only if the band is shown not to
  work.
