import type { ReactNode } from "react";

export type SectionTone = "dark" | "light";

type SectionProps = {
  children: ReactNode;
  id?: string;
  /** Drives the fg / line / label tokens the children inherit. */
  tone?: SectionTone;
  className?: string;
};

/**
 * Full-bleed band with a hairline top edge and a declared tone. Padding is left
 * to the caller so the vertical rhythm stays explicit at the call site.
 */
export function Section({
  children,
  id,
  tone = "dark",
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`ix-tone-${tone} border-t border-line ${className ?? ""}`}
    >
      {children}
    </section>
  );
}