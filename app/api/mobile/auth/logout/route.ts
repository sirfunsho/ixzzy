import { NextResponse } from "next/server";
import { readBearerToken, revokeMobileSession } from "@/lib/mobile-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = readBearerToken(request);
  if (!token) return NextResponse.json({ error: "No app session was provided." }, { status: 401 });
  try {
    await revokeMobileSession(token);
    return NextResponse.json({ success: true });
  } catch {
    console.error("Mobile session could not be revoked.");
    return NextResponse.json({ error: "Sign-out is temporarily unavailable." }, { status: 503 });
  }
}
