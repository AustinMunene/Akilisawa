/*
 * SawaChat (ticket 20) - the one chat.
 *
 * SAWA-AI-NO-ACCOUNTS-APPROACH.md section 4 makes this a deep module requirement:
 * there must never be a second implementation. It used to be embedded on
 * /sawa-ai and Home in two densities; since the full-screen change it is
 * mounted once, by SawaChatPage at /sawa-ai/chat, and fills its parent. Home
 * and /sawa-ai show SawaLauncher, which is not a chat: it only carries the
 * first message here as `initialMessage`.
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
 * WAITING AND CLEARING
 * Before the first token arrives the visitor sees ThinkingBubble: three dots
 * and a label, which changes after STILL_THINKING_MS so a slow cold start does
 * not look frozen. With reduced motion the dots hold still and the label does
 * the work. "Clear conversation" sits under the composer once the visitor
 * has written something; it asks first, inline (no browser dialog), then empties the tab
 * store and starts a new conversation id, so the server's turn count starts
 * again too. Escalations already sent are not recalled; the copy does not
 * claim otherwise.
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
import { chatCopy, messageTooLong, openingLine } from "../../lib/sawa/language";
import type { SafetySignal } from "../../lib/sawa/safety/detector";
import {
  ANNOUNCE_THROTTLE_MS,
  announcementText,
  assistantTurns,
  supportAlreadyShown,
  buildHistory,
  chatReducer,
  checkMessage,
  DEFAULT_ENDPOINT,
  detectUserTurn,
  initialChatState,
  MAX_MESSAGE_CHARS,
  planTurn,
  promptVersion,
  streamReply,
  toBubble,
  type ChatBubble,
  type Detection,
  type OutgoingHistory,
  type TurnPlan,
  withoutDashes,
} from "../../lib/sawa/chat";
import { configuredWhatsAppNumber, whatsappAnchors } from "../../lib/sawa/whatsapp";
import { useSawaLanguage } from "./SawaLanguageProvider";
import SawaWhatsAppCard from "./SawaWhatsAppCard";
import SawaReplyReport from "./SawaReplyReport";
import { reportableReplies } from "../../lib/sawa/report";

export type SawaChatProps = {
  readonly className?: string;
  /**
   * A first message typed into SawaLauncher. Sent once, after the transcript
   * has hydrated, so it carries the right history.
   */
  readonly initialMessage?: string;
  /** Called as the initial message is sent, so the page can forget it. */
  readonly onInitialMessageSent?: () => void;
  /**
   * The Akili Sawa WhatsApp line. Defaults to VITE_SAWA_WHATSAPP_NUMBER; `null`
   * or unset hides the card. Injected in tests.
   */
  readonly whatsappNumber?: string | null;
  /** Injected in tests. Defaults to a per-tab AnonymousConversationStore. */
  readonly store?: ConversationStore;
  /** Injected. When absent the disclosure is still shown, nothing is sent. */
  readonly escalationSink?: EscalationSink;
  /** Injected in tests. Defaults to the global fetch. */
  readonly fetcher?: typeof fetch;
  readonly endpoint?: string;
};

const DEFAULT_ENDPOINT_VALUE = DEFAULT_ENDPOINT;

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
  const { language } = useSawaLanguage();
  const t = chatCopy[language];
  const isUser = message.role === "user";
  const isSafety = message.safety !== undefined && message.safety.tier !== "low";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-3xl px-4 py-3 text-[0.95rem] leading-relaxed",
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
          <p className="mt-1 text-xs text-muted">{t.partialReply}</p>
        ) : null}
      </div>
    </div>
  );
};

/* After this long with no first token, the label says it is still working. */
export const STILL_THINKING_MS = 8_000;

const THINKING_DOT_DELAYS = [
  "",
  "motion-safe:[animation-delay:160ms]",
  "motion-safe:[animation-delay:320ms]",
] as const;

