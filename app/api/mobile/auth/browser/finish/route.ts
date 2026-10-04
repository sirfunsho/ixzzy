import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CODE_LIFETIME_MS = 5 * 60 * 1000;

function isAllowedRedirect(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol === "ixzzy:" && value.startsWith("ixzzy://auth")) return true;
    if (url.protocol === "exp:") return true;
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get("redirect_uri");
  if (!isAllowedRedirect(redirectUri)) {
    return NextResponse.json({ error: "Invalid app return address." }, { status: 400 });
  }
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: "Sign in on the website first." }, { status: 401 });
  }
  const code = randomBytes(32).toString("base64url");
  const codeHash = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS).toISOString();
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("mobile_auth_codes").insert({
      code_hash: codeHash,
      user_id: userId,
      expires_at: expiresAt,
    });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  const separator = redirectUri.includes("?") ? "&" : "?";
  return NextResponse.redirect(`${redirectUri}${separator}code=${encodeURIComponent(code)}`);
}
