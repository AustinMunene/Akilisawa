/*
 * Severity tiers and signal categories (ticket 17).
 *
 * Detection classifies, it does not merely flag (SAWA-AI-NO-ACCOUNTS-APPROACH.md
 * section 2). The tier decides the behaviour, so these definitions are the
 * governance artefact the ticket asks for: get the thresholds in writing and
 * encode them here, or the next engineer silently moves them.
 *
 * Maps to docs/adr/crisis-resources-v1.md's severity mapping:
 *   low       distress, no risk present            continue, watch
 *   elevated  passive thoughts, recent self-harm,  continue with care, offer
 *             GBV disclosure, substance crisis       human support
 *   high      active suicidal intent, self-harm    short-circuit, mandated
 *             in progress, immediate danger          crisis copy, escalate
 *   abuse     malicious or high-volume shapes      decline, no crisis channel
 *
 * The tiers are deliberately few and their behaviours are distinct. A single
 * confidence threshold cannot separate "I am very tired" from "I have been
 * thinking about ending my life" (section 2).
 */

export type SeverityTier = "low" | "elevated" | "high" | "abuse";

export type SignalCategory =
  | "distress"
  | "suicidal_ideation"
  | "self_harm"
  | "indirect_reference"
  | "harm_to_others"
  | "gbv"
  | "substance_crisis"
  | "child_safety"
  | "abuse"
  | "prompt_injection";

export type TierBehaviour = {
  readonly label: SeverityTier;
  readonly continueOpenEnded: boolean;
  readonly offerHumanSupport: boolean;
  readonly emitCrisisCopy: boolean;
  readonly escalate: boolean;
};

export const TIER_BEHAVIOUR: Readonly<Record<SeverityTier, TierBehaviour>> = {
  low: {
    label: "low",
    continueOpenEnded: true,
    offerHumanSupport: false,
    emitCrisisCopy: false,
    escalate: false,
  },
  elevated: {
    label: "elevated",
    continueOpenEnded: true,
    offerHumanSupport: true,
    emitCrisisCopy: true,
    escalate: false,
  },
  high: {
    label: "high",
    continueOpenEnded: false,
    offerHumanSupport: true,
    emitCrisisCopy: true,
    escalate: true,
  },
  abuse: {
    label: "abuse",
    continueOpenEnded: false,
    offerHumanSupport: false,
    emitCrisisCopy: false,
    escalate: false,
  },
};

/*
 * Distress outranks abuse, and high outranks everything: safety first, and a
 * person who is both distressed and rude is a person in distress, not spam.
 */
const TIER_ORDER: readonly SeverityTier[] = ["low", "abuse", "elevated", "high"];

export function highestTier(tiers: readonly SeverityTier[]): SeverityTier {
  let best: SeverityTier = "low";
  for (const tier of tiers) {
    if (TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(best)) best = tier;
  }
  return best;
}
