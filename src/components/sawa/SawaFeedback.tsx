import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import Card from "../ui/Card";

/*
 * The product feedback band (ticket 29).
 *
 * WHERE IT SITS
 * Below the conversation, above the organisation CTA and the §67 answers. The
 * §67 principle is product-first and answers-below, so a prompt inside or
 * immediately under the chat competes with the product itself. Here the
 * visitor has already had their moment with Sawa, and the band reads as a
 * coda rather than an interruption.
 *
 * WHAT IT SENDS
 * A comment, and nothing else. The endpoint ignores anything else it is
 * sent, so the conversation transcript never leaves the browser and the
 * site keeps the promise the privacy notice makes on this very page.
 *
 * THE CRISIS GUARD
 * A visitor who found Sawa unhelpful may write their crisis into this box
 * rather than into the chat, where the safety pipeline would catch it. The
 * server classifies the comment with the same bilingual lexicon the chat
 * uses, and a high-severity comment is refused and pointed at the crisis
 * resources rather than being forwarded to a mailbox nobody watches.
 */
type FeedbackStatus = "idle" | "loading" | "sent" | "error" | "support";

const MAX_COMMENT_CHARS = 2000;

const SawaFeedback = () => {
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please write your feedback before sending it.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: trimmed, page: "/sawa-ai" }),
      });

      if (response.ok) {
        setComment("");
        setStatus("sent");
        setMessage(
          "Thank you. Your feedback has been sent to the Akili Sawa team."
        );
        return;
      }

      const body = (await response.json().catch(() => null)) as {
        message?: string;
        support?: boolean;
      } | null;

      /*
       * A refusal because the comment carried crisis content is not a
       * failure of the form. The person is shown where to get help, which
       * is the whole point of the guard.
       */
      if (body?.support) {
        setStatus("support");
        setMessage(
          body.message ??
            "Please speak to someone you trust, or contact local emergency services."
        );
        return;
      }

      /*
       * Everything else is one generic message, which is the house pattern
       * the contact form already uses: the server's own wording ("Feedback
       * service not configured") is for whoever reads the API response, not
       * for a visitor.
       */
      setStatus("error");
      setMessage("We could not send your feedback. Please try again later.");
    } catch {
      setStatus("error");
      setMessage("We could not send your feedback. Please try again.");
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark dark:text-brand">
            Your feedback
          </p>
          <h2 className="text-xl md:text-2xl">Tell us what you think of Sawa</h2>
          <p className="text-sm text-muted">
            Your comment goes to the Akili Sawa team. It is not linked to your
            conversation, and the conversation itself is never sent. We may not
            be able to reply to every comment.
          </p>
        </div>

        {status === "sent" ? (
          <p className="text-sm text-muted" role="status">
            {message}
          </p>
        ) : (
          <form className="space-y-4" onSubmit={submit} noValidate>
            <label className="block">
              <span className="sr-only">Your feedback</span>
              <textarea
                name="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={MAX_COMMENT_CHARS}
                rows={4}
                placeholder="What worked, what did not, what you would change."
                className="w-full rounded-none border border-line bg-surface/90 px-3 py-2 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 dark:bg-panel/90"
              />
            </label>
            <p className="text-xs text-muted">
              Please do not include personal or clinical information.
            </p>

            {status === "error" || status === "support" ? (
              <p
                className="text-sm text-text"
                role="status"
              >
                {message}
              </p>
            ) : null}

            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send feedback"}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
};

export default SawaFeedback;
