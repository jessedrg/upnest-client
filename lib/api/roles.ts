import { createClient } from "@/lib/supabase/client";
import {
  RoleSchema,
  type Role,
  type RoleStatus,
} from "@/lib/schemas";
import { z } from "zod";

/**
 * Normalize remote policy from database to schema enum
 */
function normalizeRemotePolicy(value: unknown): "onsite" | "hybrid" | "remote" {
  if (typeof value !== "string") return "hybrid";
  const normalized = value.toLowerCase().replace(/[-_\s]/g, "");
  if (normalized === "onsite" || normalized === "office" || normalized === "inperson") return "onsite";
  if (normalized === "remote" || normalized === "fullyremote") return "remote";
  return "hybrid";
}

/**
 * Transform database row to frontend Role shape
 */
function transformRole(row: Record<string, unknown>): Role {
  // Count pipeline stages from sourced_candidates or applications if available
  const pipeline = {
    sourced: 0,
    submitted: 0,
    interviewing: 0,
    offered: 0,
    hired: 0,
  };
  
  // Map database status to our status enum
  const statusMap: Record<string, RoleStatus> = {
    active: "open",
    paused: "on_hold",
    closed: "closed",
  };
  
  const status = statusMap[row.status as string] || "open";
  
  return RoleSchema.parse({
    id: row.id,
    title: row.title,
    company: row.company_name || "Unknown Company",
    companyLogo: row.company_logo || undefined,
    location: row.location || "Remote",
    remote: normalizeRemotePolicy(row.remote_policy),
    status,
    priority: row.focus_this_week || row.priority || false,
    bounty: {
      amount: Number(row.bounty) || 0,
      currency: "USD",
    },
    baseSalary: row.salary_range
      ? {
          min: 0,
          max: 0,
          currency: "USD",
        }
      : undefined,
    postedAt: row.created_at as string,
    closesAt: undefined,
    pipeline,
    tags: [],
    description: row.description,
    recruiters: [],
  });
}

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchRoles(): Promise<Role[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_hidden", false)
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching roles:", error);
    return [];
  }

  return (data || []).map(transformRole);
}

export async function fetchRole(id: string): Promise<Role | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[v0] Error fetching role:", error);
    return null;
  }

  return transformRole(data);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const CreateRoleInput = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  location: z.string(),
  remote: z.enum(["onsite", "hybrid", "remote"]),
  bountyAmount: z.number().min(0),
  description: z.string().optional(),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInput>;

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const parsed = CreateRoleInput.parse(input);
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("roles")
    .insert({
      title: parsed.title,
      company_name: parsed.company,
      location: parsed.location,
      remote_policy: parsed.remote,
      bounty: parsed.bountyAmount,
      description: parsed.description,
      type: "Full-time",
      department: "Engineering",
      requirements: "",
    })
    .select()
    .single();

  if (error) {
    console.error("[v0] Error creating role:", error);
    throw new Error("Failed to create role");
  }

  return transformRole(data);
}

export async function updateRoleStatus(
  id: string,
  status: RoleStatus,
): Promise<Role> {
  const supabase = createClient();
  
  // Map our status to database status
  const statusMap: Record<RoleStatus, string> = {
    draft: "paused",
    open: "active",
    priority: "active",
    on_hold: "paused",
    filled: "closed",
    closed: "closed",
  };
  
  const { data, error } = await supabase
    .from("roles")
    .update({ 
      status: statusMap[status],
      focus_this_week: status === "priority",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating role status:", error);
    throw new Error("Failed to update role status");
  }

  return transformRole(data);
}
