import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { navLinks } from "../../lib/navigation";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dark mode toggle temporarily disabled.

  return (
    <header
      className={`sticky top-0 z-40 border-b border-transparent backdrop-blur-xl transition ${
        isScrolled
          ? "bg-white/55 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
          : "bg-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link to="/" className="flex items-center">
          <img
            src="/akili-sawa-logo.png"
            alt="Akili Sawa"
            loading="eager"
            decoding="async"
            className="h-8 w-auto brightness-0 drop-shadow-[0_2px_6px_rgba(15,23,42,0.25)] dark:brightness-100 dark:invert"
          />
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition ${
                    isActive
                      ? "bg-accent/15 text-accent shadow-[0_8px_16px_rgba(27,49,75,0.1)] ring-1 ring-accent/20 font-semibold dark:bg-accent/20"
                      : "text-muted hover:text-text"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          {/* Dark mode toggle hidden for now */}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
