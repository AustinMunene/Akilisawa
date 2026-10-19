/*
 * SawaChat (ticket 20) - the one chat, mounted in two places.
 *
 * SAWA-AI-NO-ACCOUNTS-APPROACH.md section 4 makes this a deep module requirement:
 * `/sawa-ai` uses `variant="page"` and Home section 3 will use `variant="inline"`.
 * There must never be a second implementation. The variant only changes density
 * and the minimum height; every behaviour below is shared.
 *
 * The component is thin on purpose. Its decisions live in `src/lib/sawa/chat.ts`
 * (the pure engine) so they can be tested without a DOM; this file owns React
 * state, focus, scroll and the fetch lifecycle.
 *
 * WHAT IT WIRES TOGETHER
 *   - AnonymousConversationStore (ticket 19): the transcript, tab-scoped.
 *   - detectUserTurn / detectAssistantReply (ticket 17): pre- and post-checks.
 *   - planTurn / resolveReply (this ticket): what the safety result means here.
 *   - streamReply (this ticket) against api/sawa.ts (ticket 16).
 *   - EscalationSink (ticket 18): fed only on a high-severity signal.
 *
 * WHAT IT DELIBERATELY DOES NOT HAVE
 * No name field, no sign-in prompt, no "save this conversation". Each would edge
 * toward the accounts architecture the map excludes and make ticket 12's honesty
 * copy untrue.
 *
 * NO INLINE STYLES. Tokens only (bg-panel, border-line, text-text, text-muted,
 * text-accent, bg-tint, bg-accent-fill). Motion is opt-in per element through
 * `motion-safe:`; there are no framer-motion `motion.*` calls in this file.
 */

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { KeyboardEvent, FormEvent } from "react";
import { useReducedMotion } from "framer-motion";

import {
  AnonymousConversationStore,
  type ConversationStore,
} from "../../lib/sawa/store";
import { EXCERPT_DISCLOSURE, type EscalationSink } from "../../lib/sawa/escalation";
import type { SafetySignal } from "../../lib/sawa/safety/detector";
import {
  ANNOUNCE_THROTTLE_MS,
  announcementText,
  buildHistory,
  chatReducer,
  checkMessage,
  DECLINE_MESSAGE,
  DEFAULT_ENDPOINT,
  detectUserTurn,
  GENERIC_ERROR,
  initialChatState,
  MESSAGE_TOO_LONG,
  OPENING_LINE,
  planTurn,
  promptVersion,
  resolveReply,
  STREAM_TRUNCATED_MESSAGE,
  STREAM_TIMEOUT_MESSAGE,
  streamReply,
  toBubble,
  TURN_CAP_FALLBACK,
  type ChatBubble,
  type Detection,
  type OutgoingHistory,
  type TurnPlan,
} from "../../lib/sawa/chat";

export type SawaChatVariant = "page" | "inline";

export type SawaChatProps = {
  /** `page` is the full `/sawa-ai` surface; `inline` is the compact embed. */
  readonly variant?: SawaChatVariant;
  readonly className?: string;
  /** Injected in tests. Defaults to a per-tab AnonymousConversationStore. */
  readonly store?: ConversationStore;
  /** Injected. When absent the disclosure is still shown, nothing is sent. */
  readonly escalationSink?: EscalationSink;
  /** Injected in tests. Defaults to the global fetch. */
  readonly fetcher?: typeof fetch;
  readonly endpoint?: string;
};

const DEFAULT_ENDPOINT_VALUE = DEFAULT_ENDPOINT;

const STARTING_OPTIONS = [
  "Help me make sense of a concern",
  "Help me plan a next step",
  "What support options could suit me?",
  "What can you help me with?",
] as const;

/*
 * api/sawa.ts accepts `[A-Za-z0-9_-]{8,64}`. A UUID is 36 characters and fits;
 * the fallback is shaped to fit too. This is the only identifier the endpoint
 * ever sees, and it is not tied to any account.
 */
function defaultConversationId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function safetyFor(detection: Detection) {
  if (detection.tier === "low") return undefined;
  return { tier: detection.tier, categories: detection.categories };
}

