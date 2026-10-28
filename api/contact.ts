import {
  contactReasonValues,
  findContactReason,
  type ContactReasonVariant,
} from "../src/lib/contact.js";
import { classifyCrisisContent } from "../src/lib/sawa/safety/detector.js";
import {
  sendMail,
  sender,
  teamRecipient,
} from "./_mail.js";

type ContactPayload = {
  fullName: string;
  organisation: string;
  roleTitle: string;
  workEmail: string;
  countryRegion: string;
  reason: string;
  organisationType?: string;
  researchInterest?: string;
  mediaOutlet?: string;
  message: string;
  companyWebsite?: string;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();

/*
 * The crisis guard for the contact form.
 *
 * It used to be a flat list of ten words, including "trauma" and "emergency",
 * so a B2B enquiry about a trauma-informed programme or an emergency
 * response team was rejected. That is the anti-pattern the safety lexicon
 * exists not to reproduce (gap-analysis item 7.10).
 *
 * Now it is the same bilingual lexicon the chat uses, and it refuses only on
 * the tiers that mean the person needs help rather than a reply: `high` and
 * `elevated`. A message that merely mentions trauma, or a substance-crisis
 * programme, is an enquiry, and it is answered.
 *
 * The levels 2 and 3 routes on /sawa-ai send individual visitors here, so
 * the guard has to work for a person as well as for an organisation.
 */
const REFUSED_TIERS = new Set(["high", "elevated"]);

/*
 * Every reason the contact form can submit, taken from the shared list so
 * the dropdown and the allowlist cannot drift apart. Anything else is
 * rejected rather than reaching the subject line or the responder-template
 * lookup. The reason reaches the email subject, so an unlisted value could
 * carry a newline and a forged header.
 */
const allowedReasons = new Set<string>(contactReasonValues);

// Untrusted lengths are capped before anything is formatted into an email.
const MAX_FIELD_LENGTHS: Record<string, number> = {
  fullName: 120,
  organisation: 160,
  roleTitle: 120,
  workEmail: 200,
  countryRegion: 80,
  reason: 80,
  message: 1000,
  organisationType: 80,
  researchInterest: 300,
  mediaOutlet: 120,
};

const responderTemplates = {
  partnership: {
    subject: "Thank you for your enquiry — Akili Sawa",
    body: `Thank you for reaching out to Akili Sawa.

We have received your enquiry regarding a potential collaboration or engagement. Our team reviews all partnership requests to ensure alignment with our preventive, non-clinical scope.

If there is a fit, we will follow up to propose a scoping conversation.

Kind regards,
Akili Sawa Team`,
  },
  research: {
    subject: "Thank you for your research enquiry — Akili Sawa",
    body: `Thank you for contacting Akili Sawa regarding a potential research collaboration.

We work with research partners on preventive mental wellbeing interventions that are ethically grounded and evaluation-ready. Your message has been received and will be reviewed by the appropriate team member.

We will follow up if there is alignment.

Best regards,
Akili Sawa Team`,
  },
  media: {
    subject: "Media enquiry received - Akili Sawa",
    body: `Thank you for your interest in Akili Sawa.

Media and speaking requests are reviewed on a case-by-case basis. We will be in touch if appropriate.

Kind regards,
Akili Sawa Team`,
  },
  sawaAccount: {
    subject: "Thank you for your Sawa account enquiry - Akili Sawa",
    body: `Thank you for reaching out to Akili Sawa about a Sawa account.

Sawa conversations are available now without an account, and the conversation is held in your browser. A Sawa account will add history, check-ins, and follow-ups, with consent controls you can see and change.

Your enquiry has been received and will be reviewed by our team.

Kind regards,
Akili Sawa Team`,
  },
  institutional: {
    subject: "Thank you for your deployment enquiry - Akili Sawa",
    body: `Thank you for reaching out to Akili Sawa about an institutional deployment.

Akili Sawa can be deployed through an employer, SACCO, insurer, government, or NGO programme. Deployment is designed to add programme check-ins, benefits, and support pathways, and institutions see aggregate insight rather than private conversations.

Your enquiry has been received and we will follow up to propose a scoping conversation.

Kind regards,
Akili Sawa Team`,
  },
  fallback: {
    subject: "Thank you for contacting Akili Sawa",
    body: `Thank you for reaching out to Akili Sawa.

Please note that Akili Sawa provides preventive, non-clinical mental wellbeing support and does not offer individual therapy or crisis services.

Your message has been received and will be reviewed.

Sincerely,
Akili Sawa Team`,
  },
};

const getVariantKey = (reason: string): ContactReasonVariant =>
  findContactReason(reason)?.variant ?? "fallback";

/*
 * Whether the message needs a person rather than a reply. The tiers come
 * from the shared safety lexicon, so the contact form and the chat agree on
 * what counts as crisis content.
 */
const needsSupportNotReply = (value: string) => {
  const classification = classifyCrisisContent(value);
  return REFUSED_TIERS.has(classification.tier);
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Contact fields are visitor-supplied. They are escaped before being placed in
// the internal HTML email so a submission cannot forge markup or links.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getClientIp = (req: { headers: Record<string, string | string[]> }) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim();
  return "unknown";
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
    res.status(429).json({ message: "Too many requests. Please try again." });
    return;
  } else {
    record.count += 1;
  }

  let payload: ContactPayload;
  try {
    payload = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as ContactPayload;
  } catch {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (!isPlainObject(payload)) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (payload.companyWebsite) {
    res.status(200).json({ message: "Thank you." });
    return;
  }

  const requiredFields = [
    "fullName",
    "organisation",
    "roleTitle",
    "workEmail",
    "countryRegion",
    "reason",
    "message",
  ] as const;

  const missingOrNotText = requiredFields.some(
    (field) => typeof payload[field] !== "string" || payload[field].trim() === ""
  );

  if (missingOrNotText) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  const overLength = Object.entries(MAX_FIELD_LENGTHS).some(([field, max]) => {
    const value = payload[field as keyof ContactPayload];
    return value !== undefined && (typeof value !== "string" || value.length > max);
  });

  if (overLength) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (!allowedReasons.has(payload.reason)) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  // Deliberately narrow: no commas, quotes, semicolons or angle brackets, so a
  // submission cannot smuggle extra recipients or header content.
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(payload.workEmail)) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (needsSupportNotReply(payload.message)) {
    /*
     * `support` tells the form this refusal is a redirect to help, not a
     * problem with what was typed. The visitor is shown where to get
     * support, which is the whole point of the guard.
     */
    res.status(400).json({
      support: true,
      message:
        "We cannot process this message. Please contact local emergency services or a trusted healthcare provider.",
    });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    res.status(500).json({ message: "Email service not configured." });
    return;
  }

  const fromEmail = sender();
  const timestamp = new Date().toISOString();
  const variant = responderTemplates[getVariantKey(payload.reason)];

  const internalBody = `
New Akili Sawa contact submission

Timestamp: ${timestamp}
Reason: ${payload.reason}

Full Name: ${payload.fullName}
Organisation: ${payload.organisation}
Role / Title: ${payload.roleTitle}
Work Email: ${payload.workEmail}
Country / Region: ${payload.countryRegion}

Organisation Type: ${payload.organisationType || "N/A"}
Research Interest: ${payload.researchInterest || "N/A"}
Outlet / Event Name: ${payload.mediaOutlet || "N/A"}

Message:
${payload.message}
`.trim();

  /*
   * THE DELIVERY CONTRACT (ticket 26).
   *
   * The Resend SDK does not throw on an API error: it resolves with
   * `{ data: null, error }`. The handler this replaced awaited the send
   * inside a try/catch that could never fire, and answered `200 ok` on
   * every failed send - telling every enquirer their message had been
   * received while dropping it. The live site did this for as long as the
   * domain was unverified.
   *
   * The two copies have different weights:
   *   - The TEAM copy is load-bearing. If it fails the enquiry is gone, so
   *     the request must fail and the visitor is told to try again.
   *   - The VISITOR's acknowledgement is best-effort. The enquiry has
   *     already landed, and failing the request would invite a duplicate
   *     into the same inbox.
   */
  const teamCopy = await sendMail({
    from: fromEmail,
    to: teamRecipient(),
    subject: `New Contact Request: ${payload.reason}`,
    text: internalBody,
    html: escapeHtml(internalBody).replace(/\n/g, "<br />"),
  });

  if (!teamCopy.ok) {
    if (teamCopy.reason === "not-configured") {
      res.status(500).json({ message: "Email service not configured." });
      return;
    }
    res.status(500).json({ message: "Unable to send message." });
    return;
  }

  // The enquiry is safe. A failed acknowledgement is not worth a retry.
  await sendMail({
    from: fromEmail,
    to: payload.workEmail,
    subject: variant.subject,
    text: variant.body,
    html: variant.body.replace(/\n/g, "<br />"),
  });

  res.status(200).json({ message: "ok" });
}

