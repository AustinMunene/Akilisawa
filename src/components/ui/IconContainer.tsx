import type { ReactNode } from "react";

type IconContainerProps = {
  children: ReactNode;
  className?: string;
};

const IconContainer = ({ children, className }: IconContainerProps) => {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-line bg-brand-soft text-brand-dark dark:text-brand ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default IconContainer;
