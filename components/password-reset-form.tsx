"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PasswordResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setWorking(true); setMessage(""); setIsError(false);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm_password") ?? "")) { setMessage("The passwords do not match."); setIsError(true); setWorking(false); return; }
    try {
      const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Password update failed.");
      router.replace("/account?password_updated=1");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Your password could not be updated. Request a new reset link and try again."); setIsError(true); }
    finally { setWorking(false); }
  }
  return <section className="mx-auto w-full max-w-xl border-t border-line pt-8 md:pt-10">
    <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">ACCOUNT SECURITY</p>
    <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] uppercase md:text-5xl">SET A NEW PASSWORD</h2>
    {!token ? <p className="mt-5 text-sm text-red-700">This reset link is missing or invalid. Request another from your account page.</p> : <form onSubmit={updatePassword} className="mt-8 space-y-5">
      <label className="block"><span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">NEW PASSWORD</span><input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="w-full border-b border-line bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-fg" /></label>
      <label className="block"><span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">CONFIRM PASSWORD</span><input name="confirm_password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="w-full border-b border-line bg-transparent px-0 py-3 text-sm outline-none focus-visible:border-fg" /></label>
      <button type="submit" disabled={working} className="mt-3 flex w-full items-center justify-center border border-fg bg-fg px-7 py-5 font-mono text-[10px] tracking-[0.25em] text-on-accent uppercase disabled:opacity-50">{working ? "UPDATING" : "UPDATE PASSWORD"}</button>
    </form>}
    {message && <p role="status" aria-live="polite" className={`mt-5 text-sm ${isError ? "text-red-700" : "text-muted"}`}>{message}</p>}
  </section>;
}
