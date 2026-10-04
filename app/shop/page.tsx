import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { COLLECTION, PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "SHOP",
  description: `The IXZZY ${COLLECTION} collection.`,
};

/**
 * Shop — the full HEAT//01 range, read straight from `PRODUCTS` so there is no
 * second product list to keep in sync.
 *
 * Product links lead to the catalogue-backed detail pages.
 */
export default function ShopPage() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <section className="ix-tone-dark">
          <SiteHeader />

          <Container className="pt-16 pb-20 md:pt-24 md:pb-28">
            <SectionHeading
              level="h1"
              label="COLLECTION"
              index="001"
              title="SHOP"
            />

            <p className="mt-8 font-mono text-[10px] tracking-[0.35em] text-label uppercase">
              {PRODUCTS.length} Items
            </p>
          </Container>
        </section>

        <Section tone="light" className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-16 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-20">
              {PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
