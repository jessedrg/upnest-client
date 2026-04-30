import { getSupabaseClient } from "./_client";
import {
  StatsSchema,
  NotificationSchema,
  UserProfileSchema,
  type Stats,
  type Notification,
  type UserProfile,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── User Profile ────────────────────────────────────────────────── */
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[v0] Error fetching current user:", error);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data ? UserProfileSchema.parse(data) : null;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[v0] Error fetching user profile:", error);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data ? UserProfileSchema.parse(data) : null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating user profile:", error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return UserProfileSchema.parse(data);
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export async function fetchStats(): Promise<Stats> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      earningsThisMonth: 0,
      earningsAllTime: 0,
      rolesActive: 0,
      candidatesSubmitted: 0,
      hires: 0,
      responseRate: 0,
    };
  }

  // Fetch active roles count
  const { count: rolesCount } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("approval_status", "approved")
    .eq("is_hidden", false);

  // Fetch candidates submitted by this recruiter
  const { data: applications } = await supabase
    .from("applications")
    .select("interview_status")
    .eq("sourced_by", user.id);

  const candidatesSubmitted = applications?.length || 0;
  const hires = applications?.filter(a => a.interview_status === "hired").length || 0;
  
  // Calculate response rate (candidates that moved past "new" status)
  const responded = applications?.filter(a => a.interview_status !== "new" && a.interview_status !== "rejected").length || 0;
  const responseRate = candidatesSubmitted > 0 ? responded / candidatesSubmitted : 0;

  // Fetch earnings from placement_commissions if available
  const { data: commissions } = await supabase
    .from("placement_commissions")
    .select("amount, status, created_at")
    .eq("recipient_id", user.id);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const earningsAllTime = commissions
    ?.filter(c => c.status === "paid")
    .reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
    
  const earningsThisMonth = commissions
    ?.filter(c => c.status === "paid" && new Date(c.created_at) >= startOfMonth)
    .reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

  return StatsSchema.parse({
    earningsThisMonth,
    earningsAllTime,
    rolesActive: rolesCount || 0,
    candidatesSubmitted,
    hires,
    responseRate,
  });
}

/* ─── Notifications ───────────────────────────────────────────────── */
export async function fetchNotifications(): Promise<Notification[]> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[v0] Error fetching notifications:", error);
    return [];
  }

  return z.array(NotificationSchema).parse(data || []);
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[v0] Error marking notification read:", error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("[v0] Error marking all notifications read:", error);
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }
}

/* ─── Activity (Recent activity for dashboard) ────────────────────── */
export async function fetchActivity() {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  // Fetch recent applications for this recruiter
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      candidate_name,
      interview_status,
      updated_at,
      role_id,
      roles!inner(title, company_name)
    `)
    .eq("sourced_by", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (!applications) return [];

  // Transform to activity format
  return applications.map(app => ({
    id: app.id,
    actor: app.candidate_name || "Unknown",
    verb: getStatusVerb(app.interview_status),
    target: `${(app.roles as { title: string; company_name: string })?.title} at ${(app.roles as { title: string; company_name: string })?.company_name}`,
    at: app.updated_at,
    kind: "candidate" as const,
  }));
}

function getStatusVerb(status: string | null): string {
  const verbs: Record<string, string> = {
    new: "applied to",
    sent_to_client: "sent to client for",
    screening: "in screening for",
    interviewing: "interviewing for",
    phone_interview: "had phone interview for",
    technical_interview: "had technical interview for",
    final_interview: "in final interview for",
    onsite_interview: "had onsite interview for",
    offer: "received offer for",
    hired: "was hired for",
    rejected: "was rejected for",
  };
  return verbs[status || "new"] || "updated status for";
}

/* ─── Legacy exports for backwards compatibility ──────────────────── */
// These are no longer used but kept for any components that might reference them
export async function fetchEmails() {
  return [];
}

export async function fetchContracts() {
  return [];
}
