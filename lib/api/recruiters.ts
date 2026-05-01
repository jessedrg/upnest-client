import { createClient } from "@/lib/supabase/client";
import { z } from "zod";

export const RecruiterSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.string(),
  status: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  contractType: z.string().nullable(),
  bountyPercentage: z.number().nullable(),
  agencyId: z.string().nullable(),
  createdAt: z.string(),
});

export type Recruiter = z.infer<typeof RecruiterSchema>;

function transformRecruiter(row: Record<string, unknown>): Recruiter {
  return RecruiterSchema.parse({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    profilePictureUrl: row.profile_picture_url,
    linkedinUrl: row.linkedin_url,
    phone: row.phone,
    bio: row.bio,
    contractType: row.contract_type,
    bountyPercentage: row.bounty_percentage,
    agencyId: row.agency_id,
    createdAt: row.created_at as string,
  });
}

export async function fetchRecruiters(): Promise<Recruiter[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .in("role", ["user", "agency_owner"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching recruiters:", error);
    return [];
  }

  return (data || []).map(transformRecruiter);
}

export async function fetchRecruiter(id: string): Promise<Recruiter | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[v0] Error fetching recruiter:", error);
    return null;
  }

  return transformRecruiter(data);
}

export async function updateRecruiterStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<Recruiter> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = { status };
  
  if (status === "approved") {
    const { data: { user } } = await supabase.auth.getUser();
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = user?.id;
  }
  
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating recruiter status:", error);
    throw new Error("Failed to update recruiter status");
  }

  return transformRecruiter(data);
}