type MessageBubbleProps = { readonly message: ChatBubble };

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const isSafety = message.safety !== undefined && message.safety.tier !== "low";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-3xl px-4 py-3 text-sm",
          isUser
            ? "bg-accent-fill text-accent-on-fill"
            : "bg-tint text-text shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
          isSafety ? "ring-1 ring-line" : "",
        ]
          .join(" ")
          .trim()}
      >
        <p
          className={`whitespace-pre-wrap text-pretty ${
            isUser ? "text-accent-on-fill" : "text-text"
          }`}
        >
          {message.content}
        </p>
        {message.partial ? (
          <p className="mt-1 text-xs text-muted">Reply stopped early.</p>
        ) : null}
      </div>
    </div>
  );
};

const StreamingBubble = ({
  text,
  animate,
}: {
  readonly text: string;
  readonly animate: boolean;
}) => (
  <div className="flex justify-start" aria-hidden="true">
    <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-tint px-4 py-3 text-sm text-text shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
      {text}
      <span
        className={`ml-1 inline-block h-4 w-1.5 translate-y-0.5 bg-accent ${
          animate ? "motion-safe:animate-pulse" : ""
        }`}
      />
    </p>
  </div>
);

const SawaChat = ({
  variant = "page",
  className,
  store,
  escalationSink,
  fetcher,
  endpoint = DEFAULT_ENDPOINT_VALUE,
}: SawaChatProps) => {
  const prefersReducedMotion = useReducedMotion();
  const conversationStore = useMemo(
    () => store ?? new AnonymousConversationStore(),
    [store]
  );
  const [state, dispatch] = useReducer(chatReducer, undefined, initialChatState);
  const [input, setInput] = useState("");
  const conversationId = useMemo(() => defaultConversationId(), []);
  const doFetch = useMemo<typeof fetch | undefined>(() => {
    if (fetcher) return fetcher;
    return typeof fetch === "function" ? fetch : undefined;
  }, [fetcher]);

  const abortRef = useRef<AbortController | null>(null);
  const lastTurnRef = useRef<{
    text: string;
    history: OutgoingHistory;
    detection: Detection;
    plan: TurnPlan;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);

  /*
   * Throttled live region (ticket 22). Only committed assistant turns are ever
   * spoken, at most once per `ANNOUNCE_THROTTLE_MS`, so the stream itself
   * stays silent and a burst of committed turns is coalesced into one
   * announcement. The transcript log is structural (`aria-live="off"`); the
   * hidden status below is the single thing a screen reader hears.
   */
  const [announcement, setAnnouncement] = useState("");
  const announcedRef = useRef<Set<string>>(new Set());
  const announceReadyRef = useRef(false);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnnouncementRef = useRef<string | null>(null);

  const isStreaming = state.status === "streaming";

  // Hydrate from the tab store: rehydrate an existing transcript, or seed the
  // opening line once. The opening line is first-person because it is Sawa
  // speaking inside the chat. Hydrated turns are pre-marked as announced so a
  // restored session is not re-read as a burst of live additions.
  useEffect(() => {
    const existing = conversationStore.getMessages();
    if (existing.length > 0) {
      const messages = existing.map(toBubble);
      announcedRef.current = new Set(messages.map((message) => message.id));
      dispatch({
        type: "hydrate",
        messages,
        degraded: conversationStore.isDegraded(),
      });
      return;
    }
    const seeded = conversationStore.addMessage({
      role: "assistant",
      content: OPENING_LINE,
      promptVersion,
    });
    const bubble = toBubble(seeded);
    announcedRef.current = new Set([bubble.id]);
    dispatch({
      type: "hydrate",
      messages: [bubble],
      degraded: conversationStore.isDegraded(),
    });
  }, [conversationStore]);

  // A leaked stream bills money: abort on unmount, and drop any pending
  // announcement so a timed-out update never fires after the chat is gone.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (announceTimerRef.current !== null) {
        clearTimeout(announceTimerRef.current);
        announceTimerRef.current = null;
      }
    },
    []
  );

  // Do not keep paying for a generation after the visitor backgrounds the tab.
  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === "hidden") abortRef.current?.abort();
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => document.removeEventListener("visibilitychange", stopWhenHidden);
  }, []);

  // Speak freshly committed assistant turns once, coalesced. The first pass is
  // skipped so hydration is never announced as an addition.
  useEffect(() => {
    if (!announceReadyRef.current) {
      announceReadyRef.current = true;
      return;
    }
    if (state.status === "streaming") return;
    const fresh = announcementText(state.messages, announcedRef.current);
    if (!fresh) return;
    for (const message of state.messages) announcedRef.current.add(message.id);
    pendingAnnouncementRef.current = fresh;
    if (announceTimerRef.current !== null) return;
    announceTimerRef.current = setTimeout(() => {
      announceTimerRef.current = null;
      if (pendingAnnouncementRef.current === null) return;
      setAnnouncement(pendingAnnouncementRef.current);
      pendingAnnouncementRef.current = null;
    }, ANNOUNCE_THROTTLE_MS);
  }, [state.messages, state.status]);

  // Keep the newest message in view, but never steal scroll from someone who
  // has scrolled up to re-read.
  useEffect(() => {
    if (!pinnedRef.current) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [state.messages, state.streaming]);

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    pinnedRef.current = distance < 48;
  };

  const remember = (bubble: ChatBubble) => {
    if (conversationStore.isDegraded()) dispatch({ type: "degrade" });
    return bubble;
  };

  const appendAssistant = (content: string, detection: Detection | null) => {
    const safety = detection ? safetyFor(detection) : undefined;
    const stored = conversationStore.addMessage({
      role: "assistant",
      content,
      promptVersion,
      ...(safety ? { safety } : {}),
    });
    dispatch({
      type: "append-assistant",
      message: remember(toBubble(stored)),
    });
  };

  const commitPartial = (content: string) => {
    if (!content.trim()) {
      dispatch({ type: "stream-end" });
      return;
    }
    const stored = conversationStore.addMessage({
      role: "assistant",
      content,
      promptVersion,
    });
    dispatch({
      type: "append-assistant",
      message: { ...remember(toBubble(stored)), partial: true },
    });
    dispatch({ type: "stream-end" });
  };

  const escalate = async (signal: SafetySignal) => {
    // The disclosure is required whenever a signal fires, sink or no sink.
    dispatch({
      type: "notice",
      notice: { kind: "info", message: EXCERPT_DISCLOSURE.en },
    });
    try {
      const outcome = escalationSink
        ? await escalationSink.notify(signal)
        : await (async () => {
            if (!doFetch) return null;
            const response = await doFetch("/api/sawa-escalate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversationId: signal.conversationId,
                excerpt: signal.excerpt,
                ageConsentAccepted: true,
              }),
            });
            return response.ok ? { disclosure: EXCERPT_DISCLOSURE } : null;
          })();
      if (!outcome) return;
      dispatch({
        type: "notice",
        notice: { kind: "info", message: outcome.disclosure.en },
      });
    } catch {
      // Generic by design: the disclosure above already said what may happen.
    }
  };

  const generate = async (
    message: string,
    history: OutgoingHistory,
    detection: Detection,
    plan: TurnPlan
  ) => {
    if (!doFetch) {
      dispatch({
        type: "notice",
        notice: { kind: "error", message: GENERIC_ERROR },
      });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: "stream-start" });

    const result = await streamReply({
      endpoint,
      conversationId,
      message,
      history,
      signal: controller.signal,
      fetcher: doFetch,
      onDelta: (text) => dispatch({ type: "delta", text }),
    });
    if (abortRef.current === controller) abortRef.current = null;

    if (result.ok) {
      const resolved = resolveReply(result.text);
      appendAssistant(resolved.content, detection);
      if (
        plan.thenCrisis &&
        detection.crisis &&
        !result.text.includes(detection.crisis.text.en)
      ) {
        appendAssistant(detection.crisis.text.en, detection);
      }
      dispatch({ type: "stream-end" });
      return;
    }

    if (result.reason === "aborted") {
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: { kind: "info", message: STREAM_TRUNCATED_MESSAGE },
      });
      return;
    }

    if (result.reason === "http" && result.status === 429) {
      // Turn or IP cap: ticket 16 requires it degrade gracefully, not look like
      // a crash. The server's own cap copy is shown.
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: {
          kind: "info",
          message: result.message ?? TURN_CAP_FALLBACK,
        },
      });
      return;
    }

    if (result.reason === "truncated" && result.text.trim()) {
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: {
          kind: "info",
          message: STREAM_TRUNCATED_MESSAGE,
        },
      });
      return;
    }

    if (result.reason === "timeout") {
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: { kind: "info", message: STREAM_TIMEOUT_MESSAGE },
      });
      return;
    }

    // Network, HTTP error, empty body: generic, and the user's turn is kept.
    commitPartial(result.text);
    dispatch({
      type: "notice",
      notice: { kind: "error", message: GENERIC_ERROR },
    });
  };

  const submit = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isStreaming || abortRef.current) return;
    const messageCheck = checkMessage(text);
    if (!messageCheck.ok) {
      if (messageCheck.tooLong) {
        dispatch({
          type: "notice",
          notice: { kind: "error", message: MESSAGE_TOO_LONG },
        });
      }
      return;
    }
    setInput("");
    dispatch({ type: "dismiss-notice" });

    // History is the transcript before this new turn; api/sawa.ts appends the
    // new message itself.
    const history = buildHistory(state.messages);
    const detection = detectUserTurn({ text, conversationId });
    const plan = planTurn(detection);

    const stored = conversationStore.addMessage({
      role: "user",
      content: text,
      promptVersion,
    });
    dispatch({ type: "user", message: remember(toBubble(stored)) });

    if (!plan.callModel) {
      if (plan.immediate === "crisis" && detection.crisis) {
        appendAssistant(detection.crisis.text.en, detection);
      } else {
        appendAssistant(DECLINE_MESSAGE, detection);
      }
      if (plan.escalate && detection.signal) {
        await escalate(detection.signal);
      }
      return;
    }

    lastTurnRef.current = { text, history, detection, plan };
    await generate(text, history, detection, plan);
  };

  const retry = () => {
    const last = lastTurnRef.current;
    if (!last) return;
    dispatch({ type: "dismiss-notice" });
    void generate(last.text, last.history, last.detection, last.plan);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(input);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit(input);
    }
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isStreaming) {
      event.preventDefault();
      abortRef.current?.abort();
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const minHeight = variant === "page" ? "min-h-[24rem]" : "min-h-[18rem]";
  const canSend = input.trim().length > 0 && !isStreaming;
  const retryAvailable =
    state.notice !== null &&
    lastTurnRef.current !== null &&
    (state.notice.kind === "error" ||
      state.notice.message === STREAM_TIMEOUT_MESSAGE ||
      state.notice.message === STREAM_TRUNCATED_MESSAGE);

  return (
    <div
      className={`flex h-full flex-col ${minHeight} ${className ?? ""}`}
      onKeyDown={handleRootKeyDown}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {state.degraded ? (
        <p className="mb-3 text-xs text-muted">
          Akili Sawa cannot save this conversation to your browser right now. It
          is held in memory for this tab only.
        </p>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto pr-1"
      >
        <div
          role="log"
          aria-live="off"
          aria-relevant="additions"
          aria-label="Conversation with Sawa"
          className="space-y-3"
        >
          {state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
        {state.messages.length === 1 && !isStreaming ? (
          <div className="flex flex-wrap gap-2" aria-label="Ways Sawa can help">
            {STARTING_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => void submit(option)}
                className="rounded-full border border-line bg-surface px-3 py-2 text-left text-xs text-text transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 dark:bg-panel"
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
        {isStreaming ? (
          <StreamingBubble
            text={state.streaming}
            animate={!prefersReducedMotion}
          />
        ) : null}
      </div>

      {state.notice ? (
        <div
          className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-none border border-line px-3 py-2 text-xs ${
            state.notice.kind === "error"
              ? "bg-surface/90 text-text"
              : "bg-tint text-muted"
          }`}
        >
          <p className="text-pretty">{state.notice.message}</p>
          {retryAvailable ? (
            <button
              type="button"
              onClick={retry}
              className="link-underline text-brand-dark dark:text-brand font-semibold"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      <form className="mt-4 flex items-end gap-3" onSubmit={handleSubmit}>
        <label htmlFor="sawa-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="sawa-message"
          name="message"
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Type your message..."
          className="min-h-[44px] min-w-0 flex-1 resize-none rounded-none border border-line bg-surface/90 px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/25 dark:bg-panel/90"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stop}
            className="btn btn-secondary btn-sm shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="btn btn-primary btn-sm shrink-0"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
};

export default SawaChat;
