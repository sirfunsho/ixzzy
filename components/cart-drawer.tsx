"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { cartLineKey, useCart } from "@/components/cart-provider";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { PRODUCTS } from "@/lib/catalog";
import { formatNaira, priceInNaira } from "@/lib/money";

export function CartDrawer() {
  const {
    lines,
    ready,
    syncError,
    itemCount,
    isCartOpen,
    closeCart,
    setQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!isCartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const subtotal = lines.reduce((total, line) => {
    const product = PRODUCTS.find((item) => item.slug === line.slug);
    return total + (product ? priceInNaira(product.price) * line.quantity : 0);
  }, 0);
  const recommendations = PRODUCTS
    .filter((product) => !lines.some((line) => line.slug === product.slug))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" aria-label="Cart drawer">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/65"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="ix-tone-light relative z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-paper text-fg"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5 md:px-8">
          <h2 id="cart-drawer-title" className="font-mono text-[11px] tracking-[0.3em] uppercase">
            YOUR CART <span className="text-muted">({itemCount})</span>
          </h2>
          <button type="button" onClick={closeCart} className="font-mono text-[10px] tracking-[0.2em] uppercase underline underline-offset-4">
            CLOSE
          </button>
        </header>

        {syncError ? <p role="alert" className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800 md:px-8">{syncError}</p> : null}

        {!ready ? (
          <p className="py-14 text-center font-mono text-[10px] tracking-[0.25em] text-muted uppercase">LOADING CART</p>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">YOUR CART IS CLEAR</p>
            <p className="mt-5 text-2xl font-medium tracking-[-0.03em] uppercase">Make your first move.</p>
            <Link href="/shop" onClick={closeCart} className="mt-8 border border-fg px-6 py-4 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors hover:bg-fg hover:text-on-accent">
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ul className="divide-y divide-line px-6 md:px-8">
                {lines.map((line) => {
                  const product = PRODUCTS.find((item) => item.slug === line.slug);
                  if (!product) return null;
                  const key = cartLineKey(line);
                  const image = product.images?.[0];
                  return (
                    <li key={key} className="grid grid-cols-[5rem_1fr] gap-4 py-5">
                      <Link href={`/shop/${product.slug}`} onClick={closeCart} className="relative block aspect-[4/5] overflow-hidden bg-paper">
                        {image ? (
                          <Image src={image} alt={product.name} fill sizes="80px" className="object-contain" />
                        ) : (
                          <MediaPlaceholder ratio={null} label="PRODUCT IMAGE COMING SOON" className="h-full w-full" />
                        )}
                      </Link>
                      <div className="flex min-w-0 flex-col justify-between">
                        <div>
                          <Link href={`/shop/${product.slug}`} onClick={closeCart} className="text-[11px] tracking-[0.14em] uppercase hover:underline">{product.name}</Link>
                          <p className="mt-2 font-mono text-[9px] tracking-[0.15em] text-muted uppercase">{line.colour} / {line.size}</p>
                          <p className="mt-3 font-mono text-[11px]">{product.price}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-line font-mono text-xs">
                            <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => setQuantity(key, Math.max(1, line.quantity - 1))} className="px-3 py-2 hover:bg-black/5">−</button>
                            <span aria-live="polite" className="min-w-7 text-center">{line.quantity}</span>
                            <button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => setQuantity(key, line.quantity + 1)} className="px-3 py-2 hover:bg-black/5">+</button>
                          </div>
                          <button type="button" onClick={() => removeItem(key)} className="font-mono text-[9px] tracking-[0.15em] text-muted uppercase underline underline-offset-4 hover:text-fg">REMOVE</button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {recommendations.length > 0 ? (
                <section className="border-t border-line px-6 py-5 md:px-8">
                  <h3 className="font-mono text-[9px] tracking-[0.25em] uppercase">YOU MAY ALSO LIKE</h3>
                  <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                    {recommendations.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        onClick={closeCart}
                        className="group w-28 shrink-0 snap-start"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill sizes="112px" className="object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
                          ) : (
                            <MediaPlaceholder ratio={null} label="PRODUCT IMAGE COMING SOON" className="h-full w-full" />
                          )}
                        </div>
                        <p className="mt-2 truncate font-mono text-[8px] tracking-[0.12em] uppercase">{product.name}</p>
                        <p className="mt-1 font-mono text-[9px] text-muted">{product.price}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <footer className="border-t border-line px-6 py-6 md:px-8">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
                <span>SUBTOTAL</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-muted">Delivery details and costs are confirmed at checkout.</p>
              <Link href="/checkout" onClick={closeCart} className="mt-5 flex w-full items-center justify-center border border-fg bg-fg px-6 py-5 font-mono text-[10px] tracking-[0.3em] text-on-accent uppercase transition-colors hover:bg-transparent hover:text-fg">
                CHECKOUT
              </Link>
              <button type="button" onClick={closeCart} className="mt-4 w-full text-center font-mono text-[9px] tracking-[0.22em] uppercase underline underline-offset-4">
                CONTINUE SHOPPING
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
