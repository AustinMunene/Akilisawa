import type { ReactNode } from "react";
import Section from "../ui/Section";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: "light" | "mid" | "soft" | "dark-soft";
};

const PageShell = ({ title, subtitle, children, variant }: PageShellProps) => {
  return (
    <Section variant={variant} className="max-w-7xl pt-24 md:pt-28">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Akili Sawa
        </p>
        <h1 className="text-balance">{title}</h1>
        {subtitle ? (
          <p className="text-base text-muted md:text-lg">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="mt-12 space-y-6">{children}</div> : null}
    </Section>
  );
};

export default PageShell;
