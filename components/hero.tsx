import Image from "next/image";
import { ActionLink } from "@/components/action-link";
import { Container } from "@/components/container";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

const HERO_META = ["FW26 / 001", "SCROLL ↓"];

type HeroProps = {
  className?: string;
};

/**
 * Editorial hero that leaves a glimpse of the next section below the fold.
 */
export function Hero({ className }: HeroProps) {
  return (
    <section
      id="top"
      className={`ix-tone-dark relative isolate flex min-h-[85svh] flex-col bg-ink ${className ?? ""}`}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/campaign/homepage-campaign-v2.png"
          alt="IXZZY campaign portrait in a yellow and black beanie and hoodie"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] md:object-[55%_center]"
        />
        <span aria-hidden className="absolute inset-0 bg-ink/10" />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/45 to-transparent" />
      </div>

      {/* Scrim so type always holds over the film. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 block h-2/3 bg-gradient-to-t from-ink via-ink/75 to-transparent"
      />

      <div className="ix-rise absolute inset-x-0 top-0 z-20">
        <SiteHeader />
      </div>

      <Container className="relative z-20 mt-auto pt-40 pb-10 md:pt-56 md:pb-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="ix-rise ix-rise-late lg:col-span-8">
            <h1 className="max-w-[16ch] text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] font-medium tracking-[-0.035em] text-fg">
              {SITE.tagline}
            </h1>

            <div className="mt-8 md:mt-12">
              <ActionLink href="/shop" suffix="→">
                SHOP COLLECTION
              </ActionLink>
            </div>
          </div>

          <ul className="ix-rise ix-rise-later flex flex-col gap-4 font-mono text-[10px] tracking-[0.35em] text-label uppercase lg:col-span-4 lg:items-end">
            {HERO_META.map((item) => (
              <li key={item} className="flex items-center gap-4">
                <span aria-hidden className="block h-px w-10 bg-line" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
