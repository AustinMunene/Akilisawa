import type { Transition, Variants } from "framer-motion";

// Entry and exit easings for calm, premium motion
export const ENTRY_EASE: Transition["ease"] = [0.25, 0.46, 0.45, 0.94];
export const EXIT_EASE: Transition["ease"] = [0.4, 0, 0.2, 1];

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: ENTRY_EASE,
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: ENTRY_EASE,
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: ENTRY_EASE,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

