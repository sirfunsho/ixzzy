import "server-only";

type MailgunMessage = { to: string; subject: string; text: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry transient DNS, connection, rate-limit, and Mailgun server failures. */
export async function sendMailgunMessage(message: MailgunMessage) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  if (!apiKey || !domain || !from) throw new Error("Email delivery is not configured.");

  const baseUrl = (process.env.MAILGUN_API_BASE_URL ?? "https://api.mailgun.net").replace(/\/$/, "");
  const body = new URLSearchParams({ from, to: message.to, subject: message.subject, text: message.text });
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/v3/${encodeURIComponent(domain)}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return true;
      const responseText = (await response.text()).slice(0, 1000);
      lastError = new Error(`Mailgun rejected the message (${response.status}): ${responseText}`);
      if (response.status < 500 && response.status !== 429) throw lastError;
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.message.startsWith("Mailgun rejected")
        && !/\((429|5\d\d)\)/.test(error.message)) throw error;
    }
    if (attempt < 2) await wait(300 * 2 ** attempt);
  }

  throw lastError instanceof Error ? lastError : new Error("Mailgun request failed after retries.");
}
