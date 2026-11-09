/*
 * "This didn't help": an opt-in report on one Sawa reply.
 *
 * How Sawa improves without storing conversations. Nothing is kept by
 * default; a visitor who thinks a reply missed can choose to send that one
 * exchange (their message and Sawa's reply), plus an optional comment, to the
 * Akili Sawa team. The team turns it into a replay scenario
 * (tests/replay/scenarios.ts) and fixes Sawa until it passes.
 *
 * The consent is the Send button, pressed after the panel says exactly what
 * leaves the page. Never the rest of the conversation, never a name, never
 * the conversation id. api/feedback.ts stays as it was: it never carries the
 * conversation, and this is a separate endpoint so that promise stays true.
 */

import type { SawaLanguage } from "./language.js";
import { isFixedSafetyCopy } from "./safety/crisisCopy.js";

export const REPORT_ENDPOINT = "/api/sawa-report";
export const REPORT_MAX_MESSAGE = 1000;
export const REPORT_MAX_REPLY = 2000;
export const REPORT_MAX_COMMENT = 1000;

export type ReplyReport = {
  readonly message: string;
  readonly reply: string;
  readonly comment?: string;
  readonly language: SawaLanguage;
  readonly promptVersion: string;
};

const cap = (text: string, max: number) => (text.length > max ? text.slice(0, max) : text);

export function buildReport(input: {
  readonly message: string;
  readonly reply: string;
  readonly comment?: string;
  readonly language: SawaLanguage;
  readonly promptVersion: string;
}): ReplyReport {
  const comment = input.comment?.trim();
  return {
    message: cap(input.message.trim(), REPORT_MAX_MESSAGE),
    reply: cap(input.reply.trim(), REPORT_MAX_REPLY),
    ...(comment ? { comment: cap(comment, REPORT_MAX_COMMENT) } : {}),
    language: input.language,
    promptVersion: input.promptVersion,
  };
}

/*
 * Which assistant turns get the button, mapped to the visitor message each
 * one answered: Sawa's own replies only. Not the opening line (nothing to
 * answer), and not the system's fixed safety copy (not Sawa's words).
 */
export function reportableReplies(
  messages: readonly { readonly id: string; readonly role: "user" | "assistant"; readonly content: string }[],
): Map<string, string> {
  const reportable = new Map<string, string>();
  let lastUser: string | null = null;
  for (const message of messages) {
    if (message.role === "user") {
      lastUser = message.content;
    } else if (lastUser !== null && !isFixedSafetyCopy(message.content)) {
      reportable.set(message.id, lastUser);
    }
  }
  return reportable;
}

export type ReportCopy = {
  readonly open: string;
  readonly explain: string;
  readonly commentLabel: string;
  readonly send: string;
  readonly cancel: string;
  readonly sent: string;
  readonly failed: string;
};

// Kiswahili pending the native review.
export const reportCopy: Readonly<Record<SawaLanguage, ReportCopy>> = {
  en: {
    open: "This didn't help",
    explain:
      "Send this to the Akili Sawa team so we can improve Sawa? Only your message above and this reply are sent, with anything you add below. Not the rest of the conversation, and not your name. This is not monitored for emergencies.",
    commentLabel: "What would have helped? (optional)",
    send: "Send",
    cancel: "Cancel",
    sent: "Thank you. This helps us make Sawa better.",
    failed: "That did not send. You can try again later.",
  },
  sw: {
    open: "Hili halikusaidia",
    explain:
      "Utume hii kwa timu ya Akili Sawa ili tuboreshe Sawa? Ni ujumbe wako hapo juu na jibu hili pekee yatatumwa, pamoja na chochote utaongeza hapa chini. Si mazungumzo yote, na si jina lako. Hii haifuatiliwi kwa dharura.",
    commentLabel: "Nini kingekusaidia? (si lazima)",
    send: "Tuma",
    cancel: "Ghairi",
    sent: "Asante. Hii inatusaidia kuboresha Sawa.",
    failed: "Haikutumwa. Unaweza kujaribu tena baadaye.",
  },
};
