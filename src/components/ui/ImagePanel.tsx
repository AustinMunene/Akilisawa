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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.05)] dark:bg-panel/80 dark:shadow-[0_10px_20px_rgba(0,0,0,0.16)]">
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
