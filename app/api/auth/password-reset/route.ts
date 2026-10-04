import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAuthEmail } from "@/lib/email/auth-email";
import { getSiteOrigin } from "@/lib/site-origin";

export async function POST(request: Request) {
  let body: { email?: unknown; token?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const db = createSupabaseAdminClient();

  if (typeof body.token === "string") {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
    const token_hash = createHash("sha256").update(body.token).digest("hex");
    const { data: token } = await db.from("auth_tokens").select("user_id").eq("token_hash", token_hash).eq("purpose", "reset-password").gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!token) return NextResponse.json({ error: "This reset link has expired. Request another one." }, { status: 400 });
    const password_hash = await bcrypt.hash(password, 12);
    const { error } = await db.from("app_users").update({ password_hash, email_verified_at: new Date().toISOString() }).eq("id", token.user_id);
    if (error) return NextResponse.json({ error: "Password update failed." }, { status: 503 });
    await db.from("auth_tokens").delete().eq("user_id", token.user_id);
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  const generic = NextResponse.json({ ok: true, message: "If an account uses that email, a reset link is on its way." });
  const { data: user } = await db.from("app_users").select("id").eq("email", email).maybeSingle();
  if (!user) return generic;
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  await db.from("auth_tokens").delete().eq("user_id", user.id).eq("purpose", "reset-password");
  const { error } = await db.from("auth_tokens").insert({ token_hash, user_id: user.id, purpose: "reset-password", expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() });
  if (!error) {
    const origin = getSiteOrigin(request.url);
    try { await sendAuthEmail(email, "Reset your IXZZY password", `Reset your password within one hour: ${origin}/account/reset-password?token=${encodeURIComponent(token)}`); }
    catch (sendError) { console.error("Unable to send password reset email.", sendError); }
  }
  return generic;
}
