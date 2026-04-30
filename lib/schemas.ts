import { z } from "zod";

/* ─── Primitives ──────────────────────────────────────────────────── */
export const IdSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime().or(z.string()).nullable();

/* ─── User Profile ────────────────────────────────────────────────── */
export const UserRoleSchema = z.enum([
  "superadmin",
  "admin", 
  "user",
  "agency_owner",
  "client",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserTypeSchema = z.enum([
  "platform_admin",
  "agency_admin",
  "agency_recruiter",
  "independent_recruiter",
]);
export type UserType = z.infer<typeof UserTypeSchema>;

export const UserStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const ContractTypeSchema = z.enum(["contracted", "freelancer"]);
export type ContractType = z.infer<typeof ContractTypeSchema>;

export const UserProfileSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  role: UserRoleSchema.default("user"),
  status: UserStatusSchema.nullable().default("pending"),
  user_type: UserTypeSchema.nullable().default("independent_recruiter"),
  full_name: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  profile_picture_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  contract_type: ContractTypeSchema.nullable().default("freelancer"),
  bounty_percentage: z.number().min(0).max(100).nullable().default(30),
  agency_id: IdSchema.nullable(),
  can_view_all_agency_candidates: z.boolean().nullable().default(false),
  referred_by: IdSchema.nullable(),
  referral_code: z.string().nullable(),
  team_commission_percentage: z.number().min(0).max(50).nullable().default(25),
  total_team_earnings: z.number().nullable().default(0),
  confidential_clients: z.boolean().nullable().default(false),
  contract_signed_at: TimestampSchema,
  contract_version: z.string().nullable().default("1.0"),
  payment_method: z.string().nullable(),
  payment_details: z.record(z.unknown()).nullable(),
  tax_id: z.string().nullable(),
  billing_address: z.string().nullable(),
  billing_country: z.string().nullable(),
  last_seen_at: TimestampSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  requested_at: TimestampSchema,
  approved_at: TimestampSchema,
  approved_by: IdSchema.nullable(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/* ─── Role (Job Position) ─────────────────────────────────────────── */
export const RoleStatusSchema = z.enum(["active", "paused", "closed"]);
export type RoleStatus = z.infer<typeof RoleStatusSchema>;

export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const RoleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  type: z.string().nullable(), // Full-time, Part-time, Contract
  description: z.string().nullable(),
  requirements: z.string().nullable(),
  company_name: z.string().nullable(),
  company_logo: z.string().nullable(),
  company_website: z.string().nullable(),
  company_description: z.string().nullable(),
  company_size: z.string().nullable(),
  industry: z.string().nullable(),
  salary_range: z.string().nullable(),
  experience_level: z.string().nullable(),
  remote_policy: z.string().nullable(),
  benefits: z.string().nullable(),
  visa_sponsorship: z.boolean().nullable().default(false),
  bounty: z.number().nullable(),
  recruiter_percentage: z.number().min(1).max(100).nullable(),
  difficulty: z.number().min(1).max(5).nullable(),
  priority: z.number().nullable().default(0),
  status: RoleStatusSchema.nullable().default("active"),
  approval_status: ApprovalStatusSchema.nullable().default("approved"),
  approval_notes: z.string().nullable(),
  is_published: z.boolean().nullable().default(false),
  is_hidden: z.boolean().nullable().default(false),
  public_url: z.string().nullable(),
  published_at: TimestampSchema,
  interview_stages: z.array(z.string()).nullable(),
  skills_required: z.array(z.string()).or(z.record(z.unknown())).nullable(),
  nice_to_have: z.array(z.string()).or(z.record(z.unknown())).nullable(),
  ideal_candidate_profile: z.string().nullable(),
  red_flags: z.array(z.string()).or(z.record(z.unknown())).nullable(),
  recommended_questions: z.array(z.string()).or(z.record(z.unknown())).nullable(),
  ai_insights: z.record(z.unknown()).nullable(),
  team_info: z.string().nullable(),
  hiring_manager_info: z.record(z.unknown()).nullable(),
  phone_screening_required: z.boolean().nullable().default(false),
  no_disclosure_on_first_contact: z.boolean().nullable().default(false),
  focus_this_week: z.boolean().nullable().default(false),
  focus_this_week_set_at: TimestampSchema,
  focus_this_week_set_by: IdSchema.nullable(),
  agency_id: IdSchema.nullable(),
  requested_by_client_id: IdSchema.nullable(),
  requested_commission: z.string().nullable(),
  created_by: IdSchema.nullable(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  approved_at: TimestampSchema,
  approved_by: IdSchema.nullable(),
});
export type Role = z.infer<typeof RoleSchema>;

/* ─── Application (Candidate) ─────────────────────────────────────── */
export const ApplicationStatusSchema = z.enum([
  "pending",
  "reviewed", 
  "accepted",
  "rejected",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const InterviewStatusSchema = z.enum([
  "new",
  "sent_to_client",
  "screening",
  "interviewing",
  "phone_interview",
  "technical_interview",
  "final_interview",
  "onsite_interview",
  "offer",
  "hired",
  "rejected",
]);
export type InterviewStatus = z.infer<typeof InterviewStatusSchema>;

export const ApplicationSchema = z.object({
  id: IdSchema,
  role_id: IdSchema,
  candidate_name: z.string().nullable(),
  candidate_email: z.string().email(),
  candidate_phone: z.string().nullable(),
  cv_url: z.string().nullable(),
  resume_url: z.string().nullable(),
  resume_text: z.string().nullable(),
  cover_letter: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  answers: z.record(z.unknown()).nullable(),
  status: ApplicationStatusSchema.nullable().default("pending"),
  interview_status: InterviewStatusSchema.nullable().default("new"),
  fit_score: z.number().min(0).max(100).nullable(),
  matching_skills: z.array(z.string()).nullable(),
  missing_skills: z.array(z.string()).nullable(),
  ai_analysis: z.record(z.unknown()).nullable(),
  linkedin_data: z.record(z.unknown()).nullable(),
  linkedin_profile_id: IdSchema.nullable(),
  rejection_reason: z.string().nullable(),
  screening_completed: z.boolean().nullable().default(false),
  sourced_by: IdSchema.nullable(),
  status_entered_at: TimestampSchema,
  last_enriched_at: TimestampSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});
export type Application = z.infer<typeof ApplicationSchema>;

/* ─── Agency ──────────────────────────────────────────────────────── */
export const AgencySchema = z.object({
  id: IdSchema,
  name: z.string(),
  logo_url: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(["active", "inactive", "pending"]).nullable().default("active"),
  created_by: IdSchema.nullable(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});
export type Agency = z.infer<typeof AgencySchema>;

/* ─── Sourced Candidate ───────────────────────────────────────────── */
export const SourcedCandidateSchema = z.object({
  id: IdSchema,
  role_id: IdSchema,
  recruiter_id: IdSchema.nullable(),
  candidate_name: z.string(),
  candidate_email: z.string().email().nullable(),
  candidate_phone: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  notes: z.string().nullable(),
  status: z.string().nullable().default("sourced"),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});
export type SourcedCandidate = z.infer<typeof SourcedCandidateSchema>;

/* ─── Stats (Computed/Aggregated) ─────────────────────────────────── */
export const StatsSchema = z.object({
  earningsThisMonth: z.number(),
  earningsAllTime: z.number(),
  rolesActive: z.number(),
  candidatesSubmitted: z.number(),
  hires: z.number(),
  responseRate: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

/* ─── Activity ────────────────────────────────────────────────────── */
export const ActivitySchema = z.object({
  id: IdSchema,
  actor: z.string(),
  verb: z.string(),
  target: z.string(),
  at: TimestampSchema,
  kind: z.enum(["candidate", "role", "contract", "system"]),
});
export type Activity = z.infer<typeof ActivitySchema>;

/* ─── Notification ────────────────────────────────────────────────── */
export const NotificationSchema = z.object({
  id: IdSchema,
  user_id: IdSchema,
  actor_id: IdSchema.nullable(),
  type: z.string(),
  title: z.string(),
  message: z.string().nullable(),
  data: z.record(z.unknown()).nullable(),
  read: z.boolean().default(false),
  read_at: TimestampSchema,
  created_at: TimestampSchema,
});
export type Notification = z.infer<typeof NotificationSchema>;

/* ─── Recruiter Share (Apply Links) ───────────────────────────────── */
export const RecruiterShareSchema = z.object({
  id: IdSchema,
  role_id: IdSchema,
  recruiter_id: IdSchema,
  share_code: z.string(),
  clicks: z.number().default(0),
  applications: z.number().default(0),
  created_at: TimestampSchema,
});
export type RecruiterShare = z.infer<typeof RecruiterShareSchema>;

/* ─── Placement Commission ────────────────────────────────────────── */
export const PlacementCommissionSchema = z.object({
  id: IdSchema,
  placement_id: IdSchema,
  recipient_id: IdSchema,
  amount: z.number(),
  percentage: z.number(),
  status: z.enum(["pending", "paid", "cancelled"]).default("pending"),
  paid_at: TimestampSchema,
  created_at: TimestampSchema,
});
export type PlacementCommission = z.infer<typeof PlacementCommissionSchema>;

/* ─── Legacy types for backwards compatibility ────────────────────── */
// These map to the new schema but keep old names for components
export const CandidateStageSchema = InterviewStatusSchema;
export type CandidateStage = InterviewStatus;

export const CandidateSchema = ApplicationSchema;
export type Candidate = Application;

// User schema alias
export const UserSchema = UserProfileSchema;
export type User = UserProfile;

// Org schema (maps to Agency)
export const OrgSchema = AgencySchema;
export type Org = Agency;
