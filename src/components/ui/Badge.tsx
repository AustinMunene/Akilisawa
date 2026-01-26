import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-white/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted shadow-float dark:bg-panel/85 dark:text-muted ${className ?? ""}`}
    >
      {children}
    </span>
  );
};

export default Badge;
