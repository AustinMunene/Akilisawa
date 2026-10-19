/*
 * The escalation seam (ticket 18) - where a SafetySignal becomes a human
 * notification, and the one and only place Akili Sawa persists anything a
 * visitor wrote.
 *
 * SAWA-AI-NO-ACCOUNTS-APPROACH.md section 3 defines this as an interface so the
 * transport can be swapped - an email sink now, a case-management queue later -
 * without touching the detector (ticket 17) or the mandated crisis copy. The
 * interface earns its place: `notify` takes the SafetySignal the detector
 * already produces and nothing else, so detection neither knows nor cares where
 * an alert ends up.
 *
 * RETENTION IS THE ETHICALLY LOAD-BEARING PART
 * Three requirements, from section 3, are enforced here rather than documented:
 *   1. Immediate disclosure. Every outcome carries EXCERPT_DISCLOSURE so the
 *      chat can tell the visitor, in the moment, in the house third person,
 *      that a flagged excerpt may be kept.
 *   2. Strictly scoped excerpts. Only the flagged turn's capped excerpt is
 *      stored. Never a transcript, never another conversation, never a message
 *      the visitor did not write in the flagged turn. The sink receives a
 *      SafetySignal, which carries only that excerpt.
 *   3. Short TTL. Expiry is enforced in code by InMemoryExcerptStore and proven
 *      by a test, not left as an intention.
 *
 * NOTHING HERE LOGS
 * There is no console call and no error surface in this file. A failed send is
 * reported to the caller as a generic `unavailable`, and a failed send discards
 * the excerpt rather than keeping data nobody was told about.
 *
 * The in-memory store is a starting point, not the end state: serverless
 * instances do not share memory, so a real deployment swaps in a KV or Postgres
 * implementation of ExcerptStore. That decision, the TTL value and the
 * staffing of the receiving inbox are all HITL (ticket 18) and are called out
 * where they bite.
 */

import { capExcerpt, type SafetySignal } from "./safety/detector";
import type { BilingualText } from "./safety/crisisCopy";
import type { SeverityTier, SignalCategory } from "./safety/tiers";

/*
 * TTL. Deliberately overridable so the humans' answer can be applied without a
 * code change. The default is tied to a follow-up SLA - a person reads the
 * inbox and can act within three days - rather than picked as a round number.
 * HITL, per ticket 18: confirm the inbox, the reader and the response window.
 */
export const DEFAULT_EXCERPT_TTL_MS = 3 * 24 * 60 * 60 * 1000;

/* Coalesce one conversation's repeats; the first alert already went out. */
export const DEFAULT_CONVERSATION_COOLDOWN_MS = 15 * 60 * 1000;

export const DEFAULT_ESCALATION_FROM = "no-reply@akilisawa.com";

/*
 * The in-chat disclosure. This is product copy, not transport: ticket 20
 * renders it when a SafetySignal fires, which is why every outcome carries it
 * rather than a boolean. House third person (`Akili Sawa`), British English,
 * sentence case, no exclamation marks, no emoji.
 */
export const EXCERPT_DISCLOSURE: BilingualText = {
  en: "Akili Sawa may send the message that raised a safety concern to its designated support inbox for review. Email retention depends on that inbox's settings. This service is not monitored for emergencies and cannot guarantee an immediate response. The full conversation is not sent.",
  sw: "Akili Sawa inaweza kutuma ujumbe ulioibua wasiwasi wa usalama kwenye kisanduku maalum cha usaidizi kwa ajili ya kukaguliwa. Muda wa kuhifadhi barua pepe hutegemea mipangilio ya kisanduku hicho. Huduma hii haifuatiliwi kwa dharura na haiwezi kuhakikisha jibu la haraka. Mazungumzo yote hayatatumwa.",
};

/* A single retained excerpt. The store's unit; never a whole transcript. */
export type ExcerptRecord = {
  readonly id: string;
  readonly conversationId: string;
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
  readonly promptVersion: string;
  readonly capturedAt: string;
  readonly expiresAt: string;
  readonly excerpt: string;
};

/*
 * Retention behind an interface so the in-memory map can be replaced by a
 * durable backend without touching the sink or the detector.
 */
export interface ExcerptStore {
  save(record: ExcerptRecord): void;
  get(id: string, now?: number): ExcerptRecord | null;
  list(now?: number): readonly ExcerptRecord[];
  delete(id: string): boolean;
  purge(now?: number): number;
}

function isExpired(record: ExcerptRecord, now: number): boolean {
  return Date.parse(record.expiresAt) <= now;
}

