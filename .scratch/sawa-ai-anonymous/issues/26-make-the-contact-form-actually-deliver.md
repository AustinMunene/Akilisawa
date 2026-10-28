# 26: Make the contact form actually deliver

**Type:** task · AFK
**Blocked by:** none

**Claimed by:** opencode (agent)
**Status:** closed 22 October 2026

## Question

Why does the contact form say "Thank you" and deliver nothing, and what should the handler do when
the mail provider refuses?

## What is broken

Two independent defects. Fixing either alone changes nothing observable in production.

### Defect 1 - the code reports success on a failed send

`api/contact.ts:267` does this:

```ts
await resend.emails.send({ from: fromEmail, to: "smile@akilisawa.com", ... });
await resend.emails.send({ from: fromEmail, to: payload.workEmail, ... });
res.status(200).json({ message: "ok" });
```

The Resend SDK **does not throw** when the API rejects a request. It returns
`{ data: null, error: { name, message, statusCode }, headers }`. Verified against the live
Resend API with the production key:

```
{"message":"The akilisawa.com domain is not verified. ...","name":"validation_error","statusCode":403}
```

and against the SDK itself:

```
{ "threw": false, "value": { "data": null, "error": { "message": "API key is invalid", ... } } }
```

So the `try/catch` never fires, `result.error` is never read, and the handler answers `200 ok`
having sent nothing. **Confirmed live**: a POST to `https://akilisawa.com/api/contact` returned
`200 {"message":"ok"}` while Resend rejected the send with a 403.

The site has been telling every enquirer "Thank you for reaching out" and dropping every one of
them. How long that has been true is not known; the handler has looked like this since the
contact endpoint was written.

`api/_sawaEscalation.ts:39` **does** check `result.error` - so the pattern is already understood
elsewhere in the codebase. The contact handler just never learned it.

### Defect 2 - the recipient and the sender are hardcoded

`api/contact.ts:269` hardcodes `to: "smile@akilisawa.com"`, and `api/contact.ts:242` defaults
`from` to `process.env.RESEND_FROM_EMAIL || "no-reply@akilisawa.com"`.

Meanwhile Vercel already carries three vars that this handler ignores:

| Var | Value | Currently used? |
|---|---|---|
| `CONTACT_TO_EMAIL` | `smile@akilisawa.com` | no |
| `CONTACT_FROM_EMAIL` | `smile@akilisawa.com` | no |
| `RESEND_API_KEY` | `re_Cez…` | yes |

Gap-analysis item **7.9** is exactly this: "Make `smile@akilisawa.com` configurable via env in
`api/contact.ts`".

### The third defect - the escalation endpoint never fires

`api/sawa-escalate.ts` requires `SAWA_ESCALATION_ENABLED=true` and `SAWA_ESCALATION_TO=<address>`.
Neither is set in Vercel, so it answers `503 "Akili Sawa cannot send a support notification right
now."` on every safety signal. Meanwhile `/sawa-ai` tells visitors "the flagged message may also be
sent there" - a path that does not currently exist.

Note also that `api/sawa.ts:284` calls `sendSafetyNotification` **directly** on a crisis signal,
bypassing the `/api/sawa-escalate` endpoint entirely. Two escalation paths, one of them unwired.

## The answer

### The failure semantics, decided

The ticket left this open: "Right now the handler treats a failure of either as a failure
of the whole submission, so a visitor whose mailbox rejects the reply loses their enquiry
to the team as well."

**Decided: the team copy is load-bearing, the visitor's acknowledgement is best-effort.**

- If the **team copy** fails, the enquiry is gone. The request fails with a 500 and the
  visitor is told to try again. Retrying is correct, because nothing was received.
- If the **team copy** succeeds and the **visitor's acknowledgement** fails, the enquiry has
  landed with the team. The request still succeeds. Failing it would tell a visitor to
  resubmit something already in the inbox, and the duplicate would arrive in the same
  mailbox.

The acknowledgement failure is not silent in the sense that matters: the send is attempted
and its result is checked. It is simply not the visitor's problem to solve, and it is not
the team's either.

### What was built

**`api/_mail.ts` is the single place that talks to Resend.** It exists because the code
half of this ticket and the account half are independent, and because two mail paths that
each carry their own copy of the send-and-check logic are two places for the silent-failure
bug to live.

| Function | What it does |
|---|---|
| `sendMail(message)` | Sends and returns `{ ok: true }` or `{ ok: false, reason, statusCode }`. Never throws. |
| `teamRecipient()` | `CONTACT_TO_EMAIL` or `smile@akilisawa.com` |
| `sender()` | `RESEND_FROM_EMAIL`, then `CONTACT_FROM_EMAIL`, then `smile@akilisawa.com` |
| `escalationRecipient()` | `SAWA_ESCALATION_TO`, then `teamRecipient()` |
| `escalationSender()` | `SAWA_ESCALATION_FROM`, then `sender()` |

