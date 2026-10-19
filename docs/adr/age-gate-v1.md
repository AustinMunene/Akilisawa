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
The implemented gate accepts a date of birth in the browser, checks it locally, and discards the input when the page is left. The DOB is not sent to the API and is never persisted. Only an acceptance marker is held in tab-scoped `sessionStorage`; the Sawa API also rejects requests missing its age/consent acknowledgement flag. This is a friction and accidental-bypass control, not identity verification: a caller can forge a public API request. A stronger age-assurance method requires a legal/product decision and a provider that does not unnecessarily retain the DOB. The Privacy page must stay aligned with the deployed provider and its terms.

## Copy constraints
Age gate copy must be plain, English+Kiswahili, and use third person (Akili Sawa/we) for boundary messages per voice-v1. Non-punitive, Kenya-context appropriate.

## Notes
Trade-off: some friction for under-18 prevention access, but necessary for safeguarding. The same gate wraps both `/sawa-ai` and the Home embed. Legal advice and a named owner remain required before public use.
