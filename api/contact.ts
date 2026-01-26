import { Resend } from "resend";

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

const sensitivePhrases = [
  "suicide",
  "self-harm",
  "kill myself",
  "kill me",
  "end my life",
  "abuse",
  "assault",
  "rape",
  "trauma",
  "emergency",
];

const reasonVariants = {
  partnership: new Set([
    "Pilot or Partnership Discussion",
    "Insurance / Financial Institution Collaboration",
    "Employer / Workforce Program",
    "General Organisational Enquiry",
  ]),
  research: new Set(["Research Collaboration"]),
  media: new Set(["Media / Speaking Request"]),
};

const responderTemplates = {
  partnership: {
    subject: "Thank you for your enquiry — Akili Sawa",
    body: `Thank you for reaching out to Akili Sawa.

We have received your enquiry regarding a potential collaboration or pilot. Our team reviews all partnership requests to ensure alignment with our preventive, non-clinical scope.

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
    subject: "Media enquiry received — Akili Sawa",
    body: `Thank you for your interest in Akili Sawa.

Media and speaking requests are reviewed on a case-by-case basis. We will be in touch if appropriate.

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

const getVariantKey = (reason: string) => {
  if (reasonVariants.partnership.has(reason)) return "partnership";
  if (reasonVariants.research.has(reason)) return "research";
  if (reasonVariants.media.has(reason)) return "media";
  return "fallback";
};

const containsSensitiveContent = (value: string) => {
  const lower = value.toLowerCase();
  return sensitivePhrases.some((phrase) => lower.includes(phrase));
};

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

  const payload: ContactPayload =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (payload.companyWebsite) {
    res.status(200).json({ message: "Thank you." });
    return;
  }

  if (
    !payload.fullName ||
    !payload.organisation ||
    !payload.roleTitle ||
    !payload.workEmail ||
    !payload.countryRegion ||
    !payload.reason ||
    !payload.message
  ) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.workEmail)) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if ((payload.message || "").length > 1000) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if ((payload.researchInterest || "").length > 300) {
    res.status(400).json({ message: "Invalid submission." });
    return;
  }

  if (containsSensitiveContent(payload.message || "")) {
    res.status(400).json({
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

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@akilisawa.com";
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

  try {
    await resend.emails.send({
      from: fromEmail,
      to: "smile@akilisawa.com",
      subject: `New Contact Request: ${payload.reason}`,
      text: internalBody,
      html: internalBody.replace(/\n/g, "<br />"),
    });

    await resend.emails.send({
      from: fromEmail,
      to: payload.workEmail,
      subject: variant.subject,
      text: variant.body,
      html: variant.body.replace(/\n/g, "<br />"),
    });

    res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: "Unable to send message." });
  }
}
