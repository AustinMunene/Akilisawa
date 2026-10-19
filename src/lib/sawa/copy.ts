/*
 * Copy for the §10 access levels (ticket 12) and the §9 fork (owned here, wired
 * in ticket 20). Voice is voice-v1: these are boundaries and explanations, so
 * they stay in the house third person (`Akili Sawa`), never the chat's `I`.
 *
 * Levels 2 and 3 are not shipped. They are described honestly and never given a
 * control that implies a capability that does not exist. `Create your Sawa
 * account` is reserved here and routes to /contact as waitlist capture, per
 * SAWA-AI-NO-ACCOUNTS-APPROACH.md §7 — no stub sign-up form.
 */

export type AccessLevelCta =
  | { kind: "scroll"; label: string }
  | { kind: "link"; label: string; to: string };

export type AccessLevel = {
  id: "public" | "registered" | "institutional";
  level: number;
  name: string;
  who: string;
  body: string;
  available: boolean;
  cta?: AccessLevelCta;
};

const accountWaitlistPath = "/contact?reason=sawa-account-waitlist";

export const sawaFork = {
  continueWithSawa: {
    label: "Continue with Sawa",
    note: "Reopens the conversation held in this browser.",
  },
  createAccount: {
    label: "Create your Sawa account",
    note: "Sawa accounts are not available yet. This records your interest as a waitlist enquiry.",
    to: accountWaitlistPath,
  },
} as const;

export const accessLevels: AccessLevel[] = [
  {
    id: "public",
    level: 1,
    name: "Public",
    who: "Anyone",
    body: "Begin a first conversation with Sawa. No account and no sign-in are needed, and the conversation is held in this browser. Level 1 is for adults aged 18 and over.",
    available: true,
    cta: { kind: "scroll", label: "Talk to Sawa AI" },
  },
  {
    id: "registered",
    level: 2,
    name: "Registered",
    who: "Sawa user",
    body: "Not open yet. A Sawa account will add history, check-ins and follow-ups, with consent controls. Until then, this records your interest as a waitlist enquiry.",
    available: false,
    cta: {
      kind: "link",
      label: sawaFork.createAccount.label,
      to: accountWaitlistPath,
    },
  },
  {
    id: "institutional",
    level: 3,
    name: "Institutional",
    who: "Enrolled through a programme",
    body: "Akili Sawa can be deployed through an employer, SACCO, insurer, government or NGO programme. Deployment is designed to add programme check-ins, benefits and support pathways. Institutions see aggregate insight, never private conversations.",
    available: false,
  },
];

/*
 * Copy for ticket 13: the capability-boundary band and the safety-flow strip.
 * These are the site's answer to "is this a real clinical tool or not".
 *
 * The band describes the safety pipeline as architecture, never as a live
 * status readout, and it does not claim a staffing service level: the humans
 * have not confirmed the escalation inbox is monitored, so the copy stays with
 * the mechanism (the ticket's sanctioned "Right" wording) and the crisis
 * resources stay conceptual, aligned with the principles in
 * docs/adr/crisis-resources-v1.md. Numbers themselves live in the in-chat block
 * of ticket 17, not on this static page.
 */

export const capabilityBoundary = {
  heading: "What Sawa can and cannot do",
  can: "Akili Sawa can listen, ask clarifying questions and help you identify an appropriate next step.",
  cannot:
    "Akili Sawa cannot diagnose, treat or prescribe medication, and it cannot provide emergency care.",
  thesis: "AI identifies patterns. Humans provide context. People make decisions.",
  transcript:
    "Your conversation is held in this browser rather than on our servers.",
  privacyLabel: "Read about privacy",
  privacyTo: "/privacy",
} as const;

export const safetyFlow = {
  kicker: "The safety flow",
  steps: [
    "Conversation",
    "Signal detection",
    "Safety rules",
    "Triage",
    "Human support",
    "Follow-up",
  ],
  architecture:
    "This is how Sawa AI is built, not a live readout of this conversation.",
  mechanism:
    "Sawa AI checks messages against safety rules before generation. A high-severity signal stops the open-ended reply and shows crisis resources. When an escalation inbox is configured, the flagged message may also be sent there; the inbox is not monitored for emergencies and no immediate response is guaranteed.",
  crisis:
    "In a crisis, Sawa shares support line details so you can reach someone directly. Akili Sawa does not call on your behalf.",
} as const;

/*
 * Copy for ticket 14: the six §67 answers, verbatim from
 * docs/adr/67-answers-v1.md, rendered below the product by Faq67.tsx.
 *
 * Placement is the point (§67): product first, answers below. Option B
 * (hybrid) is chosen over all-collapsed: questions 3 and 5 are the two a
 * sceptical visitor arrives with — what Sawa cannot do, and how information
 * is protected — so they open by default and the rest stay collapsed. Voice
 * is house third person (`Akili Sawa`/`we`), British English, sentence case.
 * Question 5 carries the /privacy link required by ticket 14; the answer text
 * itself is unchanged.
 */

export type Faq67Item = {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
  privacyTo?: string;
  privacyLabel?: string;
};

export const faq67: {
  heading: string;
  intro: string;
  items: Faq67Item[];
} = {
  heading: "Common questions",
  intro: "Short answers to what people ask before they begin.",
  items: [
    {
      id: "what-is-sawa",
      question: "What is Sawa?",
      answer:
        "Sawa AI is a preventive, non-clinical support companion. Sawa is an AI conversation interface designed to help people reflect, clarify and explore next steps in a safe, bounded space. It is not a replacement for professional care.",
    },
    {
      id: "what-can-sawa-do",
      question: "What can Sawa do?",
      answer:
        "Sawa AI can listen, ask clarifying questions, reflect back what you have shared and help you identify clear next steps. It can also point you towards general information and resources when that is helpful. Its role is to support reflection and navigation, not assessment.",
    },
    {
      id: "what-cant-sawa-do",
      question: "What can't Sawa do?",
      answer:
        "Sawa AI cannot diagnose, treat or prescribe medication. It cannot provide emergency care, legal advice or crisis intervention. It is not a therapist, psychiatrist, psychologist or other licensed clinician. If you need urgent care, contact local emergency services or a trusted healthcare provider.",
      defaultOpen: true,
    },
    {
      id: "when-human-involved",
      question: "When does a human become involved?",
      answer:
        "Sawa AI is designed for self-directed reflection. A high-severity signal stops the open-ended reply and shows crisis resources. When an escalation inbox is configured, the flagged message may be sent for human review, but the inbox is not monitored for emergencies and no immediate response is guaranteed. You can also choose to connect with a professional.",
    },
    {
      id: "how-information-protected",
      question: "How is information protected?",
      answer:
        "Your transcript is held in this browser. Messages are sent to the configured AI provider to generate replies. If a high-severity safety signal is detected, the flagged message may be sent to Akili Sawa's designated support inbox; email retention depends on that inbox's settings. The Privacy notice explains the current provider and data handling before real-user use is enabled.",
      defaultOpen: true,
      privacyTo: "/privacy",
      privacyLabel: "Read about privacy",
    },
    {
      id: "institutional-deployment",
      question: "How does institutional deployment work?",
      answer:
        " Sawa AI can be deployed in organisational settings to support prevention and early navigation. Deployments are configured with clear boundaries, appropriate safeguards and roles. Institutional access is designed to protect individual privacy: organisations see aggregated insights where relevant, never private conversation details.",
    },
  ],
};
