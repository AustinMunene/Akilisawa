import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The shared mail transport (ticket 26).
 *
 * This is the seam where Akili Sawa talks to Resend. Two rules are load-bearing
 * here, and both came from a defect that shipped:
 *
 *   1. The Resend SDK does NOT throw on an API error. It resolves with
 *      `{ data: null, error }`. A handler that awaits a send and returns 200
 *      has checked nothing. Every send must inspect `result.error`.
 *   2. A provider rejection is a delivery failure. "Sent" means the provider
 *      accepted the message, not that the SDK call returned.
 *
 * The outcome deliberately carries a status code but never the provider's
 * message: an error body can echo content, and nothing downstream needs it.
 */

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return { emails: { send } };
  }),
}));

import {
  DEFAULT_TEAM_EMAIL,
  escalationRecipient,
  escalationSender,
  sendMail,
  sender,
  teamRecipient,
} from "../api/_mail";

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  delete process.env.CONTACT_FROM_EMAIL;
  delete process.env.RESEND_FROM_EMAIL;
  delete process.env.SAWA_ESCALATION_TO;
  delete process.env.SAWA_ESCALATION_FROM;
  vi.restoreAllMocks();
  send.mockReset();
});

describe("mail address resolution", () => {
  it("sends team mail to CONTACT_TO_EMAIL when it is set", () => {
    process.env.CONTACT_TO_EMAIL = "team@example.test";
    expect(teamRecipient()).toBe("team@example.test");
  });

  it("falls back to the known team mailbox when CONTACT_TO_EMAIL is absent", () => {
    expect(teamRecipient()).toBe(DEFAULT_TEAM_EMAIL);
    expect(DEFAULT_TEAM_EMAIL).toBe("smile@akilisawa.com");
  });

  it("sends from RESEND_FROM_EMAIL, then CONTACT_FROM_EMAIL, then the default", () => {
    expect(sender()).toBe(DEFAULT_TEAM_EMAIL);
    process.env.CONTACT_FROM_EMAIL = "from-config@example.test";
    expect(sender()).toBe("from-config@example.test");
    process.env.RESEND_FROM_EMAIL = "from-override@example.test";
    expect(sender()).toBe("from-override@example.test");
  });

  it("sends escalation mail to the same team mailbox as the contact form", () => {
    /*
     * The escalation alert and the contact enquiry land in one inbox, so a
     * human reads them in one place. SAWA_ESCALATION_TO can still point
     * elsewhere, but it is never required.
     */
    expect(escalationRecipient()).toBe(DEFAULT_TEAM_EMAIL);
    process.env.CONTACT_TO_EMAIL = "team@example.test";
    expect(escalationRecipient()).toBe("team@example.test");
    process.env.SAWA_ESCALATION_TO = "safety@example.test";
    expect(escalationRecipient()).toBe("safety@example.test");
  });

  it("sends escalation mail from the same sender as everything else", () => {
    process.env.CONTACT_FROM_EMAIL = "from-config@example.test";
    expect(escalationSender()).toBe("from-config@example.test");
    process.env.SAWA_ESCALATION_FROM = "escalation-from@example.test";
    expect(escalationSender()).toBe("escalation-from@example.test");
  });
});

describe("the mail transport", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-mail-key";
  });

  it("reports success only when the provider accepted the message", async () => {
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    const outcome = await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
    });
    expect(outcome.ok).toBe(true);
  });

  /*
   * The regression this whole module exists for. The SDK resolves with
   * `{ data: null, error }` and never rejects, so a transport that only
   * caught exceptions would report success on a 403.
   */
  it("reports a provider rejection as a failure rather than throwing", async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        message: "The akilisawa.com domain is not verified.",
        statusCode: 403,
      },
    });
    const outcome = await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reason).toBe("rejected");
      expect(outcome.statusCode).toBe(403);
    }
  });

  it("reports a transport exception as a failure", async () => {
    send.mockRejectedValue(new Error("socket hang up"));
    const outcome = await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("transport-error");
  });

  it("reports a missing API key as a failure", async () => {
    delete process.env.RESEND_API_KEY;
    const outcome = await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("not-configured");
    expect(send).not.toHaveBeenCalled();
  });

  it("never carries the provider's message in the failure", async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        message: "The akilisawa.com domain is not verified.",
        statusCode: 403,
      },
    });
    const outcome = await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
    });
    expect(JSON.stringify(outcome)).not.toContain("not verified");
  });

  it("sends the message to the address it was given", async () => {
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    await sendMail({
      to: "someone@example.test",
      subject: "Hello",
      text: "Body",
      html: "<p>Body</p>",
    });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "someone@example.test",
        subject: "Hello",
        text: "Body",
        html: "<p>Body</p>",
      })
    );
  });
});
