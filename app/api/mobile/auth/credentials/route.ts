import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createMobileSession } from "@/lib/mobile-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const body = input && typeof input === "object"
    ? input as { email?: unknown; password?: unknown }
    : {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !password || password.length > 128) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: user, error: lookupError } = await supabase
    .from("app_users")
    .select("id,email,name,password_hash,email_verified_at")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) {
    console.error("Mobile password account lookup failed.", lookupError.code);
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }

  let passwordMatches = false;
  if (user?.password_hash && user.email_verified_at) {
    try {
      passwordMatches = await bcrypt.compare(password, user.password_hash);
    } catch {
      passwordMatches = false;
    }
  }
  if (!user || !passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  try {
    const mobileSession = await createMobileSession(user.id);
    return NextResponse.json({
      ...mobileSession,
      user: { id: user.id, email: user.email, name: user.name },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Mobile password session could not be created.");
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
