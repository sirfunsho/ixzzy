import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import type { CartLine } from "@/components/cart-provider";
import { getRequestUserId } from "@/lib/mobile-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type SubmittedLine = { slug?: unknown; colour?: unknown; size?: unknown; quantity?: unknown };

function validateSubmittedLines(value: unknown): CartLine[] | null {
  if (!Array.isArray(value) || value.length > 40) return null;
  const lines = new Map<string, CartLine>();
  for (const row of value as SubmittedLine[]) {
    const product = PRODUCTS.find((item) => item.slug === row?.slug);
    if (
      !product || typeof row.colour !== "string" || !product.colours.includes(row.colour) ||
      typeof row.size !== "string" || !product.sizes.includes(row.size) ||
      typeof row.quantity !== "number" || !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 99
    ) return null;
    const line = { slug: product.slug, colour: row.colour, size: row.size, quantity: row.quantity };
    const key = `${line.slug}::${line.colour}::${line.size}`;
    const previous = lines.get(key);
    lines.set(key, { ...line, quantity: Math.min(99, line.quantity + (previous?.quantity ?? 0)) });
  }
  return [...lines.values()];
}

async function requireUserId(request: Request) {
  try {
    return { userId: await getRequestUserId(request), unavailable: false };
  } catch {
    console.error("Unable to verify IXZZY cart session.");
    return { userId: null, unavailable: true };
  }
}

async function readCart(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_slug, colour, size, quantity")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    slug: row.product_slug,
    colour: row.colour,
    size: row.size,
    quantity: row.quantity,
  }));
}

export async function GET(request: Request) {
  const { userId, unavailable } = await requireUserId(request);
  if (unavailable) return NextResponse.json({ error: "Your session could not be checked." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Sign in to access your saved cart." }, { status: 401 });
  try {
    return NextResponse.json({ lines: await readCart(userId) });
  } catch (error) {
    console.error("Unable to load IXZZY cart.", error instanceof Error ? error.message : "Unknown database error.");
    return NextResponse.json({ error: "Your saved cart could not be loaded." }, { status: 503 });
  }
}

async function readRequestLines(request: Request): Promise<CartLine[] | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("lines" in body)) return null;
    return validateSubmittedLines((body as { lines: unknown }).lines);
  } catch {
    return null;
  }
}

function toDatabaseLines(lines: CartLine[]) {
  return lines.map(({ slug, colour, size, quantity }) => ({
    product_slug: slug,
    colour,
    size,
    quantity,
  }));
}

export async function PUT(request: Request) {
  const { userId, unavailable } = await requireUserId(request);
  if (unavailable) return NextResponse.json({ error: "Your session could not be checked." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Sign in to save your cart." }, { status: 401 });
  const lines = await readRequestLines(request);
  if (!lines) return NextResponse.json({ error: "Your cart contains invalid items." }, { status: 400 });
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.rpc("replace_user_cart", { p_user_id: userId, p_lines: toDatabaseLines(lines) });
    if (error) throw error;
    return NextResponse.json({ lines });
  } catch (error) {
    console.error("Unable to save IXZZY cart.", error instanceof Error ? error.message : "Unknown database error.");
    return NextResponse.json({ error: "Your cart could not be saved." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const { userId, unavailable } = await requireUserId(request);
  if (unavailable) return NextResponse.json({ error: "Your session could not be checked." }, { status: 503 });
  if (!userId) return NextResponse.json({ error: "Sign in to merge your cart." }, { status: 401 });
  const lines = await readRequestLines(request);
  if (!lines) return NextResponse.json({ error: "Your cart contains invalid items." }, { status: 400 });
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.rpc("merge_user_cart", { p_user_id: userId, p_lines: toDatabaseLines(lines) });
    if (error) throw error;
    return NextResponse.json({ lines: await readCart(userId) });
  } catch (error) {
    console.error("Unable to merge IXZZY cart.", error instanceof Error ? error.message : "Unknown database error.");
    return NextResponse.json({ error: "Your guest cart could not be merged." }, { status: 503 });
  }
}
