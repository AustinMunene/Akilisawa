import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

type ButtonVariant = "primary" | "secondary" | "tertiary";

type ButtonProps = ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: ButtonVariant;
};

type ButtonLinkProps = {
  to: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-fill text-[#1b2624] shadow-[0_8px_18px_rgba(10,74,64,0.12)] ring-1 ring-white/25 hover:brightness-[1.04] hover:shadow-[0_12px_22px_rgba(10,74,64,0.16)] focus-visible:ring-accent/35",
  secondary:
    "bg-white/85 text-text shadow-float hover:text-accent hover:shadow-floatHover focus-visible:ring-accent/25 dark:bg-panel/85 dark:text-text",
  tertiary:
    "px-0 py-0 rounded-none text-accent hover:text-accent/80 focus-visible:ring-accent/20",
};

/*
 * Square corners across every button and button-link on the site: this string is
 * the single source for all 63 <Button>/<ButtonLink> usages, so `rounded-soft`
 * here was the only radius most of the site's CTAs ever had.
 */
const baseStyles =
  "inline-flex items-center justify-center rounded-none px-5 py-2.5 text-sm font-semibold hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2";

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        transition:
          "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
      {...props}
    />
  );
};

export const ButtonLink = ({
  to,
  variant = "primary",
  className,
  children,
}: ButtonLinkProps) => {
  return (
    <MotionLink
      to={to}
      className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        transition:
          "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {children}
    </MotionLink>
  );
};
