# Model provider comparison for Akili Sawa

Ticket: `.scratch/sawa-ai-anonymous/issues/05-choose-the-model-provider.md`
Status: research complete, decision pending human sign-off.
Sources checked: 6 October 2026. Policy pages and list prices move; re-check anything quoted here
before it goes into `/privacy`.

## What was asked

Four terms, in order: zero-retention, data residency, safety and escalation terms, cost per
anonymous conversation. Plus the dimensions the ticket calls out separately: availability of a
dedicated safety model as its own call, Kenya's data-transfer position, what vendor classifiers do
in Kiswahili, and whether the provider streams tokens over SSE as §11 requires.

Four providers were evaluated: Mistral, OpenAI, Google (Gemini API) and Anthropic. All four meet
the minimum of three.

## Comparison table

| | Mistral | OpenAI | Google (Gemini API) | Anthropic |
|---|---|---|---|---|
| **1. Zero retention, in writing** | Published ZDR procedure, paid plans, opt-in by request; excludes Files API, Vibe and Labs models | ZDR and modified abuse monitoring, approval-gated; default abuse monitoring retains up to 30 days; ZDR requires `store=false` | **Not available on the API tier.** Abuse monitoring retains prompts and outputs 55 days; flagged content may get human review. Zero retention only on the enterprise/Vertex stack by exception request | ZDR available on request, org-wide; some covered models require 30-day retention and are ZDR-ineligible unless authorised |
| **2. Nameable residency** | `api.eu.mistral.ai` — European Union, with a US endpoint optional | "Europe" (EEA and Switzerland) or US, opt-in for eligible customers; DPA counterparty is OpenAI Ireland Ltd for EEA and Swiss customers | **Not nameable on the API tier** — global endpoint pool. Google Cloud offers `us`, `eu` and in-country regions; none in Africa | Workspace storage geo is `us` only; inference `global` or `us`. EU residency only via Bedrock, Vertex or Foundry |
| **3. Safety and escalation terms** | Usage policy: no professional advice "without proper qualification", explicitly naming "medical diagnoses, treatment suggestions, or any form of health-related guidance" | Usage policy: tailored advice requiring a licence "such as legal or medical advice, without appropriate involvement by a licensed professional"; no automation of high-stakes decisions without human review | Additional terms: may not be used "in clinical practice, to provide medical advice". Prohibited-use policy: no facilitation of self-harm; no automated decisions with material detrimental impact in healthcare without human supervision | Usage policy classifies healthcare — therapy, mental health, medical guidance — as a **high-risk use case** requiring human-in-the-loop review before dissemination and a start-of-session disclosure |
| **§11 conflict flag** | Medium — wording is broad but framed around qualification, not around the service being prohibited | Medium — narrower; bites if copy drifts into medical advice | High — clinical-practice and self-harm clauses are close to what a crisis conversation looks like | **High** — human review *before dissemination* conflicts with §11's real-time stream |
| **4. Cost, per 12-turn conversation** | $0.0052 average (Small 4) | $0.0037 average (`gpt-6-luna`) | $0.0098 average (3.1 Flash-Lite); $0.0277 (3.8 Flash) | $0.0370 average (Haiku 4.5) |
| **Dedicated classifier endpoint** | Yes — `/v1/moderations` plus pre-generation guardrails | Yes — `/v1/moderations` | No standalone endpoint on the API; safety filters ride the generation call | None |
| **SSE streaming for §11** | Yes — `stream: true` on `/v1/chat/completions`; data-only SSE frames terminated by `data: [DONE]`; works on `api.eu.mistral.ai` | Yes — `stream: true` over SSE, on Chat Completions and the Responses API; usage reportable in the final chunk via `stream_options.include_usage` | Yes — `streamGenerateContent?alt=sse`. Without `alt=sse` it returns a JSON array, not SSE | Yes — `stream: true` on `/v1/messages`; typed SSE events (`content_block_delta`, `message_delta`); usage arrives on `message_delta` |
| **Serves Kenya** | No published country restriction beyond sanctions | Yes, supported countries list | Yes, published region list | Yes, supported regions list |
| **Launch blockers** | ZDR is approval-gated — a schedule risk, not paperwork. Regional endpoint drops stateful features. Moderator's Kiswahili coverage unvalidated, so ticket 17 carries the safety load alone | ZDR approval-gated and forces `store=false`. EU residency is opt-in for eligible customers. Otherwise no hard blocker | **Hard:** no ZDR and no nameable residency on the API tier, so §46 cannot be written honestly. Clinical-practice clause sits close to a crisis conversation | **Hard:** human review *before dissemination* cannot coexist with §11's real-time stream. No classifier endpoint, US-only first-party storage, highest cost |

