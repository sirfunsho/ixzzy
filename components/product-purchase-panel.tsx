"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/container";
import { ProductPhoto } from "@/components/product-photo";
import { useCart } from "@/components/cart-provider";
import type { CatalogueProduct } from "@/lib/catalog";

export function ProductPurchasePanel({ product }: { product: CatalogueProduct }) {
  const { addItem, openCart } = useCart();
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const images = [...(product.images ?? []), ...(product.modelImages ?? [])];

  function addToCart() {
    addItem(
      { slug: product.slug, colour: selectedColour, size: selectedSize },
      quantity,
    );
    setAdded(true);
  }

  return (
    <section className="ix-tone-light py-8 md:py-10">
      <Container>
        <p className="mb-5 font-mono text-[10px] tracking-[0.3em] text-label uppercase">
          <Link href="/shop" className="transition-colors hover:text-fg">SHOP</Link>
          <span aria-hidden> / </span>
          <span>{product.name}</span>
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="mx-auto w-full max-w-[34rem] lg:col-span-6 lg:max-w-none">
            <ProductPhoto
              src={images[activeImage]}
              alt={`${product.name} image ${activeImage + 1}`}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="max-h-[min(62svh,36rem)]"
              placeholderLabel="PRODUCT IMAGE COMING SOON"
            />
            {images.length > 1 ? (
              <div className="mt-0.5 flex gap-3" aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    onClick={() => setActiveImage(index)}
                  className={`relative aspect-[4/5] w-16 overflow-hidden border bg-paper transition-colors md:w-20 ${
                      activeImage === index ? "border-fg" : "border-line"
                    }`}
                  >
                    <Image src={image} alt="" fill sizes="80px" className="object-contain" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <p className="font-mono text-[10px] tracking-[0.35em] text-label uppercase">
              PRODUCT
            </p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.75rem)] leading-[0.94] font-medium tracking-[-0.04em] uppercase">
              {product.name}
            </h1>
            <p className="mt-4 font-mono text-sm tracking-[0.12em]">{product.price}</p>
            <p className="mt-5 max-w-[42ch] text-sm leading-6 text-muted">{product.description}</p>

            <div className="mt-7 border-t border-line pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase">COLOUR</h2>
                <p className="text-xs text-muted">{selectedColour}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colours.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    aria-pressed={selectedColour === colour}
                    onClick={() => { setSelectedColour(colour); setAdded(false); }}
                    className={`border px-4 py-3 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors ${
                      selectedColour === colour
                        ? "border-fg bg-fg text-on-accent"
                        : "border-line text-fg hover:border-fg"
                    }`}
                  >
                    {colour}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase">SIZE</h2>
                <p className="text-xs text-muted">{selectedSize}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selectedSize === size}
                    onClick={() => { setSelectedSize(size); setAdded(false); }}
                    className={`min-w-14 border px-4 py-3 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors ${
                      selectedSize === size
                        ? "border-fg bg-fg text-on-accent"
                        : "border-line text-fg hover:border-fg"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase">QUANTITY</h2>
              <div className="flex items-center border border-line font-mono text-xs">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 py-3 hover:bg-black/5">−</button>
                <span aria-live="polite" className="min-w-8 text-center">{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="px-4 py-3 hover:bg-black/5">+</button>
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className="mt-6 flex w-full items-center justify-center border border-fg bg-fg px-6 py-5 font-mono text-[11px] font-medium tracking-[0.28em] text-on-accent uppercase transition-colors hover:bg-transparent hover:text-fg"
            >
              {added ? "ADDED TO CART" : "ADD TO CART"}
            </button>
            {added ? (
              <p className="mt-4 text-center font-mono text-[10px] tracking-[0.25em] uppercase">
                <button type="button" onClick={openCart} className="underline underline-offset-4">VIEW CART</button>
              </p>
            ) : null}
            <p className="mt-6 border-t border-line pt-4 text-[11px] leading-6 text-muted">
              Life is IXZZY. HEAT//01.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
