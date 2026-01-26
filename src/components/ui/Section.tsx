import type { ReactNode } from "react";
import MotionInView from "../motion/MotionInView";

type SectionProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  animate?: boolean;
  id?: string;
  variant?: "light" | "mid" | "soft" | "dark-soft";
};

const variantStyles = {
  light: "bg-background",
  mid: "bg-tint",
  soft: "bg-soft",
  "dark-soft": "bg-tintAlt",
};

const Section = ({
  children,
  className,
  innerClassName,
  animate = true,
  id,
  variant,
}: SectionProps) => {
  const content = <div className={innerClassName}>{children}</div>;
  const sectionContent = animate ? (
    <MotionInView>{content}</MotionInView>
  ) : (
    content
  );

  if (variant) {
    return (
      <section
        id={id}
        className={`relative overflow-hidden ${variantStyles[variant]}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-sheen opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent dark:from-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/15 to-transparent dark:from-transparent" />
        <div className={`relative z-10 section-wrap ${className ?? ""}`}>
          {sectionContent}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className={`section-wrap ${className ?? ""}`}
    >
      {sectionContent}
    </section>
  );
};

export default Section;
