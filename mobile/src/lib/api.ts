export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://ixzzy.vercel.app"
).replace(/\/$/, "");

type ApiErrorBody = { error?: unknown };

export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Could not reach IXZZY. Check your internet connection and try again.");
  }

  const payload = await response.json().catch(() => null) as (T & ApiErrorBody) | null;
  if (!response.ok) {
    const message = typeof payload?.error === "string"
      ? payload.error
      : `Request failed (${response.status}). Please try again.`;
    throw new ApiRequestError(message, response.status);
  }
  if (payload === null) throw new Error("IXZZY returned an unreadable response. Please try again.");
  return payload;
}