function hasControlChars(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/*
 * The default store. In-memory, per-instance, cleared on cold start - a
 * placeholder for the durable backend ticket 18 defers. Expiry is checked on
 * read, so an expired excerpt is never returned even if purge has not run.
 */
export class InMemoryExcerptStore implements ExcerptStore {
  private readonly records = new Map<string, ExcerptRecord>();

  save(record: ExcerptRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string, now: number = Date.now()): ExcerptRecord | null {
    const record = this.records.get(id);
    if (!record) return null;
    if (isExpired(record, now)) {
      this.records.delete(id);
      return null;
    }
    return record;
  }

  list(now: number = Date.now()): readonly ExcerptRecord[] {
    this.purge(now);
    return [...this.records.values()];
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  purge(now: number = Date.now()): number {
    let removed = 0;
    for (const [id, record] of this.records) {
      if (isExpired(record, now)) {
        this.records.delete(id);
        removed += 1;
      }
    }
    return removed;
  }
}

/* The transport contract. Resend is the intended implementation; tests inject a
 * fake, and the api layer owns the key. Nothing here touches the environment. */
export type EscalationMessage = {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text: string;
};

export interface EscalationTransport {
  send(message: EscalationMessage): Promise<void>;
}

export type EscalationStatus = "sent" | "suppressed" | "unavailable";

export type EscalationOutcome = {
  readonly status: EscalationStatus;
  /** Always present: the chat must disclose whenever a signal fires. */
  readonly disclosure: BilingualText;
  readonly excerptId: string | null;
  readonly expiresAt: string | null;
};

/*
 * The seam. `notify` is the whole contract - one signal in, one outcome out.
 */
export interface EscalationSink {
  notify(signal: SafetySignal): Promise<EscalationOutcome>;
}

export type EmailEscalationSinkOptions = {
  readonly transport: EscalationTransport;
  readonly to: string;
  readonly from?: string;
  readonly excerptStore?: ExcerptStore;
  readonly ttlMs?: number;
  readonly now?: () => number;
  readonly idFactory?: () => string;
  readonly conversationCooldownMs?: number;
};

function defaultIdFactory(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/*
 * The default sink: retain the flagged excerpt under a TTL, then alert a human
 * by email. The alert carries only what a person needs to act - conversation
 * id, tier, categories, prompt version, timestamp and the capped excerpt - and
 * points at docs/adr/crisis-resources-v1.md for the verified list rather than
 * inlining a single number. A number in an alert body is not a number anyone
 * dials.
 */
export class EmailEscalationSink implements EscalationSink {
  private readonly transport: EscalationTransport;
  private readonly to: string;
  private readonly from: string;
  private readonly excerptStore: ExcerptStore;
  private readonly ttlMs: number;
  private readonly now: () => number;
  private readonly idFactory: () => string;
  private readonly conversationCooldownMs: number;
  private readonly lastAlertAt = new Map<string, number>();

  constructor(options: EmailEscalationSinkOptions) {
    this.transport = options.transport;
    this.to = options.to;
    this.from = options.from ?? DEFAULT_ESCALATION_FROM;
    this.excerptStore = options.excerptStore ?? new InMemoryExcerptStore();
    this.ttlMs = options.ttlMs ?? DEFAULT_EXCERPT_TTL_MS;
    this.now = options.now ?? Date.now;
    this.idFactory = options.idFactory ?? defaultIdFactory;
    this.conversationCooldownMs = options.conversationCooldownMs ?? DEFAULT_CONVERSATION_COOLDOWN_MS;
  }

  async notify(signal: SafetySignal): Promise<EscalationOutcome> {
    const refused: EscalationOutcome = {
      status: "unavailable",
      disclosure: EXCERPT_DISCLOSURE,
      excerptId: null,
      expiresAt: null,
    };

    // Defend the boundary: an unusable signal must never become an email.
    // The id reaches an email subject, so control characters are refused for
    // the same reason api/sawa.ts keeps it to a safe shape.
    if (
      !signal ||
      typeof signal.conversationId !== "string" ||
      typeof signal.excerpt !== "string" ||
      typeof signal.tier !== "string" ||
      hasControlChars(signal.conversationId)
    ) {
      return refused;
    }

    const now = this.now();
    const record: ExcerptRecord = {
      id: this.idFactory(),
      conversationId: signal.conversationId,
      tier: signal.tier,
      categories: Array.isArray(signal.categories) ? [...signal.categories] : [],
      promptVersion: signal.promptVersion,
      capturedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + this.ttlMs).toISOString(),
      // Re-cap defensively: this store holds one flagged excerpt, nothing else.
      excerpt: capExcerpt(signal.excerpt),
    };
    this.excerptStore.save(record);

    const outcome = (status: EscalationStatus): EscalationOutcome => ({
      status,
      disclosure: EXCERPT_DISCLOSURE,
      excerptId: record.id,
      expiresAt: record.expiresAt,
    });

    if (this.isCoolingDown(signal.conversationId, now)) {
      return outcome("suppressed");
    }
    this.lastAlertAt.set(signal.conversationId, now);

    try {
      await this.transport.send({
        from: this.from,
        to: this.to,
        subject: `Sawa AI safety signal (${record.tier}) - ${record.conversationId}`,
        text: this.composeBody(record),
      });
      return outcome("sent");
    } catch {
      /*
       * Generic by design: the error is not logged and not surfaced. Nothing
       * was delivered, so nothing should be retained - discard the excerpt
       * rather than keep data no one was told about.
       */
      this.excerptStore.delete(record.id);
      return refused;
    }
  }

  private isCoolingDown(conversationId: string, now: number): boolean {
    const last = this.lastAlertAt.get(conversationId);
    return last !== undefined && now - last < this.conversationCooldownMs;
  }

  private composeBody(record: ExcerptRecord): string {
    return [
      "Akili Sawa safety signal",
      "",
      `Conversation id: ${record.conversationId}`,
      `Tier: ${record.tier}`,
      `Categories: ${record.categories.length > 0 ? record.categories.join(", ") : "none"}`,
      `Prompt version: ${record.promptVersion}`,
      `Captured at: ${record.capturedAt}`,
      `Excerpt expires at: ${record.expiresAt}`,
      "",
      "Flagged excerpt (capped; this is not the full conversation):",
      record.excerpt,
      "",
      "Verified crisis resources: docs/adr/crisis-resources-v1.md. This alert does not name a number and does not replace the in-chat crisis copy.",
    ].join("\n");
  }
}
