# 30: Verify the Resend domain and publish the DNS checklist

**Type:** task · HITL
**Blocked by:** none

**Claimed by:** opencode (agent) — checklist only
**Status:** the checklist is published; the DNS records still need a human

## Question

What has to happen, outside the repository, for Akili Sawa's mail to actually leave?

## The diagnosis, confirmed

Two independent defects stop the contact form from delivering. Ticket 26 fixes one. This ticket is
the other.

### The domain is not verified at Resend

Calling the live Resend API with the production key from Vercel:

```
POST https://api.resend.com/emails
{"message":"The akilisawa.com domain is not verified. Please, add and verify your domain
on https://resend.com/domains","name":"validation_error","statusCode":403}
```

Every send from `akilisawa.com` is rejected with a 403. Nothing else about the key is wrong: a
send from `onboarding@resend.dev` returns a *different* error - "You can only send testing emails
to your own email address" - which proves the key itself authenticates fine. The key is a
send-restricted key, so `/domains` and `/api-keys` answer `401 restricted_api_key`; the domain
list has to be read in the Resend dashboard, not the API.

### The DNS records that would make it work are not there

`akilisawa.com` is served by Zoho for mail (`mx.zoho.com`, `mx2`, `mx3`) with a third-party
registrar (`rcnoc.com` nameservers: `rs61`, `rs62`).

What is present:

| Record | Value |
|---|---|
| MX | `10 mx.zoho.com.`, `20 mx2.zoho.com.`, `50 mx3.zoho.com.` |
| SPF | `v=spf1 ip4:84.16.251.118 include:relay.mailbaby.net ip4:88.198.22.18 ip4:173.249.26.135 include:relay.mailchannels.net include:zoho.com +a +mx +ip4:161.97.159.201 ~all` |
| DKIM | `default._domainkey` - a Zoho key, not Resend's |
| DMARC | `v=DMARC1; p=none; rua=mailto:admin@akilisawa.com; ...` |

What is missing:

- **No Resend DKIM record.** Every common selector was checked against public DNS - `resend`,
  `dkim`, `mail`, `_resend`, `zoho`, `zoho1`, `mailchimp` - all empty. Resend's actual selector
  is chosen when the domain is added in the dashboard, so it cannot be guessed from here.
- **No `include:spf.resend.com` in the SPF record.** The current SPF has no Resend include, so
  Resend's sending servers are not authorised to send as `akilisawa.com`. **The SPF record has to
  be edited, not added to** - a domain may only have one SPF record.
- **No `send.akilisawa.com` MX.** Resend offers a custom return-path (MAIL FROM) domain; it is
  optional but recommended, and it needs a delegated MX on a subdomain.

**This cannot be done from the repository.** It needs the Resend dashboard and the DNS zone at
`rcnoc.com`. That is why this ticket is HITL.

## The answer

**The checklist is published: `docs/resend-domain-verification.md`.** It is a document
rather than a conversation, because it has to be worked through by someone with access to
the Resend dashboard and the `rcnoc.com` DNS zone, and it has to survive that person
being someone else.

It contains:

- The two confirmed causes, with the actual API error and the actual DNS state.
- The record-by-record instructions, in order, for the Resend dashboard and the DNS zone.
- **The exact SPF replacement string**, with the before and after, because a second SPF
  record breaks the domain for everything and a modified one that omits the Resend include
  leaves Resend unauthorised while looking correct.
- The verification commands, and the troubleshooting order for a record that will not
  verify.
- What is already set in Vercel, so nobody goes looking for it.

**What is already done here:** `SAWA_ESCALATION_TO` and `SAWA_ESCALATION_ENABLED` are set
in Vercel for Preview and Production, and `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` were already set for all three environments. `.env.example` is added
so a new environment can be configured without reading the source.

**What still needs a human:**

1. Add `akilisawa.com` in the Resend dashboard and note the DKIM record it generates.
2. Add that DKIM record as a TXT record in the DNS zone.
3. **Replace** the SPF record at `akilisawa.com` with the one in the checklist, adding
   `include:spf.resend.com`.
4. Optionally add the `send.akilisawa.com` MX for the custom return-path.
5. Press Verify, then send a test to `smile@akilisawa.com`.

Until that is done, the contact form and the feedback form are forms that go nowhere, and
the honest 500 that ticket 26 introduced is the correct behaviour of a site that has been
told its mail works.

## What to publish

A checklist the client can work through without a developer. It should contain:

1. **Add the domain in Resend.** `resend.com` → Domains → Add Domain → `akilisawa.com`. Resend
   will show the DNS records it needs.
2. **The exact records, with names and values**, in the form the `rcnoc.com` panel wants. Resend
   generates a DKIM record with a selector it picks; the checklist should have a place to paste it
   rather than a guessed value.
3. **The SPF edit.** The existing record, with `include:spf.resend.com` added, so it is a
   replacement rather than a second record. Show the before and after.
4. **The optional `send.akilisawa.com` MX**, if the custom return-path is wanted.
5. **DMARC.** Currently `p=none`. Once sending is verified, moving to `p=quarantine` or `p=reject`
   is the hardening step. Note that `p=none` does not block delivery today, so this is not a
   blocker.
6. **How to verify.** Resend's dashboard shows the domain as verified, and a test send to
   `smile@akilisawa.com` arrives.
7. **What still needs doing after that**: the `RESEND_FROM_EMAIL` and `SAWA_ESCALATION_*` env vars
   from ticket 26.

**The SPF edit is the one that gets missed.** A second SPF record breaks the domain for everyone,
and a modified one that omits `include:spf.resend.com` leaves Resend unauthorised while looking
correct. The checklist should show the exact replacement string.

## The alternative, and why it is worse

Resend's shared onboarding domain (`onboarding@resend.dev`) works immediately and needs no DNS. It
is also restricted to sending to the account owner's own email address - confirmed by the API
error above. It cannot carry the product's mail. Not a fallback.

## Acceptance

- `akilisawa.com` shows as verified in the Resend dashboard.
- A test send from `smile@akilisawa.com` to `smile@akilisawa.com` arrives.
- `dig TXT akilisawa.com` shows exactly one SPF record, and it contains `include:spf.resend.com`.
- The DKIM record Resend asked for is present.
- The contact form on `akilisawa.com` delivers, and a real enquiry arrives in the mailbox.
- The checklist is written somewhere the client can find it, and linked from this ticket.

## Worth considering, not in scope here

- **Moving the mailbox off Zoho.** Not this ticket. The MX records stay at Zoho; Resend is added
  as a *sender*, not a replacement for the mailbox.
- **A second domain as a sending domain** (for example `mail.akilisawa.com`), which keeps the
  transactional sending reputation separate from whatever the root domain accumulates.
- **A DMARC `rua` reporting address** that is actually read, so SPF and DKIM alignment failures
  surface before they become deliverability problems.
