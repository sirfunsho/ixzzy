import "server-only";
import { sendMailgunMessage } from "@/lib/email/mailgun";

export async function sendAuthEmail(to: string, subject: string, text: string) {
  await sendMailgunMessage({ to, subject, text });
}
