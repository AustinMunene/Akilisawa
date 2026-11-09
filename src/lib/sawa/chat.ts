/*
 * The Sawa chat engine (ticket 20) - the pure, testable half of SawaChat.
 *
 * The component is deliberately thin: it owns the DOM, focus and scroll, while
 * everything with a decision in it lives here so it can be unit-tested in the
 * node environment the rest of `tests/` uses. That split matters because this is
 * the one place the safety pipeline, the transcript store, the SSE stream and
 * the escalation seam are exercised together - the integration logic is the
 * risky part, not the markup.
 *
 * Nothing here touches `window`, `document`, `sessionStorage` or a React hook.
 * `streamReply` takes the `fetch` implementation and its own `AbortSignal` so a
 * test can drive a fake response without a DOM.
 *
 * Voice is voice-v1 (docs/adr/voice-v1.md): warmth in the chat is first person
 * (`I`); every boundary, refusal, error and safety disclosure is the house
 * third person (`Akili Sawa`). British English, sentence case, no exclamation
 * marks, no emoji.
 */

import {
  chatCopy,
  messageTooLong,
  openingLine,
  type SawaLanguage,
} from "./language";
import { promptVersion } from "./prompt";
import {
  crisisTextFor,
  detectAssistantReply,
  detectUserTurn,
  type Detection,
} from "./safety/detector";
import type { ReplyCategory } from "./safety/rules";
import type { SafetyTierResult } from "./store";

/* Fixed by spec section 9 and the mockup. Do not change without a prompt bump. */
export const OPENING_LINE = openingLine("en");

export const DEFAULT_ENDPOINT = "/api/sawa";

/*
 * Kept in step with api/sawa.ts's own strings. The client never invents a
 * different message for the same failure - the server's graceful cap and error
 * copy is shown as-is, and this is only the fallback when the body cannot be
 * read.
 */
export const GENERIC_ERROR = chatCopy.en.genericError;
export const TURN_CAP_FALLBACK = chatCopy.en.turnCapFallback;
export const STREAM_TRUNCATED_MESSAGE = chatCopy.en.streamTruncated;
export const STREAM_TIMEOUT_MESSAGE = chatCopy.en.streamTimeout;
export const STREAM_IDLE_TIMEOUT_MS = 30_000;

/* Bounded refusals, house third person for the boundary and first person for the
 * warmth, exactly as voice-v1's refusal pattern prescribes. */
export const DECLINE_MESSAGE = chatCopy.en.decline;
export const REFUSAL_MESSAGE = chatCopy.en.refusal;

/* Matches api/sawa.ts's history ceiling; the endpoint re-slices defensively. */
export const MAX_HISTORY = 24;

/*
 * Mirrors api/sawa.ts's per-message ceiling (ticket 22). The composer checks it
 * before the model call so an over-long paste fails locally with the limit
 * stated, rather than coming back as a bare 400 the visitor cannot act on.
 */
export const MAX_MESSAGE_CHARS = 1000;

export const MESSAGE_TOO_LONG = messageTooLong("en", MAX_MESSAGE_CHARS);

export type MessageCheck = {
  readonly ok: boolean;
  readonly text: string;
  readonly tooLong: boolean;
};

export function checkMessage(raw: string): MessageCheck {
  const text = raw.trim();
  return {
    ok: text.length > 0 && text.length <= MAX_MESSAGE_CHARS,
    text,
    tooLong: text.length > MAX_MESSAGE_CHARS,
  };
}

/*
 * The polite live region is throttled (ticket 22): the completed turn is set
 * aside and spoken at most once per window, so a reply immediately followed by
 * the crisis support block is heard once rather than as two interruptions. The
 * in-flight text never reaches it - that is a separate, `aria-hidden` bubble.
 */
export const ANNOUNCE_THROTTLE_MS = 700;

export function announcementText(
  messages: readonly ChatBubble[],
  alreadyAnnounced: ReadonlySet<string>
): string {
  return messages
    .filter(
      (message) =>
        message.role === "assistant" &&
        message.content.trim().length > 0 &&
        !alreadyAnnounced.has(message.id)
    )
    .map((message) => message.content)
    .join("\n\n");
}

export type ChatBubbleRole = "user" | "assistant";

export type ChatBubble = {
  readonly id: string;
  readonly role: ChatBubbleRole;
  readonly content: string;
  /** An assistant turn that ended before the stream said `done`. */
  readonly partial?: boolean;
  readonly safety?: SafetyTierResult;
};

