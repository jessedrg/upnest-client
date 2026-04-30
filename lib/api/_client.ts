/**
 * Supabase client wrapper for API operations.
 * All data fetching now goes through Supabase.
 */

import { createClient } from "@/lib/supabase/client";

// For browser-side operations
export function getSupabaseClient() {
  return createClient();
}

// Helper for artificial delay in development (optional)
export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
