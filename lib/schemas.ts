import { z } from "zod";

/**
 * Upnest — shared Zod schemas.
 *
 * SINGLE SOURCE OF TRUTH for data shapes across the 3 panels (recruiter,
 * client, admin). This file is intentionally identical in all three projects.
 *
 * When you wire a real backend, your API responses MUST match these shapes
 * (or your fetch wrapper must transform them before returning). The frontend
 * calls .parse() on every response — bad shapes throw at runtime, loudly.
 */

/* ─── Primitives ──────────────────────────────────────────────────── */
export const IdSchema = z.string().min(1);
export const TimestampSchema = z.string().datetime().or(z.string()); // ISO 8601

/* ─── Money ───────────────────────────────────────────────────────── */
export const CurrencySchema = z.enum(["USD", "EUR", "GBP", "MXN"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const MoneySchema = z.object({
  amount: z.number(),
  currency: CurrencySchema.default("USD"),
});
export type Money = z.infer<typeof MoneySchema>;

/* ─── Org / User ──────────────────────────────────────────────────── */
export const OrgTypeSchema = z.enum(["company", "agency"]);
export type OrgType = z.infer<typeof OrgTypeSchema>;

export const OrgSchema = z.object({
  id: IdSchema,
  name: z.string(),
  type: OrgTypeSchema,
  logo: z.string().url().optional(),
  status: z.enum(["pending", "active", "suspended"]).default("active"),
  website: z.string().url().optional(),
  createdAt: TimestampSchema.optional(),
});
export type Org = z.infer<typeof OrgSchema>;

export const UserRoleSchema = z.enum(["recruiter", "client", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: IdSchema,
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: UserRoleSchema,
  orgId: IdSchema.optional(),
  createdAt: TimestampSchema.optional(),
});
export type User = z.infer<typeof UserSchema>;

/* ─── Role ────────────────────────────────────────────────────────── */
export const RoleStatusSchema = z.enum([
  "draft",
  "open",
  "priority",
  "on_hold",
  "filled",
  "closed",
]);
export type RoleStatus = z.infer<typeof RoleStatusSchema>;

export const RemoteSchema = z.enum(["onsite", "hybrid", "remote"]);
export type Remote = z.infer<typeof RemoteSchema>;

export const PipelineCountsSchema = z.object({
  sourced: z.number().default(0),
  submitted: z.number().default(0),
  interviewing: z.number().default(0),
  offered: z.number().default(0),
  hired: z.number().default(0),
});
export type PipelineCounts = z.infer<typeof PipelineCountsSchema>;

export const RoleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  company: z.string(),
  companyLogo: z.string().optional(),
  orgId: IdSchema.optional(),
  location: z.string(),
  remote: RemoteSchema.default("hybrid"),
  status: RoleStatusSchema,
  priority: z.boolean().default(false),
  bounty: MoneySchema,
  baseSalary: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: CurrencySchema.default("USD"),
    })
    .optional(),
  postedAt: TimestampSchema,
  closesAt: TimestampSchema.optional(),
  pipeline: PipelineCountsSchema,
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  recruiters: z.array(IdSchema).default([]),
});
export type Role = z.infer<typeof RoleSchema>;

/* ─── Candidate ───────────────────────────────────────────────────── */
export const CandidateStageSchema = z.enum([
  "sourced",
  "submitted",
  "interviewing",
  "offered",
  "hired",
  "rejected",
]);
export type CandidateStage = z.infer<typeof CandidateStageSchema>;

/** LinkedIn-style experience entry for calibration / benchmarks. */
export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: TimestampSchema,
  endDate: TimestampSchema.optional(), // undefined = current
  location: z.string().optional(),
  description: z.string().optional(),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const CandidateSchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string(),
  avatar: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  yearsExperience: z.number().optional(),
  location: z.string().optional(),
  roleId: IdSchema,
  stage: CandidateStageSchema,
  submittedBy: IdSchema, // recruiter id
  submittedAt: TimestampSchema,
  notes: z.string().optional(),
  fitScore: z.number().min(0).max(100).optional(),
  rejectionReason: z.string().optional(),
  experience: z.array(ExperienceSchema).default([]),
  skills: z.array(z.string()).default([]),
});
export type Candidate = z.infer<typeof CandidateSchema>;

