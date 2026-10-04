"use client";

import { useCart } from "@/components/cart-provider";

export function CartNavLink() {
  const { itemCount, cartPulse, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className="group relative inline-block text-muted transition-colors duration-300 hover:text-fg focus-visible:text-fg"
    >
      CART <span key={cartPulse} className={`text-accent ${cartPulse > 0 ? "cart-count-pop" : ""}`}>({itemCount})</span>
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 block h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </button>
  );
}