export const ThinkingBubble = () => {
  const { language } = useSawaLanguage();
  const t = chatCopy[language];
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), STILL_THINKING_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex justify-start" data-sawa-thinking="">
      <div
        role="status"
        className="inline-flex items-center gap-3 rounded-3xl bg-tint px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
      >
        <span className="flex items-center gap-1" aria-hidden="true">
          {THINKING_DOT_DELAYS.map((delay, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full bg-accent motion-safe:animate-sawa-thinking ${delay}`}
            />
          ))}
        </span>
        <span className="text-xs text-muted">{slow ? t.stillThinking : t.thinking}</span>
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
    <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-tint px-4 py-3 text-[0.95rem] leading-relaxed text-text shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
      {withoutDashes(text)}
      <span
        className={`ml-1 inline-block h-4 w-1.5 translate-y-0.5 bg-accent ${
          animate ? "motion-safe:animate-pulse" : ""
        }`}
      />
    </p>
  </div>
);

const SawaChat = ({
  className,
  initialMessage,
  onInitialMessageSent,
  whatsappNumber = configuredWhatsAppNumber(),
  store,
  escalationSink,
  fetcher,
  endpoint = DEFAULT_ENDPOINT_VALUE,
}: SawaChatProps) => {
  const { language } = useSawaLanguage();
  const t = chatCopy[language];
  const prefersReducedMotion = useReducedMotion();
  const conversationStore = useMemo(
    () => store ?? new AnonymousConversationStore(),
    [store]
  );
  const [state, dispatch] = useReducer(chatReducer, language, initialChatState);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(defaultConversationId);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const doFetch = useMemo<typeof fetch | undefined>(() => {
    if (fetcher) return fetcher;
    /*
     * Bound to globalThis so it survives being called in any style. An unbound
     * `fetch` is brand-checked by the browser and throws "Illegal invocation"
     * when `this` is anything but the global object, which is a silent failure
     * here: the visitor sees only the generic error and no request is made.
     */
    return typeof globalThis.fetch === "function"
      ? globalThis.fetch.bind(globalThis)
      : undefined;
  }, [fetcher]);

  const abortRef = useRef<AbortController | null>(null);
  const lastTurnRef = useRef<{
    text: string;
    history: OutgoingHistory;
    detection: Detection;
    plan: TurnPlan;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);
  const keepButtonRef = useRef<HTMLButtonElement | null>(null);
  const pinnedRef = useRef(true);
  // A support block waiting for the next reply (assistantTurns, chat.ts).
  const pendingSupportRef = useRef<string | null>(null);

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
      setHydrated(true);
      return;
    }
    const seeded = conversationStore.addMessage({
      role: "assistant",
      content: openingLine(language),
      promptVersion,
    });
    const bubble = toBubble(seeded);
    announcedRef.current = new Set([bubble.id]);
    dispatch({
      type: "hydrate",
      messages: [bubble],
      degraded: conversationStore.isDegraded(),
    });
    setHydrated(true);
  }, [conversationStore, language]);

  useEffect(() => {
    dispatch({ type: "replace-opening", content: openingLine(language) });
  }, [language]);

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

  const commitPartial = (raw: string) => {
    const content = withoutDashes(raw);
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
      notice: { kind: "info", message: EXCERPT_DISCLOSURE[language] },
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
        notice: { kind: "info", message: outcome.disclosure[language] },
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
        notice: { kind: "error", message: t.genericError },
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
      language,
      supportShown: supportAlreadyShown(state.messages),
      signal: controller.signal,
      fetcher: doFetch,
      onDelta: (text) => dispatch({ type: "delta", text }),
    });
    if (abortRef.current === controller) abortRef.current = null;

    if (result.ok) {
      // The turn's rules live in assistantTurns (chat.ts), shared with the
      // replay suite.
      const outcome = assistantTurns({
        detection,
        plan,
        previous: state.messages,
        reply: { text: result.text, ...(result.safety ? { safety: true } : {}) },
        language,
        pending: pendingSupportRef.current,
      });
      pendingSupportRef.current = outcome.pending;
      for (const content of outcome.turns) appendAssistant(content, detection);
      dispatch({ type: "stream-end" });
      return;
    }

    if (result.reason === "aborted") {
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: {
          kind: "info",
          message: t.streamTruncated,
          retryable: true,
        },
      });
      return;
    }

    /*
     * Ticket 20: a request for the system prompt must be declined by the
     * component, not reported as an outage. api/sawa.ts rejects an intake
     * failure (injection, PII solicitation, oversized turn) with 400 before
     * generation, so the bounded refusal keeps the visitor in the conversation
     * instead of telling them Sawa is down and inviting a retry that cannot
     * succeed.
     */
    if (result.reason === "http" && result.status === 400) {
      dispatch({ type: "stream-end" });
      appendAssistant(t.decline, detection);
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
          // The server's cap copy is English; never show it in Kiswahili.
          message:
            language === "en" ? result.message ?? t.turnCapFallback : t.limitReached,
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
          message: t.streamTruncated,
          retryable: true,
        },
      });
      return;
    }

    if (result.reason === "timeout") {
      commitPartial(result.text);
      dispatch({
        type: "notice",
        notice: {
          kind: "info",
          message: t.streamTimeout,
          retryable: true,
        },
      });
      return;
    }

    // Network, HTTP error, empty body: generic, and the user's turn is kept.
    commitPartial(result.text);
    dispatch({
      type: "notice",
      notice: { kind: "error", message: t.genericError },
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
          notice: {
            kind: "error",
            message: messageTooLong(language, MAX_MESSAGE_CHARS),
          },
        });
      }
      return;
    }
    setInput("");
    setConfirmingClear(false);
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
      const outcome = assistantTurns({
        detection,
        plan,
        previous: state.messages,
        language,
        pending: pendingSupportRef.current,
      });
      pendingSupportRef.current = outcome.pending;
      for (const content of outcome.turns) appendAssistant(content, detection);
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

  // `submit` closes over this render's state; the effect below must call the
  // latest one, not the one from the render that scheduled it.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (!hydrated || initialSentRef.current) return;
    const text = initialMessage?.trim();
    if (!text) return;
    initialSentRef.current = true;
    onInitialMessageSent?.();
    void submitRef.current(text);
  }, [hydrated, initialMessage, onInitialMessageSent]);

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

  // Move focus with the confirm step so keyboard users are never stranded on a
  // button that has just been unmounted. "Keep it" takes focus, not "Clear",
  // so a stray Enter cannot delete the conversation.
  // After "Keep it", focus returns to the clear button it came from. Done in
  // an effect so the remounted button's ref is attached by the time it runs.
  const restoreClearFocusRef = useRef(false);
  useEffect(() => {
    if (confirmingClear) {
      keepButtonRef.current?.focus();
      return;
    }
    if (restoreClearFocusRef.current) {
      restoreClearFocusRef.current = false;
      clearButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const cancelClear = () => {
    restoreClearFocusRef.current = true;
    setConfirmingClear(false);
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    conversationStore.clear();
    lastTurnRef.current = null;
    pendingSupportRef.current = null;
    pinnedRef.current = true;
    if (announceTimerRef.current !== null) {
      clearTimeout(announceTimerRef.current);
      announceTimerRef.current = null;
    }
    pendingAnnouncementRef.current = null;
    announcedRef.current = new Set(initialChatState(language).messages.map((m) => m.id));
    setConversationId(defaultConversationId());
    setInput("");
    setConfirmingClear(false);
    dispatch({ type: "reset", language });
    setAnnouncement(t.cleared);
    composerRef.current?.focus();
  };

  const canSend = input.trim().length > 0 && !isStreaming;
  const hasConversation = state.messages.some((message) => message.role === "user");
  const whatsapp = whatsappNumber ? whatsappAnchors(state.messages) : null;
  const reportable = reportableReplies(state.messages);
  const showClear = hasConversation && !isStreaming;
  const retryAvailable =
    state.notice !== null &&
    lastTurnRef.current !== null &&
    (state.notice.kind === "error" || state.notice.retryable === true);

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${className ?? ""}`}
      onKeyDown={handleRootKeyDown}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6 md:py-10">
          {state.degraded ? (
            <p className="text-xs text-muted">{t.degraded}</p>
          ) : null}
          <div
            role="log"
            aria-live="off"
            aria-relevant="additions"
            aria-label={t.conversationLabel}
            className="space-y-4"
          >
            {state.messages.map((message) => {
              const anchor = whatsapp?.get(message.id);
              return (
                <div key={message.id} className="space-y-3">
                  <MessageBubble message={message} />
                  {reportable.has(message.id) && !message.partial ? (
                    <SawaReplyReport
                      message={reportable.get(message.id)!.message}
                      reply={reportable.get(message.id)!.reply}
                    />
                  ) : null}
                  {anchor && whatsappNumber ? (
                    <SawaWhatsAppCard
                      number={whatsappNumber}
                      excerpt={anchor.excerpt}
                      tier={anchor.tier}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          {state.messages.length === 1 && !isStreaming ? (
            <div className="flex flex-wrap gap-2" aria-label={t.startingOptionsLabel}>
              {t.startingOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => void submit(option)}
                  className="min-h-[44px] rounded-full border border-line bg-surface px-4 py-2 text-left text-sm text-text transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 dark:bg-panel"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          {isStreaming && state.streaming.length === 0 ? <ThinkingBubble /> : null}
          {isStreaming && state.streaming.length > 0 ? (
            <StreamingBubble
              text={state.streaming}
              animate={!prefersReducedMotion}
            />
          ) : null}
        </div>
      </div>

      {/* The dock: notices, the clear confirmation, the composer, then the
          footnote and the clear button underneath it. */}
      {/* Translucent so the Sawa space's blue carries through to the bottom
          edge; the blur keeps scrolled text from fighting the composer. */}
      <div className="border-t border-line/70 bg-background/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pb-4 pt-3 md:px-6">
          {state.notice ? (
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2 text-xs ${
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
                  {t.retry}
                </button>
              ) : null}
            </div>
          ) : null}

          {showClear && confirmingClear ? (
            <div
              role="group"
              aria-label={t.clear}
              className="flex flex-wrap items-center justify-between gap-3 border border-line bg-tint px-3 py-2 text-sm text-text"
            >
              <p className="text-pretty">{t.clearConfirm}</p>
              <div className="flex gap-2">
                <button
                  ref={keepButtonRef}
                  type="button"
                  onClick={cancelClear}
                  className="btn btn-secondary btn-sm"
                >
                  {t.clearConfirmNo}
                </button>
                <button
                  type="button"
                  onClick={clearConversation}
                  className="btn btn-primary btn-sm"
                >
                  {t.clearConfirmYes}
                </button>
              </div>
            </div>
          ) : null}

          <form
            className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_8px_18px_rgba(15,23,42,0.06)] focus-within:ring-2 focus-within:ring-accent/25 dark:bg-panel"
            onSubmit={handleSubmit}
          >
            <label htmlFor="sawa-message" className="sr-only">
              {t.messageLabel}
            </label>
            <textarea
              ref={composerRef}
              id="sawa-message"
              name="message"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={t.placeholder}
              className="field-sizing-content max-h-48 min-h-[44px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-text outline-none placeholder:text-muted"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className="btn btn-secondary btn-sm shrink-0"
              >
                {t.stop}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className="btn btn-primary btn-sm shrink-0"
              >
                {t.send}
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-xs text-muted">{t.footnote}</p>
            {showClear && !confirmingClear ? (
              <button
                ref={clearButtonRef}
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="btn btn-secondary btn-sm"
              >
                {t.clear}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SawaChat;
