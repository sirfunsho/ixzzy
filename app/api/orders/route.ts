import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import { priceInNaira } from "@/lib/money";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import { getRequestUserId } from "@/lib/mobile-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type SubmittedLine = { slug: unknown; colour: unknown; size: unknown; quantity: unknown };
type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note: string;
};

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
  const body = input as { customer?: Partial<CustomerDetails>; lines?: SubmittedLine[] };

  let userId: string | null;
  try {
    userId = await getRequestUserId(request);
  } catch {
    console.error("Unable to verify IXZZY order session.");
    return NextResponse.json({ error: "Your session could not be checked." }, { status: 503 });
  }
  if (request.headers.has("authorization") && !userId) {
    return NextResponse.json({ error: "Your app session is invalid. Sign in again." }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();

  const customer = {
    name: readText(body.customer?.name, 120),
    email: readText(body.customer?.email, 254).toLowerCase(),
    phone: readText(body.customer?.phone, 40),
    address: readText(body.customer?.address, 300),
    city: readText(body.customer?.city, 100),
    state: readText(body.customer?.state, 100),
    note: readText(body.customer?.note, 500),
  };
  if (!customer.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    || !customer.phone || !customer.address || !customer.city || !customer.state) {
    return NextResponse.json({ error: "Complete the required contact and delivery details." }, { status: 400 });
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 40) {
    return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }

  const lines = [];
  for (const line of body.lines) {
    const product = PRODUCTS.find((item) => item.slug === line.slug);
    if (!product || typeof line.colour !== "string" || !product.colours.includes(line.colour)
      || typeof line.size !== "string" || !product.sizes.includes(line.size)
      || typeof line.quantity !== "number" || !Number.isInteger(line.quantity)
      || line.quantity < 1 || line.quantity > 99) {
      return NextResponse.json({ error: "A cart item is no longer valid. Please review your cart." }, { status: 400 });
    }
    lines.push({
      slug: product.slug,
      name: product.name,
      colour: line.colour,
      size: line.size,
      quantity: line.quantity,
      unitPrice: priceInNaira(product.price),
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const reference = `IX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { error: insertError } = await supabase.from("orders").insert({
    reference,
    user_id: userId,
    contact_name: customer.name,
    contact_email: customer.email,
    contact_phone: customer.phone,
    delivery_address: customer.address,
    delivery_city: customer.city,
    delivery_state: customer.state,
    delivery_note: customer.note || null,
    items: lines,
    subtotal_ngn: subtotal,
  });

  if (insertError) {
    console.error("Unable to save IXZZY order request.", insertError.message);
    return NextResponse.json({ error: "Your order request could not be saved. Please try again." }, { status: 503 });
  }

  let emailSent = true;
  try {
    await sendOrderConfirmation({
      reference,
      email: customer.email,
      name: customer.name,
      lines,
      subtotal,
    });
  } catch (error) {
    emailSent = false;
    console.error("IXZZY order confirmation email failed.", error);
  }

  return NextResponse.json({ reference, subtotal, name: customer.name, emailSent }, { status: 201 });
}
