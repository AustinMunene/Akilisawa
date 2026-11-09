import { useSawaLanguage } from "./SawaLanguageProvider";

type SawaLanguageToggleProps = {
  readonly className?: string;
};

const OPTIONS = [
  { value: "en", label: "English" },
  { value: "sw", label: "Kiswahili" },
] as const;

export default function SawaLanguageToggle({ className }: SawaLanguageToggleProps) {
  const { language, setLanguage } = useSawaLanguage();

  return (
    <div
      role="group"
      aria-label="Language / Lugha"
      className={`inline-flex border border-line bg-surface p-1 ${className ?? ""}`}
    >
      {OPTIONS.map((option) => {
        const selected = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => setLanguage(option.value)}
            className={`min-h-[44px] px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected
                ? "bg-accent-fill text-accent-on-fill"
                : "text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
