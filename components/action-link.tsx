import type { ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  /** Rendered after the label, e.g. the arrow. Slides on hover. */
  suffix?: string;
  className?: string;
};

/**
 * Square-cut call to action. Acid yellow only arrives on hover, which is the
 * loudest moment on the page and still reserved for one element.
 */
export function ActionLink({
  href,
  children,
  suffix,
  className,
}: ActionLinkProps) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-4 border border-line px-6 py-4 font-mono text-[10px] tracking-[0.35em] text-fg uppercase transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-on-accent md:px-8 md:py-5 ${className ?? ""}`}
    >
      {children}
      {suffix ? (
        <span
          aria-hidden
          className="block transition-transform duration-500 ease-out group-hover:translate-x-1"
        >
          {suffix}
        </span>
      ) : null}
    </a>
  );
}