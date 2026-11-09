import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { isAdultDateOfBirth } from "../../lib/sawa/ageGate";
import { gateCopy, type SawaLanguage } from "../../lib/sawa/language";
import { SawaLanguageProvider, useSawaLanguage } from "./SawaLanguageProvider";
import SawaLanguageToggle from "./SawaLanguageToggle";

const SESSION_KEY = "sawa.age-consent.v1";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index);

function daysInMonth(year: string, month: string): number {
  const resolvedYear = Number(year) || 2000;
  const resolvedMonth = Number(month) || 1;
  return new Date(resolvedYear, resolvedMonth, 0).getDate();
}

// Read on first render, not in an effect, so a visitor who already accepted
// this session never sees the gate flash before the chat.
function readAccepted(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(SESSION_KEY) === "accepted";
  } catch {
    // Storage blocked: the gate stays usable for this page view.
    return false;
  }
}

function SawaAgeGateContent({
  children,
  showLanguageToggle,
  className,
}: {
  readonly children: ReactNode;
  readonly showLanguageToggle: boolean;
  readonly className?: string;
}) {
  const { language } = useSawaLanguage();
  const t = gateCopy[language];
  const [accepted, setAccepted] = useState(readAccepted);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dateOfBirth = year && month && day ? `${year}-${month}-${day}` : "";
    if (!isAdultDateOfBirth(dateOfBirth)) {
      setError(t.ageError);
      return;
    }
    if (!consent) {
      setError(t.consentError);
      return;
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, "accepted");
    } catch {
      // Keep the confirmation in memory for this page view only.
    }
    setError("");
    setAccepted(true);
  };

  if (accepted) return children;

  return (
    <section
      aria-labelledby="sawa-age-gate-title"
      className={`space-y-5 rounded-none border border-line bg-panel p-5 text-text shadow-card md:p-7 ${className ?? ""}`}
    >
      {showLanguageToggle ? (
        <div className="flex justify-end">
          <SawaLanguageToggle />
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {t.before}
        </p>
        <h2 id="sawa-age-gate-title" className="text-xl font-semibold">
          {t.title}
        </h2>
        <p lang={language} className="text-sm text-muted">
          {t.intro}
        </p>
        <p lang={language} className="text-sm text-muted">
          {t.safety}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium">{t.dateOfBirth}</legend>
          <p id="sawa-date-of-birth-help" className="text-xs text-muted">
            {t.dateOfBirthHelp}
          </p>
          <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2">
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>{t.day}</span>
              <select
                name="birthDay"
                required
                value={day}
                onChange={(event) => setDay(event.target.value)}
                aria-describedby="sawa-date-of-birth-help"
                className="min-h-[44px] w-full border border-line bg-background px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="">{t.day}</option>
                {Array.from({ length: daysInMonth(year, month) }, (_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {index + 1}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>{t.month}</span>
              <select
                name="birthMonth"
                required
                value={month}
                onChange={(event) => {
                  const nextMonth = event.target.value;
                  setMonth(nextMonth);
                  if (Number(day) > daysInMonth(year, nextMonth)) setDay("");
                }}
                aria-describedby="sawa-date-of-birth-help"
                className="min-h-[44px] w-full border border-line bg-background px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="">{t.month}</option>
                {t.months.map((label, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>{t.year}</span>
              <select
                name="birthYear"
                required
                value={year}
                onChange={(event) => {
                  const nextYear = event.target.value;
                  setYear(nextYear);
                  if (Number(day) > daysInMonth(nextYear, month)) setDay("");
                }}
                aria-describedby="sawa-date-of-birth-help"
                className="min-h-[44px] w-full border border-line bg-background px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="">{t.year}</option>
                {YEARS.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-4 accent-accent"
          />
          <span lang={language}>
            {t.consentPrefix}
            <Link
              to="/privacy#sawa-privacy"
              className="underline underline-offset-4"
            >
              {t.privacyLabel}
            </Link>
            {t.consentSuffix}
          </span>
        </label>

        {error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="min-h-[44px] w-full bg-accent-fill px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t.submit}
        </button>
      </form>
    </section>
  );
}

type SawaAgeGateProps = {
  readonly children: ReactNode;
  readonly initialLanguage?: SawaLanguage;
  /** Off when the surrounding page already shows the toggle. */
  readonly showLanguageToggle?: boolean;
  /** Placement for the gate panel only; the children are not wrapped. */
  readonly className?: string;
};

export default function SawaAgeGate({
  children,
  initialLanguage,
  showLanguageToggle = true,
  className,
}: SawaAgeGateProps) {
  return (
    <SawaLanguageProvider initialLanguage={initialLanguage}>
      <SawaAgeGateContent showLanguageToggle={showLanguageToggle} className={className}>
        {children}
      </SawaAgeGateContent>
    </SawaLanguageProvider>
  );
}
