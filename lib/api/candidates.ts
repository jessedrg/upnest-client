import { getSupabaseClient } from "./_client";
import {
  ApplicationSchema,
  type Application,
  type InterviewStatus,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchCandidates(roleId?: string): Promise<Application[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[v0] Error fetching candidates:", error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return z.array(ApplicationSchema).parse(data || []);
}

export async function fetchCandidate(id: string): Promise<Application | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[v0] Error fetching candidate:", error);
    throw new Error(`Failed to fetch candidate: ${error.message}`);
  }

  return data ? ApplicationSchema.parse(data) : null;
}

export async function fetchCandidatesByStatus(
  status: InterviewStatus,
  roleId?: string
): Promise<Application[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from("applications")
    .select("*")
    .eq("interview_status", status)
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[v0] Error fetching candidates by status:", error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return z.array(ApplicationSchema).parse(data || []);
}

export async function fetchCandidatesForRecruiter(
  recruiterId: string,
  roleId?: string
): Promise<Application[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from("applications")
    .select("*")
    .eq("sourced_by", recruiterId)
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[v0] Error fetching candidates for recruiter:", error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return z.array(ApplicationSchema).parse(data || []);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const SubmitCandidateInput = z.object({
  role_id: z.string().uuid(),
  candidate_name: z.string().min(2),
  candidate_email: z.string().email(),
  candidate_phone: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  resume_url: z.string().url().optional(),
  cover_letter: z.string().optional(),
  notes: z.string().optional(),
});
export type SubmitCandidateInput = z.infer<typeof SubmitCandidateInput>;

export async function submitCandidate(
  input: SubmitCandidateInput,
): Promise<Application> {
  const supabase = getSupabaseClient();
  const parsed = SubmitCandidateInput.parse(input);

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("applications")
    .insert({
      role_id: parsed.role_id,
      candidate_name: parsed.candidate_name,
      candidate_email: parsed.candidate_email,
      candidate_phone: parsed.candidate_phone,
      linkedin_url: parsed.linkedin_url,
      resume_url: parsed.resume_url,
      cover_letter: parsed.cover_letter,
      status: "pending",
      interview_status: "new",
      sourced_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[v0] Error submitting candidate:", error);
    throw new Error(`Failed to submit candidate: ${error.message}`);
  }

  return ApplicationSchema.parse(data);
}

export async function moveCandidateStage(
  id: string,
  stage: InterviewStatus,
): Promise<Application> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ 
      interview_status: stage, 
      status_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error moving candidate stage:", error);
    throw new Error(`Failed to update candidate stage: ${error.message}`);
  }

  return ApplicationSchema.parse(data);
}

export async function updateCandidate(
  id: string,
  updates: Partial<Application>,
): Promise<Application> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating candidate:", error);
    throw new Error(`Failed to update candidate: ${error.message}`);
  }

  return ApplicationSchema.parse(data);
}

export async function rejectCandidate(
  id: string,
  reason?: string,
): Promise<Application> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ 
      interview_status: "rejected",
      status: "rejected",
      rejection_reason: reason,
      status_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error rejecting candidate:", error);
    throw new Error(`Failed to reject candidate: ${error.message}`);
  }

  return ApplicationSchema.parse(data);
}
