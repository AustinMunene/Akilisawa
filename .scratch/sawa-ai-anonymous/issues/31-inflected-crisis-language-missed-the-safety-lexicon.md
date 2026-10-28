# 31: Inflected crisis language missed the safety lexicon

**Type:** research · HITL
**Blocked by:** none

**Claimed by:** opencode (agent)
**Status:** closed 22 October 2026 — the gap is fixed; one behaviour is left for clinical review

## Question

Does the safety lexicon actually catch crisis language in the forms people write it, or
only in the forms the list was written in?

## How it was found

While building ticket 29. The feedback endpoint's crisis guard was going to reuse the
safety lexicon, so the lexicon had to be trustworthy. It was not.

**The gap:** the lexicon listed one form of each phrase, and Kiswahili verbs inflect for
subject and tense. A person writing "ninataka kufa" (I really want to die) or "nimekujikata"
(I have cut myself) matched nothing.

**The consequence:** the turn classified as `low`. Low means `continueOpenEnded: true`,
`emitCrisisCopy: false`, `escalate: false`. So the person got an open-ended wellbeing
reply, no crisis resources, and no alert to the team. This is under-classifying distress,
which `src/lib/sawa/safety/detector.ts` names as the failure the design refuses to make.

**It was live in the chat, not just the feedback box.** The detector is the same module
either way.

## The evidence

```
"nataka kufa"        -> tier=high      "ninataka kufa"        -> tier=low
"sitaki kuishi"      -> tier=high      "nasitaki kuishi"      -> tier=low
"kujikata"           -> tier=high      "nimekujikata"         -> tier=low
"kujiuwa"            -> tier=high      "nimekujiuwa"          -> tier=low
"kujidhuru"          -> tier=high      "nimekujidhuru"        -> tier=low
"kupindukia dawa"    -> tier=elevated  "nimepindukia dawa"    -> tier=low
"i am 16"            -> tier=elevated  "I'm 16"               -> tier=low
"self harm"          -> tier=high      "I have been self harming" -> tier=low
```

## The answer

### The inflected forms are now listed explicitly

Not derived by stripping prefixes off a word. A stripper has to guess where a prefix
ends, and a wrong guess turns a benign word into a crisis signal - the exact inversion of
what the lexicon is for. An explicit list can be read and signed off by the person who has
to sign the safety pipeline off.

**Kiswahili.** `ninataka kufa`, `ninitaka kufa`, `nasitaki kuishi`,
`ninasitaki kuishi`, `nasitaki kuendelea`, `haina sababu ya kuishi`, `nibora nife`,
`nimekumaliza maisha yangu`, `nalimaliza maisha yangu`, `nimekujiuwa`, `nimekujiua`,
`nilikujiuwa`, `nimekujikata`, `nilikujikata`, `nimekatakata`, `nimekujidhuru`,
`nimekujiumiza`, `nimekujichoma`, `nimepindukia dawa`, `nalipindukia dawa`,
`nimekubakwa`.

**English.** `killing myself`, `harming myself`, `self harming`, `was abused`,
`abused me`, `being abused`.

**One normalisation change.** `i'm` is expanded to `i am` before the apostrophe is
stripped. The lexicon's child-safety ages are written "i am 16" and a visitor writes
"I'm 16"; stripping the apostrophe alone turns the second into "im 16", which matches
nothing. Only that one contraction is expanded - the others do not need it, because the
lexicon lists both the contracted and the expanded form of each.

### The false-positive surface is pinned alongside

The anti-pattern this module exists not to reproduce is `api/contact.ts:21`'s blocklist,
which rejected B2B enquiries for containing "trauma" or "emergency". So the tests assert
that ordinary wellbeing vocabulary stays out ("the trauma support in the conversation was
not enough for me", "my work is stressful", "I feel anxious about the presentation"), and
that a benign Kiswahili turn which merely starts like a crisis phrase stays out
("ninasoma kitabu", "ninataka chakula", "nimefungua simu").

### What was NOT changed, and why

**The indirect-reference euphemisms are still matched on the phrase alone.** So
"joining my brother" fires on a social invitation ("I have been thinking about joining my
brother for lunch") as readily as on the crisis it exists to catch.

This is left alone deliberately:

- The behaviour **pre-dates this ticket** - the entry was already there and already fired
  on the benign reading.
- The existing test asserts that "I have been thinking about joining my brother" alone is
  `high` severity. Narrowing it changes what the reviewed pipeline does.
- The lexicon and the tier thresholds are **gated on clinical review** (map ticket 17:
  "Needs clinical review of the tier thresholds"). Deciding when an ambiguous euphemism
  counts is a clinical judgement, not a copy fix.

So it is **pinned as a known limitation** in `tests/safety-inflections.test.ts`, in a test
named `KNOWN LIMITATION:`, and the comment says what it is and where the decision belongs.
It stays visible rather than hidden, and it is recorded here for that review.

## Acceptance

- [x] Every inflected high-severity form in either language classifies as `high` and emits
      a signal.
- [x] Every inflected elevated-severity form classifies as `elevated`.
- [x] The original uninflected forms still match.
- [x] Ordinary wellbeing vocabulary and benign Kiswahili turns are not flagged.
- [x] The known limitation is pinned, not silently changed.
- [x] `npm run verify` passes.

## What still needs a human

The clinical review of the indirect-reference euphemisms, and of the new inflected entries.
They were added to the list that a clinician has not yet signed off, and that review is
still open on map ticket 17.
