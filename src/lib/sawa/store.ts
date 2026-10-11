/*
 * The browser-held conversation store (ticket 19) - the client half of
 * "no account, no server transcript" (SAWA-AI-NO-ACCOUNTS-APPROACH.md section 4).
 *
 * SawaChat depends on the ConversationStore interface, never on the
 * implementation. That is the swap point: the anonymous store below can be
 * replaced by an account-backed one later without the chat component changing,
 * which is what keeps the no-accounts decision reversible rather than a dead end.
 *
 * WHY sessionStorage AND NOT THE PERSISTENT STORE
 * The transcript lives for the tab and is gone when the tab closes. That is the
 * difference between "forgets when you close the tab" and "follows you around
 * forever", and the site's central privacy promise (section 67 answer 5, ticket
 * 14) rests on it. Do not "improve" this to the persistent local store so that
 * history survives - that would quietly make the promise false. Its counterpart
 * is the flagged-excerpt path: that is ticket 18's EscalationSink, bounded by a
 * TTL and disclosed in-transcript. Nothing in this file posts a transcript to a
 * server, ever.
 *
 * STORAGE IS NOT GUARANTEED
 * Safari private mode, quota exhaustion and storage-disabled browsers all throw
 * on sessionStorage. A wellbeing product must not white-screen because a visitor
 * blocks storage, so every access degrades to in-memory instead. The degraded
 * state is surfaced through isDegraded() so the UI can say so - it is never
 * silent. A malformed or schema-mismatched stored value is discarded rather
 * than thrown.
 */

import type { SeverityTier, SignalCategory } from "./safety/tiers";

/* Bump when the stored shape changes; an old payload is then discarded safely. */
export const SCHEMA_VERSION = 1;

export const DEFAULT_NAMESPACE = "anonymous";

const STORAGE_PREFIX = "sawa.conversation:";

export function storageKey(namespace: string = DEFAULT_NAMESPACE): string {
  return `${STORAGE_PREFIX}${namespace}`;
}

export type MessageRole = "user" | "assistant";

/**
 * Carried on assistant turns only, when the safety pipeline (ticket 17)
 * classified the turn. The store persists it; it does not act on it. Surfacing
 * this is how the store tells the chat that disclosure is required - where the
 * excerpt goes is ticket 18's decision, not this file's.
 */
export type SafetyTierResult = {
  readonly tier: SeverityTier;
  readonly categories: readonly SignalCategory[];
};

export type ConversationMessage = {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  /** ISO 8601. The store stamps it; callers do not supply it. */
  readonly timestamp: string;
  readonly promptVersion: string;
  readonly safety?: SafetyTierResult;
};

export type NewConversationMessage = {
  readonly role: MessageRole;
  readonly content: string;
  readonly promptVersion: string;
  readonly safety?: SafetyTierResult;
};

/** The minimal surface SawaChat needs. Deliberately small. */
export interface ConversationStore {
  addMessage(message: NewConversationMessage): ConversationMessage;
  getMessages(): readonly ConversationMessage[];
  getLastN(count: number): readonly ConversationMessage[];
  clear(): void;
  /** True when persistence is unavailable and the store is memory-only. */
  isDegraded(): boolean;
}

/**
 * The subset of the Storage API used here. A structural type so tests can pass a
 * plain object without a DOM.
 */
export type ConversationStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type AnonymousConversationStoreOptions = {
  readonly namespace?: string;
  /** Injected in tests. `null` forces the degraded in-memory path. */
  readonly storage?: ConversationStorage | null;
  readonly now?: () => number;
  readonly idFactory?: () => string;
};

type StoredPayload = {
  version: number;
  messages: ConversationMessage[];
};

const SAFETY_TIERS: readonly string[] = ["low", "elevated", "high", "abuse"];

function isValidSafety(value: unknown): value is SafetyTierResult {
  if (!value || typeof value !== "object") return false;
  const safety = value as Record<string, unknown>;
  return (
    typeof safety.tier === "string" &&
    SAFETY_TIERS.includes(safety.tier) &&
    Array.isArray(safety.categories) &&
    safety.categories.every((category) => typeof category === "string")
  );
}

