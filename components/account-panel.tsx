"use client";

import { useState, type FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type AccountMode = "sign-in" | "sign-up" | "forgot-password";

function getSafeNextPath() {
  const requested = new URLSearchParams(window.location.search).get("next");
  if (!requested || !requested.startsWith("/") || requested.startsWith("//") || requested.includes("\\")) return "/account";
  try { return new URL(requested, window.location.origin).origin === window.location.origin ? requested : "/account"; }
  catch { return "/account"; }
}

export function AccountPanel({ notice = "", noticeIsError = false }: { notice?: string; noticeIsError?: boolean }) {
  const { data: session, status } = useSession();
  const [working, setWorking] = useState(false);
  const [mode, setMode] = useState<AccountMode>("sign-in");
  const [message, setMessage] = useState(notice);
  const [isError, setIsError] = useState(noticeIsError);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true); setMessage(""); setIsError(false);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "forgot-password") {
        const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "The reset link could not be sent.");
        setMessage(result.message); setIsError(false); return;
      }
      if (mode === "sign-up") {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "Account creation failed.");
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false, redirectTo: getSafeNextPath() });
      if (!result || result.error) throw new Error(mode === "sign-up" ? "Account created. Check your email to verify it, then sign in." : "Those sign-in details could not be verified.");
      window.location.assign(getSafeNextPath());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
      setIsError(true);
    } finally { setWorking(false); }
  }

  async function googleSignIn() {
    setWorking(true); setMessage(""); setIsError(false);
    await signIn("google", { redirectTo: getSafeNextPath() });
  }

  if (status === "loading") return <section className="mx-auto w-full max-w-xl border-t border-line pt-8"><p className="font-mono text-[10px] tracking-[0.25em] text-label uppercase">LOADING ACCOUNT</p></section>;
  if (session?.user) return (
    <section className="mx-auto w-full max-w-xl border-t border-line pt-8 md:pt-10">
      <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">CONNECTED ACCOUNT</p>
      <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] uppercase md:text-5xl">{session.user.name ? `HELLO, ${session.user.name}` : "YOU'RE SIGNED IN"}</h2>
      <p className="mt-5 text-sm text-muted">{session.user.email}</p>
      <button type="button" onClick={() => signOut({ redirectTo: "/account" })} className="mt-9 border border-fg px-7 py-5 font-mono text-[10px] tracking-[0.28em] uppercase">SIGN OUT</button>
    </section>
  );

  return (
    <section className="mx-auto w-full max-w-xl border-t border-line pt-8 md:pt-10">
      <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] uppercase md:text-5xl">{mode === "sign-up" ? "CREATE ACCOUNT" : mode === "forgot-password" ? "RESET PASSWORD" : "Life is IXZZY."}</h2>
      <p className="mt-5 max-w-[42ch] text-sm leading-6 text-muted">Sign in to connect your account. Your cart stays saved while you sign in or create an account.</p>
      <form onSubmit={submitCredentials} className="mt-8 space-y-5">
        <label className="block"><span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">EMAIL</span><input name="email" type="email" autoComplete="email" required className="w-full border-b border-line bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-fg" /></label>
        {mode !== "forgot-password" && <label className="block"><span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">PASSWORD</span><input name="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={8} maxLength={128} required className="w-full border-b border-line bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-fg" /></label>}
        <button type="submit" disabled={working} className="mt-3 flex w-full items-center justify-center border border-fg bg-fg px-7 py-5 font-mono text-[10px] tracking-[0.25em] text-on-accent uppercase disabled:opacity-50">{working ? "PLEASE WAIT" : mode === "sign-up" ? "CREATE ACCOUNT" : mode === "forgot-password" ? "SEND RESET LINK" : "SIGN IN WITH EMAIL"}</button>
      </form>
      {mode === "sign-in" && <div className="mt-4 text-left"><button type="button" onClick={() => { setMode("forgot-password"); setMessage(""); }} className="font-mono text-[9px] tracking-[0.16em] uppercase underline underline-offset-4">Forgot password?</button></div>}
      {mode !== "forgot-password" && <><div className="my-8 flex items-center gap-4 font-mono text-[9px] tracking-[0.25em] text-label uppercase"><span className="h-px flex-1 bg-line" /><span>OR</span><span className="h-px flex-1 bg-line" /></div>
      <button type="button" disabled={working} onClick={googleSignIn} className="flex w-full items-center justify-center gap-3 border border-line bg-transparent px-7 py-5 font-mono text-[10px] tracking-[0.2em] text-fg uppercase disabled:opacity-50">
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.09-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.85 0-5.27-1.92-6.13-4.5H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.87 13.07a6.6 6.6 0 0 1 0-4.14V6.09H2.18a11 11 0 0 0 0 9.82l3.69-2.84z"/><path fill="#EA4335" d="M12 4.43c1.62 0 3.07.56 4.21 1.64l3.15-3.15A10.55 10.55 0 0 0 12 0 11 11 0 0 0 2.18 6.09l3.69 2.84c.86-2.58 3.28-4.5 6.13-4.5z"/></svg>
        CONTINUE WITH GOOGLE
      </button></>}
      <div className="mt-8 text-center font-mono text-[9px] tracking-[0.16em] uppercase">{mode === "sign-in" ? <span className="text-muted">New to IXZZY? <button type="button" onClick={() => { setMode("sign-up"); setMessage(""); }} className="text-fg underline underline-offset-4">CREATE ACCOUNT</button></span> : <button type="button" onClick={() => { setMode("sign-in"); setMessage(""); }} className="underline underline-offset-4">BACK TO SIGN IN</button>}</div>
      {message && <p role="status" aria-live="polite" className={`mt-5 text-sm ${isError ? "text-red-700" : "text-muted"}`}>{message}</p>}
    </section>
  );
}
