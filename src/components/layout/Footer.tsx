import { Link } from "react-router-dom";
import { footerColumns } from "../../lib/navigation";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-soft">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold text-text">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-muted">
                {column.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="transition hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 text-xs text-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© {year} Akili Sawa. All rights reserved.</p>
            <a
              href="https://www.linkedin.com/company/akili-sawa/"
              aria-label="Akili Sawa on LinkedIn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-muted shadow-float transition hover:scale-110 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:bg-panel/85"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5C0 2.12 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM0 8h5v16H0V8Zm7.5 0h4.8v2.2h.1c.7-1.3 2.4-2.7 5-2.7 5.3 0 6.3 3.5 6.3 8.1V24h-5V16.5c0-1.8 0-4.1-2.5-4.1s-2.9 1.9-2.9 4V24h-5V8Z" />
              </svg>
            </a>
          </div>
          <p className="mt-3">
            Akili Sawa provides non-clinical, preventive mental wellbeing
            support and does not offer diagnosis, therapy, or crisis services.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
