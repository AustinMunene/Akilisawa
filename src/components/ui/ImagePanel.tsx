import type { ReactNode } from "react";

type ImagePanelProps = {
  src?: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
};

const fallbackImage =
  "https://akilisawa.com/wp-content/uploads/2026/01/Safety.jpeg";

const ImagePanel = ({ src, alt = "", className, children }: ImagePanelProps) => {
  const resolvedSrc = src ?? fallbackImage;
  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white/80 shadow-float dark:bg-panel/80 dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(244,247,251,0.7)] via-transparent to-transparent dark:from-[rgba(18,24,38,0.75)]" />
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="relative h-full w-full object-cover"
        />
      </div>
      {children ? <div className="mt-4 text-xs text-muted">{children}</div> : null}
    </div>
  );
};

export default ImagePanel;
