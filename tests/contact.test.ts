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

const { sentEmails } = vi.hoisted(() => ({
  sentEmails: [] as Record<string, unknown>[],
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn(async (payload: Record<string, unknown>) => {
        sentEmails.push(payload);
        return { id: "test" };
      }),
    };
  },
}));

describe("api/contact validation", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    sentEmails.length = 0;
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
    for (const phrase of ["suicide", "self-harm", "kill myself", "rape", "trauma"]) {
      const { last } = await send({ body: { ...validPayload, message: `I am thinking about ${phrase}.` } });
      expect(last().status, `"${phrase}" should be refused`).toBe(400);
      expect(last().body.message).toContain("emergency services");
    }
  });

  it("matches crisis phrases case-insensitively", async () => {
    const { last } = await send({ body: { ...validPayload, message: "SUICIDE" } });
    expect(last().status).toBe(400);
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