/* ─── Email / Comment ─────────────────────────────────────────────── */
export const EmailSchema = z.object({
  id: IdSchema,
  candidateId: IdSchema.optional(),
  roleId: IdSchema.optional(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  sentAt: TimestampSchema,
  status: z.enum(["draft", "sent", "opened", "replied"]).default("sent"),
});
export type Email = z.infer<typeof EmailSchema>;

export const CommentSchema = z.object({
  id: IdSchema,
  authorId: IdSchema,
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  body: z.string(),
  createdAt: TimestampSchema,
  // Anchored to one of:
  candidateId: IdSchema.optional(),
  roleId: IdSchema.optional(),
});
export type Comment = z.infer<typeof CommentSchema>;

/* ─── Contract ────────────────────────────────────────────────────── */
export const ContractStatusSchema = z.enum([
  "pending", // recruiter signed, awaiting client
  "active", // both signed
  "completed", // hire made + bounty paid
  "cancelled",
]);
export type ContractStatus = z.infer<typeof ContractStatusSchema>;

export const ContractSchema = z.object({
  id: IdSchema,
  roleId: IdSchema,
  recruiterId: IdSchema,
  orgId: IdSchema.optional(),
  bounty: MoneySchema,
  status: ContractStatusSchema,
  signedAt: TimestampSchema.optional(),
  countersignedAt: TimestampSchema.optional(),
  paidAt: TimestampSchema.optional(),
});
export type Contract = z.infer<typeof ContractSchema>;

/* ─── Submittal (client → admin queue) ────────────────────────────── */
export const SubmittalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type SubmittalStatus = z.infer<typeof SubmittalStatusSchema>;

export const RoleSubmittalSchema = z.object({
  id: IdSchema,
  orgId: IdSchema,
  orgName: z.string(),
  title: z.string(),
  bounty: MoneySchema,
  bountyPercent: z.number().optional(), // % of base if applicable
  description: z.string().optional(),
  status: SubmittalStatusSchema,
  submittedAt: TimestampSchema,
  reviewedAt: TimestampSchema.optional(),
  reviewedBy: IdSchema.optional(),
  rejectionReason: z.string().optional(),
});
export type RoleSubmittal = z.infer<typeof RoleSubmittalSchema>;

/* ─── Recruiter Application (pending recruiter → admin) ───────────── */
export const RecruiterApplicationSchema = z.object({
  id: IdSchema,
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  references: z.array(z.string()).default([]),
  yearsExperience: z.number().optional(),
  specialties: z.array(z.string()).default([]),
  status: z.enum(["pending", "approved", "rejected"]),
  submittedAt: TimestampSchema,
  reviewedAt: TimestampSchema.optional(),
});
export type RecruiterApplication = z.infer<typeof RecruiterApplicationSchema>;

/* ─── Stats ───────────────────────────────────────────────────────── */
export const StatsSchema = z.object({
  earningsThisMonth: z.number(),
  earningsAllTime: z.number(),
  rolesActive: z.number(),
  candidatesSubmitted: z.number(),
  hires: z.number(),
  responseRate: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const PlatformStatsSchema = z.object({
  totalOrgs: z.number(),
  totalRecruiters: z.number(),
  totalRolesActive: z.number(),
  totalHiresAllTime: z.number(),
  bountyPaidAllTime: z.number(),
  avgTimeToHireDays: z.number(),
});
export type PlatformStats = z.infer<typeof PlatformStatsSchema>;

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

/* ─── Auth ────────────────────────────────────────────────────────── */
export const SessionSchema = z.object({
  user: UserSchema,
  expires: TimestampSchema,
});
export type Session = z.infer<typeof SessionSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const SignupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: UserRoleSchema,
  orgName: z.string().optional(),
  orgType: OrgTypeSchema.optional(),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;
