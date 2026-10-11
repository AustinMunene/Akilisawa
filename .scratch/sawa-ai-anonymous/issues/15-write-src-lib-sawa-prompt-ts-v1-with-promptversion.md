# 15: Write `src/lib/sawa/prompt.ts` v1 with `promptVersion`

**Type:** grilling - HITL
**Blocked by:**
- 05 - Choose the model provider
- 07 - Write Sawa's voice and the six §67 answers

**Claimed by:** _(unclaimed)_
**Status:** blocked

## Question

What does Sawa say when it has no idea - and what must it never be talked into saying?

## What to build

Create `src/lib/sawa/prompt.ts` with a versioned prompt string and an exported `promptVersion = "1.0"`.

## Requirements

- Export `promptV1: string` and `promptVersion = "1.0"`
- Encode the voice split: chat uses `I`, boundaries use `Akili Sawa` (third person)
- Prohibit diagnosis, treatment, medication, therapy/clinician framing
- Reference crisis resources only via `docs/adr/crisis-resources-v1.md` (never inline numbers except directive)
- Include §67 constraints (product first, answers below, non-clinical)
- Safety-first ordering, refusal register that declines gracefully

## Acceptance criteria

- [ ] `src/lib/sawa/prompt.ts` exists with both exports
- [ ] Prompt references `docs/adr/crisis-resources-v1.md` and uses `promptVersion = "1.0"`
- [ ] Unit test added (shape/version/forbidden strings)
- [ ] `npm run verify` passes

## Notes

Wire into ticket 16 once complete. This is HITL review before shipping to API.
