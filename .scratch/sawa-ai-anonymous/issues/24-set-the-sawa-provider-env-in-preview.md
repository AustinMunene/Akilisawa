# 24: Set the Sawa provider env in Preview

**Type:** task · HITL
**Blocked by:**
- 05 — Choose the model provider (the decision itself is a human gate; research is done)

**Claimed by:** _(unclaimed)_
**Status:** open

## Question

None, once 05 is settled. This is the configuration step that turns the deployed endpoint into
a working chat.

## Why it exists

`api/sawa.ts` is deployed and correct on `staging`, verified end to end:

| Request | Response |
|---|---|
| `GET /api/sawa` | `405` |
| `POST` with an invalid body | `400 Invalid submission.` |
| `POST` with a valid body | `500 Sawa is unavailable right now.` |

That last response is `GENERIC_ERROR`, returned when `resolveProviderConfig()` is `null`. It is
the designed fail-closed path, not a bug — the request reaches it through the method guard, the
IP cap, the parse and every sanitiser. Nothing is wrong with the code. There is no key.

The visitor-visible symptom is the notice in the chat: "Sawa is unavailable right now. Please
try again."

## What to do

In Vercel → Settings → Environment Variables, scoped to **Preview** (and to Production when this
reaches `main`):

| Variable | Needed | Note |
|---|---|---|
| `MISTRAL_API_KEY` | yes | all three are required together — `resolveProviderConfig()` returns `null` if any is missing |
| `MISTRAL_BASE_URL` | yes | `https://api.eu.mistral.ai` per ticket 05 |
| `MISTRAL_MODEL` | yes | |
| `SAWA_MODEL_PROVIDER` | no | `openai` switches to the three `OPENAI_*` vars instead |
| `SAWA_PROVIDER_TIMEOUT_MS` | no | module default applies when unset or non-numeric |
| `RESEND_API_KEY` | separate concern | the contact form and the escalation sink both need it; currently absent on Preview, so the contact form answers "Email service not configured" |

Then apply for **zero-data-retention** with the chosen provider. Ticket 05 raises this and it is
not done. For a wellbeing product whose privacy claim is that transcripts are not kept, a
provider retaining them by default contradicts the page.

## Acceptance

- A message sent at `/sawa-ai` on the staging URL streams a reply.
- The contact form on staging no longer answers "Email service not configured", or the decision
  to leave it unconfigured on Preview is written down here.
- Zero-data-retention is applied for, or explicitly deferred with a reason.

## Unblocks

- **16** — the function duration ceiling cannot be measured until a real stream runs.
- The first end-to-end exercise of the safety pipeline against a live model. Everything proving
  it today is unit-level.
