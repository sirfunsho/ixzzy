"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useCart, type CartLine } from "@/components/cart-provider";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { PRODUCTS } from "@/lib/catalog";
import { formatNaira, priceInNaira } from "@/lib/money";

type OrderRow = CartLine & {
  name: string;
  image?: string;
  unitPrice: number;
};

type Confirmation = {
  reference: string;
  name: string;
  lines: OrderRow[];
  subtotal: number;
  emailSent: boolean;
};

function makeOrderRows(lines: CartLine[]): OrderRow[] {
  return lines.flatMap((line) => {
    const product = PRODUCTS.find((item) => item.slug === line.slug);
    return product
      ? [{
          ...line,
          name: product.name,
          image: product.images?.[0],
          unitPrice: priceInNaira(product.price),
        }]
      : [];
  });
}

function CheckoutField({
  label,
  name,
  type = "text",
  className: wrapperClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className={`block ${wrapperClassName ?? ""}`}>
      <span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">{label}</span>
      <input
        name={name}
        type={type}
        {...props}
        required
        className="w-full border-b border-line bg-transparent px-0 py-3 text-sm outline-none transition-colors focus-visible:border-fg"
      />
    </label>
  );
}

export function CheckoutForm({ isSignedIn }: { isSignedIn: boolean }) {
  const { lines, ready, clearCart } = useCart();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [working, setWorking] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const rows = makeOrderRows(lines);
  const subtotal = rows.reduce((total, row) => total + row.unitPrice * row.quantity, 0);
  const itemCount = rows.reduce((total, row) => total + row.quantity, 0);

  async function placeOrderRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rows.length === 0 || working) return;

    const formData = new FormData(event.currentTarget);
    setWorking(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            city: formData.get("city"),
            state: formData.get("state"),
            note: formData.get("note"),
          },
          lines: rows.map(({ slug, colour, size, quantity }) => ({ slug, colour, size, quantity })),
        }),
      });
      const result = await response.json() as { reference?: string; subtotal?: number; name?: string; emailSent?: boolean; error?: string };
      if (!response.ok || !result.reference || typeof result.subtotal !== "number") {
        throw new Error(result.error ?? "The order request could not be saved. Please try again.");
      }
      setConfirmation({
        reference: result.reference,
        name: result.name ?? String(formData.get("name") ?? ""),
        lines: rows,
        subtotal: result.subtotal,
        emailSent: result.emailSent === true,
      });
      clearCart();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The order request could not be saved. Please try again.");
    } finally {
      setWorking(false);
    }
  }

  if (!ready) {
    return <p className="py-24 text-center font-mono text-[10px] tracking-[0.3em] text-muted uppercase">LOADING CHECKOUT</p>;
  }

  if (confirmation) {
    return (
      <section className="mx-auto max-w-2xl py-16 text-center md:py-24">
        <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">IXZZY / ORDER REQUEST</p>
        <h2 className="mt-6 text-[clamp(2rem,6vw,4rem)] leading-[0.95] font-medium tracking-[-0.04em] uppercase">Request complete.</h2>
        <p className="mt-6 text-sm leading-6 text-muted">
          Thank you, {confirmation.name}. Your order request is confirmed and saved{isSignedIn ? " to your IXZZY account" : ""}. {confirmation.emailSent ? "A confirmation email was sent to your email address." : "We could not send the confirmation email, so please keep your reference and contact us if needed."} {isSignedIn ? "" : "You checked out as a guest; keep your reference for your records."} Payment is not processed yet; delivery and payment will be confirmed separately.
        </p>
        <p className="mt-8 font-mono text-[11px] tracking-[0.2em] uppercase">REFERENCE / {confirmation.reference}</p>
        <p className="mt-5 font-mono text-[10px] tracking-[0.15em] uppercase">
          TOTAL BEFORE SHIPPING / {formatNaira(confirmation.subtotal)}
        </p>
        <Link href="/shop" className="mt-9 inline-flex border border-fg px-7 py-5 font-mono text-[10px] tracking-[0.3em] uppercase transition-colors hover:bg-fg hover:text-on-accent">RETURN TO SHOP</Link>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-20 text-center md:py-28">
        <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">NO ITEMS TO CHECK OUT</p>
        <h2 className="mt-6 text-3xl font-medium tracking-[-0.03em] uppercase md:text-5xl">Your cart is clear.</h2>
        <Link href="/shop" className="mt-9 inline-flex border border-fg px-7 py-5 font-mono text-[10px] tracking-[0.3em] uppercase transition-colors hover:bg-fg hover:text-on-accent">CONTINUE SHOPPING</Link>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrderRequest} className="grid gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-10 lg:col-span-7">
        <fieldset>
          <legend className="w-full border-b border-line pb-4 font-mono text-[10px] tracking-[0.3em] uppercase">01 / CONTACT</legend>
          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <CheckoutField className="sm:col-span-2" label="FULL NAME" name="name" autoComplete="name" />
            <CheckoutField label="EMAIL" name="email" type="email" autoComplete="email" />
            <CheckoutField label="PHONE" name="phone" type="tel" autoComplete="tel" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="w-full border-b border-line pb-4 font-mono text-[10px] tracking-[0.3em] uppercase">02 / DELIVERY</legend>
          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <CheckoutField className="sm:col-span-2" label="DELIVERY ADDRESS" name="address" autoComplete="street-address" />
            <CheckoutField label="CITY" name="city" autoComplete="address-level2" />
            <CheckoutField label="STATE" name="state" autoComplete="address-level1" />
            <label className="block sm:col-span-2">
              <span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">DELIVERY NOTE / OPTIONAL</span>
              <textarea name="note" rows={2} className="w-full resize-y border-b border-line bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-fg" />
            </label>
          </div>
        </fieldset>

        <section aria-labelledby="payment-title">
          <h2 id="payment-title" className="border-b border-line pb-4 font-mono text-[10px] tracking-[0.3em] uppercase">03 / PAYMENT</h2>
          <div className="mt-5 flex items-start justify-between gap-6 border border-line p-5 md:p-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase">PAYMENT PLACEHOLDER</p>
              <p className="mt-3 max-w-[48ch] text-xs leading-5 text-muted">
                Payment is not connected yet. Submitting saves this order request and sends a confirmation email; no payment is taken.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[9px] tracking-[0.15em] text-label uppercase">NOT ACTIVE</span>
          </div>
        </section>
      </div>

      <aside className="h-fit border-t border-line pt-6 lg:sticky lg:top-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase">YOUR SELECTION</h2>
          <span className="font-mono text-[9px] tracking-[0.18em] text-label uppercase">{itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}</span>
        </div>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {rows.map((line) => (
            <li key={`${line.slug}-${line.colour}-${line.size}`} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[5rem_1fr]">
              <div className="relative aspect-[4/5] overflow-hidden">
                {line.image ? (
                  <Image src={line.image} alt={line.name} fill sizes="80px" className="object-contain" />
                ) : (
                  <MediaPlaceholder ratio={null} label="PRODUCT IMAGE COMING SOON" className="h-full w-full" />
                )}
              </div>
              <div className="flex min-w-0 items-start justify-between gap-3 pt-1">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase">{line.name}</p>
                  <p className="mt-2 text-[10px] text-muted">{line.colour} / {line.size}</p>
                  <p className="mt-2 font-mono text-[9px] tracking-[0.12em] text-label uppercase">QTY {line.quantity} · {formatNaira(line.unitPrice)} EACH</p>
                </div>
                <p className="shrink-0 font-mono text-[10px]">{formatNaira(line.unitPrice * line.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-4 font-mono text-[10px] tracking-[0.15em] uppercase">
          <div className="flex justify-between gap-4"><dt>SUBTOTAL</dt><dd>{formatNaira(subtotal)}</dd></div>
          <div className="flex justify-between gap-4 text-muted"><dt>SHIPPING</dt><dd>TO BE CONFIRMED</dd></div>
          <div className="flex justify-between gap-4 border-t border-line pt-5 text-[11px] font-medium"><dt>TOTAL BEFORE SHIPPING</dt><dd>{formatNaira(subtotal)}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">Delivery is confirmed with you before payment; no shipping rate has been set for this preview.</p>
        {submitError ? <p role="alert" className="mt-6 text-sm text-red-700">{submitError}</p> : null}
        <button type="submit" disabled={working} className="mt-7 flex w-full items-center justify-center border border-fg bg-fg px-6 py-5 font-mono text-[10px] tracking-[0.28em] text-on-accent uppercase transition-colors hover:bg-transparent hover:text-fg disabled:opacity-50">{working ? "SAVING ORDER REQUEST" : "SUBMIT ORDER REQUEST"}</button>
        <p className="mt-4 text-center font-mono text-[9px] tracking-[0.16em] text-label uppercase">{isSignedIn ? "ACCOUNT CHECKOUT" : "GUEST CHECKOUT - NO ACCOUNT REQUIRED"} · PAYMENT NOT ACTIVE</p>
        <Link href="/shop" className="mt-5 block text-center font-mono text-[9px] tracking-[0.22em] uppercase underline underline-offset-4">CONTINUE SHOPPING</Link>
      </aside>
    </form>
  );
}
