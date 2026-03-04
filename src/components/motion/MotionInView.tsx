import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, fadeUp } from "../../lib/animation";

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
      variants={fadeUp}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.6,
              ease: EASE_OUT,
              delay,
            }
      }
    >
      {children}
    </motion.div>
  );
};

export default MotionInView;
