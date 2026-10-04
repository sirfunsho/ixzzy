import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Account — IXZZY",
  description: "Connect to your IXZZY account, or continue shopping as a guest.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string | string[]; password_updated?: string | string[]; verified?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const authFailed = params.auth_error !== undefined || params.error !== undefined;
  const notice = authFailed
    ? "Sign-in could not be completed. Please try again."
    : params.password_updated !== undefined ? "Your password has been updated."
      : params.verified !== undefined ? "Your email has been verified. You can now sign in." : "";

  return (
    <>
      <main className="flex flex-1 flex-col">
        <section className="ix-tone-dark">
          <SiteHeader />
          <Container className="pt-14 pb-16 md:pt-20 md:pb-24">
            <p className="font-mono text-[10px] tracking-[0.35em] text-label uppercase">IXZZY / ACCOUNT</p>
            <h1 className="mt-7 font-mono text-[10px] tracking-[0.3em] text-label uppercase">YOUR IXZZY ACCOUNT</h1>
          </Container>
        </section>
        <Section tone="light" className="flex-1 py-10 md:py-16">
          <Container>
            <AccountPanel notice={notice} noticeIsError={authFailed} />
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
