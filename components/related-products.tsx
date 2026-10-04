"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductPhoto } from "@/components/product-photo";
import type { CatalogueProduct } from "@/lib/catalog";

function RelatedProductCard({ product }: { product: CatalogueProduct }) {
  const { addItem } = useCart();
  const [colour, setColour] = useState(product.colours[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  return (
    <article className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <ProductPhoto src={product.images?.[0]} alt={product.name} />
        <div className="mt-4 flex items-start justify-between gap-4 border-t border-line pt-4">
          <h3 className="text-[11px] tracking-[0.18em] uppercase group-hover:underline group-hover:underline-offset-4">
            {product.name}
          </h3>
          <p className="shrink-0 font-mono text-[11px] text-muted">{product.price}</p>
        </div>
      </Link>

      <div className="mt-5 flex flex-wrap gap-3">
        {product.colours.length > 1 ? (
          <label className="min-w-0 flex-1">
            <span className="sr-only">Colour for {product.name}</span>
            <select
              value={colour}
              onChange={(event) => { setColour(event.target.value); setAdded(false); }}
              className="w-full appearance-none border border-line bg-transparent px-3 py-3 font-mono text-[9px] tracking-[0.15em] uppercase focus-visible:outline"
            >
              {product.colours.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ) : null}
        {product.sizes.length > 1 ? (
          <label className="min-w-0 flex-1">
            <span className="sr-only">Size for {product.name}</span>
            <select
              value={size}
              onChange={(event) => { setSize(event.target.value); setAdded(false); }}
              className="w-full appearance-none border border-line bg-transparent px-3 py-3 font-mono text-[9px] tracking-[0.15em] uppercase focus-visible:outline"
            >
              {product.sizes.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ) : (
          <p className="flex-1 self-center font-mono text-[9px] tracking-[0.15em] text-muted uppercase">ONE SIZE</p>
        )}
        <button
          type="button"
          onClick={() => {
            addItem({ slug: product.slug, colour, size }, 1);
            setAdded(true);
          }}
          className="w-full border border-fg px-4 py-4 font-mono text-[9px] tracking-[0.22em] uppercase transition-colors hover:bg-fg hover:text-on-accent"
        >
          {added ? "ADDED TO CART" : "QUICK ADD"}
        </button>
      </div>
    </article>
  );
}

export function RelatedProducts({ products }: { products: readonly CatalogueProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => <RelatedProductCard key={product.id} product={product} />)}
    </div>
  );
}
