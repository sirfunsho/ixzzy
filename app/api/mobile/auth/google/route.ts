import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { createMobileSession } from "@/lib/mobile-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const googleClient = new OAuth2Client();

function allowedGoogleAudiences() {
  return [
    process.env.AUTH_GOOGLE_ID,
    ...(process.env.GOOGLE_MOBILE_CLIENT_IDS ?? "").split(","),
  ].map((id) => id?.trim()).filter((id): id is string => Boolean(id));
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const idToken = input && typeof input === "object" && "idToken" in input
    ? (input as { idToken?: unknown }).idToken
    : null;
  if (typeof idToken !== "string" || idToken.length < 100 || idToken.length > 10_000) {
    return NextResponse.json({ error: "Google sign-in could not be verified." }, { status: 401 });
  }

  let profile: { sub: string; email: string; email_verified: boolean; name?: string };
  try {
    const audiences = allowedGoogleAudiences();
    if (audiences.length === 0) {
      return NextResponse.json({ error: "Google sign-in is not configured on the server." }, { status: 503 });
    }
    const ticket = await googleClient.verifyIdToken({ idToken, audience: audiences });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return NextResponse.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }
    profile = {
      sub: payload.sub,
      email: payload.email.trim().toLowerCase(),
      email_verified: payload.email_verified,
      name: payload.name,
    };
  } catch {
    // Do not log or return the submitted ID token; it is a credential.
    return NextResponse.json({ error: "Google sign-in could not be verified. Please try again." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: lookupError } = await supabase
    .from("app_users")
    .select("id,google_sub")
    .eq("email", profile.email)
    .maybeSingle();
  if (lookupError) {
    console.error("Mobile Google account lookup failed.", lookupError.code);
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  if (existing?.google_sub && existing.google_sub !== profile.sub) {
    return NextResponse.json({ error: "Google sign-in could not be completed for this account." }, { status: 401 });
  }

  const { data: user, error: upsertError } = await supabase.from("app_users").upsert({
    id: existing?.id,
    email: profile.email,
    name: profile.name ?? profile.email,
    google_sub: profile.sub,
    email_verified_at: new Date().toISOString(),
  }, { onConflict: "email" }).select("id,email,name").single();
  if (upsertError || !user) {
    console.error("Mobile Google account could not be saved.", upsertError?.code ?? "no_user_returned");
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }

  try {
    const mobileSession = await createMobileSession(user.id);
    return NextResponse.json({ ...mobileSession, user }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    console.error("Mobile Google session could not be created.");
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
