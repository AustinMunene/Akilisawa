/*
 * The contact reasons, shared by the form and the API (tickets 27 and 28).
 *
 * WHY THIS IS ONE MODULE
 * The reason string is not decoration. It reaches the email subject line, so
 * `api/contact.ts` holds an allowlist of the exact strings the form can
 * produce, and a submission with anything else is a 400. When the form's
 * dropdown and the handler's allowlist were edited separately, they drifted:
 * the form could offer a reason the API would reject.
 *
 * So the list lives here, and both sides read it. `api/contact.ts` imports
 * it with a `.js` specifier, the way every other cross-boundary import in
 * this repo does.
 *
 * THE SLUGS
 * A slug is the stable, URL-safe handle used in `?reason=` links. The
 * published site already links to `sawa-account-waitlist` and
 * `scoping-conversation`, so both are kept as aliases for the reasons they
 * always meant. New links use the current slugs.
 *
 * See docs/adr/vocabulary-engagement-v1.md for why the partnership reason
 * no longer says "pilot".
 */

export type ContactReasonVariant =
  | "partnership"
  | "research"
  | "media"
  | "sawaAccount"
  | "institutional"
  | "fallback";

export type ContactReason = {
  /** The value submitted by the form and matched by the API allowlist. */
  readonly value: string;
  /** The stable handle used in `?reason=` links. */
  readonly slug: string;
  /** Which acknowledgement template the API sends back. */
  readonly variant: ContactReasonVariant;
  /** The extra field this reason asks the visitor to fill in, if any. */
  readonly requires: "organisationType" | "researchInterest" | "mediaOutlet" | null;
};

/*
 * The order here is the order of the dropdown. It is grouped the way a
 * visitor reads it: the partnership and deployment conversations first,
 * then the other two audiences.
 */
export const contactReasons: readonly ContactReason[] = [
  {
    value: "Partnership Discussion",
    slug: "partnership",
    variant: "partnership",
    requires: "organisationType",
  },
  {
    value: "Institutional Deployment Enquiry",
    slug: "institutional-deployment",
    variant: "institutional",
    requires: "organisationType",
  },
  {
    value: "Insurance / Financial Institution Collaboration",
    slug: "insurance",
    variant: "partnership",
    requires: "organisationType",
  },
  {
    value: "Employer / Workforce Program",
    slug: "workforce",
    variant: "partnership",
    requires: "organisationType",
  },
  {
    value: "Research Collaboration",
    slug: "research",
    variant: "research",
    requires: "researchInterest",
  },
  {
    value: "Sawa Account Enquiry",
    slug: "sawa-account",
    variant: "sawaAccount",
    requires: null,
  },
  {
    value: "General Organisational Enquiry",
    slug: "general",
    variant: "fallback",
    requires: null,
  },
  {
    value: "Media / Speaking Request",
    slug: "media",
    variant: "media",
    requires: "mediaOutlet",
  },
] as const;

/*
 * Slugs that were published on the site before the slugs were settled. A
 * visitor who followed one of these links should still land on the right
 * question, so they resolve to the reason they always meant.
 */
export const contactReasonAliases: Readonly<Record<string, string>> = {
  "sawa-account-waitlist": "sawa-account",
  "scoping-conversation": "partnership",
  "pilots": "partnership",
};

export const contactReasonValues: readonly string[] = contactReasons.map(
  (reason) => reason.value
);

export const findContactReason = (value: string): ContactReason | undefined =>
  contactReasons.find((reason) => reason.value === value);

/**
 * Resolve a `?reason=` slug to the reason the form should preselect.
 * Returns undefined for anything unrecognised, so an unknown slug leaves
 * the dropdown on "Select one" rather than silently choosing something
 * the visitor did not ask for.
 */
export const resolveContactReasonSlug = (slug: string | null): ContactReason | undefined => {
  if (!slug) return undefined;
  const normalised = slug.trim().toLowerCase();
  const resolved = contactReasonAliases[normalised] ?? normalised;
  return contactReasons.find((reason) => reason.slug === resolved);
};
