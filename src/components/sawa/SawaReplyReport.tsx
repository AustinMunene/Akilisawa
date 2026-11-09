import { useId, useState } from "react";

import { promptVersion } from "../../lib/sawa/prompt";
import { buildReport, REPORT_ENDPOINT, REPORT_MAX_COMMENT, reportCopy } from "../../lib/sawa/report";
import { useSawaLanguage } from "./SawaLanguageProvider";

type SawaReplyReportProps = {
  /** The visitor's message this reply answered. */
  readonly message: string;
  readonly reply: string;
  /** Injected in tests. */
  readonly fetcher?: typeof fetch;
};

type Status = "closed" | "open" | "sending" | "sent" | "failed";

/*
 * "This didn't help" under one Sawa reply (src/lib/sawa/report.ts). Nothing
 * leaves the page until the visitor has read what will be sent and pressed
 * Send. Quiet by design: a small text button, so it never competes with the
 * conversation itself.
 */
export default function SawaReplyReport({ message, reply, fetcher }: SawaReplyReportProps) {
  const { language } = useSawaLanguage();
  const t = reportCopy[language];
  const [status, setStatus] = useState<Status>("closed");
  const [comment, setComment] = useState("");
  const commentId = useId();

  const send = async () => {
    setStatus("sending");
    const doFetch = fetcher ?? globalThis.fetch?.bind(globalThis);
    try {
      const response = await doFetch(REPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildReport({ message, reply, comment, language, promptVersion })),
      });
      setStatus(response.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return <p className="pl-1 text-xs text-muted" role="status">{t.sent}</p>;
  }

  if (status === "closed") {
    return (
      <button
        type="button"
        onClick={() => setStatus("open")}
        className="min-h-[32px] pl-1 text-xs text-muted underline-offset-4 hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        data-sawa-report=""
      >
        {t.open}
      </button>
    );
  }

  return (
    <div className="max-w-[85%] space-y-3 rounded-3xl border border-line bg-surface px-4 py-4 text-sm text-text dark:bg-panel">
      <p className="text-muted">{t.explain}</p>
      <label htmlFor={commentId} className="block space-y-1">
        <span className="text-xs font-semibold">{t.commentLabel}</span>
        <textarea
          id={commentId}
          rows={2}
          maxLength={REPORT_MAX_COMMENT}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="w-full resize-none rounded-xl border border-line bg-background px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
        />
      </label>
      {status === "failed" ? <p role="alert" className="text-xs">{t.failed}</p> : null}
      <div className="flex gap-2">
        <button type="button" onClick={() => setStatus("closed")} className="btn btn-secondary btn-sm">
          {t.cancel}
        </button>
        <button
          type="button"
          onClick={() => void send()}
          disabled={status === "sending"}
          className="btn btn-primary btn-sm"
        >
          {t.send}
        </button>
      </div>
    </div>
  );
}
