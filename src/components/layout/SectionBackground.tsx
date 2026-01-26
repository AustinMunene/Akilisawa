import type { ReactNode } from "react";
import Section from "../ui/Section";

type SectionVariant =
  | "light"
  | "mid"
  | "soft"
  | "dark-soft"
  | "neutral"
  | "tint"
  | "tintAlt"
  | "gradient"
  | "grid"
  | "image";

type SectionBackgroundProps = {
  variant?: SectionVariant;
  imageUrl?: string;
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  innerClassName?: string;
  id?: string;
  animate?: boolean;
};

const variantBase: Record<SectionVariant, string> = {
  light: "bg-background",
  mid: "bg-tint",
  soft: "bg-soft",
  "dark-soft": "bg-tintAlt",
  neutral: "bg-soft",
  tint: "bg-tint",
  tintAlt: "bg-tintAlt",
  gradient: "bg-background",
  grid: "bg-tint",
  image: "bg-soft",
};

const SectionBackground = ({
  variant = "neutral",
  imageUrl,
  children,
  className,
  wrapperClassName,
  innerClassName,
  id,
  animate,
}: SectionBackgroundProps) => {
  return (
    <section
      className={`relative overflow-hidden ${variantBase[variant]} ${wrapperClassName ?? ""}`}
    >
      {variant === "gradient" ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-wash opacity-60" />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-sheen opacity-35" />
      )}
      {variant === "grid" ? (
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-18" />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent dark:from-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/15 to-transparent dark:from-transparent" />
      {variant === "image" && imageUrl ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90 dark:from-[rgba(10,14,22,0.7)] dark:via-[rgba(10,14,22,0.55)] dark:to-[rgba(10,14,22,0.75)]" />
        </>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03]" />
      <Section
        id={id}
        innerClassName={innerClassName}
        animate={animate}
        className={`relative z-10 ${className ?? ""}`}
      >
        {children}
      </Section>
    </section>
  );
};

export default SectionBackground;
