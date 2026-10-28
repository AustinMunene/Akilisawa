# Safety lexicon coverage (v1)

Status: adopted (2026-10-22, ticket 31)
Source: ticket 31, found while building ticket 29

## Decision

The crisis lexicon lists the inflected forms of each phrase explicitly, in both English
and Kiswahili, rather than deriving them by stripping prefixes off a word. "i'm" is
expanded to "i am" during normalisation, because the child-safety ages are written "i am
16" and a visitor writes "I'm 16".

## Rationale

A safety lexicon that lists one form of a phrase misses the people it exists for. Kiswahili
verbs inflect for subject and tense, so "nataka kufa" (I want to die) did not match
"ninataka kufa" (I really want to die), and "kujikata" did not match "nimekujikata" (I
have cut myself). English contracts and inflections had the same problem: "self harm" did
not match "I have been self harming", and "i am 16" did not match "I'm 16".

The consequence was the failure `src/lib/sawa/safety/detector.ts` names as the one it
refuses to make. A turn in that form classified as `low`, which means
`continueOpenEnded: true`, `emitCrisisCopy: false`, `escalate: false`: an open-ended
wellbeing reply, no crisis resources, and no alert to the team.

The alternative - stripping prefixes to derive the forms - was rejected. A stripper has to
guess where a prefix ends, and a wrong guess turns a benign word into a crisis signal,
which is the exact inversion of what the lexicon is for. An explicit list can be read and
signed off by the person who has to sign the safety pipeline off, and the file already
worked this way: "kujikata" and "najikata" were both listed before this.

## Consequences

- The lexicon is longer. That is the cost of reviewability.
- The inflected entries were added to a list that a clinician has **not yet signed off**.
  Map ticket 17's clinical review is still open, and it now covers these entries too.
- The one behaviour this did **not** change is the indirect-reference euphemisms, which
  are still matched on the phrase alone and so fire on a social invitation as readily as
  on the crisis they exist to catch. Narrowing them is a clinical judgement about when an
  ambiguous euphemism counts, so it is pinned as a known limitation in
  `tests/safety-inflections.test.ts` and left for that review.
- The false-positive surface is pinned alongside the new coverage, because the anti-pattern
  this module exists not to reproduce is a filter that flags ordinary wellbeing
  vocabulary. `api/contact.ts:21`'s blocklist rejected business enquiries for containing
  "trauma" or "emergency".

## Notes

The gap was found while building the feedback endpoint, which reuses this lexicon for its
own crisis guard. It was live in the chat before that, not introduced by the feedback
work.
