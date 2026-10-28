import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../api/contact";

/*
 * Smoke tests for `api/contact.ts`.
 *
 * The handler is the reference for how the Sawa safety handlers should be shaped,
 * and its validation branches were entirely untested. Three things drive the
 * structure of this file:
 *
 *  1. `req`/`res` are `any` (house style, no @vercel/node), so the fakes below are
 *     plain objects. `res.status().json()` is the only chaining the handler uses.
 *  2. The rate limiter is a module-level `Map` keyed by IP, so each test uses a
 *     unique IP. Sharing one would let earlier tests consume later tests' quota.
 *  3. `Resend` is mocked, so no test can send email or need an API key.
 */

type JsonCall = { message: string };

const makeRes = () => {
  const calls: { status: number; body: JsonCall }[] = [];
  let current = 200;
  const res = {
    status(code: number) {
      current = code;
      return res;
    },
    json(body: JsonCall) {
      calls.push({ status: current, body });
      return res;
    },
  };
  return { res, calls, last: () => calls[calls.length - 1] };
};

const validPayload = {
  fullName: "Amina Yusuf",
  organisation: "Nairobi Health Collective",
  roleTitle: "Programme Director",
  workEmail: "amina@example.org",
  countryRegion: "Kenya",
  reason: "Research Collaboration",
  message: "We would like to discuss an evaluation partnership.",
};

// Unique per call so the rate limiter never bleeds between tests.
let ipCounter = 0;
const makeReq = (overrides: Record<string, unknown> = {}) => {
  ipCounter += 1;
  return {
    method: "POST",
    headers: { "x-forwarded-for": `203.0.113.${ipCounter}` },
    body: validPayload,
    ...overrides,
  };
};

const send = async (overrides: Record<string, unknown> = {}) => {
  const { res, calls, last } = makeRes();
  await handler(makeReq(overrides), res);
  return { calls, last };
};

const { sentEmails, sendMock } = vi.hoisted(() => ({
  sentEmails: [] as Record<string, unknown>[],
  sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendMock,
    };
  },
}));

