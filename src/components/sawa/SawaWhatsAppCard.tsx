import { useId, useState } from "react";

import type { SeverityTier } from "../../lib/sawa/safety/tiers";
import { whatsappCopy, whatsappLink, whatsappMessage } from "../../lib/sawa/whatsapp";
import { useSawaLanguage } from "./SawaLanguageProvider";

type SawaWhatsAppCardProps = {
  readonly number: string;
  /** The visitor's own message that raised the concern. */
  readonly excerpt: string;
  readonly tier: SeverityTier;
};

/*
 * Offered under a support or crisis message when the WhatsApp line is
 * configured (see src/lib/sawa/whatsapp.ts). The link is a plain anchor: the
 * visitor opens WhatsApp and sends the message themselves; nothing is sent
 * from here. "Add what I wrote" is off by default, so the visitor's own words
 * leave the page only when they choose.
 */
export default function SawaWhatsAppCard({ number, excerpt, tier }: SawaWhatsAppCardProps) {
  const { language } = useSawaLanguage();
  const t = whatsappCopy[language];
  const [includeExcerpt, setIncludeExcerpt] = useState(false);
  const checkboxId = useId();
  const href = whatsappLink(number, whatsappMessage(language, includeExcerpt ? excerpt : undefined));

  return (
    <div
      className="max-w-[85%] space-y-3 rounded-3xl border border-line bg-surface px-4 py-4 text-sm text-text dark:bg-panel"
      data-sawa-whatsapp=""
    >
      {tier === "high" ? <p className="font-semibold">{t.urgent}</p> : null}
      <div className="space-y-1">
        <p className="font-semibold">{t.title}</p>
        <p className="text-muted">{t.body}</p>
        <p className="text-muted">{t.reply}</p>
      </div>
      {excerpt.trim() ? (
        <label htmlFor={checkboxId} className="flex min-h-[44px] items-start gap-3">
          <input
            id={checkboxId}
            type="checkbox"
            checked={includeExcerpt}
            onChange={(event) => setIncludeExcerpt(event.target.checked)}
            className="mt-1 size-4 accent-accent"
          />
          <span>{t.includeLabel}</span>
        </label>
      ) : null}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-sm"
      >
        {t.open}
      </a>
    </div>
  );
}
