/*
 * SawaLauncher - the doorway to the full-screen conversation.
 *
 * Home and /sawa-ai used to embed the chat itself. Now they show this: Sawa's
 * opening line, the starting options and a message box. Sending a message or
 * picking an option opens /sawa-ai/chat with that text, and the chat sends it
 * once the visitor is past the age gate. Nothing is sent from here and nothing
 * is stored here, so this is not a second chat implementation.
 *
 * If this tab already holds a conversation, the launcher offers to continue it
 * rather than pretending the visitor is starting fresh.
 */

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MAX_MESSAGE_CHARS } from "../../lib/sawa/chat";
import { chatCopy } from "../../lib/sawa/language";
import { SAWA_CHAT_PATH, type SawaChatLocationState } from "../../lib/sawa/routes";
import { AnonymousConversationStore } from "../../lib/sawa/store";
import { SawaLanguageProvider, useSawaLanguage } from "./SawaLanguageProvider";
import SawaLanguageToggle from "./SawaLanguageToggle";

function hasConversationInThisTab(): boolean {
  try {
    return new AnonymousConversationStore()
      .getMessages()
      .some((message) => message.role === "user");
  } catch {
    return false;
  }
}

function SawaLauncherContent() {
  const { language } = useSawaLanguage();
  const t = chatCopy[language];
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  // Read after mount: the server render and the first client render must match.
  const [canContinue, setCanContinue] = useState(false);
  useEffect(() => setCanContinue(hasConversationInThisTab()), []);

  const start = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const state: SawaChatLocationState = { start: text };
    navigate(SAWA_CHAT_PATH, { state });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    start(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      start(input);
    }
  };

  return (
    // `sawa-space` carries the full-screen chat's blue into the doorway, so the
    // visitor sees where the next step leads before they take it.
    <div
      className="sawa-space space-y-4 rounded-2xl border border-line/70 p-4 md:p-6"
      data-sawa-launcher=""
    >
      <div className="flex justify-end">
        <SawaLanguageToggle />
      </div>

      <div className="flex justify-start">
        <p className="max-w-[85%] rounded-3xl bg-tint px-4 py-3 text-[0.95rem] leading-relaxed text-text shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
          {t.opening}
        </p>
      </div>

      {canContinue ? (
        <Link to={SAWA_CHAT_PATH} className="btn btn-secondary btn-sm">
          {t.continueLabel}
        </Link>
      ) : (
        <div className="flex flex-wrap gap-2" aria-label={t.startingOptionsLabel}>
          {t.startingOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => start(option)}
              className="min-h-[44px] rounded-full border border-line bg-surface px-4 py-2 text-left text-sm text-text transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 dark:bg-panel"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_8px_18px_rgba(15,23,42,0.06)] focus-within:ring-2 focus-within:ring-accent/25 dark:bg-panel"
      >
        <label htmlFor="sawa-launch-message" className="sr-only">
          {t.messageLabel}
        </label>
        <textarea
          id="sawa-launch-message"
          rows={1}
          maxLength={MAX_MESSAGE_CHARS}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          className="field-sizing-content max-h-40 min-h-[44px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-text outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={input.trim().length === 0}
          className="btn btn-primary btn-sm shrink-0"
        >
          {t.launchLabel}
        </button>
      </form>
    </div>
  );
}

export default function SawaLauncher() {
  return (
    <SawaLanguageProvider>
      <SawaLauncherContent />
    </SawaLanguageProvider>
  );
}
