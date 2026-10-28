import { Resend } from "resend";

/*
 * The one place Akili Sawa talks to Resend (ticket 26).
 *
 * WHY THIS EXISTS
 * Two independent defects stopped the contact form from delivering. This
 * module closes the code half of one of them and owns the other.
 *
 * 1. THE SDK DOES NOT THROW ON AN API ERROR.
 *    `resend.emails.send()` resolves with `{ data: null, error }` when
 *    Resend rejects a request. It does not reject the promise and it does
 *    not throw. A handler that awaits a send inside a `try/catch` and
 *    reports success has checked nothing at all: the catch never fires and
 *    the error is silently dropped.
 *
 *    The live symptom, confirmed against the deployed site: a POST to
 *    /api/contact returned `200 {"message":"ok"}` while Resend rejected
 *    the send with a 403 because the domain was unverified. Every enquirer
 *    was told their message had been received, and every message was
 *    discarded.
 *
 * 2. ADDRESSES WERE HARDCODED.
 *    The recipient was a literal in the handler while `CONTACT_TO_EMAIL`
 *    sat in the environment, unused. Every address now resolves here.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 * It does not log. It does not return the provider's error message, because
 * an error body can echo content that came from a visitor, and nothing
 * downstream needs it. A caller gets a reason and a status code, and
 * decides for itself what to tell the visitor.
 *
 * See docs/adr/mail-delivery-contract-v1.md.
 */

/** The mailbox Akili Sawa reads. The default for both mail paths. */
export const DEFAULT_TEAM_EMAIL = "smile@akilisawa.com";

/*
 * Why "sent" is not the same as "delivered", and what the codes mean:
 *   not-configured  - no API key, so nothing was attempted
 *   rejected        - the provider refused the message (bad address, domain
 *                     not verified, revoked key). It was NOT sent.
 *   transport-error - the call itself failed, so we do not know either way
 */
export type MailFailureReason = "not-configured" | "rejected" | "transport-error";

export type MailOutcome =
  | { ok: true }
  | { ok: false; reason: MailFailureReason; statusCode: number | null };

export type MailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly from?: string;
};

/*
 * The team mailbox. Everything a human is meant to read lands here, which
 * is why the contact form and the safety escalation share it by default:
 * one inbox, one place to look.
 */
export function teamRecipient(): string {
  return process.env.CONTACT_TO_EMAIL || DEFAULT_TEAM_EMAIL;
}

/* The sender for ordinary mail. */
export function sender(): string {
  return process.env.RESEND_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || DEFAULT_TEAM_EMAIL;
}

/* The escalation destination. Defaults to the same team mailbox. */
export function escalationRecipient(): string {
  return process.env.SAWA_ESCALATION_TO || teamRecipient();
}

/* The escalation sender. Defaults to the same sender as everything else. */
export function escalationSender(): string {
  return process.env.SAWA_ESCALATION_FROM || sender();
}

/**
 * Send one message. Resolves to `ok: true` only when the provider accepted
 * it. Never throws.
 */
export async function sendMail(message: MailMessage): Promise<MailOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "not-configured", statusCode: null };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: message.from ?? sender(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    });

    /*
     * The check the old handler did not make. The SDK reports a rejection
     * here, in the resolved value, and nowhere else.
     */
    if (result.error) {
      return {
        ok: false,
        reason: "rejected",
        statusCode: result.error.statusCode ?? null,
      };
    }

    return { ok: true };
  } catch {
    // The provider's own error text is deliberately not carried out of here.
    return { ok: false, reason: "transport-error", statusCode: null };
  }
}
