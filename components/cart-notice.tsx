"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";

export function CartNotice() {
  const { addedProduct, cartPulse, dismissAddedProduct, openCart } = useCart();

  useEffect(() => {
    if (!addedProduct) return;
    const timeout = window.setTimeout(dismissAddedProduct, 3500);
    return () => window.clearTimeout(timeout);
  }, [addedProduct, cartPulse, dismissAddedProduct]);

  if (!addedProduct) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="ix-tone-light fixed inset-x-4 bottom-4 z-[110] mx-auto flex max-w-md items-center gap-4 border border-line bg-paper px-4 py-4 text-fg shadow-2xl sm:inset-x-auto sm:right-6"
    >
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-acid" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] tracking-[0.22em] text-muted uppercase">ADDED TO CART</p>
        <p className="mt-1 truncate text-xs font-medium uppercase">{addedProduct.name}</p>
      </div>
      <button
        type="button"
        onClick={openCart}
        className="shrink-0 font-mono text-[9px] tracking-[0.18em] uppercase underline underline-offset-4"
      >
        VIEW CART
      </button>
      <button
        type="button"
        onClick={dismissAddedProduct}
        aria-label="Dismiss added to cart message"
        className="shrink-0 px-1 text-lg leading-none text-muted hover:text-fg"
      >
        ×
      </button>
    </aside>
  );
}
