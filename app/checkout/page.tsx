import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout — IXZZY",
  description: "Review your selection and submit an IXZZY order request.",
};

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <>
      <main className="flex flex-1 flex-col">
        <section className="ix-tone-dark">
          <SiteHeader />
          <Container className="pt-14 pb-16 md:pt-20 md:pb-24">
            <p className="font-mono text-[10px] tracking-[0.35em] text-label uppercase">YOUR SELECTION</p>
            <h1 className="mt-7 text-[clamp(2.5rem,7vw,6rem)] leading-[0.92] font-medium tracking-[-0.04em] uppercase">CHECKOUT</h1>
          </Container>
        </section>
        <Section tone="light" className="flex-1 py-8 md:py-16">
          <Container>
            <CheckoutForm isSignedIn={Boolean(session?.user?.id)} />
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
