import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionInViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const MotionInView = ({ children, className, delay = 0 }: MotionInViewProps) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 120,
              damping: 22,
              mass: 0.9,
              delay,
            }
      }
    >
      {children}
    </motion.div>
  );
};

export default MotionInView;
