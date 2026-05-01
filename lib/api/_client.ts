/**
 * Upnest — shared API client.
 *
 * The ONLY file you should need to edit when wiring real backends.
 *
 * Behavior:
 *   - When NEXT_PUBLIC_USE_MOCKS=true (default in dev), every method throws
 *     synchronously — endpoints fall back to local mock data inside their
 *     own `if (ApiClient.useMocks) { ... }` branches.
 *   - When NEXT_PUBLIC_USE_MOCKS=false, methods hit `${API_URL}${path}` with
 *     JSON + bearer auth header (token from NextAuth session) and throw a
 *     typed `ApiError` on non-2xx responses.
 *
 * Switching to real APIs:
 *   1.  Set `NEXT_PUBLIC_USE_MOCKS=false` and `API_URL=https://...` in `.env.local`.
 *   2.  Wire `getAuthToken()` below to your NextAuth session (see lib/auth.ts).
 *   3.  Confirm your backend matches the shapes in `lib/schemas.ts` — Zod will
 *       throw at the call site if they drift.
 *   4.  See API_CONTRACT.md (repo root) for endpoint list + request/response shapes.
 */

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`API ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Hook for the auth token. The default reads a NextAuth JWT cookie via
 * the session endpoint on the client; on the server, prefer reading it
 * from `auth()` directly in route handlers / server components and passing
 * it explicitly to ApiClient.
 *
 * Replace the body when you swap to your real auth provider.
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  if (USE_MOCKS) {
    throw new Error(
      `[ApiClient] Real fetch called for ${method} ${path} while NEXT_PUBLIC_USE_MOCKS=true. ` +
        `Either set NEXT_PUBLIC_USE_MOCKS=false to hit the real API, or handle this branch with mocks in the calling endpoint module.`,
    );
  }

  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // GET caching is opt-in — most reads are short-lived
    next: method === "GET" ? { revalidate: 30 } : undefined,
    ...init,
  });

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, res.statusText, errBody);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const ApiClient = {
  /** Whether the app is running against local mocks (dev default). */
  useMocks: USE_MOCKS,

  /** Base URL — empty string when mocks are on. */
  baseUrl: BASE,

  get: <T>(path: string, init?: RequestInit) =>
    request<T>("GET", path, undefined, init),

  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>("POST", path, body, init),

  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>("PATCH", path, body, init),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>("DELETE", path, undefined, init),
};

/** Helper used by mock branches to simulate latency. */
export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
