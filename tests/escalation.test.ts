import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { detectUserTurn, MAX_EXCERPT_CHARS, type SafetySignal } from "../src/lib/sawa/safety/detector";
import {
  DEFAULT_EXCERPT_TTL_MS,
  EmailEscalationSink,
  EXCERPT_DISCLOSURE,
  InMemoryExcerptStore,
  type EscalationMessage,
  type EscalationOutcome,
  type EscalationSink,
  type EscalationTransport,
} from "../src/lib/sawa/escalation";

/*
 * Ticket 18: the escalation seam. The tests pin the two things that make this
 * module safe to ship - only flagged excerpts are ever retained, and the TTL is
 * enforced rather than aspirational - plus the generic-failure behaviour the
 * rest of the serverless surface uses.
 */

const FIXED = Date.UTC(2026, 9, 11, 12, 0, 0);

class FakeTransport implements EscalationTransport {
  readonly sent: EscalationMessage[] = [];
  fail = false;

  async send(message: EscalationMessage): Promise<void> {
    if (this.fail) throw new Error("transport down");
    this.sent.push(message);
  }
}

const ids = () => {
  let n = 0;
  return () => `excerpt-${++n}`;
};

const makeSignal = (over: Partial<SafetySignal> = {}): SafetySignal => ({
  conversationId: "conv-high-1",
  tier: "high",
  categories: ["suicidal_ideation"],
  createdAt: new Date(FIXED).toISOString(),
  promptVersion: "1.0",
  excerpt: "I have been thinking about ending my life",
  ...over,
});

