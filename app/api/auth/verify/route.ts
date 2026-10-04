import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const token_hash = createHash("sha256").update(token).digest("hex");
  const db = createSupabaseAdminClient();
  const { data } = await db.from("auth_tokens").select("user_id").eq("token_hash", token_hash).eq("purpose", "verify-email").gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!data) return NextResponse.redirect(new URL("/account?auth_error=1", url.origin));
  const { error } = await db.from("app_users").update({ email_verified_at: new Date().toISOString() }).eq("id", data.user_id);
  if (error) return NextResponse.redirect(new URL("/account?auth_error=1", url.origin));
  await db.from("auth_tokens").delete().eq("user_id", data.user_id).eq("purpose", "verify-email");
  return NextResponse.redirect(new URL("/account?verified=1", url.origin));
}
