# Feedback capture (v1)

Status: adopted (2026-10-21)
Source: ticket 29, the "site that actually works" map

## Decision

Product feedback is captured by a dedicated `/api/feedback` endpoint, not by the contact form. It
carries an open comment and nothing else about the visitor. It never carries the conversation
transcript. A comment containing crisis content is refused, pointed at the crisis resources, and
not delivered anywhere.

## Rationale

The contact form is organisational in shape - Organisation, Role/Title, Work Email. It is the
right instrument for a business enquiry and the wrong one for a person who has just used a
wellbeing chat and wants to say something about it. Routing feedback through the contact form
would mean asking a visitor for a job title, and it would mix two populations in one inbox that
need different handling.

The transcript restriction is the load-bearing part. The site's position is that the conversation
is held in the browser and never reaches the server, and `/sawa-ai` is the page where that promise
is most visible. A feedback endpoint that shipped the transcript would break it on the one page
where a reader is most likely to check. "The chat was unhelpful" is what arrives. Nothing more.

The crisis guard is stricter than the contact form's on purpose. The contact form's filter matches
the bare words "trauma" and "emergency", which is blunt enough to reject legitimate B2B enquiries
(gap-analysis 7.10). In a feedback comment, a wellbeing statement about trauma is exactly what
should arrive. The guard has to detect crisis *intent*, not crisis vocabulary - which points at
reusing the bilingual safety detector rather than a second phrase list.

## Consequences

- Feedback rides the same Resend transport and the same recipient as the contact form, so it is
  fixed by the same DNS work and cannot develop its own silent-failure path.
- The endpoint needs its own rate limit. A public form that accepts free text on a wellbeing site
  is a spam target.
- The band sits between the conversation and the org CTA on `/sawa-ai`. The §67 principle is
  product-first and answers-below, so a prompt inside or immediately under the chat competes with
  the product. A coda does not.

## Notes

No rating. The client chose an open comment over a star widget, on the grounds that the comment
is the valuable part and the rating is the signal. A rating also asks a question the page cannot
act on without a baseline.
