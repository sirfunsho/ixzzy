import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** Left side of the label, e.g. "NEW". */
  label: string;
  /** Right side of the label, e.g. "001". */
  index: string;
  title: string;
  /** Optional link closing the label rule, e.g. "SHOP ALL". */
  action?: ReactNode;
  /** Heading level. Pages take "h1"; sections within a page keep the default. */
  level?: "h1" | "h2";
};

/**
 * Numbered section header: mono label and hairline rule, then the heavy
 * uppercase title. Used by every section so the rhythm stays identical.
 */
export function SectionHeading({
  label,
  index,
  title,
  action,
  level = "h2",
}: SectionHeadingProps) {
  const headingClass =
    "mt-8 text-[clamp(1.75rem,5.5vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.03em] text-fg uppercase md:mt-10";

  return (
    <div>
      <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.4em] text-label uppercase">
        <span>
          {label} / {index}
        </span>
        <span aria-hidden className="block h-px flex-1 bg-line" />
        {action}
      </div>

      {level === "h1" ? (
        <h1 className={headingClass}>{title}</h1>
      ) : (
        <h2 className={headingClass}>{title}</h2>
      )}
    </div>
  );
}