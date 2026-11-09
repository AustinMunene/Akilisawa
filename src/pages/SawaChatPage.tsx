/*
 * /sawa-ai/chat - the full-screen conversation.
 *
 * Mounted outside Layout on purpose: no site navigation, no footer, nothing
 * competing with the conversation. A slim header keeps a way back to /sawa-ai,
 * the title and the language toggle; everything else is the chat.
 *
 * The age gate guards this page, so a visitor arriving from SawaLauncher with
 * a first message passes the gate before anything is sent. One language
 * provider wraps the page, so the header toggle, the gate and the chat agree.
 */

import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SawaAgeGate from "../components/sawa/SawaAgeGate";
import SawaChat from "../components/sawa/SawaChat";
import {
  SawaLanguageProvider,
  useSawaLanguage,
} from "../components/sawa/SawaLanguageProvider";
import SawaLanguageToggle from "../components/sawa/SawaLanguageToggle";
import { chatCopy } from "../lib/sawa/language";
import { startMessageFrom } from "../lib/sawa/routes";

function SawaChatScreen() {
  const { language } = useSawaLanguage();
  const t = chatCopy[language];
  const location = useLocation();
  const navigate = useNavigate();
  // Captured once: the history entry is cleared as soon as it is sent.
  const [initialMessage] = useState(() => startMessageFrom(location.state));

  const forgetInitialMessage = useCallback(() => {
    navigate(location.pathname, { replace: true, state: null });
  }, [navigate, location.pathname]);

  return (
    <div className="sawa-space flex h-dvh flex-col text-text">
      <header className="border-b border-line/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-2 md:px-6">
          <Link
            to="/sawa-ai"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true">←</span>
            {t.leave}
          </Link>
          <h1 className="text-base font-semibold md:text-lg">{t.title}</h1>
          <SawaLanguageToggle />
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SawaAgeGate
          showLanguageToggle={false}
          className="mx-auto my-6 w-full max-w-xl md:my-12"
        >
          <SawaChat
            className="flex-1"
            initialMessage={initialMessage}
            onInitialMessageSent={forgetInitialMessage}
          />
        </SawaAgeGate>
      </main>
    </div>
  );
}

const SawaChatPage = () => (
  <SawaLanguageProvider>
    <SawaChatScreen />
  </SawaLanguageProvider>
);

export default SawaChatPage;
