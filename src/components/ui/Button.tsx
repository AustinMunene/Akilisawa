import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "tertiary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
    "bg-accent text-[#0b1220] shadow-[0_8px_18px_rgba(15,23,42,0.06)] ring-1 ring-white/15 hover:brightness-105 hover:shadow-[0_12px_22px_rgba(15,23,42,0.08)] focus-visible:ring-accent/35",
  secondary:
    "bg-white/85 text-text shadow-float hover:text-accent hover:shadow-floatHover focus-visible:ring-accent/25 dark:bg-panel/85 dark:text-text",
  tertiary:
    "px-0 py-0 rounded-none text-accent hover:text-accent/80 focus-visible:ring-accent/20",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-soft px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2";

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
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
    <Link
      to={to}
      className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
};