function normaliseSafety(safety: SafetyTierResult): SafetyTierResult {
  return { tier: safety.tier, categories: [...safety.categories] };
}

function isValidMessage(value: unknown): value is ConversationMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  if (
    typeof message.id !== "string" ||
    (message.role !== "user" && message.role !== "assistant") ||
    typeof message.content !== "string" ||
    typeof message.timestamp !== "string" ||
    typeof message.promptVersion !== "string"
  ) {
    return false;
  }
  return message.safety === undefined || isValidSafety(message.safety);
}

function normaliseMessage(message: ConversationMessage): ConversationMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    promptVersion: message.promptVersion,
    ...(message.safety ? { safety: normaliseSafety(message.safety) } : {}),
  };
}

function parsePayload(raw: string | null): ConversationMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return [];
    const payload = parsed as Record<string, unknown>;
    if (payload.version !== SCHEMA_VERSION) return [];
    if (!Array.isArray(payload.messages)) return [];
    return payload.messages.filter(isValidMessage).map(normaliseMessage);
  } catch {
    return [];
  }
}

function defaultIdFactory(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/*
 * Resolve the tab store defensively. Private mode can expose the object but
 * throw on first use, so the probe write/delete is part of detection.
 */
function resolveSessionStorage(): ConversationStorage | null {
  try {
    const candidate = (globalThis as { sessionStorage?: ConversationStorage })
      .sessionStorage;
    if (!candidate) return null;
    const probe = "__sawa_probe__";
    candidate.setItem(probe, "1");
    candidate.removeItem(probe);
    return candidate;
  } catch {
    return null;
  }
}

export class AnonymousConversationStore implements ConversationStore {
  private readonly namespace: string;
  private readonly key: string;
  private readonly storage: ConversationStorage | null;
  private readonly now: () => number;
  private readonly idFactory: () => string;
  private messages: ConversationMessage[];
  private degraded: boolean;

  constructor(options: AnonymousConversationStoreOptions = {}) {
    this.namespace = options.namespace ?? DEFAULT_NAMESPACE;
    this.key = storageKey(this.namespace);
    this.storage =
      "storage" in options ? options.storage ?? null : resolveSessionStorage();
    this.now = options.now ?? Date.now;
    this.idFactory = options.idFactory ?? defaultIdFactory;
    this.degraded = this.storage === null;
    this.messages = this.storage ? this.read() : [];
  }

  addMessage(message: NewConversationMessage): ConversationMessage {
    const stored: ConversationMessage = {
      id: this.idFactory(),
      role: message.role,
      content: message.content,
      timestamp: new Date(this.now()).toISOString(),
      promptVersion: message.promptVersion,
      ...(message.safety ? { safety: normaliseSafety(message.safety) } : {}),
    };
    this.messages = [...this.messages, stored];
    this.persist();
    return stored;
  }

  getMessages(): readonly ConversationMessage[] {
    return [...this.messages];
  }

  getLastN(count: number): readonly ConversationMessage[] {
    if (!Number.isFinite(count) || count <= 0) return [];
    const size = Math.floor(count);
    return this.messages.slice(Math.max(0, this.messages.length - size));
  }

  clear(): void {
    this.messages = [];
    if (!this.storage) return;
    try {
      this.storage.removeItem(this.key);
    } catch {
      this.degraded = true;
    }
  }

  isDegraded(): boolean {
    return this.degraded;
  }

  private read(): ConversationMessage[] {
    if (!this.storage) return [];
    try {
      return parsePayload(this.storage.getItem(this.key));
    } catch {
      // A throwing read is a storage failure, not a bad value: go memory-only.
      this.degraded = true;
      return [];
    }
  }

  private persist(): void {
    if (!this.storage) return;
    const payload: StoredPayload = {
      version: SCHEMA_VERSION,
      messages: this.messages,
    };
    try {
      this.storage.setItem(this.key, JSON.stringify(payload));
    } catch {
      // Quota or a disabled store mid-session: keep the transcript in memory.
      this.degraded = true;
    }
  }
}
