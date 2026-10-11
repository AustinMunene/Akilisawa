import { Link } from "react-router-dom";
import { faq67 } from "../../lib/sawa/copy";

/*
 * The six §67 answers (ticket 14), placed below the product on /sawa-ai.
 *
 * Placement is the requirement, not a preference: product first, answers
 * below. This component reuses the existing `.faq-panel` + <details>
 * disclosure pattern (src/pages/Faqs.tsx) rather than hand-rolling an
 * accordion, so keyboard operability and screen-reader semantics come for
 * free. `<details>` opens and closes without animation, so reduced motion
 * needs no special handling here; the CSS hover lift degrades with
 * `motion-reduce`.
 */
const Faq67 = () => {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <h2>{faq67.heading}</h2>
        <p className="text-base text-muted md:text-lg">{faq67.intro}</p>
      </div>
      <div className="faq-panel space-y-4">
        {faq67.items.map((item) => (
          <details
            key={item.id}
            open={item.defaultOpen}
            className="rounded-card border border-line bg-surface p-5 motion-reduce:transition-none"
          >
            <summary className="cursor-pointer text-sm font-semibold text-text">
              {item.question}
            </summary>
            <div className="mt-3 space-y-3 text-sm text-muted">
              <p>{item.answer}</p>
              {item.privacyTo ? (
                <p>
                  <Link
                    to={item.privacyTo}
                    className="text-brand-dark dark:text-brand"
                  >
                    {item.privacyLabel}
                  </Link>
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default Faq67;
