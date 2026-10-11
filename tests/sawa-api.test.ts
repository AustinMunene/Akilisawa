import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler, { extractDeltaText } from "../api/sawa";

/*
 * Smoke tests for `api/sawa.ts` (ticket 16).
 *
 * These cover the guards and the failure paths, not a live provider: `fetch` is
 * stubbed, so no test touches the network or needs a real key. Three things
 * shape the file:
 *
 *  1. `req`/`res` are `any`, so the fakes are plain objects. The handler only
 *     needs `status`/`json` for errors and `setHeader`/`write`/`end` for SSE.
 *  2. The turn and IP Maps are module-level and survive between tests, so each
 *     test uses a unique conversation id and IP - the same trick as
 *     `tests/contact.test.ts`.
 *  3. The SSE success path is exercised end to end against a `ReadableStream`,
 *     which is enough to prove the delta parser and the event framing.
 */

const successBody = [
  'data: {"choices":[{"delta":{"content":"Hello"}}]}',
  "",
  'data: {"choices":[{"delta":{"content":" world"}}]}',
  "",
  "data: [DONE]",
  "",
].join("\n");

const sseResponse = () => ({
  ok: true,
  status: 200,
  body: new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(successBody));
      controller.close();
    },
  }),
});

const makeRes = () => {
  let statusCode = 200;
  let jsonBody: { message: string } | undefined;
  const headers: Record<string, string> = {};
  const chunks: string[] = [];
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    flushHeaders() {},
    write(chunk: string) {
      chunks.push(String(chunk));
      return true;
    },
    end(chunk?: string) {
      if (chunk) chunks.push(String(chunk));
      return res;
    },
    json(body: { message: string }) {
      jsonBody = body;
      return res;
    },
  };
  return {
    res,
    get status() {
      return statusCode;
    },
    get json() {
      return jsonBody;
    },
    headers,
    text: () => chunks.join(""),
  };
};

// Unique per call so the limiter never bleeds between tests.
let ipCounter = 0;
const makeReq = (overrides: Record<string, unknown> = {}) => {
  ipCounter += 1;
  return {
    method: "POST",
    headers: { "x-forwarded-for": `203.0.113.${ipCounter}` },
    body: { conversationId: `conv-${ipCounter}-abcdef`, message: "Hello Sawa" },
    ...overrides,
  };
};

const send = async (overrides: Record<string, unknown> = {}) => {
  const fake = makeRes();
  await handler(makeReq(overrides), fake.res);
  return fake;
};

const configureProvider = () => {
  process.env.SAWA_MODEL_PROVIDER = "mistral";
  process.env.MISTRAL_API_KEY = "test-key";
  process.env.MISTRAL_BASE_URL = "https://api.eu.mistral.ai/v1";
  process.env.MISTRAL_MODEL = "mistral-small-4";
};

beforeEach(() => {
  configureProvider();
  vi.stubGlobal("fetch", vi.fn(async () => sseResponse()));
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.SAWA_PROVIDER_TIMEOUT_MS;
});

describe("api/sawa guards", () => {
  it("rejects every method other than POST", async () => {
    const fake = makeRes();
    await handler({ ...makeReq(), method: "GET" }, fake.res);
    expect(fake.status).toBe(405);
    expect(fake.json?.message).toBe("Method not allowed.");
  });

  it("streams SSE deltas, a meta event and a done event", async () => {
    const fake = await send();
    expect(fake.status).toBe(200);
    expect(fake.headers["content-type"]).toBe("text/event-stream");
    expect(fake.headers["cache-control"]).toBe("no-cache");
    expect(fake.headers["access-control-allow-origin"]).toBeUndefined();
    expect(fake.text()).toContain('"type":"meta"');
    expect(fake.text()).toContain('"promptVersion":"1.0"');
    expect(fake.text()).toContain('"text":"Hello"');
    expect(fake.text()).toContain('"text":" world"');
    expect(fake.text()).toContain('"type":"done"');
  });

  it("rejects a message over the 1000 character cap", async () => {
    const fake = await send({
      body: { conversationId: "conv-oversize-1", message: "a".repeat(1001) },
    });
    expect(fake.status).toBe(400);
    expect(fake.json?.message).toBe("Invalid submission.");
  });

  it("rejects a missing or malformed conversation id", async () => {
    const missing = await send({ body: { message: "Hello" } });
    expect(missing.status).toBe(400);
    const malformed = await send({ body: { conversationId: "a b!", message: "Hello" } });
    expect(malformed.status).toBe(400);
  });

  it("rejects a body that is not valid JSON", async () => {
    const fake = await send({ body: "{not json" });
    expect(fake.status).toBe(400);
  });
});

describe("api/sawa failure paths", () => {
  it("fails closed with a generic 500 when the key is missing", async () => {
    delete process.env.MISTRAL_API_KEY;
    const fake = await send();
    expect(fake.status).toBe(500);
    expect(fake.json?.message).toBe("Sawa is unavailable right now. Please try again.");
    expect(fake.json?.message).not.toMatch(/mistral|openai|key/i);
  });

  it("fails closed when the base URL is missing", async () => {
    delete process.env.MISTRAL_BASE_URL;
    const fake = await send();
    expect(fake.status).toBe(500);
  });

  it("reports a provider error as a generic 500", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 502, body: null })));
    const fake = await send();
    expect(fake.status).toBe(500);
    expect(fake.json?.message).toBe("Sawa is unavailable right now. Please try again.");
  });

  it("times out a hung provider", async () => {
    process.env.SAWA_PROVIDER_TIMEOUT_MS = "15";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () =>
              reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
            );
          }),
      ),
    );
    const fake = await send();
    expect(fake.status).toBe(500);
  });
});

describe("api/sawa caps", () => {
  it("caps turns per conversation and says so honestly", async () => {
    const conversationId = "turn-cap-conversation";
    const ip = "198.51.100.200";
    let last = makeRes();
    for (let attempt = 1; attempt <= 13; attempt += 1) {
      last = makeRes();
      await handler(
        { method: "POST", headers: { "x-forwarded-for": ip }, body: { conversationId, message: "hi" } },
        last.res,
      );
    }
    expect(last.status).toBe(429);
    expect(last.json?.message).toContain("12-turn limit");
  });

  it("caps messages per IP per day", async () => {
    const ip = "198.51.100.201";
    let last = makeRes();
    for (let attempt = 1; attempt <= 41; attempt += 1) {
      last = makeRes();
      await handler(
        {
          method: "POST",
          headers: { "x-forwarded-for": ip },
          body: { conversationId: `ip-cap-${attempt}-abcdef`, message: "hi" },
        },
        last.res,
      );
    }
    expect(last.status).toBe(429);
    expect(last.json?.message).toContain("Too many messages");
  });
});

describe("api/sawa delta parser", () => {
  it("extracts text and tolerates malformed frames", () => {
    expect(extractDeltaText('{"choices":[{"delta":{"content":"x"}}]}')).toBe("x");
    expect(extractDeltaText("[DONE]")).toBe("");
    expect(extractDeltaText("{not json")).toBe("");
  });
});
