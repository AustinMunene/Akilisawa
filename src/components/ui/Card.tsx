import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

const Card = ({ title, eyebrow, children, className }: CardProps) => {
  return (
    <div
      className={`rounded-3xl bg-white/85 p-6 shadow-float backdrop-blur transition hover:-translate-y-0.5 hover:shadow-floatHover dark:bg-panel/85 dark:shadow-[0_12px_26px_rgba(0,0,0,0.22)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.28)] ${className ?? ""}`}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      ) : null}
      <div className={`${title || eyebrow ? "mt-4" : ""} text-sm text-muted`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
