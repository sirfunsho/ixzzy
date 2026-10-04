import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MOBILE_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization);
  return match?.[1] ?? null;
}

export async function createMobileSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MOBILE_SESSION_LIFETIME_MS).toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("mobile_sessions").insert({
    token_hash: hashToken(token),
    user_id: userId,
    expires_at: expiresAt,
  });
  if (error) throw new Error("Could not create a mobile session.");
  return { token, expiresAt };
}

export async function getMobileSessionUserId(token: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("mobile_sessions")
    .select("user_id")
    .eq("token_hash", hashToken(token))
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("Could not check the mobile session.");
  return data?.user_id ?? null;
}

export async function revokeMobileSession(token: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("mobile_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("revoked_at", null);
  if (error) throw new Error("Could not end the mobile session.");
}

/** Uses the Auth.js cookie for the website and a revocable bearer token for the mobile app. */
export async function getRequestUserId(request: Request) {
  if (request.headers.has("authorization")) {
    const token = readBearerToken(request);
    return token ? getMobileSessionUserId(token) : null;
  }
  const session = await auth();
  return session?.user?.id ?? null;
}
