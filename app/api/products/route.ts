import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import { priceInNaira } from "@/lib/money";

/** Public catalogue data used by the website and the IXZZY mobile app. */
export async function GET() {
  const products = PRODUCTS.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: priceInNaira(product.price),
    displayPrice: product.price,
    description: product.description,
    sizes: product.sizes,
    colours: product.colours,
    images: product.images ?? [],
  }));

  return NextResponse.json({ products }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}
