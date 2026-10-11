import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-brand-line bg-brand-soft px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-dark dark:text-brand ${className ?? ""}`}
    >
      {children}
    </span>
  );
};

export default Badge;
