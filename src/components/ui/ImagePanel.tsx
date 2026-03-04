import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { EASE_OUT, scaleIn } from "../../lib/animation";

type ImagePanelProps = {
  src?: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
};

const fallbackImage =
  "https://akilisawa.com/wp-content/uploads/2026/01/Safety.jpeg";

const ImagePanel = ({ src, alt = "", className, children }: ImagePanelProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const id = useId();
  const direction =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 === 0
      ? 1
      : -1;
  const xOffset = prefersReducedMotion ? 0 : (isMobile ? 6 : 16) * direction;
  const resolvedSrc = src ?? fallbackImage;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <div className={`w-full ${className ?? ""}`}>
      <motion.div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.05)] dark:bg-panel/80 dark:shadow-[0_10px_20px_rgba(0,0,0,0.16)]"
        variants={scaleIn}
        initial={
          prefersReducedMotion
            ? false
            : { ...(scaleIn.hidden as object), x: xOffset }
        }
        whileInView={{ ...(scaleIn.visible as object), x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        whileHover={prefersReducedMotion ? undefined : { y: -3 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 0.4,
                ease: EASE_OUT,
              }
        }
      >
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="relative h-full w-full object-cover"
        />
      </motion.div>
      {children ? <div className="mt-4 text-xs text-muted">{children}</div> : null}
    </div>
  );
};

export default ImagePanel;
