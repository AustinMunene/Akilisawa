import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return { emails: { send } };
  }),
}));

import handler from "../api/feedback";

/*
 * The feedback endpoint (ticket 29).
 *
 * Two properties matter more than anything else here.
 *
 * 1. IT NEVER CARRIES THE TRANSCRIPT. The site's whole position is that the
 *    conversation is held in the browser and never reaches the server.
 *    /sawa-ai is the page where a reader is most likely to check that
 *    promise, so a feedback endpoint that shipped the transcript would
 *    break it in the most visible place possible. The request carries a
 *    comment and nothing else, and the endpoint ignores anything else it
 *    is sent.
 *
 * 2. A COMMENT CARRYING CRISIS CONTENT IS NOT EMAILED. Someone who has just
 *    used a wellbeing chat may write their crisis into the comment box
 *    rather than into the chat, where the safety pipeline would catch it.
 *    The endpoint classifies the comment with the same lexicon the chat
 *    uses, and a high-severity comment is refused and pointed at the crisis
 *    resources instead of being forwarded to a mailbox.
 */
const response = () => {
  let status = 200;
  let json: { message: string; [key: string]: unknown } | undefined;
  const res = {
    status(code: number) {
      status = code;
      return res;
    },
    json(body: { message: string; [key: string]: unknown }) {
      json = body;
      return res;
    },
  };
  return { res, get status() { return status; }, get json() { return json; } };
};

let ipCounter = 0;
const post = async (body: unknown) => {
  ipCounter += 1;
  const result = response();
  await handler(
    {
      method: "POST",
      headers: { "x-forwarded-for": `198.51.100.${ipCounter}` },
      body,
    },
    result.res
  );
  return result;
};

beforeEach(() => {
  process.env.RESEND_API_KEY = "test-mail-key";
  send.mockReset();
  send.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  vi.restoreAllMocks();
});

describe("the feedback endpoint", () => {
  it("rejects every method other than POST", async () => {
    const result = response();
    await handler({ method: "GET", body: {} }, result.res);
    expect(result.status).toBe(405);
  });

  it("accepts a comment and delivers it to the team mailbox", async () => {
    const result = await post({ comment: "The conversation was genuinely helpful." });
    expect(result.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "smile@akilisawa.com",
        text: expect.stringContaining("The conversation was genuinely helpful."),
      })
    );
  });

  it("rejects an empty comment", async () => {
    const result = await post({ comment: "   " });
    expect(result.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a comment over the length cap", async () => {
    const result = await post({ comment: "a".repeat(2001) });
    expect(result.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("never carries the conversation transcript", async () => {
    /*
     * A client that tried to smuggle the transcript through would be
     * ignored: only the comment and the page it was left on are sent.
     */
    await post({
      comment: "It helped.",
      transcript: ["user: I feel low", "sawa: tell me more"],
      conversationId: "conv-secret-1234",
      messages: [{ role: "user", content: "I feel low" }],
    });
    const sent = send.mock.calls[0]?.[0] as { text: string; html?: string };
    expect(sent.text).not.toContain("conv-secret-1234");
    expect(sent.text).not.toContain("I feel low");
    expect(sent.text).not.toContain("transcript");
  });

  it("refuses a comment carrying crisis content and does not email it", async () => {
    const result = await post({
      comment: "I want to kill myself and the bot was no help at all",
    });
    expect(result.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
    expect(String(result.json?.message)).toContain("emergency services");
  });

  /*
   * The client needs to tell a refusal apart from a broken form, so the
   * response says which it is. Without this the visitor sees a red error
   * and no idea that the point of the refusal was to point them at help.
   */
  it("marks a crisis refusal so the client can show the support copy", async () => {
    const result = await post({ comment: "I want to end my life" });
    expect(result.status).toBe(400);
    expect(result.json?.support).toBe(true);
  });

  it("does not mark an ordinary rejection as a support case", async () => {
    const result = await post({ comment: "   " });
    expect(result.status).toBe(400);
    expect(result.json?.support).toBeUndefined();
  });

  it("refuses a comment carrying crisis content in Kiswahili", async () => {
    const result = await post({ comment: "ninataka kufa, Sawa haikusaidia" });
    expect(result.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("accepts a comment that uses ordinary wellbeing vocabulary", async () => {
    /*
     * The contact form's old filter rejected any message containing
     * "trauma" or "emergency", which is why the safety lexicon exists
     * instead. A comment about trauma is a comment, and it is accepted.
     */
    const result = await post({
      comment: "The trauma support in the conversation was not enough for me.",
    });
    expect(result.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("does not leak the provider's error message back to the visitor", async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        message: "The akilisawa.com domain is not verified.",
        statusCode: 403,
      },
    });
    const result = await post({ comment: "A useful observation." });
    expect(result.status).toBe(500);
    expect(String(result.json?.message)).not.toContain("not verified");
  });

  it("rate limits a visitor who submits repeatedly", async () => {
    const ip = "203.0.113.200";
    const result = response();
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await handler(
        {
          method: "POST",
          headers: { "x-forwarded-for": ip },
          body: { comment: "Repeated feedback." },
        },
        result.res
      );
    }
    expect(result.status).toBe(429);
  });

  it("takes the recipient from CONTACT_TO_EMAIL when it is set", async () => {
    process.env.CONTACT_TO_EMAIL = "team@example.test";
    await post({ comment: "A useful observation." });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "team@example.test" })
    );
    delete process.env.CONTACT_TO_EMAIL;
  });
});
