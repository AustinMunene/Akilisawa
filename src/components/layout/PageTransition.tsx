import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

const PageTransition = ({ children, className }: PageTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.main
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.2,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.main>
  );
};

export default PageTransition;
