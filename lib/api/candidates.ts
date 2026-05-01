import { createClient } from "@/lib/supabase/client";
import {
  CandidateSchema,
  type Candidate,
  type CandidateStage,
} from "@/lib/schemas";
import { z } from "zod";

/**
 * Transform database row to frontend Candidate shape
 */
function transformCandidate(row: Record<string, unknown>): Candidate {
  // Map database status to our stage enum
  const stageMap: Record<string, CandidateStage> = {
    sourced: "sourced",
    submitted: "submitted",
    phone_screen: "submitted",
    interviewing: "interviewing",
    offer: "offered",
    hired: "hired",
    rejected: "rejected",
    withdrawn: "rejected",
  };
  
  return CandidateSchema.parse({
    id: row.id,
    name: row.candidate_name || row.name || "Unknown",
    title: row.current_title || row.title || "N/A",
    avatar: row.avatar_url || row.photo_url,
    email: row.candidate_email || row.email,
    phone: row.candidate_phone || row.phone,
    linkedin: row.linkedin_url || row.linkedin,
    yearsExperience: row.years_experience,
    location: row.location,
    roleId: row.role_id,
    stage: stageMap[row.status as string] || "submitted",
    submittedBy: row.sourced_by || row.submitted_by || "",
    submittedAt: row.created_at as string,
    notes: row.notes || row.cover_letter,
    fitScore: row.fit_score || row.ai_score,
    rejectionReason: row.rejection_reason,
    experience: [],
    skills: row.skills || [],
  });
}

export async function fetchCandidates(roleId?: string): Promise<Candidate[]> {
  const supabase = createClient();
  
  // First try applications table (has more candidates)
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[v0] Error fetching candidates from applications:", error);
    // Try sourced_candidates as fallback
    const sourcedQuery = supabase
      .from("sourced_candidates")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (roleId) {
      sourcedQuery.eq("role_id", roleId);
    }
    
    const { data: sourcedData, error: sourcedError } = await sourcedQuery;
    
    if (sourcedError) {
      console.error("[v0] Error fetching sourced candidates:", sourcedError);
      return [];
    }
    
    return (sourcedData || []).map(transformCandidate);
  }

  return (data || []).map(transformCandidate);
}

export async function fetchCandidate(id: string): Promise<Candidate | null> {
  const supabase = createClient();
  
  // Try applications first
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // Try sourced_candidates
    const { data: sourcedData, error: sourcedError } = await supabase
      .from("sourced_candidates")
      .select("*")
      .eq("id", id)
      .single();
    
    if (sourcedError) {
      console.error("[v0] Error fetching candidate:", sourcedError);
      return null;
    }
    
    return transformCandidate(sourcedData);
  }

  return transformCandidate(data);
}

export const SubmitCandidateInput = z.object({
  roleId: z.string(),
  name: z.string().min(2),
  title: z.string(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  notes: z.string().optional(),
});
export type SubmitCandidateInput = z.infer<typeof SubmitCandidateInput>;

export async function submitCandidate(
  input: SubmitCandidateInput,
): Promise<Candidate> {
  const parsed = SubmitCandidateInput.parse(input);
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("applications")
    .insert({
      role_id: parsed.roleId,
      candidate_name: parsed.name,
      candidate_email: parsed.email || `${parsed.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      current_title: parsed.title,
      linkedin_url: parsed.linkedin,
      notes: parsed.notes,
      status: "submitted",
      sourced_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[v0] Error submitting candidate:", error);
    throw new Error("Failed to submit candidate");
  }

  return transformCandidate(data);
}

export async function moveCandidateStage(
  id: string,
  stage: CandidateStage,
): Promise<Candidate> {
  const supabase = createClient();
  
  // Map our stage to database status
  const stageMap: Record<CandidateStage, string> = {
    sourced: "sourced",
    submitted: "submitted",
    interviewing: "interviewing",
    offered: "offer",
    hired: "hired",
    rejected: "rejected",
  };
  
  // Try to update in applications first
  const { data, error } = await supabase
    .from("applications")
    .update({ status: stageMap[stage] })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // Try sourced_candidates
    const { data: sourcedData, error: sourcedError } = await supabase
      .from("sourced_candidates")
      .update({ status: stageMap[stage] })
      .eq("id", id)
      .select()
      .single();
    
    if (sourcedError) {
      console.error("[v0] Error moving candidate stage:", sourcedError);
      throw new Error("Failed to update candidate stage");
    }
    
    return transformCandidate(sourcedData);
  }

  return transformCandidate(data);
}
