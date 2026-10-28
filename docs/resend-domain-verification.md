# Resend domain verification — the DNS checklist

**Status:** the code is done. This is the half that needs a human with access to the
Resend dashboard and the `akilisawa.com` DNS zone.

Akili Sawa's contact form and the Sawa AI safety escalation both send through Resend.
Neither can deliver until `akilisawa.com` is verified as a sending domain there.

---

## Why the mail does not arrive today

Two independent defects. The code half is fixed (see `docs/adr/mail-delivery-contract-v1.md`).
The account half is this document.

**1. The domain is not verified at Resend.** A direct call to the Resend API with the
production key returns:

```json
{
  "message": "The akilisawa.com domain is not verified. Please, add and verify your domain on https://resend.com/domains",
  "name": "validation_error",
  "statusCode": 403
}
```

The key itself is fine. A send from `onboarding@resend.dev` returns a *different* error —
"You can only send testing emails to your own email address" — which proves the key
authenticates. The key is also send-restricted, so `GET /domains` answers
`401 restricted_api_key`; the domain list has to be read in the dashboard.

**2. The DNS records Resend needs are not there.** `akilisawa.com` is served by Zoho for
mail, on third-party nameservers, and carries no Resend records at all.

### What is already there

| Record | Value |
|---|---|
| MX | `10 mx.zoho.com.`, `20 mx2.zoho.com.`, `50 mx3.zoho.com.` |
| SPF | `v=spf1 ip4:84.16.251.118 include:relay.mailbaby.net ip4:88.198.22.18 ip4:173.249.26.135 include:relay.mailchannels.net include:zoho.com +a +mx +ip4:161.97.159.201 ~all` |
| DKIM | `default._domainkey` — a Zoho key, not Resend's |
| DMARC | `v=DMARC1; p=none; rua=mailto:admin@akilisawa.com; ruf=mailto:admin@akilisawa.com; sp=none; adkim=r; aspf=r` |

### What is missing

- **No Resend DKIM record.** Every common selector was checked against public DNS —
  `resend`, `dkim`, `mail`, `_resend`, `zoho`, `zoho1`, `mailchimp` — all empty. Resend's
  actual selector is chosen when the domain is added in the dashboard, so it cannot be
  guessed from here. The dashboard shows the exact name and value.
- **No `include:spf.resend.com` in the SPF record.** Resend's sending servers are not
  authorised to send as `akilisawa.com`.
- **No `send.akilisawa.com` MX.** Resend's optional custom return-path (MAIL FROM)
  domain, which needs a delegated MX on a subdomain.

**Note the SPF record has to be edited, not added to.** A domain may only have one SPF
record, and a second one breaks SPF for everything else. The `~all` soft-fail at the end
stays as it is; only the `include:` is added.

---

## The checklist

Work through it in order. Steps 1 and 2 are in the Resend dashboard; steps 3 to 5 are in
the DNS zone at the registrar.

### 1. Add the domain in Resend

`resend.com` → **Domains** → **Add Domain** → `akilisawa.com`.

Resend immediately shows the DNS records it wants. **Leave that page open** — the DKIM
record name and value it generates are the ones that go into step 3.

### 2. Note the sending domain

Use `akilisawa.com` as the sending domain. The `from` address in production is
`smile@akilisawa.com` (`CONTACT_FROM_EMAIL`), so the domain has to match.

### 3. Add the DKIM record

Copy the name and value from the Resend dashboard into the DNS zone. It is a **TXT** record.

```
Type:   TXT
Name:   <the selector>.\_domainkey    (Resend shows the full name, e.g. resend._domainkey)
Value:  p=<the public key Resend shows>
```

A DKIM key is one long string. It must be pasted whole, with no line breaks and no
added spaces.

### 4. Edit the SPF record

**Replace** the existing TXT record at `akilisawa.com`. Do not add a second one.

```
Type:   TXT
Name:   @
Value:  v=spf1 ip4:84.16.251.118 include:relay.mailbaby.net ip4:88.198.22.18 ip4:173.249.26.135 include:relay.mailchannels.net include:zoho.com include:spf.resend.com +a +mx +ip4:161.97.159.201 ~all
```

That is the current value with `include:spf.resend.com` added after `include:zoho.com`.
Everything else is unchanged. Check it before saving:

```bash
dig +short TXT akilisawa.com @8.8.8.8
```

There must be exactly **one** SPF record, and it must contain `include:spf.resend.com`.

### 5. Add the custom return-path (optional but recommended)

Resend offers a dedicated subdomain for the envelope sender, so the root domain's
reputation is not spent on bounces. If the dashboard offers it, add the MX it specifies:

```
Type:   MX
Name:   send
Value:  <the feedback-smtp region host Resend shows, e.g. feedback-smtp.us-east-1.amazonses.com>
Priority: 10
```

A subdomain MX does not affect the root domain's Zoho mail.

### 6. Verify

Press **Verify** in the Resend dashboard. DNS changes can take a few minutes to propagate
if the nameservers have not cached the change yet; Resend retries on its own.

Check from the command line:

```bash
dig +short TXT <selector>._domainkey.akilisawa.com @8.8.8.8   # the DKIM record
dig +short TXT akilisawa.com @8.8.8.8                        # one SPF record, with the Resend include
dig +short MX send.akilisawa.com @8.8.8.8                    # the return-path, if step 5 was done
```

### 7. Send a test

From the Resend dashboard, send a test to `smile@akilisawa.com` and confirm it arrives.
Then submit the contact form on the live site and confirm the enquiry lands in the
mailbox.

---

## After the domain is verified

**Nothing else is needed.** The code already reads the right variables and they are
already set in Vercel:

| Variable | Value | Where |
|---|---|---|
| `RESEND_API_KEY` | set | Development, Preview, Production |
| `CONTACT_TO_EMAIL` | `smile@akilisawa.com` | Development, Preview, Production |
| `CONTACT_FROM_EMAIL` | `smile@akilisawa.com` | Development, Preview, Production |
| `SAWA_ESCALATION_TO` | `smile@akilisawa.com` | Preview, Production |
| `SAWA_ESCALATION_ENABLED` | `true` | Preview, Production |

The safety escalation and the contact form share one mailbox on purpose: a human reads
enquiries and safety signals in one place, and `SAWA_ESCALATION_ENABLED` is there as an
off switch for when nobody is watching it.

`SAWA_ESCALATION_ENABLED` defaults to **on**, so the escalation path works without any
configuration. Set it to `false` in an environment to switch the path off.

---

## The alternative, and why it is worse

Resend's shared onboarding domain (`onboarding@resend.dev`) works immediately and needs
no DNS. It is also restricted to sending to the account owner's own email address —
confirmed by the API error above. It cannot carry the product's mail. Not a fallback.

---

## What to do if the records do not verify

1. **Check the DKIM value was pasted whole.** A truncated key is the most common reason a
   DKIM record fails to verify.
2. **Check there is only one SPF record.** Two SPF records are an error, not a merge.
3. **Check the nameservers.** The zone is on `rs61.rcnoc.com` / `rs62.rcnoc.com`. If the
   records were added somewhere else, they are not in the live zone.
4. **Wait and retry.** Resend retries on its own. Some resolvers cache the old SPF for
   up to an hour.
