import { formatNaira } from "@/lib/money";
import { sendMailgunMessage } from "@/lib/email/mailgun";

type ConfirmationLine = {
  name: string;
  colour: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

type OrderConfirmation = {
  reference: string;
  email: string;
  name: string;
  lines: ConfirmationLine[];
  subtotal: number;
};

/** Sends only when server-side Mailgun settings are present; never blocks order persistence. */
export async function sendOrderConfirmation(order: OrderConfirmation) {
  const items = order.lines.map((line) =>
    `${line.name} — ${line.colour} / ${line.size} — QTY ${line.quantity} — ${formatNaira(line.unitPrice * line.quantity)}`,
  ).join("\n");
  return sendMailgunMessage({
    to: order.email,
    subject: `IXZZY order request ${order.reference}`,
    text: [
      `Thank you, ${order.name}.`,
      `Your IXZZY order request ${order.reference} has been received.`,
      "",
      items,
      "",
      `Subtotal: ${formatNaira(order.subtotal)}`,
      "Delivery and payment will be confirmed separately.",
    ].join("\n"),
  });
}
