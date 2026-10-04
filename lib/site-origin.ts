export function getSiteOrigin(requestUrl: string) {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  return configured ? new URL(configured).origin : new URL(requestUrl).origin;
}
