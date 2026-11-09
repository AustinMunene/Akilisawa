import { promptVersion as currentPromptVersion } from "../src/lib/sawa/prompt.js";
import {
  REPORT_MAX_COMMENT,
  REPORT_MAX_MESSAGE,
  REPORT_MAX_REPLY,
} from "../src/lib/sawa/report.js";
import { sendMail, teamRecipient } from "./_mail.js";

/*
 * The opt-in "This didn't help" report (src/lib/sawa/report.ts).
 *
 * Carries exactly one exchange the visitor chose to send: their message,
 * Sawa's reply, an optional comment, the language and the prompt version.
 * Anything else in the request is ignored. No conversation id, no history.
 * The email goes to the team mailbox so the exchange can become a replay
 * scenario.
 *
 * Unlike api/feedback.ts this does not refuse crisis content: the exchanges
 * that most need improving are the hard ones, and the visitor has already
 * been shown the support lines in the chat. The panel says plainly that this
 * is not monitored for emergencies, and the email says so at the top.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();

const getClientIp = (req: { headers: Record<string, string | string[]> }) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim();
  return "unknown";
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now - record.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, start: now });
  } else if (record.count >= RATE_LIMIT_MAX) {
    res.status(429).json({ message: "Too many reports. Please try again later." });
    return;
  } else {
    record.count += 1;
  }

  let payload: any;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  const message = text(payload?.message, REPORT_MAX_MESSAGE);
  const reply = text(payload?.reply, REPORT_MAX_REPLY);
  if (!message || !reply) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }
  const comment =
    payload?.comment === undefined ? null : text(payload.comment, REPORT_MAX_COMMENT);
  if (payload?.comment !== undefined && comment === null && String(payload.comment).trim() !== "") {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }
  const language = payload?.language === "sw" ? "sw" : "en";
  const promptVersion =
    typeof payload?.promptVersion === "string" && /^[0-9.]{1,10}$/.test(payload.promptVersion)
      ? payload.promptVersion
      : "unknown";

  const body = [
    "Sawa AI: a visitor reported a reply that did not help",
    "",
    "Sent by the visitor's choice. Not an emergency report: this inbox is not monitored for emergencies.",
    "",
    `Received at: ${new Date().toISOString()}`,
    `Language: ${language}`,
    `Prompt version: ${promptVersion} (live: ${currentPromptVersion})`,
    "",
    "Their message:",
    message,
    "",
    "Sawa's reply:",
    reply,
    "",
    "What would have helped:",
    comment ?? "(nothing added)",
    "",
    "Next step: add this exchange to tests/replay/scenarios.ts and fix Sawa until it passes.",
  ].join("\n");

  const outcome = await sendMail({
    to: teamRecipient(),
    subject: "Sawa AI: reply reported as unhelpful",
    text: body,
    html: escapeHtml(body).replace(/\n/g, "<br />"),
  });

  if (!outcome.ok) {
    res.status(500).json({ message: "Unable to send your report." });
    return;
  }

  res.status(200).json({ message: "ok" });
}