export type ChatNotice = {
  readonly kind: "error" | "info";
  readonly message: string;
  readonly retryable?: boolean;
};

export type ChatStatus = "idle" | "streaming" | "error";

export type ChatState = {
  readonly messages: readonly ChatBubble[];
  readonly streaming: string;
  readonly status: ChatStatus;
  readonly notice: ChatNotice | null;
  readonly degraded: boolean;
};

export const OPENING_ID = "sawa-opening";

export function openingBubble(language: SawaLanguage = "en"): ChatBubble {
  return {
    id: OPENING_ID,
    role: "assistant",
    content: openingLine(language),
  };
}

export function initialChatState(language: SawaLanguage = "en"): ChatState {
  return {
    messages: [openingBubble(language)],
    streaming: "",
    status: "idle",
    notice: null,
    degraded: false,
  };
}

export type ChatAction =
  | { readonly type: "hydrate"; readonly messages: readonly ChatBubble[]; readonly degraded: boolean }
  | { readonly type: "replace-opening"; readonly content: string }
  | { readonly type: "degrade" }
  | { readonly type: "user"; readonly message: ChatBubble }
  | { readonly type: "append-assistant"; readonly message: ChatBubble }
  | { readonly type: "stream-start" }
  | { readonly type: "delta"; readonly text: string }
  | { readonly type: "stream-end" }
  | { readonly type: "notice"; readonly notice: ChatNotice }
  | { readonly type: "dismiss-notice" }
  /** The visitor cleared the conversation: back to the opening line only. */
  | { readonly type: "reset"; readonly language: SawaLanguage };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        messages: action.messages.length > 0 ? action.messages : state.messages,
        degraded: action.degraded,
        status: "idle",
      };
    case "replace-opening": {
      const [first] = state.messages;
      if (state.messages.length !== 1 || first?.id !== OPENING_ID) return state;
      return {
        ...state,
        messages: [{ ...first, content: action.content }],
      };
    }
    case "degrade":
      return { ...state, degraded: true };
    case "user":
      return {
        ...state,
        messages: [...state.messages, action.message],
        notice: null,
      };
    case "append-assistant":
      return { ...state, messages: [...state.messages, action.message] };
    case "stream-start":
      return { ...state, status: "streaming", streaming: "", notice: null };
    case "delta":
      return { ...state, streaming: state.streaming + action.text };
    case "stream-end":
      return { ...state, status: "idle", streaming: "" };
    case "notice":
      return {
        ...state,
        notice: action.notice,
        status: action.notice.kind === "error" ? "error" : state.status,
      };
    case "dismiss-notice":
      return { ...state, notice: null, status: state.status === "error" ? "idle" : state.status };
    case "reset":
      // Storage degradation is a fact about the browser, not the conversation.
      return { ...initialChatState(action.language), degraded: state.degraded };
    default:
      return state;
  }
}

/*
 * `store.ts` owns the persisted message shape; the component renders this
 * smaller view shape so the optional `partial` marker never reaches storage.
 */
export function toBubble(message: {
  readonly id: string;
  readonly role: ChatBubbleRole;
  readonly content: string;
  readonly safety?: SafetyTierResult;
}): ChatBubble {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    ...(message.safety ? { safety: message.safety } : {}),
  };
}

export type OutgoingHistory = readonly {
  readonly role: "user" | "assistant";
  readonly content: string;
}[];

export function buildHistory(messages: readonly ChatBubble[]): OutgoingHistory {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .slice(-MAX_HISTORY)
    .map((message) => ({ role: message.role, content: message.content }));
}

/* ------------------------------------------------------------------ *
 * SSE parsing
 *
 * api/sawa.ts writes `data: <json>\n\n` frames (ticket 16). `EventSource`
 * cannot be used because the request is a POST, so the stream is read with a
 * reader and framed here. Frames may straddle chunks, hence the returned
 * `rest`; a partial line is carried forward rather than parsed.
 * ------------------------------------------------------------------ */

export type SseEvent =
  | { readonly type: "meta"; readonly promptVersion: string }
  | { readonly type: "delta"; readonly text: string }
  | { readonly type: "done" }
  | { readonly type: "error"; readonly message: string };

export function parseSseEvent(data: string): SseEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  switch (record.type) {
    case "meta":
      return typeof record.promptVersion === "string"
        ? { type: "meta", promptVersion: record.promptVersion }
        : null;
    case "delta":
      return typeof record.text === "string" ? { type: "delta", text: record.text } : null;
    case "done":
      return { type: "done" };
    case "error":
      return { type: "error", message: sanitiseServerMessage(record.message) };
    default:
      return null;
  }
}

