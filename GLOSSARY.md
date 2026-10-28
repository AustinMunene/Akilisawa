# GLOSSARY.md

Terms used in the Sawa AI build.

| Term | Definition |
|---|---|
| Sawa | The conversational companion interface (AI). In chat it speaks as "I" (first person). Boundaries/disclaimers/safety/legal use third person. |
| Akili Sawa | The product/organisation name used in third-person voice (boundaries, legal, disclosures, crisis). |
| §67 | The six explanatory questions that must appear below the immediately accessible product (product-first principle). Questions: What is Sawa? What can Sawa do? What can't Sawa do? When does a human become involved? How is information protected? How does institutional deployment work? |
| voice-v1 | The registered voice specification (docs/adr/voice-v1.md). When voice changes, promptVersion must change. |
| promptVersion | Version stamp attached to responses and safety signals (ticket 15). Enables reproducibility and governance. |
| escalation | Human involvement triggered by safety signals or user choice (ticket 18). |
| safety signals | Flags from safety detection (ticket 17) that may trigger escalation or refusal. |
| transcript | Session data stored in sessionStorage for the anonymous flow; only flagged excerpts may be retained server-side with TTL and disclosure. |
| engagement | A scoped, time-bound collaboration with a partner, on defined success measures. Replaces "pilot" site-wide from 21 October 2026. The relationship is a *partnership*; the act of going live is a *deployment*. |
| deployment | Taking a Sawa AI intervention live in an institution. A deployment is arranged with the Akili Sawa team, not self-serve. |
| access level | One of the three ways to use Sawa (§10). A level being *available* means it is reachable and its limits are stated honestly - not that every feature it describes is shipped. |
| enquiry | A message sent through the contact form, on behalf of an organisation. Distinct from *feedback*, which is a comment about the product itself. |
| feedback | A visitor's comment about Sawa AI, submitted through the dedicated feedback endpoint. Carries no transcript and is never linked to a conversation. |

Updated: 2026-10-21 (tickets 26-30, the "site that actually works" map)
