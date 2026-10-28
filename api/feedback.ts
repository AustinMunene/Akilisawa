import { classifyCrisisContent } from "../src/lib/sawa/safety/detector.js";
import { sendMail, teamRecipient } from "./_mail.js";

/*
 * The product feedback endpoint (ticket 29).
 *
 * Feedback is a comment about the product, from a visitor who has just used
 * a wellbeing chat. It is not a business enquiry, so it does not go through
 * the contact form: that form is shaped for organisations (Organisation,
 * Role/Title, Work Email) and asking a person who just used a wellbeing
 * chat for a job title is the wrong instrument.
 *
 * TWO THINGS THIS ENDPOINT WILL NOT DO
 *
 * 1. It never carries the conversation. The site's position is that the
 *    transcript is held in the browser and never reaches the server, and
 *    /sawa-ai is where a reader is most likely to check that promise. The
 *    request carries a comment and a page, nothing else, and anything else
 *    sent is ignored rather than forwarded. "The chat felt unhelpful" is
 *    what arrives. Nothing more.
 *
 * 2. It never emails crisis content. Someone in difficulty may write their
 *    crisis into the comment box rather than into the chat, where the
 *    safety pipeline would catch it. The comment is classified with the
 *    same lexicon the chat uses, and a high-severity comment is refused and
 *    pointed at the crisis resources instead of being forwarded to a
 *    mailbox nobody is watching.
 *
 * The contact form's old phrase filter is the anti-pattern here: it
 * rejected any message containing "trauma" or "emergency", which is why
 * `classifyCrisisContent` exists in the safety module instead.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();

const MAX_COMMENT_CHARS = 2000;
const MAX_PAGE_CHARS = 120;

type FeedbackPayload = {
  comment?: string;
  page?: string;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
    res.status(429).json({ message: "Too many messages. Please try again later." });
    return;
  } else {
    record.count += 1;
  }

  let payload: FeedbackPayload;
  try {
    payload = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as FeedbackPayload;
  } catch {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (!isPlainObject(payload)) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  const comment = typeof payload.comment === "string" ? payload.comment.trim() : "";
  if (comment.length === 0 || comment.length > MAX_COMMENT_CHARS) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  /*
   * The page the comment was left on. A short, non-identifying label, so
   * the team can tell a comment from /sawa-ai apart from one from the Home
   * embed. It is capped and stripped of anything that could carry a header.
   */
  const rawPage = typeof payload.page === "string" ? payload.page : "";
  const page = rawPage
    .replace(/[^A-Za-z0-9/._-]/g, "")
    .slice(0, MAX_PAGE_CHARS);

  /*
   * The crisis guard. A comment at high severity carries active suicidal
   * intent or self-harm, which is not something to forward to a mailbox.
   * It is refused, and the visitor is pointed at the resources the same
   * safety pipeline shows in the chat.
   *
   * The `support` flag tells the client this was a refusal because of the
   * content, not a failure of the form. The person is shown where to get
   * help, which is the whole point of the guard.
   */
  const classification = classifyCrisisContent(comment);
  if (classification.tier === "high") {
    res.status(400).json({
      support: true,
      message:
        "We could not send that message. If you are in danger or thinking about harming yourself, please contact local emergency services or a trusted healthcare provider now. You can also call Kenya Red Cross on 1199, any time, day or night.",
    });
    return;
  }

  const body = [
    "New Sawa AI product feedback",
    "",
    `Received at: ${new Date().toISOString()}`,
    `Page: ${page || "unknown"}`,
    "",
    "Comment:",
    comment,
  ].join("\n");

  const outcome = await sendMail({
    to: teamRecipient(),
    subject: "Sawa AI product feedback",
    text: body,
    html: escapeHtml(body).replace(/\n/g, "<br />"),
  });

  if (!outcome.ok) {
    if (outcome.reason === "not-configured") {
      res.status(500).json({ message: "Feedback service not configured." });
      return;
    }
    res.status(500).json({ message: "Unable to send your feedback." });
    return;
  }

  res.status(200).json({ message: "ok" });
}
