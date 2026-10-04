import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAuthEmail } from "@/lib/email/auth-email";
import { createHash, randomBytes } from "node:crypto";
import { getSiteOrigin } from "@/lib/site-origin";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  const db = createSupabaseAdminClient();
  const password_hash = await bcrypt.hash(password, 12);
  const { data: user, error } = await db.from("app_users").insert({ email, name: name || email, password_hash }).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.code === "23505" ? "An account already exists for that email. Sign in or reset its password." : "Account creation failed." }, { status: error.code === "23505" ? 409 : 503 });
  }
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { error: tokenError } = await db.from("auth_tokens").insert({ token_hash, user_id: user.id, purpose: "verify-email", expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
  if (tokenError) return NextResponse.json({ error: "Account created, but the verification email could not be prepared. Request a password reset to continue." }, { status: 503 });
  const origin = getSiteOrigin(request.url);
  try { await sendAuthEmail(email, "Verify your IXZZY account", `Confirm your email within 24 hours: ${origin}/api/auth/verify?token=${encodeURIComponent(token)}`); }
  catch (sendError) {
    console.error("Unable to send verification email.", sendError);
    return NextResponse.json({ error: "Account created, but the verification email could not be sent. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
