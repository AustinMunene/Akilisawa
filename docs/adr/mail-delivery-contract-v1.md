# Mail delivery contract (v1)

Status: adopted (2026-10-21)
Source: ticket 26, the "site that actually works" map

## Decision

A handler that sends mail through Resend reports success **only** when the provider accepted the
message. The Resend SDK does not throw on an API error - it returns `{ data: null, error }` - so
every send checks `result.error` explicitly. Recipient and sender addresses come from
`CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, with `smile@akilisawa.com` as the default.

## Rationale

`api/contact.ts` awaited `resend.emails.send()` inside a `try/catch` and returned `200 ok`. The
catch never fired, because the SDK resolves with an error object rather than rejecting. A live POST
to `https://akilisawa.com/api/contact` returned `200 {"message":"ok"}` while Resend rejected the
send with a 403 (the domain was unverified). Every enquirer was told their message had been
received, and every message was dropped.

The failure was invisible for two independent reasons: a provider-level rejection the code did not
read, and a domain that was never verified at Resend. Fixing either alone would have left the
other in place, and the site would still have looked healthy.

## Consequences

- A single shared transport for the contact form, the escalation sink and the feedback endpoint.
  Three copies of the send-and-check logic is three places for the same bug to live.
- The site now answers with a non-2xx when it could not deliver. That is a worse-looking dashboard
  and a better product: a failure rate of zero that means "nothing arrived" is the failure mode this
  ADR exists to end.
- `SAWA_ESCALATION_ENABLED` and `SAWA_ESCALATION_TO` must be set in Vercel, and the escalation
  recipient is the same mailbox as the contact form.

## Notes

The escalation endpoint had the same problem in a different shape: it required two env vars that
were never set, so it answered `503` on every safety signal while `/sawa-ai` told visitors the
flagged message "may also be sent there". The page described a path that did not exist.
