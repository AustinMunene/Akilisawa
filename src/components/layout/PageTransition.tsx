import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ENTRY_EASE, EXIT_EASE } from "../../lib/animation";

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
      animate={{
        opacity: 1,
        y: 0,
        transition: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: ENTRY_EASE },
      }}
      exit={{
        opacity: 0,
        y: -8,
        transition: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: EXIT_EASE },
      }}
    >
      {children}
    </motion.main>
  );
};

export default PageTransition;