## Streaming (SSE)

All four clear the §11 requirement of token-by-token streaming, so streaming is not a
discriminator — but three implementation facts are:

- **Mistral and OpenAI are interchangeable on Chat Completions** — both emit
  `choices[].delta` chunks closed by `data: [DONE]`. A fallback swap between the two is a base URL
  and key change, not a second parser. Google and Anthropic each need their own event shape, so
  they would make the fallback path a second implementation. (OpenAI's Responses API uses typed
  semantic events instead; ticket 16 should speak Chat Completions to keep the two providers
  symmetric.)
- **Billing visibility differs.** OpenAI reports usage in the final chunk when
  `stream_options.include_usage` is set, and Anthropic on `message_delta`; Mistral includes usage
  on the stream events. This is how ticket 16 stops billing on client disconnect without a second
  non-streaming call to check the meter.
- **Gemini needs `alt=sse`.** Omitting it returns a JSON array, which is not SSE and cannot be
  forwarded through a `text/event-stream` response incrementally.

The transport risk in ticket 16 is not the vendor — all four stream — but the Vercel
response-duration ceiling: the handler must forward chunks as they arrive rather than buffering,
and abandon the upstream request on `req.on("close")`.

## Term 1: zero retention and no training

"Zero retention" and "we do not train on your inputs" are two different commitments, and both need
to be in writing.

- **Mistral** publishes a zero-data-retention procedure on its docs site: paid plans, stateless
  inference, granted on request, separate from the training opt-out. Explicit carve-outs: Files
  API, Vibe, and Labs models. The partner-served terms state separately that Mistral does not use
  your data to train its models.
- **OpenAI** documents zero data retention and modified abuse monitoring as approval-gated
  features configured in data controls. Default abuse monitoring retains data for up to 30 days.
  ZDR forces `store=false` on requests, which has functional consequences (no conversation
  persistence on the vendor side).
- **Anthropic** documents ZDR as available on request per organisation, with a material caveat:
  certain covered models require 30-day retention and are not ZDR-eligible unless authorised.
- **Google** is the outlier. On the Gemini API, abuse monitoring retains prompts and outputs for
  55 days, and flagged content may receive human review by authorised Google employees. The
  service-specific terms restrict training on paid-tier inputs without permission, but that is a
  no-training commitment, not a no-retention one. Zero retention is achievable only on the
  enterprise/Vertex stack via a documented exception request, and grounding features that store
  30 days must be avoided.

**Practical finding:** no provider offers self-serve zero retention. Every option here means
applying and being approved. That is a schedule risk, not a paperwork one, and it should be
started before ticket 15 writes `/privacy`.

## Term 2: data residency suitable for `/privacy`

| Provider | Wording that can go in `/privacy` | Caveat |
|---|---|---|
| Mistral | "Processed in the European Union" (`api.eu.mistral.ai`) | Regional endpoints only serve models hosted in that region; stateful features unavailable |
| OpenAI | "Processed in Europe (the EEA and Switzerland)" | Opt-in, eligible customers only; regional endpoints can carry a 10% uplift for models released on or after 5 March 2026 |
| Anthropic | "Processed in the United States" | First-party EU storage is not offered; global inference is the default, so pinning to US may carry a price multiplier |
| Google (Gemini API) | Nothing usable | The developer tier routes through a global pool with no region choice |

