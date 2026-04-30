"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CreateRoleInput,
  type CreateRoleInput as CreateRoleInputT,
} from "@/lib/api/roles";
import {
  SubmitCandidateInput,
  type SubmitCandidateInput as SubmitCandidateInputT,
} from "@/lib/api/candidates";
import { RoleSchema, ApplicationSchema, type RoleStatus, type InterviewStatus } from "@/lib/schemas";

/* ─── Roles ───────────────────────────────────────────────────────── */
export async function createRoleAction(input: CreateRoleInputT) {
  const supabase = await createClient();
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
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/roles");
  return { ok: true as const, role: RoleSchema.parse(data) };
}

export async function updateRoleStatusAction(input: {
  id: string;
  status: RoleStatus;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error updating role status:", error);
    return { ok: false as const, error: error.message };
  }

  revalidatePath(`/roles/${input.id}`);
  revalidatePath("/dashboard");
  return { ok: true as const, role: RoleSchema.parse(data) };
}

/* ─── Candidates ──────────────────────────────────────────────────── */
export async function submitCandidateAction(input: SubmitCandidateInputT) {
  const supabase = await createClient();
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
      cover_letter: parsed.notes,
      status: "pending",
      interview_status: "new",
      sourced_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[v0] Error submitting candidate:", error);
    return { ok: false as const, error: error.message };
  }

  revalidatePath(`/roles/${parsed.role_id}`);
  revalidatePath("/candidates");
  return { ok: true as const, candidate: ApplicationSchema.parse(data) };
}

export async function moveCandidateStageAction(input: {
  id: string;
  stage: InterviewStatus;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ 
      interview_status: input.stage, 
      status_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    console.error("[v0] Error moving candidate stage:", error);
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/candidates");
  if (data.role_id) revalidatePath(`/roles/${data.role_id}`);
  return { ok: true as const, candidate: ApplicationSchema.parse(data) };
}

/* ─── Auth Actions ────────────────────────────────────────────────── */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
