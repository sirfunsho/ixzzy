import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSiteOrigin } from "@/lib/site-origin";

export const runtime = "nodejs";

function isAllowedRedirect(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    // Only allow our own app link back. This prevents open-redirect abuse.
    return url.protocol === "ixzzy:" && value.startsWith("ixzzy://auth");
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
  const origin = getSiteOrigin(request.url);
  const finishUrl = `${origin}/api/mobile/auth/browser/finish?redirect_uri=${encodeURIComponent(redirectUri)}`;
  if (!session?.user?.id) {
    const loginUrl = `${origin}/account?next=${encodeURIComponent(`/api/mobile/auth/browser/finish?redirect_uri=${encodeURIComponent(redirectUri)}`)}`;
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.redirect(finishUrl);
}
