import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "../../lib/animation";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

const PageTransition = ({ children, className }: PageTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.main
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: prefersReducedMotion ? undefined : EASE_OUT,
      }}
    >
      {children}
    </motion.main>
  );
};

export default PageTransition;
