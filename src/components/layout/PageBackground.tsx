import type { ReactNode } from "react";

type PageBackgroundProps = {
  children: ReactNode;
};

const PageBackground = ({ children }: PageBackgroundProps) => {
  return (
    <div className="relative min-h-screen bg-background text-text">
      <div className="pointer-events-none absolute inset-0 bg-gradient-wash opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-sheen opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-12" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PageBackground;