No provider offers a Kenyan or African inference region. The nearest third-party cloud regions
are AWS `af-south-1`, Azure South Africa North and GCP `africa-south1`, and Google's machine
learning locations table for `africa-south1` does not list Gemini model endpoints. So every
option transfers data out of Kenya, and Part VI of the Data Protection Act applies in all cases.

## Term 3: safety and escalation terms, and what conflicts with §11

Every one of the four restricts health-related guidance in some form. That is the single most
important finding in this report: **no vendor gives an unqualified green light to a crisis-support
conversation.**

- Anthropic's position is the hardest conflict. Healthcare is defined as a high-risk use case and
  requires human-in-the-loop review *before* dissemination plus a disclosure at the start of the
  session. §11 streams the reply first and escalates after. Those two cannot both be true.
- Google prohibits clinical practice and medical advice outright, and separately prohibits
  facilitating self-harm and automated decisions with material detrimental impact in healthcare
  without human supervision. A self-harm conversation sits uncomfortably close to both clauses.
- OpenAI's clause is narrower: it bites when advice requiring a licence is given without the
  involvement of a licensed professional.
- Mistral's clause is broad in wording ("any form of health-related guidance") but is framed as a
  qualification requirement rather than a prohibition on the category.

What makes the position defensible is the same for all four: keep the product non-clinical and
signposting rather than diagnostic, keep §11's human escalation real rather than decorative, and
get the vendor's trust and safety team to confirm in writing how the clause applies to a
wellbeing service. That confirmation is a pre-launch gate, not a nice-to-have.

## Term 4: cost model

### Assumptions, stated rather than buried

These are proposed defaults for ticket 16, not decisions. Change them and re-run the table.

| Assumption | Value |
|---|---|
| Turn cap per conversation | 12 user turns |
| System prompt | 900 tokens, resent on every turn, no prompt caching assumed |
| Average user message | 45 tokens |
| Average assistant reply | 180 tokens |
| Hard reply cap | 400 tokens |
| History growth | Turn *n* costs 900 + 225(*n* − 1) + 45 input tokens |
| **Total input per conversation** | **26,190 tokens** (10,800 system + 15,390 history and messages) |
| Output, average | 2,160 tokens (12 × 180) |
| Output, worst case | 4,800 tokens (12 × 400) |
| Classifier, when it is a separate LLM call | 250 input + 40 output per turn = 3,000 + 480 per conversation |

### Cost per conversation

Generation only, list prices as at 6 October 2026.

| Provider | Model | In $/M | Out $/M | Average | Worst case |
|---|---|---|---|---|---|
| OpenAI | `gpt-6-luna` | 0.10 | 0.50 | **$0.0037** | $0.0050 |
| Mistral | Small 4 | 0.15 | 0.60 | **$0.0052** | $0.0068 |
| Google | `gemini-3.1-flash-lite` | 0.25 | 1.50 | **$0.0098** | $0.0137 |
| Google | `gemini-3.8-flash` | 0.75 | 3.75 | **$0.0277** | $0.0376 |
| Anthropic | `claude-haiku-4-5` | 1.00 | 5.00 | **$0.0370** | $0.0502 |

Per turn, the average is the conversation figure divided by 12: $0.00031 at `gpt-6-luna` through
$0.00308 at Haiku 4.5. Anthropic's US-only inference tier is billed at 1.1× the global list price,
which would take Haiku to roughly $0.041 average.

### How this sets the turn cap in ticket 16

```
worst-case conversation cost = (26,190 × in_price + 4,800 × out_price) / 1,000,000
worst-case cost per IP per day = ceil(ip_daily_message_cap / turn_cap) × worst-case conversation cost
```

