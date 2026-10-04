import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteLink } from "@/lib/site";

type NavLinkProps = {
  link: SiteLink;
  className?: string;
};

/**
 * Navigation link with a hairline underline that grows on hover — the only
 * movement the navigation has. Colours come from the surrounding section tone.
 *
 * Homepage-only build: destinations are in-page anchors today, so those render
 * as plain `<a>`. Anything else goes through `next/link`, which is what real
 * routes (/shop, /account, …) will use later.
 */
export function NavLink({ link, className }: NavLinkProps) {
  const classes = `group relative inline-block text-muted transition-colors duration-300 hover:text-fg focus-visible:text-fg ${className ?? ""}`;

  const content: ReactNode = (
    <>
      {link.label}
      {link.accent ? <span className="text-accent"> {link.accent}</span> : null}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </>
  );

  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} className={classes}>
        {content}
      </a>
    );
  }

  const externalProps = link.external
    ? { target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Link href={link.href} {...externalProps} className={classes}>
      {content}
    </Link>
  );
}