describe("api/contact validation", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    sentEmails.length = 0;
    sendMock.mockReset();
    sendMock.mockImplementation(async (payload: Record<string, unknown>) => {
      sentEmails.push(payload);
      return { data: { id: "test" }, error: null };
    });
  });

  it("rejects every method other than POST", async () => {
    const { res, last } = makeRes();
    await handler({ ...makeReq(), method: "GET" }, res);
    expect(last().status).toBe(405);
  });

  it("silently accepts a submission that fills the honeypot field", async () => {
    /*
     * `companyWebsite` is the bot trap. It must answer 200 "Thank you." and stop,
     * before any validation or email - a bot should never learn which rule it hit.
     */
    const { calls } = await send({ body: { ...validPayload, companyWebsite: "http://spam.example" } });
    expect(calls).toHaveLength(1);
    expect(calls[0].status).toBe(200);
    expect(calls[0].body.message).toBe("Thank you.");
  });

  it("rejects a submission missing any required field", async () => {
    for (const field of [
      "fullName",
      "organisation",
      "roleTitle",
      "workEmail",
      "countryRegion",
      "reason",
      "message",
    ] as const) {
      const { last } = await send({ body: { ...validPayload, [field]: "" } });
      expect(last().status, `missing ${field} should be a 400`).toBe(400);
      expect(last().body.message).toBe("Invalid submission.");
    }
  });

  it("rejects a malformed work email", async () => {
    for (const bad of ["not-an-email", "missing@tld", "@nolocal.com", "spaces in@mail.com"]) {
      const { last } = await send({ body: { ...validPayload, workEmail: bad } });
      expect(last().status, `${bad} should be a 400`).toBe(400);
    }
  });

  it("enforces the 1000 character message cap", async () => {
    const { last } = await send({ body: { ...validPayload, message: "a".repeat(1001) } });
    expect(last().status).toBe(400);
  });

  it("accepts a message of exactly 1000 characters", async () => {
    const { last } = await send({ body: { ...validPayload, message: "a".repeat(1000) } });
    expect(last().status).toBe(200);
  });

  it("enforces the 300 character research interest cap", async () => {
    const { last } = await send({
      body: { ...validPayload, researchInterest: "r".repeat(301) },
    });
    expect(last().status).toBe(400);
  });

  /*
   * The most important test in this file. A message containing crisis language
   * must be refused and redirected to real help, never emailed to staff.
   */
  it("refuses crisis language and points to emergency services", async () => {
    for (const phrase of ["suicide", "self-harm", "kill myself"]) {
      const { last } = await send({ body: { ...validPayload, message: `I am thinking about ${phrase}.` } });
      expect(last().status, `"${phrase}" should be refused`).toBe(400);
      expect(last().body.message).toContain("emergency services");
    }
  });

  /*
   * The anti-pattern this replaced. The old filter was a flat list of ten
   * words including "trauma" and "emergency", so a B2B enquiry about a
   * trauma-informed programme or an emergency response team was rejected
   * (gap-analysis item 7.10). The guard is now the safety lexicon, and it
   * refuses on the tiers that mean the person needs help rather than a
   * reply.
   */
  it("accepts a business enquiry that uses ordinary wellbeing vocabulary", async () => {
    for (const phrase of ["trauma", "emergency", "substance misuse"]) {
      const { last } = await send({
        body: {
          ...validPayload,
          message: `We run a ${phrase} support programme for employers and would like to discuss a partnership.`,
        },
      });
      expect(last().status, `"${phrase}" should be accepted`).toBe(200);
    }
  });

  it("matches crisis phrases case-insensitively", async () => {
    const { last } = await send({ body: { ...validPayload, message: "SUICIDE" } });
    expect(last().status).toBe(400);
  });

  /*
   * The `support` flag tells the form this refusal is a redirect to help
   * rather than a problem with what was typed, so it can show the resources
   * instead of a generic error.
   */
  it("marks a crisis refusal so the form can show the support copy", async () => {
    const { last } = await send({
      body: { ...validPayload, message: "I am thinking about suicide." },
    });
    expect(last().status).toBe(400);
    expect((last().body as { support?: boolean }).support).toBe(true);
  });

  it("does not mark an ordinary rejection as a support case", async () => {
    const { last } = await send({ body: { ...validPayload, message: "" } });
    expect(last().status).toBe(400);
    expect((last().body as { support?: boolean }).support).toBeUndefined();
  });

  it("accepts a clean, valid submission", async () => {
    const { last } = await send();
    expect(last().status).toBe(200);
    expect(last().body.message).toBe("ok");
  });

  it("reports a 500 rather than throwing when the email key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const { last } = await send();
    expect(last().status).toBe(500);
    expect(last().body.message).toBe("Email service not configured.");
  });

  it("rate limits the sixth request from one IP within the window", async () => {
    const { res, calls } = makeRes();
    const ip = "198.51.100.77";
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      await handler(
        { method: "POST", headers: { "x-forwarded-for": ip }, body: { ...validPayload, companyWebsite: "x" } },
        res,
      );
    }
    expect(calls).toHaveLength(6);
    expect(calls[4].status).toBe(200);
    expect(calls[5].status).toBe(429);
    expect(calls[5].body.message).toContain("Too many requests");
  });

  it("takes the first entry when x-forwarded-for is a list", async () => {
    /*
   * A proxy chain sends "client, proxy1, proxy2". Rate limiting on the whole
   * string would let one client evade the limiter by rotating its chain, so
   * getClientIp must take the first hop.
   */
    const { last } = await send({
      headers: { "x-forwarded-for": "198.51.100.9, 10.0.0.1, 10.0.0.2" },
    });
    expect(last().status).toBe(200);
  });

  it("parses a JSON string body, as Vercel delivers it", async () => {
    const { last } = await send({ body: JSON.stringify(validPayload) });
    expect(last().status).toBe(200);
  });

  it("rejects malformed JSON instead of throwing", async () => {
    const { last } = await send({ body: '{"fullName":' });
    expect(last().status).toBe(400);
  });

  it("rejects a body that is not a plain object", async () => {
    const { last } = await send({ body: [] });
    expect(last().status).toBe(400);
  });

  it("rejects a reason outside the form's allowlist", async () => {
    /*
     * The reason reaches the email subject. An unlisted value could carry a
     * newline and a forged header, so only the six form options are accepted.
     */
    const { last } = await send({
      body: {
        ...validPayload,
        reason: "Research Collaboration\r\nBcc: attacker@example.org",
      },
    });
    expect(last().status).toBe(400);
  });

  it("rejects an email address carrying a second recipient", async () => {
    const { last } = await send({
      body: { ...validPayload, workEmail: "amina@example.org,attacker@example.org" },
    });
    expect(last().status).toBe(400);
  });

  it("caps fields that are not otherwise length-checked", async () => {
    const { last } = await send({
      body: { ...validPayload, fullName: "a".repeat(121) },
    });
    expect(last().status).toBe(400);
  });

  it("escapes visitor text in the internal HTML email", async () => {
    await send({
      body: {
        ...validPayload,
        message: 'Hello <script>alert(1)</script> & "friends"',
      },
    });
    const html = String(sentEmails[0]?.html ?? "");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&amp;");
  });
});

