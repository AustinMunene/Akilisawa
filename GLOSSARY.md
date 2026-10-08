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

Updated: 2025-10-06 (ticket 07)