export type ParsedSseChunk = {
  readonly events: readonly SseEvent[];
  readonly rest: string;
};

export function parseSseChunk(buffer: string): ParsedSseChunk {
  const events: SseEvent[] = [];
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    const event = parseSseEvent(data);
    if (event) events.push(event);
  }
  return { events, rest };
}

/* ------------------------------------------------------------------ *
 * One streamed turn
 * ------------------------------------------------------------------ */

export type StreamFailureReason = "network" | "http" | "truncated" | "empty" | "aborted" | "timeout";

export type StreamReplyResult = {
  readonly ok: boolean;
  readonly text: string;
  readonly reason?: StreamFailureReason;
  readonly status?: number;
  readonly message?: string;
};

export type StreamReplyOptions = {
  readonly endpoint: string;
  readonly conversationId: string;
  readonly message: string;
  readonly history: OutgoingHistory;
  readonly signal: AbortSignal;
  readonly fetcher: typeof fetch;
  /** The visitor's chosen reply language; api/sawa.ts treats absent as English. */
  readonly language?: SawaLanguage;
  readonly onDelta?: (text: string) => void;
  readonly onMeta?: (version: string) => void;
  /** Shortens the idle timer in tests; production uses STREAM_IDLE_TIMEOUT_MS. */
  readonly idleTimeoutMs?: number;
};

/*
 * Server copy is only shown verbatim when it is short, single-line and free of
 * anything that smells like an internals leak. A provider stack trace, a JSON
 * payload or a prompt fragment never reaches the client; the generic string
 * does, so error text cannot double as an information-disclosure channel.
 * `api/sawa.ts` already returns the generic `{ message }` shape on every path
 * (ticket 16); this is the client's own defence in depth.
 */
export function sanitiseServerMessage(raw: unknown): string {
  if (typeof raw !== "string") return GENERIC_ERROR;
  const message = raw.trim();
  if (!message || message.length > 240) return GENERIC_ERROR;
  if (/[\r\n]/.test(message)) return GENERIC_ERROR;
  if (/[{}<>]/.test(message)) return GENERIC_ERROR;
  if (/\bat\s+\S+:\d+/.test(message)) return GENERIC_ERROR;
  if (/api[_-]?key|bearer|authorization|stack|prompt/i.test(message)) return GENERIC_ERROR;
  return message;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object") {
      const message = (data as Record<string, unknown>).message;
      if (typeof message === "string") return sanitiseServerMessage(message);
    }
  } catch {
    // Non-JSON body: fall through to the generic fallback.
  }
  return GENERIC_ERROR;
}

export async function streamReply(options: StreamReplyOptions): Promise<StreamReplyResult> {
  if (options.signal.aborted) return { ok: false, text: "", reason: "aborted" };

  /*
   * Reached for as a bare function on purpose. `fetch` is brand-checked by the
   * browser: calling it as a method of another object makes `this` that object
   * and throws "Illegal invocation" before a request is sent, which reaches the
   * visitor as the generic error. Test doubles are plain functions and ignore
   * `this`, so only a real browser exposes the difference; streamReply's own
   * test suite pins the bare call with a fetcher that refuses to be a method.
   */
  const fetcher = options.fetcher;

  let response: Response;
  try {
    response = await fetcher(options.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        conversationId: options.conversationId,
        ageConsentAccepted: true,
        message: options.message,
        history: options.history,
        language: options.language ?? "en",
      }),
      signal: options.signal,
    });
  } catch {
    // A throw from fetch is a dead network or an abort; never surface the error.
    return options.signal.aborted
      ? { ok: false, text: "", reason: "aborted" }
      : { ok: false, text: "", reason: "network" };
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    return { ok: false, text: "", reason: "http", status: response.status, message };
  }
  if (!response.body) {
    return { ok: false, text: "", reason: "network" };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let sawDone = false;
  let streamError: string | undefined;

  const apply = (events: readonly SseEvent[]) => {
    for (const event of events) {
      if (event.type === "meta") {
        options.onMeta?.(event.promptVersion);
      } else if (event.type === "delta") {
        text += event.text;
        options.onDelta?.(event.text);
      } else if (event.type === "done") {
        sawDone = true;
      } else {
        streamError = event.message;
      }
    }
  };

  try {
    for (;;) {
      if (options.signal.aborted) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, text, reason: "aborted" };
      }
      let stalled = false;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const read = reader.read();
      const timeout = new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          stalled = true;
          reject(new Error("stream idle timeout"));
        }, options.idleTimeoutMs ?? STREAM_IDLE_TIMEOUT_MS);
      });
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await Promise.race([read, timeout]);
      } catch {
        if (stalled) {
          void reader.cancel().catch(() => undefined);
          return { ok: false, text, reason: "timeout" };
        }
        throw new Error("stream read failed");
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseChunk(buffer);
      buffer = rest;
      apply(events);
    }
    // Flush a final frame that arrived without its trailing newline.
    apply(parseSseChunk(`${buffer}\n\n`).events);
  } catch {
    if (options.signal.aborted) return { ok: false, text, reason: "aborted" };
    return { ok: false, text, reason: "truncated" };
  }

  if (options.signal.aborted) return { ok: false, text, reason: "aborted" };
  if (streamError) return { ok: false, text, reason: "http", message: streamError };
  if (!sawDone) return { ok: false, text, reason: "truncated" };
  if (text.trim().length === 0) return { ok: false, text, reason: "empty" };
  return { ok: true, text };
}

