import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";
import type { Product } from "@/lib/catalog";

type ProductCardProps = { product: Product };

/**
 * Product tile: media frame, then a hairline rule with name and price.
 * Flat, square, no shadow — the image does the work.
 *
 * The whole tile links to its catalogue-backed product page.
 *
 * Media sits in a fixed 4:5 frame with a shared inner inset, and photographs are
 * `object-contain` — so a product is never cropped or stretched, keeps its own
 * proportions, and lands at the same scale inside the same frame as every other
 * product. The frame is left unfilled: the surrounding band is the whitespace.
 *
 * The name gets a growing hairline on hover rather than a colour change, since
 * this tile sits in the off-white band where `--ix-fg` and `--ix-accent` are
 * both black — a colour swap there would be invisible. Yellow is reserved for
 * the black sections.
 *
 * Products with no imagery yet fall back to `MediaPlaceholder`, which is also
 * the only place a corner index is drawn — so the homepage keeps its numbering
 * and the shop grid stays uniform.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <ProductPhoto src={product.images?.[0]} alt={product.name} index={product.index} />

        <div className="mt-4 flex items-start justify-between gap-6 border-t border-line pt-4">
          <h3 className="relative text-[11px] tracking-[0.18em] text-fg uppercase">
            {product.name}
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
            />
          </h3>
          <p className="shrink-0 font-mono text-[11px] text-label">
            {product.price}
          </p>
        </div>
      </Link>
    </article>
  );
}
