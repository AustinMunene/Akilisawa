import type { ReactNode } from "react";

type IconContainerProps = {
  children: ReactNode;
  className?: string;
};

const IconContainer = ({ children, className }: IconContainerProps) => {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-accent shadow-float dark:bg-panel/85 ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default IconContainer;
