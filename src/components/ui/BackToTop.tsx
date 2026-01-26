import { useEffect, useState } from "react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 480);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-text shadow-float transition hover:-translate-y-1 hover:shadow-floatHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:bg-panel/85"
    >
      <span className="text-lg">↑</span>
    </button>
  );
};

export default BackToTop;
