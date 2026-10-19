/*
 * The deterministic safety rules (ticket 17).
 *
 * Two checks live here, matching the two distinct checks in
 * SAWA-AI-NO-ACCOUNTS-APPROACH.md section 2:
 *
 *   1. intake + classification on the user turn, before generation
 *   2. a post-generation check on Sawa's own reply, so section 11's
 *      prohibition on diagnosis and therapy is enforced rather than trusted
 *
 * The intake checks are flags, not gates. A message that trips the
 * prompt-injection check still goes through signal detection: injection can
 * never suppress a safety signal, and the regression test in tests/safety.test.ts
 * pins that. Nothing here rejects a person for being in pain.
 *
 * api/contact.ts:21 (`sensitivePhrases`) is the anti-pattern this file exists
 * not to reproduce: it rejected any enquiry containing "trauma" or "emergency".
 */

import { highestTier, type SeverityTier, type SignalCategory } from "./tiers.js";
import { matchLexicon, type LexiconMatch } from "./lexicon.js";

export const MAX_USER_TURN_CHARS = 1000;

export type IntakeIssue =
  | "too_long"
  | "prompt_injection"
  | "pii_solicitation"
  | "internal_error";

export type IntakeResult = {
  readonly issues: readonly IntakeIssue[];
  readonly tooLong: boolean;
  readonly promptInjection: boolean;
  readonly piiSolicitation: boolean;
  readonly ok: boolean;
};

const PROMPT_INJECTION_PATTERNS: readonly RegExp[] = [
  /\bignore\b[\s\S]{0,24}\b(previous|prior|above|earlier)\b/i,
  /\bignore\b[\s\S]{0,24}\b(instructions?|rules?|guidelines?|prompt)\b/i,
  /\bdisregard\b[\s\S]{0,24}\b(instructions?|rules?|safety|prompt)\b/i,
  /\b(reveal|show|print|repeat|leak)\b[\s\S]{0,24}\b(system\s*)?prompt\b/i,
  /\b(you are now|from now on you|pretend to be|act as if|jailbreak|developer mode)\b/i,
  /\bpuuza\b[\s\S]{0,24}\b(maagizo|sheria|kanuni)\b/i,
  /\bsahau\b[\s\S]{0,24}\b(maagizo|sheria)\b/i,
  /\b(nionyeshe|nifichue|nirudie)\b[\s\S]{0,24}\bmaagizo\b/i,
];

const PII_SOLICITATION_PATTERNS: readonly RegExp[] = [
  /\b(remember|store|save|collect|keep)\b[\s\S]{0,24}\bmy\b[\s\S]{0,24}\b(name|number|phone|id|email|address|location)\b/i,
  /\bask me for my\b[\s\S]{0,24}\b(personal|id|phone|email|address)\b/i,
  /\bsend (me )?(the )?(form|link)\b[\s\S]{0,24}\b(details|id|personal)\b/i,
];

const matchesAny = (patterns: readonly RegExp[], text: string): boolean =>
  patterns.some((pattern) => pattern.test(text));

export function checkIntake(text: string): IntakeResult {
  const tooLong = text.length > MAX_USER_TURN_CHARS;
  const promptInjection = matchesAny(PROMPT_INJECTION_PATTERNS, text);
  const piiSolicitation = matchesAny(PII_SOLICITATION_PATTERNS, text);

  const issues: IntakeIssue[] = [];
  if (tooLong) issues.push("too_long");
  if (promptInjection) issues.push("prompt_injection");
  if (piiSolicitation) issues.push("pii_solicitation");

  return {
    issues,
    tooLong,
    promptInjection,
    piiSolicitation,
    ok: issues.length === 0,
  };
}

export type Classification = {
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
};

export function classifyMatches(matches: readonly LexiconMatch[]): Classification {
  if (matches.length === 0) return { tier: "low", categories: [] };
  const categories = [...new Set(matches.map((match) => match.entry.category))];
  const tier = highestTier(matches.map((match) => match.entry.tier));
  return { tier, categories };
}

/*
 * Convenience: intake and classification together. Kept pure so the detector
 * can wrap it in a single fail-closed guard.
 */
export type UserTurnRules = {
  readonly intake: IntakeResult;
  readonly matches: readonly LexiconMatch[];
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
};

export function applyUserTurnRules(text: string): UserTurnRules {
  const intake = checkIntake(text);
  const matches = matchLexicon(text);
  const { tier, categories } = classifyMatches(matches);
  return { intake, matches, tier, categories };
}

/*
 * Post-generation check. Sawa's reply is scanned before it streams to the
 * client. If it crossed into diagnosis, medication or a therapy claim, the
 * caller discards it and emits a bounded refusal instead (section 11).
 */
export type ReplyCategory = "diagnosis" | "medication" | "therapy_claim";

export type ReplyCheck = {
  readonly flagged: boolean;
  readonly categories: readonly ReplyCategory[];
};

const REPLY_PATTERNS: readonly { category: ReplyCategory; pattern: RegExp }[] = [
  {
    category: "diagnosis",
    pattern:
      /\byou (have|are suffering from|are dealing with|are experiencing)\b[\s\S]{0,32}\b(depression|anxiety|ptsd|bipolar|adhd|ocd|schizophrenia|a disorder|a condition|mental illness)\b/i,
  },
  { category: "diagnosis", pattern: /\b(my|your) diagnosis\b/i },
  { category: "diagnosis", pattern: /\bi (diagnose|can diagnose)\b/i },
  { category: "diagnosis", pattern: /\byou (definitely|certainly|clearly) have\b/i },
  {
    category: "medication",
    pattern:
      /\b(take|increase|reduce|stop|adjust|change|double)\b[\s\S]{0,24}\b(medication|dose|dosage|pills|antidepressants?|ssris?)\b/i,
  },
  {
    category: "medication",
    // Do not mistake Sawa's required boundary (for example, "I do not
    // prescribe") for prescription advice. Actual claims or offers to
    // prescribe remain blocked here; dosage and medication instructions are
    // covered by the rule above.
    pattern:
      /\b(?:i|we|akili sawa)\s+(?!(?:do not|don't|cannot|can't|never)\b)(?:(?:can|will|would)\s+)?prescrib(?:e|ing|ed|es)\b/i,
  },
  {
    category: "therapy_claim",
    pattern: /\bi am (your|a) (therapist|psychiatrist|psychologist|counsellor|clinician)\b/i,
  },
  { category: "therapy_claim", pattern: /\bthis will (cure|fix|treat)\b/i },
];

export function checkAssistantReply(reply: string): ReplyCheck {
  const categories: ReplyCategory[] = [];
  for (const { category, pattern } of REPLY_PATTERNS) {
    if (pattern.test(reply) && !categories.includes(category)) {
      categories.push(category);
    }
  }
  return { flagged: categories.length > 0, categories };
}
