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

  return (
    <>
      {/* Transparent at rest, so the hero paints straight through with no band
          across it. Once scrolled it takes `bg-background` — the page's OWN
          token, so it flips to the dark ground in dark mode with no `dark:`
          variant. The previous hardcoded `rgba(251,250,247,0.72)` matched the
          light body but not the green-tinted hero above it, and had no dark
          equivalent at all: a cream bar across a dark page. */}
      <header
        className={`sticky top-0 z-40 border-b border-transparent backdrop-blur-xl transition ${
          isScrolled
            ? "bg-background/85 shadow-[0_8px_18px_rgba(20,40,70,0.06)]"
            : "bg-transparent"
        }`}
        style={{
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
          transition:
            "background-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), backdrop-filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="flex items-center">
            <img
              src="/akili-sawa-logo.png"
              alt="Akili Sawa"
              loading="eager"
              decoding="async"
              className="h-8 w-auto brightness-0 drop-shadow-[0_2px_6px_rgba(20,40,70,0.25)] dark:invert"
            />
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-x-3 text-sm font-medium md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link link-underline px-3 py-1 font-medium ${isActive ? "font-semibold" : ""}`
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
              className="btn btn-secondary btn-circle md:hidden"
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
          <div className="absolute right-4 top-20 z-10 w-[min(90vw,320px)] rounded-3xl bg-surface/95 p-4 shadow-[0_20px_50px_rgba(20,40,70,0.18)]">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `nav-link link-underline rounded-2xl px-4 py-2 ${isActive ? "font-semibold" : ""}`
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
