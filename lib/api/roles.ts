import { getSupabaseClient } from "./_client";
import {
  RoleSchema,
  type Role,
  type RoleStatus,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchRoles(): Promise<Role[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_hidden", false)
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching roles:", error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return z.array(RoleSchema).parse(data || []);
}

export async function fetchRole(id: string): Promise<Role | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("[v0] Error fetching role:", error);
    throw new Error(`Failed to fetch role: ${error.message}`);
  }

  return data ? RoleSchema.parse(data) : null;
}

export async function fetchRolesForRecruiter(recruiterId: string): Promise<Role[]> {
  const supabase = getSupabaseClient();
  
  // Fetch roles that are either:
  // 1. Published and active
  // 2. Assigned to this recruiter
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_hidden", false)
    .eq("approval_status", "approved")
    .in("status", ["active", "paused"])
    .order("focus_this_week", { ascending: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching roles for recruiter:", error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return z.array(RoleSchema).parse(data || []);
}

export async function fetchFocusedRoles(): Promise<Role[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("focus_this_week", true)
    .eq("is_hidden", false)
    .eq("approval_status", "approved")
    .eq("status", "active")
    .order("priority", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching focused roles:", error);
    throw new Error(`Failed to fetch focused roles: ${error.message}`);
  }

  return z.array(RoleSchema).parse(data || []);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const CreateRoleInput = z.object({
  title: z.string().min(2),
  company_name: z.string().min(2),
  location: z.string(),
  remote_policy: z.enum(["onsite", "hybrid", "remote"]).optional(),
  bounty: z.number().min(0).optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  department: z.string().optional(),
  type: z.string().optional(),
  salary_range: z.string().optional(),
  experience_level: z.string().optional(),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInput>;

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const supabase = getSupabaseClient();
  const parsed = CreateRoleInput.parse(input);

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("roles")
    .insert({
      ...parsed,
      created_by: user?.id,
      status: "active",
      approval_status: "pending",
      is_published: false,
      is_hidden: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[v0] Error creating role:", error);
    throw new Error(`Failed to create role: ${error.message}`);
  }

  return RoleSchema.parse(data);
}

export async function updateRoleStatus(
  id: string,
  status: RoleStatus,
): Promise<Role> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("roles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating role status:", error);
    throw new Error(`Failed to update role status: ${error.message}`);
  }

  return RoleSchema.parse(data);
}

export async function updateRole(
  id: string,
  updates: Partial<Role>,
): Promise<Role> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("roles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating role:", error);
    throw new Error(`Failed to update role: ${error.message}`);
  }

  return RoleSchema.parse(data);
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export async function fetchRoleStats(roleId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("applications")
    .select("interview_status")
    .eq("role_id", roleId);

  if (error) {
    console.error("[v0] Error fetching role stats:", error);
    return {
      total: 0,
      new: 0,
      sent_to_client: 0,
      interviewing: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
  }

  const stats = {
    total: data.length,
    new: 0,
    sent_to_client: 0,
    interviewing: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  };

  for (const app of data) {
    const status = app.interview_status;
    if (status === "new") stats.new++;
    else if (status === "sent_to_client") stats.sent_to_client++;
    else if (["screening", "interviewing", "phone_interview", "technical_interview", "final_interview", "onsite_interview"].includes(status)) stats.interviewing++;
    else if (status === "offer") stats.offer++;
    else if (status === "hired") stats.hired++;
    else if (status === "rejected") stats.rejected++;
  }

  return stats;
}
