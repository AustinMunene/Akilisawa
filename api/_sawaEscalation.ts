import { Resend } from "resend";
import type { SafetySignal } from "../src/lib/sawa/safety/detector.js";

const lastNotificationAt = new Map<string, number>();
const COOLDOWN_MS = 15 * 60 * 1000;

export async function sendSafetyNotification(signal: SafetySignal): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.SAWA_ESCALATION_TO;
  if (
    process.env.SAWA_ESCALATION_ENABLED !== "true" ||
    !apiKey ||
    !recipient
  ) return false;

  const now = Date.now();
  const lastSent = lastNotificationAt.get(signal.conversationId);
  if (lastSent !== undefined && now - lastSent < COOLDOWN_MS) return true;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.SAWA_ESCALATION_FROM || "no-reply@akilisawa.com",
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
    if (result.error) return false;
    lastNotificationAt.set(signal.conversationId, now);
    return true;
  } catch {
    // Never log the provider response or the flagged message.
    return false;
  }
}