The `reason` is one of three: `not-configured` (no key, so nothing was attempted),
`rejected` (the provider refused it - it was **not** sent), or `transport-error` (the call
itself failed, so we do not know either way). The provider's own error message is
deliberately not carried out of the module: an error body can echo visitor content, and
nothing downstream needs it.

**`api/contact.ts`** now uses the transport and checks every result. A rejected send
answers `500 "Unable to send message."` instead of `200 ok`.

**`api/_sawaEscalation.ts`** now uses the same transport. It already checked
`result.error`; it no longer carries its own copy of the send logic. The escalation path
is **on by default** - `SAWA_ESCALATION_ENABLED` is an off switch rather than an opt-in,
so it works without configuration and can be disabled when nobody is watching the inbox.

**`SAWA_ESCALATION_TO` and `SAWA_ESCALATION_ENABLED` are set in Vercel** (Preview and
Production), pointing at the same `smile@akilisawa.com` mailbox the contact form uses, so
a human reads enquiries and safety signals in one place.

**`docs/adr/mail-delivery-contract-v1.md`** records the contract, so the next person to
add a mail path knows the rule: *a handler that awaits a send and returns 200 has checked
nothing.*

### The contact form's own crisis guard, replaced

Not part of the original ticket, but it was in the way of the work and the map had already
flagged it (gap-analysis item 7.10, in ticket 28's "worth considering").

The guard was a flat list of ten words:

```
suicide, self-harm, kill myself, kill me, end my life, abuse, assault, rape, trauma, emergency
```

So a B2B enquiry about a **trauma-informed programme**, or an **emergency response team**,
was rejected with "We cannot process this message. Please contact local emergency
services". That is the same inverted filter the safety lexicon was built to replace, and
ticket 28 made it sharper by routing individual visitors here.

It now uses the same bilingual lexicon as the chat, and refuses only on the tiers that mean
the person needs help rather than a reply - `high` and `elevated`. A message that merely
mentions trauma is an enquiry, and it is answered. The refusal carries `support: true`, so
the form shows the resources in the text colour rather than as a form error: nothing went
wrong with the form, the message was a redirect.

### The account half

Not done here. See ticket 30. The domain is still unverified at Resend, so the honest 500
is the correct production behaviour until the DNS records are added.

## What to do

1. **Check `result.error` on every send.** The handler must not report success unless the
   provider accepted the message. Treat "provider said no" exactly like "provider threw".
2. **Decide the failure semantics.** If the *team* copy fails but the *visitor* copy succeeds, the
   enquiry is still lost and the visitor should not be told it was received. If the *visitor* copy
   fails but the *team* copy succeeds, the enquiry has landed and the visitor's acknowledgement is
   what failed. The fog section of the map records this as a real open question - pick the safe
   behaviour and say which one you picked in the ticket answer.
3. **Use the env vars that already exist.** `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` should
   drive the recipients, with `smile@akilisawa.com` as the default so a missing var is not a
   regression. `RESEND_FROM_EMAIL` remains the override for the sender.
4. **Wire the escalation endpoint.** `SAWA_ESCALATION_ENABLED` and `SAWA_ESCALATION_TO` need to be
   set in Vercel, with the recipient being the same `smile@akilisawa.com` the client chose. Decide
   whether `SAWA_ESCALATION_ENABLED` should still default to off, and if so, what the `/sawa-ai`
   safety-flow copy says while it is off.
5. **Make one shared transport.** Three handlers now need to send mail. The recipient-resolution and
   error-checking logic should live in one place, not be copied three times.

## Acceptance

- [x] A send that the provider rejects produces a non-2xx response, not `200 ok`.
- [x] A test proves a rejected send is not reported as success. The mocked `Resend` in
      `tests/contact.test.ts` returns `{ data: null, error }` and the handler notices.
- [x] The recipients come from `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL`, with the current
      address as the default.
- [x] The escalation endpoint is configured, and the same recipient serves both the contact
      form and the safety escalation.
- [x] `npm run verify` passes.

## Worth considering, not in scope here

- A delivery webhook, so "sent" can be reconciled against "delivered" without a human checking the
  mailbox.
- The crisis-language filter in the same handler matches the bare words "trauma" and "emergency",
  which will reject legitimate B2B enquiries. Gap-analysis item **7.10**. Not this ticket.
- Whether the two emails should be one, or whether the visitor should get no acknowledgement at all.
