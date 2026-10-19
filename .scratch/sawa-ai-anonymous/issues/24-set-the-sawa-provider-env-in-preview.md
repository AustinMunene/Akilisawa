# 24: Set the Sawa provider env in Preview

**Type:** task · HITL
**Blocked by:**
- 05 — Choose the model provider (the decision itself is a human gate; research is done)

**Claimed by:** _(unclaimed)_
**Status:** done in Preview and Production - NVIDIA vars set in both scopes, both URLs verified
streaming on 19 October 2026. Zero-data-retention and NVIDIA's terms for real conversations are
still human gates.

## Result (19 October 2026)

The Preview vars were already set. What blocked the chat was that the deployed branch could not
read them: the NVIDIA provider lived in the working tree, unpushed, so the live handler treated
`SAWA_MODEL_PROVIDER=nvidia` as Mistral, found no `MISTRAL_*` vars and failed closed. `staging`
now carries that code, and `main` was fast-forwarded to it.

| Request | Response |
|---|---|
| Preview `POST /api/sawa` | `200`, streamed, `promptVersion 1.2` |
| Production `POST /api/sawa` | `200`, streamed, `promptVersion 1.2` |
| `POST` without the consent flag | `400` |
| Local `npm run dev`, `POST /api/sawa` | `200`, streamed - the dev middleware in `vite.config.ts` runs the same handler |

`RESEND_API_KEY` is set in Development, Preview and Production, so the contact form no longer
answers "Email service not configured".

Still open, and not closable by an agent: zero-data-retention with the provider, and written
confirmation that NVIDIA's trial terms permit real visitor conversations. Until that confirmation
exists, treat the deployed conversations as evaluation traffic.

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

### NVIDIA Preview configuration (current requested route)

Add the following under Vercel **Settings → Environment Variables**, scoped to **Preview**. The
code now reads these names; do not use a `VITE_` prefix.

| Variable | Value |
|---|---|
| `SAWA_MODEL_PROVIDER` | `nvidia` |
| `NVIDIA_API_KEY` | Secret generated from the chosen NVIDIA model page |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` (evaluation candidate) |

Save and redeploy the Preview branch, then test with synthetic conversations. NVIDIA's API Trial
Terms restrict personal or sensitive data unless the service expressly allows it. Get written
confirmation of real-user use and retention before sending visitor conversations. The staging URL
was reported as publicly reachable, so check Vercel Deployment Protection before adding a usable
Preview key.

Then apply for **zero-data-retention** with the chosen provider. Ticket 05 raises this and it is
not done. For a wellbeing product whose privacy claim is that transcripts are not kept, a
provider retaining them by default contradicts the page.

## Acceptance

- A message sent at `/sawa-ai` on the staging URL streams a reply.
- The contact form on staging no longer answers "Email service not configured", or the decision
  to leave it unconfigured on Preview is written down here.
- Zero-data-retention is applied for, or explicitly deferred with a reason.
- A Preview message returns a streamed reply from the selected NVIDIA model.

## Unblocks

- **16** — the function duration ceiling cannot be measured until a real stream runs.
- The first end-to-end exercise of the safety pipeline against a live model. Everything proving
  it today is unit-level.
