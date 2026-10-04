import { NextResponse } from "next/server";
import { getMobileSessionUserId, readBearerToken } from "@/lib/mobile-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = readBearerToken(request);
  if (!token) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  try {
    const userId = await getMobileSessionUserId(token);
    if (!userId) return NextResponse.json({ error: "Your app session has expired. Sign in again." }, { status: 401 });
    const supabase = createSupabaseAdminClient();
    const { data: user, error } = await supabase.from("app_users").select("id,email,name").eq("id", userId).maybeSingle();
    if (error) throw error;
    if (!user) return NextResponse.json({ error: "Your app session is no longer valid." }, { status: 401 });
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Mobile session could not be checked.");
    return NextResponse.json({ error: "Session check is temporarily unavailable." }, { status: 503 });
  }
}
