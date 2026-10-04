import { BrandStatement } from "@/components/brand-statement";
import { FeaturedCollection } from "@/components/featured-collection";
import { Hero } from "@/components/hero";
import { NewArrivals } from "@/components/new-arrivals";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Hero />
        <NewArrivals />
        <BrandStatement />
        <FeaturedCollection />
      </main>
      <SiteFooter />
    </>
  );
}
