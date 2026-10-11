import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  AnonymousConversationStore,
  DEFAULT_NAMESPACE,
  SCHEMA_VERSION,
  storageKey,
  type ConversationStorage,
  type NewConversationMessage,
} from "../src/lib/sawa/store";

/*
 * Ticket 19: the browser-held transcript. Node environment, no jsdom - so the
 * Storage API is injected through the store's options, which is also how the
 * real browser store is reached.
 */

class FakeStorage implements ConversationStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  peek(key: string): string | undefined {
    return this.map.get(key);
  }
}

const FIXED_NOW = 1_700_000_000_000;
const fixedNow = () => FIXED_NOW;
const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const userTurn = (content: string): NewConversationMessage => ({
  role: "user",
  content,
  promptVersion: "1.0",
});

const makeStore = (storage: ConversationStorage | null, namespace?: string) =>
  new AnonymousConversationStore({
    storage,
    namespace,
    now: fixedNow,
    idFactory: ids(),
  });

describe("AnonymousConversationStore", () => {
  it("round-trips a message through storage", () => {
    const storage = new FakeStorage();
    const store = makeStore(storage);
    const written = store.addMessage(userTurn("hello"));

    const raw = storage.peek(storageKey());
    expect(raw).toBeDefined();
    expect(JSON.parse(raw!)).toMatchObject({ version: SCHEMA_VERSION });

    expect(written.role).toBe("user");
    expect(written.content).toBe("hello");
    expect(written.timestamp).toBe(new Date(FIXED_NOW).toISOString());
    expect(written.promptVersion).toBe("1.0");
    expect(written.safety).toBeUndefined();

    const rehydrated = makeStore(storage).getMessages();
    expect(rehydrated).toEqual([written]);
  });

  it("survives a page refresh within the same tab (new instance, same storage)", () => {
    const storage = new FakeStorage();
    makeStore(storage).addMessage(userTurn("first"));
    makeStore(storage).addMessage(userTurn("second"));

    const messages = makeStore(storage).getMessages();
    expect(messages.map((m) => m.content)).toEqual(["first", "second"]);
  });

  it("uses the default namespace key, and isolates namespaces", () => {
    const storage = new FakeStorage();
    makeStore(storage).addMessage(userTurn("anonymous"));
    makeStore(storage, "other").addMessage(userTurn("other"));

    expect(storage.peek(storageKey(DEFAULT_NAMESPACE))).toBeDefined();
    expect(makeStore(storage).getMessages()).toHaveLength(1);
    expect(makeStore(storage, "other").getMessages()).toHaveLength(1);
  });

  it("keeps the assistant safety-tier result on the stored turn", () => {
    const storage = new FakeStorage();
    const store = makeStore(storage);
    store.addMessage({
      role: "assistant",
      content: "I am here with you.",
      promptVersion: "1.0",
      safety: { tier: "elevated", categories: ["distress"] },
    });

    const [message] = makeStore(storage).getMessages();
    expect(message.safety).toEqual({ tier: "elevated", categories: ["distress"] });
  });

  it("returns the last N messages, in order", () => {
    const store = makeStore(new FakeStorage());
    store.addMessage(userTurn("one"));
    store.addMessage(userTurn("two"));
    store.addMessage(userTurn("three"));

    expect(store.getLastN(2).map((m) => m.content)).toEqual(["two", "three"]);
    expect(store.getLastN(10)).toHaveLength(3);
    expect(store.getLastN(0)).toEqual([]);
    expect(store.getLastN(-1)).toEqual([]);
  });

  it("clears the transcript from memory and from storage", () => {
    const storage = new FakeStorage();
    const store = makeStore(storage);
    store.addMessage(userTurn("gone"));

    store.clear();

    expect(store.getMessages()).toEqual([]);
    expect(makeStore(storage).getMessages()).toEqual([]);
  });

  it("discards a malformed stored value without throwing", () => {
    const storage = new FakeStorage();
    storage.setItem(storageKey(), "this is not json{");

    expect(makeStore(storage).getMessages()).toEqual([]);
    expect(makeStore(storage).isDegraded()).toBe(false);
  });

  it("discards a payload from a different schema version", () => {
    const storage = new FakeStorage();
    storage.setItem(
      storageKey(),
      JSON.stringify({ version: SCHEMA_VERSION + 1, messages: [userTurn("stale")] })
    );

    expect(makeStore(storage).getMessages()).toEqual([]);
  });

  it("filters partial or malformed messages out of an otherwise valid payload", () => {
    const storage = new FakeStorage();
    storage.setItem(
      storageKey(),
      JSON.stringify({
        version: SCHEMA_VERSION,
        messages: [
          {
            id: "kept",
            role: "user",
            content: "kept",
            timestamp: new Date(FIXED_NOW).toISOString(),
            promptVersion: "1.0",
          },
          { role: "user" },
          "not an object",
          {
            id: "bad-safety",
            role: "assistant",
            content: "x",
            timestamp: "t",
            promptVersion: "1.0",
            safety: { tier: "nonsense", categories: [] },
          },
        ],
      })
    );

    const messages = makeStore(storage).getMessages();
    expect(messages.map((m) => m.id)).toEqual(["kept"]);
  });

  it("degrades to in-memory when storage is unavailable, and says so", () => {
    const store = makeStore(null);
    expect(store.isDegraded()).toBe(true);

    store.addMessage(userTurn("in memory"));
    expect(store.getMessages().map((m) => m.content)).toEqual(["in memory"]);

    store.clear();
    expect(store.getMessages()).toEqual([]);
  });

  it("degrades when a storage read throws", () => {
    const throwing: ConversationStorage = {
      getItem() {
        throw new Error("storage disabled");
      },
      setItem() {},
      removeItem() {},
    };

    const store = new AnonymousConversationStore({ storage: throwing });
    expect(store.getMessages()).toEqual([]);
    expect(store.isDegraded()).toBe(true);
  });

  it("degrades when a storage write throws mid-session (quota)", () => {
    const storage: ConversationStorage = {
      getItem: () => null,
      setItem() {
        throw new Error("quota exceeded");
      },
      removeItem() {},
    };

    const store = new AnonymousConversationStore({ storage });
    expect(store.isDegraded()).toBe(false);

    store.addMessage(userTurn("still here"));
    expect(store.isDegraded()).toBe(true);
    expect(store.getMessages().map((m) => m.content)).toEqual(["still here"]);
  });
});

describe("store privacy invariants", () => {
  const source = readFileSync(
    fileURLToPath(new URL("../src/lib/sawa/store.ts", import.meta.url)),
    "utf8"
  );

  it("never touches the persistent local store for conversation content", () => {
    expect(source).not.toMatch(/\blocalStorage\b/);
  });

  it("never posts the transcript anywhere", () => {
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bXMLHttpRequest\b/);
  });

  it("does not log message bodies", () => {
    expect(source).not.toMatch(/\bconsole\.(log|info|debug|warn|error)\b/);
  });

  it("reads the tab store, not a server one", () => {
    expect(source).toMatch(/sessionStorage/);
  });
});
