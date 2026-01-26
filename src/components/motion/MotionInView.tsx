import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MotionInViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const MotionInView = ({ children, className, delay = 0 }: MotionInViewProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

export default MotionInView;
