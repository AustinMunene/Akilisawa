import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/*
 * Scrolls to the top on a route change, or to the anchor when the link carries
 * one. Links such as /privacy#sawa-privacy (age gate, chat, FAQ) would
 * otherwise land at the top of the page, because client-side navigation does
 * not jump to a hash on its own.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the new route's content is in the DOM.
      const frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    return undefined;
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
