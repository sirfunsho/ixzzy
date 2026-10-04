import Link from "next/link";
import { Container } from "@/components/container";
import { NavLink } from "@/components/nav-link";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import { CartNavLink } from "@/components/cart-nav-link";

type SiteHeaderProps = {
  className?: string;
};

/**
 * Minimal navigation: wordmark left, three destinations right. It sits over the
 * hero rather than sticking, so the page stays quiet once you start scrolling.
 */
export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header className={`relative z-20 w-full ${className ?? ""}`}>
      <Container className="flex items-center justify-between py-6 md:py-8">
        <Link
          href="/"
          className="text-sm font-medium tracking-[0.5em] text-fg uppercase transition-colors duration-300 hover:text-accent"
        >
          {SITE.name}
        </Link>

        <nav
          aria-label="Primary"
          className="flex items-center gap-5 font-mono text-[10px] tracking-[0.25em] uppercase md:gap-10 md:tracking-[0.35em]"
        >
          {PRIMARY_NAV.map((link) => (
            link.label === "CART" ? (
              <CartNavLink key={link.label} />
            ) : (
              <NavLink key={link.label} link={link} />
            )
          ))}
        </nav>
      </Container>
    </header>
  );
}
