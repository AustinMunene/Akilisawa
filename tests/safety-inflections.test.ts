import { describe, expect, it } from "vitest";

import { detectUserTurn } from "../src/lib/sawa/safety/detector";
import { matchLexicon } from "../src/lib/sawa/safety/lexicon";

/*
 * Inflected forms (ticket 29).
 *
 * A safety lexicon that only lists one form of a phrase misses the people it
 * exists for. Kiswahili verbs inflect for subject and tense, and English
 * contracts and inflect, so "nataka kufa" (I want to die) did not match
 * "ninataka kufa" (I really want to die) or "nimekujikata" (I have cut
 * myself). The turn classified as `low`, which means no crisis copy and no
 * escalation: the pipeline's own definition of under-classifying distress,
 * the failure it refuses to make.
 *
 * These forms are added to the lexicon explicitly rather than by stripping
 * prefixes off a word. A stripper has to guess where a prefix ends, and a
 * wrong guess turns a benign word into a crisis signal - the exact
 * inversion of what the lexicon is for. An explicit list is reviewable by
 * the person who has to sign the safety pipeline off.
 *
 * The false-positive cases are here too, because the anti-pattern this
 * module exists not to reproduce is a filter that rejects a person for
 * being in pain or for using ordinary wellbeing vocabulary.
 */
describe("inflected crisis language", () => {
  const high = [
    // Kiswahili: subject-inflected "I want to die".
    "ninataka kufa",
    "ninitaka kufa",
    // Kiswahili: negative and subject-inflected "I do not want to live".
    "nasitaki kuishi",
    "ninasitaki kuishi",
    // Kiswahili: the perfect and past forms of the self-harm infinitives.
    "nimekujikata",
    "nilikujikata",
    "nimekatakata",
    "nimekujiuwa",
    "nimekujiua",
    "nimekujidhuru",
    "nimekujiumiza",
    "nimekujichoma",
    // Kiswahili: "there is no reason to live" and "I am better off dead".
    "haina sababu ya kuishi",
    "nibora nife",
    // Kiswahili: "I have ended my life".
    "nimekumaliza maisha yangu",
    // English: contracted and inflected forms.
    "I am going to kill myself",
    "I have been self harming",
    "I am harming myself",
    "I am killing myself",
  ];

  it("classifies every inflected high-severity form as high", () => {
    for (const text of high) {
      const detection = detectUserTurn({ text, conversationId: "c1" });
      expect(detection.tier, `"${text}" should be high severity`).toBe("high");
    }
  });

  it("emits a signal for every inflected high-severity form", () => {
    for (const text of high) {
      const detection = detectUserTurn({ text, conversationId: "c1" });
      expect(detection.signal, `"${text}" should produce a signal`).not.toBeNull();
    }
  });

  const elevated = [
    // Kiswahili: inflected forms of the elevated-tier entries.
    "nimepindukia dawa",
    "nalipindukia dawa",
    "nimekubakwa",
    // English: the contracted and past forms of the child-safety ages.
    "I'm 16",
    "I'm 17",
    // English: inflected forms of the GBV disclosures.
    "I was abused",
    "he abused me",
    "I am being abused",
  ];

  it("classifies every inflected elevated-severity form as elevated", () => {
    for (const text of elevated) {
      const detection = detectUserTurn({ text, conversationId: "c1" });
      expect(detection.tier, `"${text}" should be elevated severity`).toBe("elevated");
    }
  });

  it("still matches the original uninflected forms", () => {
    for (const text of ["nataka kufa", "sitaki kuishi", "kujikata"]) {
      expect(
        matchLexicon(text).length,
        `"${text}" should still match the lexicon`
      ).toBeGreaterThan(0);
    }
  });

  /*
   * The false-positive guard. A safety filter that flags ordinary wellbeing
   * vocabulary is the api/contact.ts:21 anti-pattern: it rejected business
   * enquiries for containing "trauma" or "emergency". These must stay out.
   */
  it("does not flag ordinary wellbeing vocabulary", () => {
    const benign = [
      "the trauma support in the conversation was not enough for me",
      "I am tired but fine",
      "my work is stressful",
      "I feel anxious about the presentation",
      "the programme design is good",
    ];
    for (const text of benign) {
      const detection = detectUserTurn({ text, conversationId: "c1" });
      expect(detection.tier, `"${text}" should not be high severity`).not.toBe("high");
    }
  });

  it("does not flag a benign Kiswahili turn that merely starts like a crisis phrase", () => {
    const benign = [
      "ninasoma kitabu",
      "ninataka chakula",
      "nimefungua simu",
    ];
    for (const text of benign) {
      const detection = detectUserTurn({ text, conversationId: "c1" });
      expect(detection.tier, `"${text}" should not be high severity`).not.toBe("high");
    }
  });

  /*
   * A KNOWN LIMITATION, pinned so it stays visible rather than hidden.
   *
   * The indirect-reference euphemisms are matched on the phrase alone, so
   * "joining my brother" fires on a social invitation as readily as on the
   * crisis it is there to catch. That is the accepted shape of the
   * deterministic floor: the euphemism is ambiguous by definition, and the
   * list is the floor under a classifier that is not wired yet.
   *
   * It is NOT fixed here on purpose. The lexicon and the tier thresholds
   * are gated on clinical review (map ticket 17), and the existing test
   * asserts that "I have been thinking about joining my brother" alone is
   * high severity. Narrowing it is a clinical judgement about when an
   * ambiguous euphemism counts, so it is recorded for that review rather
   * than changed quietly in a copy fix.
   */
  it("KNOWN LIMITATION: an indirect-reference euphemism fires on its benign reading too", () => {
    const detection = detectUserTurn({
      text: "I have been thinking about joining my brother for lunch",
      conversationId: "c1",
    });
    expect(detection.tier).toBe("high");
  });
});