describe("InMemoryExcerptStore", () => {
  it("returns a saved record before expiry", () => {
    const store = new InMemoryExcerptStore();
    const record = {
      id: "a",
      conversationId: "c",
      tier: "high" as const,
      categories: ["suicidal_ideation" as const],
      promptVersion: "1.0",
      capturedAt: new Date(FIXED).toISOString(),
      expiresAt: new Date(FIXED + 1000).toISOString(),
      excerpt: "flagged",
    };

    store.save(record);
    expect(store.get("a", FIXED)).toEqual(record);
    expect(store.list(FIXED)).toHaveLength(1);
  });

  it("enforces expiry on read, even before purge runs", () => {
    const store = new InMemoryExcerptStore();
    store.save({
      id: "a",
      conversationId: "c",
      tier: "high",
      categories: [],
      promptVersion: "1.0",
      capturedAt: new Date(FIXED).toISOString(),
      expiresAt: new Date(FIXED + 1000).toISOString(),
      excerpt: "flagged",
    });

    expect(store.get("a", FIXED + 999)).not.toBeNull();
    expect(store.get("a", FIXED + 1000)).toBeNull();
    expect(store.list(FIXED + 1000)).toHaveLength(0);
  });

  it("purges expired records and counts them", () => {
    const store = new InMemoryExcerptStore();
    for (let i = 0; i < 3; i += 1) {
      store.save({
        id: `r${i}`,
        conversationId: "c",
        tier: "high",
        categories: [],
        promptVersion: "1.0",
        capturedAt: new Date(FIXED).toISOString(),
        expiresAt: new Date(FIXED + 500 * (i + 1)).toISOString(),
        excerpt: "flagged",
      });
    }

    expect(store.purge(FIXED + 600)).toBe(1);
    expect(store.list(FIXED + 600).map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("deletes early on request", () => {
    const store = new InMemoryExcerptStore();
    store.save({
      id: "a",
      conversationId: "c",
      tier: "high",
      categories: [],
      promptVersion: "1.0",
      capturedAt: new Date(FIXED).toISOString(),
      expiresAt: new Date(FIXED + 1000).toISOString(),
      excerpt: "flagged",
    });

    expect(store.delete("a")).toBe(true);
    expect(store.get("a", FIXED)).toBeNull();
  });
});

describe("EmailEscalationSink", () => {
  it("alerts with the fields ticket 05 requires for reproducibility", async () => {
    const transport = new FakeTransport();
    const sink = new EmailEscalationSink({
      transport,
      to: "safeguarding@example.org",
      now: () => FIXED,
      idFactory: ids(),
    });

    const outcome = await sink.notify(makeSignal());

    expect(outcome.status).toBe("sent");
    expect(transport.sent).toHaveLength(1);
    const body = transport.sent[0].text;
    expect(body).toContain("conv-high-1");
    expect(body).toContain("high");
    expect(body).toContain("1.0");
    expect(body).toContain(new Date(FIXED).toISOString());
    expect(body).toContain("I have been thinking about ending my life");
    expect(body).toContain("docs/adr/crisis-resources-v1.md");
  });

  it("always carries the in-chat disclosure, in the house third person", async () => {
    const transport = new FakeTransport();
    const sink = new EmailEscalationSink({ transport, to: "a@b.c", now: () => FIXED });

    const outcome = await sink.notify(makeSignal());

    expect(outcome.disclosure).toEqual(EXCERPT_DISCLOSURE);
    expect(EXCERPT_DISCLOSURE.en).toContain("Akili Sawa");
    expect(/\bI\b/.test(EXCERPT_DISCLOSURE.en)).toBe(false);
    expect(EXCERPT_DISCLOSURE.en).not.toContain("!");
  });

  it("retains only one capped excerpt, never the full conversation", async () => {
    const transport = new FakeTransport();
    const store = new InMemoryExcerptStore();
    const sink = new EmailEscalationSink({
      transport,
      to: "a@b.c",
      excerptStore: store,
      now: () => FIXED,
      idFactory: ids(),
    });

    await sink.notify(makeSignal({ excerpt: `I want to die ${"x".repeat(2000)}` }));

    const retained = store.list(FIXED);
    expect(retained).toHaveLength(1);
    expect(retained[0].excerpt.length).toBe(MAX_EXCERPT_CHARS);
    expect(transport.sent[0].text).not.toContain("x".repeat(MAX_EXCERPT_CHARS + 1));
  });

  it("proves expiry end to end with an injected clock and TTL", async () => {
    const transport = new FakeTransport();
    const store = new InMemoryExcerptStore();
    let clock = FIXED;
    const sink = new EmailEscalationSink({
      transport,
      to: "a@b.c",
      excerptStore: store,
      ttlMs: 1000,
      now: () => clock,
      idFactory: ids(),
    });

    await sink.notify(makeSignal());
    expect(store.list(clock)).toHaveLength(1);

    clock = FIXED + 1000;
    expect(store.list(clock)).toHaveLength(0);
  });

  it("uses the default TTL when none is supplied", async () => {
    const transport = new FakeTransport();
    const sink = new EmailEscalationSink({ transport, to: "a@b.c", now: () => FIXED });

    const outcome = await sink.notify(makeSignal());

    expect(outcome.expiresAt).toBe(new Date(FIXED + DEFAULT_EXCERPT_TTL_MS).toISOString());
  });

  it("coalesces one conversation's repeats so the inbox is not a firehose", async () => {
    const transport = new FakeTransport();
    const sink = new EmailEscalationSink({
      transport,
      to: "a@b.c",
      now: () => FIXED,
      idFactory: ids(),
    });

    const first = await sink.notify(makeSignal());
    const second = await sink.notify(makeSignal());

    expect(first.status).toBe("sent");
    expect(second.status).toBe("suppressed");
    expect(transport.sent).toHaveLength(1);
    expect(second.disclosure).toEqual(EXCERPT_DISCLOSURE);
  });

  it("fails generically on a transport error and discards the excerpt", async () => {
    const transport = new FakeTransport();
    transport.fail = true;
    const store = new InMemoryExcerptStore();
    const sink = new EmailEscalationSink({
      transport,
      to: "a@b.c",
      excerptStore: store,
      now: () => FIXED,
      idFactory: ids(),
    });

    const outcome = await sink.notify(makeSignal());

    expect(outcome.status).toBe("unavailable");
    expect(outcome.excerptId).toBeNull();
    expect(store.list(FIXED)).toHaveLength(0);
  });

  it("refuses a malformed signal without sending or retaining", async () => {
    const transport = new FakeTransport();
    const store = new InMemoryExcerptStore();
    const sink = new EmailEscalationSink({
      transport,
      to: "a@b.c",
      excerptStore: store,
      now: () => FIXED,
    });

    const outcome = await sink.notify(undefined as unknown as SafetySignal);

    expect(outcome.status).toBe("unavailable");
    expect(transport.sent).toHaveLength(0);
    expect(store.list(FIXED)).toHaveLength(0);
  });

  it("refuses a conversation id that could inject into the email headers", async () => {
    const transport = new FakeTransport();
    const sink = new EmailEscalationSink({ transport, to: "a@b.c", now: () => FIXED });

    const outcome = await sink.notify(makeSignal({ conversationId: "conv\r\nBcc: evil@example.org" }));

    expect(outcome.status).toBe("unavailable");
    expect(transport.sent).toHaveLength(0);
  });
});

describe("detector to sink, high severity end to end", () => {
  it("routes the detector's signal to whichever sink implements the seam", async () => {
    const seen: SafetySignal[] = [];
    const customSink: EscalationSink = {
      async notify(signal): Promise<EscalationOutcome> {
        seen.push(signal);
        return {
          status: "sent",
          disclosure: EXCERPT_DISCLOSURE,
          excerptId: "custom",
          expiresAt: null,
        };
      },
    };

    const detection = detectUserTurn({
      text: "I have been thinking about ending my life",
      conversationId: "conv-high-1",
      now: FIXED,
    });

    expect(detection.signal).not.toBeNull();
    const outcome = await customSink.notify(detection.signal as SafetySignal);

    expect(outcome.status).toBe("sent");
    expect(seen).toHaveLength(1);
    expect(seen[0].tier).toBe("high");
  });

  it("emits no signal, and so no alert, for an ordinary turn", () => {
    const detection = detectUserTurn({ text: "I am so tired today", now: FIXED });
    expect(detection.signal).toBeNull();
  });
});

describe("escalation privacy and seam invariants", () => {
  const source = readFileSync(
    fileURLToPath(new URL("../src/lib/sawa/escalation.ts", import.meta.url)),
    "utf8"
  );
  const detectorSource = readFileSync(
    fileURLToPath(new URL("../src/lib/sawa/safety/detector.ts", import.meta.url)),
    "utf8"
  );

  it("never logs, and never surfaces a raw error", () => {
    expect(source).not.toMatch(/\bconsole\.(log|info|debug|warn|error)\b/);
  });

  it("never reads a model key", () => {
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/apiKey/i);
  });

  it("does not send anything itself - the transport is injected", () => {
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bXMLHttpRequest\b/);
    expect(source).toMatch(/EscalationTransport/);
  });

  it("enforces expiry in code", () => {
    expect(source).toMatch(/expiresAt/);
    expect(source).toMatch(/purge/);
  });

  it("is replaceable without the detector importing it", () => {
    expect(detectorSource).not.toMatch(/from\s+["'].*escalation/);
  });
});
