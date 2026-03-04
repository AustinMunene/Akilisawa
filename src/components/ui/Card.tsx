import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { EASE_OUT, fadeUp } from "../../lib/animation";

type CardProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

const Card = ({ title, eyebrow, children, className }: CardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const id = useId();
  const direction =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 === 0
      ? 1
      : -1;
  const xOffset = prefersReducedMotion ? 0 : (isMobile ? 6 : 16) * direction;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <motion.div
      className={`rounded-3xl bg-white/85 p-6 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:shadow-[0_10px_22px_rgba(15,23,42,0.06)] dark:bg-panel/85 dark:shadow-[0_10px_20px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] ${className ?? ""}`}
      variants={fadeUp}
      initial={
        prefersReducedMotion ? false : { ...(fadeUp.hidden as object), x: xOffset }
      }
      whileInView={{ ...(fadeUp.visible as object), x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.6,
              ease: EASE_OUT,
            }
      }
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      ) : null}
      <div className={`${title || eyebrow ? "mt-4" : ""} text-sm text-muted`}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
