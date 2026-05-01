import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "superadmin" | "admin" | "user" | "agency_owner" | "client";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  agencyId: string | null;
  profilePictureUrl: string | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { fullName?: string; role?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata?.fullName,
        role: metadata?.role || "user",
      },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the user's profile from the user_profiles table
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("[v0] Error fetching user profile:", error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role as UserRole,
    fullName: data.full_name,
    firstName: data.first_name,
    lastName: data.last_name,
    status: data.status,
    agencyId: data.agency_id,
    profilePictureUrl: data.profile_picture_url,
  };
}

/**
 * Check if a user has a specific role
 */
export function hasRole(profile: UserProfile | null, roles: UserRole[]): boolean {
  if (!profile) return false;
  return roles.includes(profile.role);
}

/**
 * Check if user is an admin (superadmin or admin)
 */
export function isAdmin(profile: UserProfile | null): boolean {
  return hasRole(profile, ["superadmin", "admin"]);
}

/**
 * Check if user is a recruiter (user or agency_owner)
 */
export function isRecruiter(profile: UserProfile | null): boolean {
  return hasRole(profile, ["user", "agency_owner"]);
}

/**
 * Check if user is a client
 */
export function isClient(profile: UserProfile | null): boolean {
  return hasRole(profile, ["client"]);
}
