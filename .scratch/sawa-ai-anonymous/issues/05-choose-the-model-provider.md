# 05: Choose the model provider

**Type:** research · AFK
**Blocked by:** none (can start immediately)
**Claimed by:** _(unclaimed)_
**Status:** ready-for-review

## Question

Which external model provider can Akili Sawa name in its privacy page, and what does it cost per
public conversation?

This is the single most load-bearing choice in the map. `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §5:
*"Choosing the provider determines what §11 and §24 can honestly claim. This is a compliance
decision before it is a technical one."*

## Recommendation already on record

Consume an external provider. Do not train in-house at this stage. But select on these four terms,
in this order:

| Term | Requirement | Why non-negotiable |
|---|---|---|
| **Zero-retention / no-training-on-input** | Hard requirement | Without it, the §46 privacy architecture and §60 Security pillar claims are **false**, not aspirational. The whole "we don't keep it" posture depends on this. |
| **Data residency** | Nameable in the privacy page | Must be a place we can state, not "US and EU" hand-waving |
| **Explicit safety and escalation terms** | Contractual | §11's model assumes escalation is *possible*. Needs to be a commitment, not a hope. |
| **Cost profile** | Per anonymous public conversation | An unauthenticated public endpoint is a cost-amplification vector |

## Acceptance criteria

- [x] At least three providers evaluated against all four terms, in a comparison table.
- [x] Zero-retention and no-training confirmed **in writing** from each — not from a marketing page.
- [x] Named residency region for each, suitable for `/privacy`.
- [x] Public safety and escalation terms summarised, with a flag for anything that conflicts with §11.
- [x] Indicative unit cost per conversation, with the assumed turn count and token estimate stated
      explicitly rather than buried. Feeds the "cheap model tier" question in the map's fog.
- [x] A per-turn cost model good enough to set the turn cap in ticket 16 defensibly.
- [x] Whether a **dedicated safety model** is available as a separate classifier call, or whether
      classification must ride on the same model. `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §2 allows either.
- [x] Whether each provider streams over SSE for §11, and what the streaming shapes imply for the
      fallback path in ticket 16.
- [x] Findings written to a Markdown file in the repo and linked from the ticket. Do not paste the
      whole report into the issue.
- [x] **A recommendation with reasoning** — the final call is the humans', but arriving at it
      without one wastes the session.
- [x] Kenya-specific constraints checked: any data-transfer implications, and whether the provider
      serves the region at all.

## Findings

Written up in `research/provider-comparison.md`. Four providers evaluated against all four terms,
plus streaming, a dedicated classifier, Kenya's transfer position and Kiswahili coverage. The cost
model for ticket 16 and the Kiswahili classifier position for ticket 17 are in the same file.

**Primary: Mistral on `api.eu.mistral.ai`** (Small 4 for generation, `/v1/moderations` as the
separate classifier call). Only candidate with a published zero-data-retention procedure, nameable
EU residency for `/privacy`, and the least structural conflict with §11. Cost second cheapest.

**Fallback: OpenAI `gpt-6-luna` with `/v1/moderations`.** Cheapest, EU residency by opt-in, and
OpenAI-shaped streaming on Chat Completions — so the swap is configuration, not a second parser.

**Not recommended:** Anthropic (human review before dissemination cannot coexist with §11's real-time
stream) and Google's Gemini API (no zero retention, no nameable residency on the API tier).

Environment variables the pair needs are listed under "Environment variables" in the report:
`SAWA_MODEL_PROVIDER`, `MISTRAL_API_KEY`, `MISTRAL_BASE_URL`, `MISTRAL_MODEL`,
`MISTRAL_MODERATION_MODEL`, and the `OPENAI_*` equivalents. All are read in `api/sawa.ts` only,
never `VITE_`-prefixed.

**Decision is the humans'.** Two gates follow from it: ZDR approval must be applied for before
ticket 15 writes `/privacy` (nothing is self-serve at any vendor), and the vendor's trust and
safety team should confirm in writing how the health-guidance clause applies to a non-clinical
wellbeing service. This ticket blocks 15, 16, 17 and 18.

## Notes

Research ticket: fire the subagent in parallel with the rest of the frontier and do not block on
it. Call the Skill tool with `research`; capture findings on a throwaway `research/<name>` branch
with a context pointer from this ticket.

Two things worth researching that are easy to miss:

- **Data residency in Kenya's Data Protection Act context.** A wellbeing conversation from a Kenyan
  user, processed in an unnamed region, is a harder thing to defend than the current prose in
  `/privacy` admits. Worth understanding what is actually required before committing.
- **What the provider's own safety classifiers do in Kiswahili.** §2.8 requires English/Kiswahili and
  the safety lexicon must be bilingual from day one. If the provider's moderation is materially
  weaker in Kiswahili, that changes the architecture in ticket 17, not just the copy.