At an IP cap of 40 messages a day and a 12-turn cap, one IP can generate four worst-case
conversations a day: $0.020 on `gpt-6-luna`, $0.027 on Mistral Small 4, $0.055 on
`gemini-3.1-flash-lite`, $0.150 on `gemini-3.8-flash`, $0.201 on Haiku 4.5.

At 30,000 conversations a month on average-case costs: $111, $157, $294, $831 and $1,110
respectively.

**The conclusion worth carrying forward:** cost does not choose the provider. The spread is about
tenfold, but every candidate is under half a US cent per turn. What cost does justify is the
abuse control: an unauthenticated endpoint hammered with 10,000 worst-case conversations a day
costs about $50 on `gpt-6-luna` and about $500 on Haiku 4.5. The IP cap is the budget control;
the turn cap is the conversation-shape control.

## Dedicated safety model

- **Mistral:** yes. `/v1/moderations` with named moderation models, per-category thresholds, and
  guardrail configurations that run before generation — which is the ordering §2 asks for.
- **OpenAI:** yes. `/v1/moderations` is a separate endpoint, so classification does not consume
  generation tokens.
- **Google:** no standalone moderation endpoint on the Gemini API. Safety filters are configured
  on the generation call. Google Cloud offers Model Armor and a "Gemini as a filter" pattern as
  separate services, but that is a different product tier with its own contracting.
- **Anthropic:** none. Classification must ride on the same model or come from our own lexicon.
  Note also that refusals are returned as ordinary responses with an `end_turn` stop reason, so a
  safety refusal is not distinguishable from a normal turn by status code alone.

§2 permits either arrangement, so this is not a blocker. It does affect cost and latency:
Mistral and OpenAI can run detection as a cheap sidecar call, Anthropic cannot.

## Kenya

**The statute.** Data Protection Act 2019, Part VI:

- **Section 48** permits transfer out of Kenya only on proof of appropriate safeguards, including
  jurisdictions with commensurate data protection laws, or where a necessity basis applies.
- **Section 49(1)** is the one that matters here: processing **sensitive personal data** out of
  Kenya requires the data subject's consent *and* confirmation of appropriate safeguards. Health
  data is sensitive personal data, and a wellbeing conversation can contain health data.
- **Section 50** lets the Cabinet Secretary prescribe processing that must occur on a server in
  Kenya. No such prescription is in force for this kind of service as far as this research
  established — treat it as a watch item, not a constraint.

**The regulator.** The ODPC's Guidance Note on Cross-border Data Transfers sets out the bases
(appropriate safeguards, an adequacy decision, necessity, or consent), publishes standard
clauses, and imposes strict conditions on onward transfers — including that onward transfer for
the recipient's own purposes, such as product improvement, is prohibited.

**What this means for the build.** Regardless of which provider is chosen, the transfer is
cross-border and may involve sensitive data. So the consent and safeguards story has to live in
the product, not only in `/privacy`: an explicit, specific consent to transfer sensitive data
abroad, captured in-session before the first message, plus a documented safeguards position. Two
things still need human or legal confirmation: whether the ODPC has issued an adequacy decision
or standard clauses for the chosen country, and the exact wording of that consent.

**Service availability in Kenya** is fine for all four: OpenAI, Anthropic and Google all publish
Kenya in their supported-country lists, and Mistral publishes no country restriction beyond
sanctions. Availability tells us nothing about residency — that is the point of term 2.

## Kiswahili

No provider publishes a Kiswahili-specific evaluation of its safety classifier. What is published:

- OpenAI describes improved moderation across a 40-language multilingual set but does not name
  the languages, so Kiswahili coverage cannot be confirmed either way.
- Mistral's moderation model was trained on eleven named languages, and Swahili is not among
  them. Its newer multilingual moderation model makes broader claims without publishing a list.
