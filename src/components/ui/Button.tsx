import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "md" | "sm";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
};

type ButtonLinkProps = {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  tertiary: "link-action link-underline text-brand-dark dark:text-brand",
  ghost: "btn-ghost",
};

const contentWithArrow = (children: ReactNode, arrow: boolean) => {
  if (typeof children === "string" && children.trimEnd().endsWith("→")) {
    const label = children.trimEnd();
    return <>{label.slice(0, -1)}<span className="btn-arrow" aria-hidden="true">→</span></>;
  }
  return <>{children}{arrow ? <span className="btn-arrow" aria-hidden="true">→</span> : null}</>;
};

export const Button = ({
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={`${variant === "tertiary" ? "link-action" : "btn"} ${variantClass[variant]} ${size === "sm" ? "btn-sm" : ""} ${className ?? ""}`}
    {...props}
  >
    {contentWithArrow(children, arrow)}
  </button>
);

export const ButtonLink = ({
  to,
  variant = "primary",
  size = "md",
  arrow = true,
  className,
  children,
}: ButtonLinkProps) => (
  <Link
    to={to}
    className={`${variant === "tertiary" ? "link-action" : "btn"} ${variantClass[variant]} ${size === "sm" ? "btn-sm" : ""} ${className ?? ""}`}
  >
    {contentWithArrow(children, arrow)}
  </Link>
);
