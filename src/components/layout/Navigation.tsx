import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { navLinks } from "../../lib/navigation";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dark mode toggle temporarily disabled.

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-transparent backdrop-blur-xl transition ${
          isScrolled
            ? "bg-white/55 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
            : "bg-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="flex items-center">
            <img
              src="/akili-sawa-logo.png"
              alt="Akili Sawa"
              loading="eager"
              decoding="async"
              className="h-8 w-auto brightness-0 drop-shadow-[0_2px_6px_rgba(15,23,42,0.25)]"
            />
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-x-3 text-sm font-medium md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1 transition ${
                      isActive
                        ? "bg-accent/15 text-accent shadow-[0_8px_16px_rgba(27,49,75,0.1)] ring-1 ring-accent/20 font-semibold"
                        : "text-muted hover:text-text"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-text shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
            >
              {isMenuOpen ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute right-4 top-20 z-10 w-[min(90vw,320px)] rounded-3xl bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-2 transition ${
                      isActive
                        ? "bg-accent/15 text-accent ring-1 ring-accent/20 font-semibold"
                        : "text-muted hover:text-text"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Navigation;