/*
 * The delivery contract (ticket 26).
 *
 * These tests exist because the handler shipped a defect that reported
 * success on every failed send. The Resend SDK resolves with
 * `{ data: null, error }` and never throws, so the old `try/catch` never
 * fired and the handler answered `200 ok` having sent nothing.
 *
 * The failure semantics decided here:
 *   - The TEAM copy is load-bearing. If it fails, the enquiry is lost, so
 *     the handler must not claim it was received. The visitor is told to
 *     try again.
 *   - The VISITOR's acknowledgement is best-effort. If the team copy
 *     landed, the enquiry is safe, and failing the whole request would
 *     make a visitor who was never acknowledged resubmit a duplicate.
 */
describe("api/contact delivery", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    sentEmails.length = 0;
    sendMock.mockReset();
    sendMock.mockImplementation(async (payload: Record<string, unknown>) => {
      sentEmails.push(payload);
      return { data: { id: "test" }, error: null };
    });
  });

  it("sends the enquiry to the team and an acknowledgement to the visitor", async () => {
    await send();
    expect(sentEmails).toHaveLength(2);
    expect(sentEmails[0]?.to).toBe("smile@akilisawa.com");
    expect(sentEmails[1]?.to).toBe("amina@example.org");
  });

  it("takes the team address from CONTACT_TO_EMAIL when it is set", async () => {
    process.env.CONTACT_TO_EMAIL = "team@example.test";
    await send();
    expect(sentEmails[0]?.to).toBe("team@example.test");
    delete process.env.CONTACT_TO_EMAIL;
  });

  it("fails the request when the provider rejects the team copy", async () => {
    /*
     * The regression. The provider answers with an error object and the
     * promise resolves, so a handler that only catches exceptions reports
     * success here. The live site did exactly this: every enquirer was
     * told their message had been received, and every message was dropped.
     */
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        message: "The akilisawa.com domain is not verified.",
        statusCode: 403,
      },
    });
    const { last } = await send();
    expect(last().status).toBe(500);
    expect(last().body.message).toBe("Unable to send message.");
  });

  it("fails the request when the provider throws", async () => {
    sendMock.mockRejectedValue(new Error("socket hang up"));
    const { last } = await send();
    expect(last().status).toBe(500);
    expect(last().body.message).toBe("Unable to send message.");
  });

  it("keeps the enquiry when only the visitor's acknowledgement fails", async () => {
    /*
     * The team copy landed, so the enquiry is safe. Failing the request
     * would tell a visitor to resubmit something we already have, and the
     * duplicate would land in the same inbox.
     */
    sendMock
      .mockResolvedValueOnce({ data: { id: "team" }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: {
          name: "validation_error",
          message: "Recipient rejected.",
          statusCode: 422,
        },
      });
    const { last } = await send();
    expect(last().status).toBe(200);
    expect(last().body.message).toBe("ok");
  });

  it("does not leak the provider's error message to the visitor", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        message: "The akilisawa.com domain is not verified.",
        statusCode: 403,
      },
    });
    const { last } = await send();
    expect(last().body.message).not.toContain("not verified");
  });

  it("reports a missing API key as a configuration problem", async () => {
    delete process.env.RESEND_API_KEY;
    const { last } = await send();
    expect(last().status).toBe(500);
    expect(last().body.message).toBe("Email service not configured.");
  });
});