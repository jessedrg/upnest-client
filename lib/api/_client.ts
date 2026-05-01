/**
 * Upnest — shared API client.
 *
 * Now integrated with Supabase for real data.
 * The useMocks flag is kept for backwards compatibility but defaults to false.
 */

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
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

export const ApiClient = {
  /** Whether the app is running against local mocks. Defaults to false (real Supabase). */
  useMocks: USE_MOCKS,

  /** Base URL — empty string when using Supabase directly. */
  baseUrl: BASE,
};

/** Helper used by mock branches to simulate latency. */
export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
