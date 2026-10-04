import { createHash } from "node:crypto";
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
  const code = input && typeof input === "object" && "code" in input
    ? (input as { code?: unknown }).code
    : null;
  if (typeof code !== "string" || code.length < 20 || code.length > 500) {
    return NextResponse.json({ error: "Invalid sign-in code." }, { status: 401 });
  }
  const codeHash = createHash("sha256").update(code).digest("hex");
  const supabase = createSupabaseAdminClient();
  const { data: row, error: lookupError } = await supabase
    .from("mobile_auth_codes")
    .select("user_id, expires_at, used_at")
    .eq("code_hash", codeHash)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This sign-in link has expired. Please try again." }, { status: 401 });
  }
  // Mark used first so the code cannot be replayed.
  const { error: usedError } = await supabase
    .from("mobile_auth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code_hash", codeHash)
    .is("used_at", null);
  if (usedError) {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  const { data: user, error: userError } = await supabase
    .from("app_users")
    .select("id,email,name")
    .eq("id", row.user_id)
    .maybeSingle();
  if (userError || !user) {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  try {
    const mobileSession = await createMobileSession(user.id);
    return NextResponse.json({ ...mobileSession, user }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