- Google's published filter testing covers a language set that excludes Swahili, and the Gemini
  API has a blocked-reason code for unsupported languages.
- Anthropic ships no classifier at all.

The published research points the same way: low-resource Swahili moderation lags materially
behind English, and recent work on African-language safety classifiers reports consistent
degradation, with Swahili misclassification rates in the high teens to low twenties per cent
across categories.

**Consequence for ticket 17:** the bilingual lexicon is load-bearing, not decorative. Deterministic
Swahili, Sheng and crisis-keyword detection must run before generation as §2 requires, and the
vendor's classifier must be treated as a backstop that we have not validated, not as the primary
safety layer.

## Recommendation

**Primary: Mistral, on `api.eu.mistral.ai`, with Mistral Small 4 for generation and the Mistral
moderation endpoint as the separate classifier call.**

Reasoning, against the terms in their stated order:

1. It is the only candidate with a published, procedurally documented zero-data-retention path,
   and it separates the no-training commitment from the retention commitment.
2. It gives the cleanest line for `/privacy`: European Union processing, named and controllable
   via the endpoint rather than granted as a favour.
3. Its safety terms, while still constraining, are the least structurally in conflict with §11,
   and it is the only candidate whose moderation layer runs before generation by design.
4. Cost is second cheapest on the model we would use, and cost is not the deciding term anyway.
5. Its streaming response is OpenAI-shaped, so the fallback below is a configuration change rather
   than a second SSE parser — which is what makes having a fallback cheap to keep warm.

**Fallback: OpenAI `gpt-6-luna` with `/v1/moderations`.** Cheapest on the table, a real
dedicated classifier endpoint, EU residency available by opt-in, and a narrower health-advice
clause than Google's or Anthropic's. Choose this if Mistral's ZDR approval is slow or refused.

**Not recommended:** Anthropic, because healthcare is contractually a high-risk use case
requiring human review before dissemination, which cannot be reconciled with §11's real-time
stream; storage is US-only on the first party; and it is the most expensive by a wide margin.
Google's Gemini API, because there is no zero retention and no nameable residency on the tier
this product would actually use.

### Environment variables

Concrete inputs for ticket 16. Naming follows `RESEND_API_KEY` in `api/contact.ts`.

| Variable | Value | Notes |
|---|---|---|
| `SAWA_MODEL_PROVIDER` | `mistral` \| `openai` | The switch. Ticket 16 reads it once at the top of the handler and selects base URL, key and moderation call from it. Default `mistral`. |
| `MISTRAL_API_KEY` | issued key | Server-side only. Never `VITE_`-prefixed, never in `src/`, never logged — ticket 16's security boundary. |
| `MISTRAL_BASE_URL` | `https://api.eu.mistral.ai/v1` | Pins EU processing for `/privacy`. Missing → `500` with `{ message: string }` at the env-check step. |
| `MISTRAL_MODEL` | the Small 4 SKU from the cost table | Pin an explicit model id, not a `-latest` alias, so the cost table and `promptVersion` stay true. |
| `MISTRAL_MODERATION_MODEL` | Mistral's named moderation model | The separate classifier call §2 permits. Runs as a backstop only — the bilingual lexicon is the primary layer. |
| `OPENAI_API_KEY` | issued key | Same server-side-only rule. |
| `OPENAI_BASE_URL` | EU regional host once residency opt-in is granted, else the default host | The exact regional host must be confirmed with OpenAI at opt-in time rather than assumed. |
| `OPENAI_MODEL` | `gpt-6-luna` | Used only when `SAWA_MODEL_PROVIDER=openai`. |
| `OPENAI_MODERATION_MODEL` | `omni-moderation-latest` | Separate `/v1/moderations` call. |

Two things that are request fields rather than environment variables: Mistral's ZDR grant needs
nothing extra per request, while OpenAI's requires `store: false` on every call once approved —
that belongs in the request builder in `api/sawa.ts`, not in configuration. Both keys must fail
closed: a missing key is a `500` with the generic `{ message: string }` shape, never a
client-visible hint about which provider is configured.

