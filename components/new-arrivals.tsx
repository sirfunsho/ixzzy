import Link from "next/link";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { NEW_ARRIVALS } from "@/lib/catalog";

/**
 * New arrivals. A compact two-up mobile row and a four-up desktop row.
 *
 * The "SHOP ALL" affordance leads into the full catalogue.
 */
export function NewArrivals() {
  return (
    <Section id="new-arrivals" tone="light" className="py-16 md:py-32">
      <Container>
        <SectionHeading
          label="NEW"
          index="001"
          title="NEW ARRIVALS"
          action={
            <Link
              href="/shop"
              className="group relative inline-block shrink-0 transition-colors duration-300 hover:text-fg"
            >
              SHOP ALL
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
              />
            </Link>
          }
        />

        <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-20 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
