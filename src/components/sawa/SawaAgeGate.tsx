import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { isAdultDateOfBirth } from "../../lib/sawa/ageGate";

const SESSION_KEY = "sawa.age-consent.v1";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index);

function daysInMonth(year: string, month: string): number {
  const resolvedYear = Number(year) || 2000;
  const resolvedMonth = Number(month) || 1;
  return new Date(resolvedYear, resolvedMonth, 0).getDate();
}

type SawaAgeGateProps = { readonly children: ReactNode };

export default function SawaAgeGate({ children }: SawaAgeGateProps) {
  const [accepted, setAccepted] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setAccepted(window.sessionStorage.getItem(SESSION_KEY) === "accepted");
    } catch {
      // The gate remains usable for this page view if browser storage is blocked.
    }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dateOfBirth = year && month && day ? `${year}-${month}-${day}` : "";
    if (!isAdultDateOfBirth(dateOfBirth)) {
      setError("Sawa AI is currently available to adults aged 18 and over. / Sawa AI inapatikana kwa watu wazima wenye umri wa miaka 18 na zaidi.");
      return;
    }
    if (!consent) {
      setError("Please confirm that you understand the limits of this service. / Tafadhali thibitisha kuwa umeelewa mipaka ya huduma hii.");
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
      className="space-y-5 rounded-none border border-line bg-panel p-5 text-text shadow-card md:p-7"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Before you begin / Kabla ya kuanza</p>
        <h2 id="sawa-age-gate-title" className="text-xl font-semibold">
          A conversation for adults / Mazungumzo ya watu wazima
        </h2>
        <p className="text-sm text-muted">
          Sawa AI is a non-clinical wellbeing companion, not a therapist, clinician or crisis service. Your date of birth is checked in this browser only; it is not sent to the server or saved.
        </p>
        <p lang="sw" className="text-sm text-muted">
          Sawa AI ni msaidizi wa ustawi asiye wa kliniki, si mtaalamu wa afya ya akili wala huduma ya dharura. Tarehe yako ya kuzaliwa itakaguliwa kwenye kivinjari hiki pekee; haitatumwa kwa seva wala kuhifadhiwa.
        </p>
        <p className="text-sm text-muted">
          If a high-severity safety concern is detected, the message that raised it may be sent to Akili Sawa's designated support inbox. Email retention depends on that inbox's settings. The service is not monitored for emergencies and cannot guarantee an immediate response.
        </p>
        <p lang="sw" className="text-sm text-muted">
          Ikiwa mfumo utagundua hatari kubwa ya usalama, ujumbe ulioibua wasiwasi huo unaweza kutumwa kwenye kisanduku maalum cha usaidizi cha Akili Sawa. Muda wa kuhifadhi barua pepe hutegemea mipangilio ya kisanduku hicho. Huduma hii haifuatiliwi kwa dharura na haiwezi kuhakikisha jibu la haraka.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium">Date of birth / Tarehe ya kuzaliwa</legend>
          <p id="sawa-date-of-birth-help" className="text-xs text-muted">
            Select the day, month and year. This is checked in your browser only.
          </p>
          <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2">
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>Day</span>
              <select
                name="birthDay"
                required
                value={day}
                onChange={(event) => setDay(event.target.value)}
                aria-describedby="sawa-date-of-birth-help"
                className="min-h-[44px] w-full border border-line bg-background px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="">Day</option>
                {Array.from({ length: daysInMonth(year, month) }, (_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return <option key={value} value={value}>{index + 1}</option>;
                })}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>Month</span>
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
                <option value="">Month</option>
                {MONTHS.map((label, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return <option key={value} value={value}>{label}</option>;
                })}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted">
              <span>Year</span>
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
                <option value="">Year</option>
                {YEARS.map((optionYear) => <option key={optionYear} value={optionYear}>{optionYear}</option>)}
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
          <span>
            I am 18 or over, understand Sawa AI is not professional or emergency care, understand the safety excerpt notice above, and agree to continue. I have read the <Link to="/privacy" className="underline underline-offset-4">Privacy notice</Link>.
            <span lang="sw" className="mt-2 block">Nina miaka 18 au zaidi, nimeelewa kuwa Sawa AI si huduma ya kitaalamu wala ya dharura, nimeelewa taarifa ya kipande cha ujumbe wa usalama hapo juu, na ninakubali kuendelea. Nimesoma <Link to="/privacy" className="underline underline-offset-4">taarifa ya faragha</Link>.</span>
          </span>
        </label>

        {error ? <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}

        <button
          type="submit"
          className="min-h-[44px] w-full bg-accent-fill px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Continue / Endelea
        </button>
      </form>
    </section>
  );
}
