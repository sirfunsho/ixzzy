import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/password-reset-form";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Reset Password — IXZZY" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <>
    <main className="flex flex-1 flex-col">
      <section className="ix-tone-dark"><SiteHeader /><Container className="pt-14 pb-16 md:pt-20 md:pb-24"><p className="font-mono text-[10px] tracking-[0.35em] text-label uppercase">IXZZY / ACCOUNT</p><h1 className="mt-7 text-[clamp(2.5rem,7vw,6rem)] leading-[0.92] font-medium tracking-[-0.04em] uppercase">RESET PASSWORD</h1></Container></section>
      <Section tone="light" className="flex-1 py-10 md:py-16"><Container><PasswordResetForm token={token} /></Container></Section>
    </main>
    <SiteFooter />
  </>;
}
