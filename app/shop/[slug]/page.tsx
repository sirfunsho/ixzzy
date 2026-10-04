import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { Container } from "@/components/container";
import { RelatedProducts } from "@/components/related-products";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { FEATURED, NEW_ARRIVALS, PRODUCTS } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.slug === slug);
  if (!product) return { title: "Product not found — IXZZY" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.slug === slug);
  if (!product) notFound();

  const editorialPicks = [...FEATURED, ...NEW_ARRIVALS, ...PRODUCTS];
  const relatedProducts = editorialPicks
    .filter((item, index, all) => item.slug !== product.slug && all.findIndex((candidate) => candidate.slug === item.slug) === index)
    .slice(0, 4);

  return (
    <>
      <main className="flex flex-1 flex-col">
        <section className="ix-tone-dark">
          <SiteHeader />
        </section>
        <ProductPurchasePanel product={product} />
        <Section tone="light" className="py-16 md:py-24">
          <Container>
            <SectionHeading label="SELECTION" index="003" title="YOU MAY ALSO LIKE" />
            <div className="mt-12 md:mt-16">
              <RelatedProducts products={relatedProducts} />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
