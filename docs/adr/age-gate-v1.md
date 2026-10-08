# Age gate (v1)

Status: adopted (2026-10-09)
Source: ticket 06

## Legal basis
Children Act 2022 intersects counselling minors. A named Akili Sawa contact (CEO/leadership) must be identified before launch; external legal advice is required (to be actioned by that contact).

## Gate mechanism
Age gate + consent (defensible for Kenya context). Self-declaration alone is insufficient; DOB may be collected only if strictly necessary and handled per data rules.

## Scope
Gate applies to /sawa-ai and to the Home embed (same surface). Discovery must not bypass gate.

## Data handling
If DOB is collected, it must never be stored server-side. Gate state is client-only in sessionStorage; no DOB persisted. Update /privacy if DOB is used.

## Copy constraints
Age gate copy must be plain, English+Kiswahili, and use third person (Akili Sawa/we) for boundary messages per voice-v1. Non-punitive, Kenya-context appropriate.

## Notes
Trade-off: some friction for under-18 prevention access, but necessary for safeguarding. Consider restricted mode for embeds if needed.
