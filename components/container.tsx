import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** One horizontal rhythm for the whole site. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1800px] px-6 md:px-10 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}