import { Container } from "@/components/container";
import { NavLink } from "@/components/nav-link";
import { FOOTER_ELSEWHERE, FOOTER_NAV, SITE } from "@/lib/site";

/**
 * Footer: oversized wordmark, then three columns of links, then the legal line.
 * Everything sits on hairlines, states its tone, and stops there.
 */
export function SiteFooter() {
  return (
    <footer className="ix-tone-dark border-t border-line">
      <Container className="pt-20 pb-10 md:pt-28">
        <p className="text-[clamp(3.5rem,17vw,13rem)] leading-[0.8] font-medium tracking-[-0.06em] uppercase">
          <span className="text-fg">{SITE.name}</span>
          <span className="text-acid">.</span>
        </p>

        <div className="mt-16 grid grid-cols-1 gap-y-10 border-t border-line pt-8 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] tracking-[0.4em] text-label uppercase">
              {SITE.city}
            </p>
          </div>

          <nav aria-label="Site" className="md:col-span-4">
            <ul className="flex flex-col gap-4 font-mono text-[10px] tracking-[0.35em] uppercase">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <NavLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Elsewhere" className="md:col-span-4">
            <ul className="flex flex-col gap-4 font-mono text-[10px] tracking-[0.35em] uppercase">
              {FOOTER_ELSEWHERE.map((link) => (
                <li key={link.label}>
                  <NavLink link={link} />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[10px] tracking-[0.35em] text-label uppercase md:flex-row md:items-center md:justify-between">
          <p>
            © {SITE.year} {SITE.name}
          </p>
          <p>All rights reserved</p>
        </div>
      </Container>
    </footer>
  );
}