## Top risks

1. **Zero retention is approval-gated everywhere.** Nothing is self-serve. If Mistral refuses or
   delays, the honest position on `/privacy` degrades to "retained up to 30 days for abuse
   monitoring", and the §46 and §60 claims need rewriting rather than softening.
2. **Every vendor restricts health guidance.** Ticket 15's copy must stay non-clinical and
   signposting, and §11's escalation must actually be staffed, or the usage-policy position is
   decorative.
3. **Kiswahili classifier coverage is unproven at every vendor.** Ticket 17 carries the safety
   load on its own.
4. **Sensitive-data consent is a product requirement, not a policy page.** Section 49(1) likely
   applies to every conversation of this kind.
5. **Prices are dated.** Google's introductory prices roughly double on 1 January 2027, and
   regional or US-pinned tiers can carry uplifts. Re-run the table before any budget commitment.

## Sources

- Mistral, zero data retention: `https://docs.mistral.ai/admin/monitor-comply/zero-data-retention`
- Mistral, regional inference: `https://docs.mistral.ai/inference/regional-inference`
- Mistral, pricing: `https://docs.mistral.ai/inference/pricing`
- Mistral, usage policy: `https://legal.mistral.ai/terms/usage-policy`
- Mistral, moderation and guardrailing: `https://docs.mistral.ai/studio/safety-moderation`
- Mistral, chat endpoints and `stream`: `https://docs.mistral.ai/api/endpoint/chat`
- OpenAI, streaming API responses: `https://developers.openai.com/api/docs/guides/streaming-responses`
- OpenAI, Chat Completions streaming events: `https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events`
- OpenAI, data controls and your data: `https://developers.openai.com/api/docs/guides/your-data`
- OpenAI, moderation: `https://developers.openai.com/api/docs/guides/moderation`
- OpenAI, pricing: `https://developers.openai.com/api/docs/pricing`
- OpenAI, usage policies: `https://openai.com/policies/usage-policies/` (blocks automated requests;
  the quoted clause was confirmed against the live page and archived copies)
- OpenAI, supported countries: `https://developers.openai.com/api/docs/supported-countries`
- Google, Gemini API pricing: `https://ai.google.dev/gemini-api/docs/pricing`
- Google, usage policies and abuse monitoring: `https://ai.google.dev/gemini-api/docs/usage-policies`
- Google, Gemini API additional terms of service: `https://ai.google.dev/gemini-api/terms`
- Google, prohibited use policy: `https://policies.google.com/terms/generative-ai/use-policy`
- Google, available regions: `https://ai.google.dev/gemini-api/docs/available-regions`
- Google, streaming interactions and `streamGenerateContent`: `https://ai.google.dev/gemini-api/docs/interactions/streaming` and `https://ai.google.dev/api`
- Google, machine learning service locations: `https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/general/locations`
- Anthropic, zero data retention: `https://docs.anthropic.com/en/api/zero-data-retention`
- Anthropic, data residency: `https://support.anthropic.com/en/articles/11179386-data-residency`
- Anthropic, usage policy: `https://www.anthropic.com/legal/aup`
- Anthropic, list prices (PDF, 31 August 2026): `https://www-cdn.anthropic.com/files/4zrzovbb/website/9e03129acc36d31970777d336f969bb53dc84355.pdf`
- Anthropic, supported regions: `https://docs.anthropic.com/en/api/supported-regions`
- Kenya, Data Protection Act 2019: `https://new.kenyalaw.org/akn/ke/act/2019/24/eng@2022-12-31`
- ODPC, guidance note on cross-border data transfers: `https://www.odpc.go.ke/wp-content/uploads/2026/04/Guidance-Note-on-Cross-border-Data-Transfers.pdf`
