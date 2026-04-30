import { createClient } from "@/lib/supabase/client";

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
    console.error("[v0] Sign in error:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string, 
  password: string,
  metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      data: metadata,
    },
  });

  if (error) {
    console.error("[v0] Sign up error:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[v0] Sign out error:", error);
    throw new Error(error.message);
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[v0] Get session error:", error);
    return null;
  }

  return session;
}

/**
 * Get the current user
 */
export async function getUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[v0] Get user error:", error);
    return null;
  }

  return user;
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/settings`,
  });

  if (error) {
    console.error("[v0] Reset password error:", error);
    throw new Error(error.message);
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("[v0] Update password error:", error);
    throw new Error(error.message);
  }
}
