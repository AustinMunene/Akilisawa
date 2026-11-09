import {
  privacyCopy,
  SW_PRIVACY_PENDING_NOTE,
  SW_PRIVACY_REVIEWED,
  type SawaLanguage,
} from "../../lib/sawa/language";
import { SawaLanguageProvider, useSawaLanguage } from "./SawaLanguageProvider";
import SawaLanguageToggle from "./SawaLanguageToggle";

/*
 * The Sawa AI section of /privacy. Plain-language summary first (the board's
 * copy), then the four questions from Sawa AI User Feedback No. 1, in one
 * language at a time. The anchors are linked from the age gate, the chat and
 * the FAQ: #sawa-privacy for the section, #safety-escalation for question 3.
 */

const linkClass =
  "text-brand-dark underline underline-offset-4 dark:text-brand";

function SawaPrivacyContent() {
  const { language: chosen } = useSawaLanguage();
  // Unreviewed Kiswahili legal copy is not shown; see SW_PRIVACY_REVIEWED.
  const pending = chosen === "sw" && !SW_PRIVACY_REVIEWED;
  const language: SawaLanguage = pending ? "en" : chosen;
  const t = privacyCopy[language];

  return (
    <div id="sawa-privacy" lang={language} className="scroll-mt-24 space-y-8">
      {pending ? (
        <p lang="sw" className="border border-line bg-tint px-4 py-3 text-sm text-text">
          {SW_PRIVACY_PENDING_NOTE}
        </p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl">{t.title}</h2>
          <p className="text-base text-muted md:text-lg">{t.intro}</p>
        </div>
        <SawaLanguageToggle />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {t.summary.map((block) => (
          <div
            key={block.heading}
            className="space-y-3 rounded-3xl border border-line bg-surface/85 p-5"
          >
            <h3 className="text-base font-semibold text-text">{block.heading}</h3>
            {block.body.map((paragraph) => (
              <p key={paragraph} className="text-sm text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>

      <p className="text-sm">
        <a href="#privacy-notice" className={linkClass}>
          {t.noticeLink}
        </a>
        <span aria-hidden="true" className="px-2 text-muted">
          ·
        </span>
        <a href="#safety-escalation" className={linkClass}>
          {t.escalationLink}
        </a>
      </p>

      <div className="max-w-3xl space-y-6">
        <h3 className="text-xl font-semibold text-text">{t.questionsTitle}</h3>
        {t.questions.map((question) => (
          <div key={question.id} id={question.id} className="scroll-mt-24 space-y-2">
            <h4 className="text-base font-semibold text-text">{question.heading}</h4>
            {question.body.map((paragraph) => (
              <p key={paragraph} className="text-sm text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-sm text-muted">{t.emergency}</p>
    </div>
  );
}

type SawaPrivacySectionProps = { readonly initialLanguage?: SawaLanguage };

export default function SawaPrivacySection({ initialLanguage }: SawaPrivacySectionProps) {
  return (
    <SawaLanguageProvider initialLanguage={initialLanguage}>
      <SawaPrivacyContent />
    </SawaLanguageProvider>
  );
}
