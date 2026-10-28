/*
 * The safety detector (ticket 17).
 *
 * This is the highest-consequence code in the product. It runs on the user turn
 * *before* generation (SAWA-AI-NO-ACCOUNTS-APPROACH.md section 2), so the
 * pipeline decides whether a conversation continues, gets a mandated response,
 * or is routed for human follow-up - not the model.
 *
 *   detectUserTurn(text)   -> tier, behaviour, crisis copy, SafetySignal
 *   detectAssistantReply()  -> post-generation diagnosis/therapy check
 *
 * It fails closed: an unexpected input or an internal error returns the high
 * tier with the mandated copy, never the low tier. The error itself is not
 * surfaced anywhere. Under-classifying distress is the failure this design
 * refuses to make.
 *
 * The `SafetySignal` is the seam ticket 18's `EscalationSink` consumes. It
 * carries the capped excerpt and the promptVersion stamp; the TTL and the
 * transport are ticket 18's, not this module's.
 */

import { promptVersion } from "../prompt.js";
import {
  applyUserTurnRules,
  checkAssistantReply,
  classifyMatches,
  MAX_USER_TURN_CHARS,
  type Classification,
  type IntakeIssue,
  type IntakeResult,
  type ReplyCheck,
} from "./rules.js";
import { matchLexicon, type LexiconMatch } from "./lexicon.js";
import {
  TIER_BEHAVIOUR,
  type SeverityTier,
  type SignalCategory,
  type TierBehaviour,
} from "./tiers.js";
import { crisisResponseFor, type CrisisResponse } from "./crisisCopy.js";

export const MAX_EXCERPT_CHARS = 500;

export type SafetySignal = {
  readonly conversationId: string;
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
  readonly createdAt: string;
  readonly promptVersion: string;
  readonly excerpt: string;
};

export type Detection = {
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
  readonly matches: readonly LexiconMatch[];
  readonly intake: IntakeResult;
  readonly behaviour: TierBehaviour;
  readonly crisis: CrisisResponse | null;
  readonly signal: SafetySignal | null;
};

/*
 * Crisis copy is mandated in both languages (crisis-resources-v1.md). The
 * lexicon already records the language of the phrase that matched, so a turn
 * that matched a Kiswahili term gets the vetted Kiswahili block rather than
 * the English one.
 */
export function crisisTextFor(detection: Detection): string {
  if (!detection.crisis) return "";
  const matchedKiswahili = detection.matches.some(
    (match) => match.entry.lang === "sw"
  );
  return matchedKiswahili ? detection.crisis.text.sw : detection.crisis.text.en;
}

export type DetectionInput = {
  readonly text: string;
  readonly conversationId?: string;
  readonly now?: number;
};

export function capExcerpt(text: string, max: number = MAX_EXCERPT_CHARS): string {
  return text.length > max ? text.slice(0, max) : text;
}

function buildSignal(
  conversationId: string,
  tier: SeverityTier,
  categories: readonly SignalCategory[],
  excerpt: string,
  now: number,
): SafetySignal {
  return {
    conversationId,
    tier,
    categories,
    createdAt: new Date(now).toISOString(),
    promptVersion,
    excerpt: capExcerpt(excerpt),
  };
}

const EMPTY_INTAKE: IntakeResult = {
  issues: [],
  tooLong: false,
  promptInjection: false,
  piiSolicitation: false,
  ok: true,
};

/*
 * The high-tier detection returned when the input cannot be trusted. It emits
 * the mandated copy and a signal, exactly like a genuine high-severity turn,
 * so a failure is loud and safe rather than quiet and permissive.
 */
function failClosedDetection(conversationId: string, now: number): Detection {
  const issues: IntakeIssue[] = ["internal_error"];
  return {
    tier: "high",
    categories: [],
    matches: [],
    intake: { ...EMPTY_INTAKE, issues, ok: false },
    behaviour: TIER_BEHAVIOUR.high,
    crisis: crisisResponseFor("high", []),
    signal: buildSignal(conversationId, "high", [], "", now),
  };
}

export function detectUserTurn(input: DetectionInput): Detection {
  const source = input ?? {};
  const conversationId =
    typeof source.conversationId === "string" ? source.conversationId : "";
  const now = typeof source.now === "number" ? source.now : Date.now();

  if (typeof source.text !== "string") return failClosedDetection(conversationId, now);

  try {
    const { intake, matches, tier, categories } = applyUserTurnRules(source.text);
    const behaviour = TIER_BEHAVIOUR[tier];
    const crisis = behaviour.emitCrisisCopy ? crisisResponseFor(tier, categories) : null;
    const signal = behaviour.escalate
      ? buildSignal(conversationId, tier, categories, source.text, now)
      : null;

    return { tier, categories, matches, intake, behaviour, crisis, signal };
  } catch {
    return failClosedDetection(conversationId, now);
  }
}

/*
 * Post-generation check on Sawa's own reply. Ticket 20 discards a flagged
 * reply and emits a bounded refusal; this function only classifies.
 */
export function detectAssistantReply(reply: string): ReplyCheck {
  if (typeof reply !== "string") return { flagged: true, categories: ["diagnosis"] };
  return checkAssistantReply(reply);
}

/*
 * The crisis classification on its own, without the chat turn's intake rules.
 *
 * The feedback form (ticket 29) needs to know whether a free-text comment
 * carries crisis content, and `detectUserTurn` is the wrong tool for it: its
 * intake rules are about a conversation with a model (prompt injection,
 * soliciting someone's personal details), and neither means anything for a
 * form field that reaches no model. Flagging "remember my name" as an
 * intake issue would reject a perfectly ordinary comment.
 *
 * What the feedback form needs is the lexicon and the tiering, and nothing
 * else. So the seam is here, in the module that owns the lexicon, and one
 * place decides what counts as a crisis for both the chat and the form.
 *
 * The tier is returned rather than a boolean because the caller's response
 * depends on it: a high-severity comment gets the full crisis block, an
 * elevated one gets the shorter support block, and both come from
 * crisisCopy.ts so the copy is the mandated copy.
 */
export function classifyCrisisContent(text: string): Classification {
  if (typeof text !== "string") return { tier: "low", categories: [] };
  return classifyMatches(matchLexicon(text));
}

// Re-exported so consumers need only the detector entry point.
export { matchLexicon, MAX_USER_TURN_CHARS };
export type { Classification };