/* ------------------------------------------------------------------ *
 * The pipeline's decisions, as pure functions
 * ------------------------------------------------------------------ */

export type TurnPlan = {
  /** Whether the endpoint may be called at all for this turn. */
  readonly callModel: boolean;
  /** A bubble to render immediately, with no model call (high/abuse). */
  readonly immediate: "crisis" | "decline" | null;
  /** Whether the escalation sink must be fed this turn's signal. */
  readonly escalate: boolean;
  /** Whether the elevated support block is appended after the model reply. */
  readonly thenCrisis: boolean;
};

export function planTurn(detection: Detection): TurnPlan {
  if (!detection.behaviour.continueOpenEnded) {
    return {
      callModel: false,
      immediate: detection.crisis ? "crisis" : "decline",
      escalate: detection.signal !== null,
      thenCrisis: false,
    };
  }
  return {
    callModel: true,
    immediate: null,
    escalate: false,
    thenCrisis: detection.crisis !== null,
  };
}

export type ResolvedReply = {
  readonly content: string;
  readonly flagged: boolean;
  readonly categories: readonly ReplyCategory[];
};

/*
 * Post-generation guard (ticket 17). Sawa's own reply is classified before it is
 * committed; a flagged reply is discarded and the bounded refusal is shown in
 * its place, so section 11's prohibition is enforced rather than trusted.
 */
export function resolveReply(reply: string): ResolvedReply {
  const check = detectAssistantReply(reply);
  return check.flagged
    ? { content: REFUSAL_MESSAGE, flagged: true, categories: check.categories }
    : { content: withoutDashes(reply), flagged: false, categories: [] };
}

/*
 * Sawa never shows an em dash. Prompt 1.6 asks the model not to write one; this
 * is the guarantee, because a prompt rule is a request, not a contract. It runs
 * on everything model-written before it reaches the screen: the live stream,
 * a committed reply and a partial one.
 *
 *   "line start — item"   -> "- item"   (a dash used as a list marker)
 *   "9–5", "2–3 weeks"    -> "9-5"      (an en dash in a number range)
 *   "word — word", "a—b"  -> "word, word"
 *
 * A dash right before closing punctuation or a line end is dropped rather than
 * turned into a comma, so "wait —." becomes "wait." and not "wait, .". Text
 * without an em, en or horizontal-bar dash comes back unchanged; hyphens are
 * never touched.
 */
const LIST_DASH = /^([ \t]*)[\u2013\u2014\u2015][ \t]*/gm;
const RANGE_DASH = /(\d)[\u2013\u2014\u2015](?=\d)/g;
const INLINE_DASH = /[ \t]*[\u2013\u2014\u2015]+[ \t]*/g;
const CLOSES_CLAUSE = /^(?:[.,;:!?)\n]|$)/;

export function withoutDashes(text: string): string {
  return text
    .replace(LIST_DASH, "$1- ")
    .replace(RANGE_DASH, "$1-")
    .replace(INLINE_DASH, (match: string, offset: number, whole: string) =>
      CLOSES_CLAUSE.test(whole.slice(offset + match.length)) ? "" : ", "
    );
}

/* Re-exported so the component imports one module for the pipeline. */
export { crisisTextFor, detectUserTurn, promptVersion };
export type { Detection };
