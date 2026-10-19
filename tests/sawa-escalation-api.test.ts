import { afterEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return { emails: { send } };
  }),
}));

import handler from "../api/sawa-escalate";

const response = () => {
  let status = 200;
  let json: { message: string } | undefined;
  const res = {
    status(code: number) {
      status = code;
      return res;
    },
    json(body: { message: string }) {
      json = body;
      return res;
    },
  };
  return { res, get status() { return status; }, get json() { return json; } };
};

afterEach(() => {
  delete process.env.SAWA_ESCALATION_ENABLED;
  delete process.env.SAWA_ESCALATION_TO;
  delete process.env.RESEND_API_KEY;
  vi.restoreAllMocks();
  send.mockReset();
});

describe("server-side Sawa escalation endpoint", () => {
  it("rejects an excerpt that does not independently classify as high severity", async () => {
    const result = response();
    await handler({
      method: "POST",
      body: {
        conversationId: "conv-low-risk-1",
        excerpt: "I had a difficult day",
        ageConsentAccepted: true,
      },
    }, result.res);
    expect(result.status).toBe(400);
  });

  it("fails closed when no monitored escalation destination is configured", async () => {
    const result = response();
    await handler({
      method: "POST",
      body: {
        conversationId: "conv-high-risk-1",
        excerpt: "I want to kill myself",
        ageConsentAccepted: true,
      },
    }, result.res);
    expect(result.status).toBe(503);
    expect(result.json?.message).toContain("cannot send a support notification");
  });

  it("sends only the server-reclassified high-severity excerpt to the configured inbox", async () => {
    process.env.SAWA_ESCALATION_ENABLED = "true";
    process.env.SAWA_ESCALATION_TO = "support@example.test";
    process.env.RESEND_API_KEY = "test-mail-key";
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    const result = response();
    await handler({
      method: "POST",
      body: {
        conversationId: "conv-mail-high-1",
        excerpt: "I want to kill myself",
        ageConsentAccepted: true,
      },
    }, result.res);

    expect(result.status).toBe(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: "support@example.test",
      text: expect.stringContaining("I want to kill myself"),
    }));
    expect(send.mock.calls[0]?.[0]?.text).not.toContain("full conversation");
  });

  it("rejects an invalid method", async () => {
    const result = response();
    await handler({ method: "GET", body: {} }, result.res);
    expect(result.status).toBe(405);
  });
});
