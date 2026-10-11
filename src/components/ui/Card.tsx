import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { ENTRY_EASE, fadeUp } from "../../lib/animation";

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
      className={`card rounded-3xl border border-transparent bg-surface/85 p-6 shadow-[0_8px_18px_rgba(20,40,70,0.08)] hover:border-brand-line hover:shadow-[0_14px_28px_rgba(20,40,70,0.13)] dark:bg-panel/85 dark:shadow-[0_8px_16px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${className ?? ""}`}
      variants={fadeUp}
      initial={
        prefersReducedMotion ? false : { ...(fadeUp.hidden as object), x: xOffset }
      }
      whileInView={{ ...(fadeUp.visible as object), x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -4, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.35,
              ease: ENTRY_EASE,
            }
      }
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark dark:text-brand">
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
