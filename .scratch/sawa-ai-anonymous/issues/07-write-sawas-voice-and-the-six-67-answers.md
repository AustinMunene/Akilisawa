# 07: Write Sawa's voice and the six §67 answers

**Type:** prototype · HITL
**Blocked by:** none (can start immediately) — but ideally resolved after 04 and 06, since both
constrain the copy
**Claimed by:** _(unclaimed)_
**Status:** ready-for-review (HITL)

## Question

What does Sawa actually sound like, and what are the six answers a sceptical visitor needs before they trust it with anything real?

## Deliverables

- `docs/adr/voice-v1.md` — Voice specification: registers per surface, I/Akili Sawa split, "never says", refusal pattern.
- `docs/adr/67-answers-v1.md` — Six §67 answers, British English, sentence case, non-clinical disclaimers included, product-first placement preserved.
- `GLOSSARY.md` — Terms updated with Sawa/Akili Sawa/§67/voice/promptVersion/escalation/safety signals/transcript.

## Notes

Prototype ticket: deliverables are rough copy for human reaction. Voice matches spec: opening line fixed ("Hi, I'm Sawa. What's on your mind today?"), chat uses I, boundaries/disclaimers/safety/legal use Akili Sawa/we. Crisis-adjacent register deferred to ticket 17. Six answers, not four; below the product.

## Two spec corrections to settle here

**§67 has six questions, not four.** `IMPLEMENTATION-GAP-ANALYSIS.md:197` says "the four
explanatory questions". The spec (`AKILI SAWA WEBSITE, DIGITAL PLATFORM & PORTAL ARCHITECTURE.docx`
§67) and `SAWA-AI-NO-ACCOUNTS-APPROACH.md` §7 both say six. The spec wins. The six:

1. What is Sawa?
2. What can Sawa do?
3. What can't Sawa do?
4. When does a human become involved?
5. How is information protected?
6. How does institutional deployment work?

**§67's placement principle is the whole point.** From the spec:

> *"This is perhaps the most important UX principle in the new website. A visitor should not have to
> read five paragraphs explaining Sawa AI before understanding it… But the product itself should be
> immediately accessible."*

So: product first, answers **below** the fold, never above. If a visitor reads a paragraph before
typing, the design has failed.

## The voice decision

Already made on this map, and it is the right one:

> **Warm but bounded first person.** Sawa speaks as `I` inside the chat — a companion speaking in
> third person to someone who just typed "I don't know if I can keep going" reads as a policy
> document. But every boundary, disclaimer, safety message and legal statement stays in the house
> third person (`Akili Sawa`, `we`).

The split is by context, not by author:

| Surface | Register | Example |
|---|---|---|
| Chat, conversational | `I` — warm, plain, first person singular | *"That sounds heavy. Tell me more about the nights."* |
| Opening line (§9, verbatim) | `I` | *"Hi, I'm Sawa. What's on your mind today?"* |
| Crisis response | `Akili Sawa` — directive, third person | Mandated copy from ticket 17 |
| Safety disclosure in-chat | `Akili Sawa` | *"Akili Sawa may keep the last few messages of this conversation so a person can follow up."* |
| Capability limits | `Akili Sawa` | *"Akili Sawa cannot diagnose..."* |
| §67 answers | `Akili Sawa` | House legal-page register |

**§9's opening line is fixed by the spec and the mockup. Do not rewrite it.** It appears verbatim at
`Akili Sawa_ final site.html:120` and in the spec's §9. It is also the one piece of first-person
persona voice that already exists in the project's history — the exploration found the word "Sawa"
as a speaking subject nowhere else in 20 pages.

## Acceptance criteria

- [x] A written voice specification: registers per surface, the `I` / `Akili Sawa` split, what Sawa
      never says, and how it handles a user who asks a direct question it cannot answer.
      (Written as `docs/adr/voice-v1.md`)
- [x] All six §67 answers written in full, in house voice, British English, sentence case, with the
      §61 non-clinical disclaimer landing where it belongs. (Written as `docs/adr/67-answers-v1.md`)
- [x] Each answer is short enough that a visitor skims all six in under a minute. If an answer runs
      past four sentences, it is probably two answers.
- [x] Sawa's refusal register written: what it does when asked *"do you think I have depression?"*
      It must decline to diagnose while staying warm. §61 forbids sounding like an autonomous
      clinician; §11 forbids the "autonomous therapist or diagnostician" framing.
- [x] Crisis-adjacent register delegated to ticket 17 — this ticket defines the *voice*, not the
      mandated copy.
- [x] Recorded as an ADR at `docs/adr/`, and `GLOSSARY.md` updated if "Sawa" as a speaking subject
      needs a term. (Both done)

## Notes

Prototype ticket: the deliverable is rough copy the humans react to, not finished prose. Use the
Skill tool with `prototype`. A wrong voice discovered here costs nothing; discovered in ticket 15
after a prompt is versioned, it costs a re-review of the prompt artefact.

Constraint from the map's Notes that is easy to get wrong: **no exclamation marks, no emoji.**
`Akili Sawa`'s copy is calm and institutional throughout 20 existing pages. Sawa's first person is
the one place warmth is licensed — and it stays warmth, not enthusiasm.

One more thing worth deciding here, because it is a copy question and not an engineering one: does
Sawa ever use the visitor's name? There is no account, so there is no name. Probably not, but
stating it prevents someone adding a `firstName` field later and quietly reintroducing the
persona-plus-accounts problem this map exists to avoid.