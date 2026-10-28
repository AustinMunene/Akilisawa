import type { SafetySignal } from "../src/lib/sawa/safety/detector.js";
import { escalationRecipient, escalationSender, sendMail } from "./_mail.js";

/*
 * The safety escalation sink (ticket 26).
 *
 * The alert goes to the same team mailbox as the contact form, so a human
 * reads enquiries and safety signals in one place. `SAWA_ESCALATION_TO`
 * can point it elsewhere, but it is never required.
 *
 * The send goes through the shared transport, which checks the provider's
 * answer. The old version of this file did check `result.error`; the
 * contact handler did not, and the two paths had drifted apart. One
 * transport now serves both, so they cannot drift again.
 *
 * NOTHING HERE LOGS
 * The provider's response and the flagged message are never written
 * anywhere. A failure is reported to the caller as a boolean, and the
 * excerpt is discarded rather than kept without the visitor being told.
 */

const lastNotificationAt = new Map<string, number>();
const COOLDOWN_MS = 15 * 60 * 1000;

/*
 * The escalation path is ON unless it is explicitly switched off.
 *
 * It used to require SAWA_ESCALATION_ENABLED=true and SAWA_ESCALATION_TO.
 * Neither was ever set, so the endpoint answered 503 on every safety
 * signal while `/sawa-ai` told visitors the flagged message "may also be
 * sent there" - a path the site described and the code never took.
 *
 * The recipient now defaults to the same team mailbox as the contact form,
 * so there is nothing left to configure. The flag stays as an off switch
 * for when the inbox is not being watched.
 */
function escalationEnabled(): boolean {
  return process.env.SAWA_ESCALATION_ENABLED !== "false";
}

export async function sendSafetyNotification(signal: SafetySignal): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!escalationEnabled() || !apiKey) return false;

  const recipient = escalationRecipient();
  const now = Date.now();
  const lastSent = lastNotificationAt.get(signal.conversationId);
  if (lastSent !== undefined && now - lastSent < COOLDOWN_MS) return true;

  const outcome = await sendMail({
    from: escalationSender(),
    to: recipient,
    subject: `Sawa AI safety signal (${signal.tier})`,
    text: [
      "A high-severity Sawa AI safety signal was detected.",
      `Conversation id: ${signal.conversationId}`,
      `Categories: ${signal.categories.join(", ") || "none"}`,
      `Prompt version: ${signal.promptVersion}`,
      `Detected at: ${signal.createdAt}`,
      "",
      "Flagged message excerpt (maximum 500 characters):",
      signal.excerpt,
      "",
      "This alert does not mean Akili Sawa has contacted emergency services.",
    ].join("\n"),
  });

  if (!outcome.ok) return false;
  lastNotificationAt.set(signal.conversationId, now);
  return true;
}
