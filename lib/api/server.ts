/**
 * Server-side API functions using the Supabase server client.
 * Use these in Server Components and Route Handlers.
 */

import { createClient } from "@/lib/supabase/server";
import {
  RoleSchema,
  ApplicationSchema,
  StatsSchema,
  UserProfileSchema,
  type Role,
  type Application,
  type Stats,
  type UserProfile,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── Roles ───────────────────────────────────────────────────────── */
export async function fetchRolesServer(): Promise<Role[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_hidden", false)
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Server: Error fetching roles:", error);
    return [];
  }

  return z.array(RoleSchema).parse(data || []);
}

export async function fetchRoleServer(id: string): Promise<Role | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[v0] Server: Error fetching role:", error);
    return null;
  }

  return data ? RoleSchema.parse(data) : null;
}

/* ─── Candidates / Applications ───────────────────────────────────── */
export async function fetchCandidatesServer(roleId?: string): Promise<Application[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[v0] Server: Error fetching candidates:", error);
    return [];
  }

  return z.array(ApplicationSchema).parse(data || []);
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export async function fetchStatsServer(): Promise<Stats> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const defaultStats: Stats = {
    earningsThisMonth: 0,
    earningsAllTime: 0,
    rolesActive: 0,
    candidatesSubmitted: 0,
    hires: 0,
    responseRate: 0,
  };

  if (!user) {
    return defaultStats;
  }

  // Fetch active roles count
  const { count: rolesCount } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("approval_status", "approved")
    .eq("is_hidden", false);

  // Fetch candidates submitted by this user
  const { data: applications } = await supabase
    .from("applications")
    .select("interview_status")
    .eq("sourced_by", user.id);

  const candidatesSubmitted = applications?.length || 0;
  const hires = applications?.filter(a => a.interview_status === "hired").length || 0;
  
  const responded = applications?.filter(a => 
    a.interview_status !== "new" && a.interview_status !== "rejected"
  ).length || 0;
  const responseRate = candidatesSubmitted > 0 ? responded / candidatesSubmitted : 0;

  // Fetch earnings
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

/* ─── User Profile ────────────────────────────────────────────────── */
export async function fetchCurrentUserServer(): Promise<UserProfile | null> {
  const supabase = await createClient();
  
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
    console.error("[v0] Server: Error fetching user profile:", error);
    return null;
  }

  return data ? UserProfileSchema.parse(data) : null;
}
