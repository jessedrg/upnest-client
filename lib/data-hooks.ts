'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import type { 
  RoleRow, 
  Candidate, 
  Recruiter, 
  ActivityRow, 
  AdminData 
} from './admin-data';

// Types from database
export interface DBRole {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string | null;
  description: string | null;
  requirements: string | null;
  created_at: string | null;
  salary_range: string | null;
  experience_level: string | null;
  remote_policy: string | null;
  company_name: string | null;
  status: 'active' | 'paused' | 'closed' | null;
  bounty: number | null;
  focus_this_week: boolean | null;
  no_disclosure_on_first_contact: boolean | null;
  recruiter_percentage: number | null;
  priority: number | null;
  is_published: boolean | null;
  interview_stages: string[] | null;
  requested_by_client_id: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
}

export interface DBApplication {
  id: string;
  role_id: string;
  candidate_name: string | null;
  candidate_email: string;
  candidate_phone: string | null;
  linkedin_url: string | null;
  profile_image_url: string | null;
  interview_status: string | null;
  fit_score: number | null;
  created_at: string | null;
  sourced_by: string | null;
  linkedin_data: {
    full_name?: string;
    headline?: string;
    location?: string;
    experiences?: Array<{
      company?: string;
      title?: string;
      starts_at?: { year?: number };
      ends_at?: { year?: number } | null;
    }>;
  } | null;
  rejection_reason: string | null;
  status_entered_at: string | null;
  // Relations
  role?: DBRole;
  sourced_by_profile?: DBUserProfile;
}

export interface DBUserProfile {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user' | 'agency_owner' | 'client';
  status: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  phone: string | null;
  bio: string | null;
  linkedin_url: string | null;
  agency_id: string | null;
  created_at: string | null;
  // Relations
  agency?: DBAgency;
}

export interface DBAgency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
}

export interface DBClientOrganization {
  id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  contact_name: string | null;
  contact_email: string | null;
  primary_contact_id: string | null;
}

// Helper to calculate time ago
function timeAgo(date: string | null): string {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 14) return '1w ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// Transform DB role to frontend RoleRow
function transformRole(dbRole: DBRole, candidateCount: number, recruiterCount: number): RoleRow {
  const createdAt = dbRole.created_at ? new Date(dbRole.created_at) : new Date();
  const age = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    id: dbRole.id,
    num: `R-${dbRole.id.slice(0, 5).toUpperCase()}`,
    org: dbRole.company_name || 'Unknown',
    title: dbRole.title,
    location: dbRole.location || 'Remote',
    workMode: dbRole.remote_policy || 'Remote',
    status: dbRole.status === 'active' ? 'open' : dbRole.status === 'paused' ? 'paused' : 'closed',
    salary: dbRole.salary_range || 'Competitive',
    opened: timeAgo(dbRole.created_at),
    focused: dbRole.focus_this_week || false,
    confidential: dbRole.no_disclosure_on_first_contact || false,
    recruiters: recruiterCount,
    candidates: candidateCount,
    pipeline: {
      New: 0,
      Screening: 0,
      Phone: 0,
      Technical: 0,
      SentToClient: 0,
      OnSite: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    },
    age,
    tta: '—',
    fee: dbRole.recruiter_percentage ? `${dbRole.recruiter_percentage}%` : '22%',
    priority: dbRole.priority && dbRole.priority > 7 ? 'high' : dbRole.priority && dbRole.priority > 3 ? 'med' : 'low',
  };
}

// Transform DB application to frontend Candidate
function transformCandidate(app: DBApplication, roleName: string, recruiterName: string): Candidate {
  const linkedinData = app.linkedin_data;
  const name = app.candidate_name || linkedinData?.full_name || 'Unknown';
  const nameParts = name.split(' ');
  const initials = nameParts.length >= 2 
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  
  // Get current company from LinkedIn data
  const currentExp = linkedinData?.experiences?.find(e => !e.ends_at);
  const currentCompany = currentExp?.company || 'Unknown';
  
  // Calculate years of experience
  const firstExp = linkedinData?.experiences?.slice().reverse().find(e => e.starts_at?.year);
  const years = firstExp?.starts_at?.year 
    ? new Date().getFullYear() - firstExp.starts_at.year 
    : 0;

  // Map interview_status to frontend stage
  const stageMap: Record<string, string> = {
    'new': 'New',
    'screening': 'Screening',
    'phone_interview': 'Phone',
    'technical_interview': 'Technical',
    'sent_to_client': 'Sent to Client',
    'onsite_interview': 'On-site',
    'final_interview': 'On-site',
    'offer': 'Offer',
    'hired': 'Hired',
    'rejected': 'Rejected',
    'interviewing': 'Technical',
  };

  return {
    id: app.id,
    num: `C-${app.id.slice(0, 5).toUpperCase()}`,
    name,
    initials,
    title: linkedinData?.headline || currentExp?.title || 'Professional',
    current: currentCompany,
    role: roleName,
    roleId: app.role_id,
    org: app.role?.company_name || 'Unknown',
    stage: stageMap[app.interview_status || 'new'] || 'New',
    source: recruiterName ? `Via ${recruiterName}` : 'Direct apply',
    submitted: timeAgo(app.created_at),
    recruiter: recruiterName || 'Direct',
    location: linkedinData?.location || 'Unknown',
    salary: 'Competitive',
    years,
    quote: linkedinData?.headline || '',
    flagged: false,
    saved: false,
    sentAt: app.status_entered_at || undefined,
    rejection: app.rejection_reason ? {
      code: 'REJECTED',
      label: 'Rejected',
      tone: 'neutral',
      note: app.rejection_reason,
      at: app.status_entered_at || '',
      atIso: app.status_entered_at || '',
      by: { name: 'Admin', role: 'Admin' },
      fromStage: stageMap[app.interview_status || 'new'] || 'New',
      kind: 'reject',
    } : undefined,
  };
}

// Transform DB user profile to frontend Recruiter
function transformRecruiter(profile: DBUserProfile, stats: { submitted: number; placed: number; rev: number }): Recruiter {
  const name = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
  
  return {
    id: profile.id,
    name,
    org: profile.agency?.name || 'Independent',
    status: profile.status === 'approved' ? 'active' : 'dormant',
    tier: profile.role === 'agency_owner' ? 'owner' : 'senior',
    roles: 0,
    submitted: stats.submitted,
    placed: stats.placed,
    rev: stats.rev,
    fee: '22%',
    joined: timeAgo(profile.created_at),
    email: profile.email,
    phone: profile.phone || '',
    linkedin: profile.linkedin_url || '',
    location: '',
    timezone: '',
    portfolio: '',
    bio: profile.bio || '',
  };
}

// Fetcher function for SWR
const fetcher = async <T>(key: string): Promise<T> => {
  const supabase = createClient();
  
  if (key === 'roles') {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_hidden', false)
      .in('approval_status', ['approved'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return roles as T;
  }
  
  if (key === 'applications') {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        role:roles(*),
        sourced_by_profile:user_profiles!applications_sourced_by_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return applications as T;
  }
  
  if (key === 'recruiters') {
    const { data: recruiters, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        agency:agencies(*)
      `)
      .in('role', ['user', 'agency_owner'])
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return recruiters as T;
  }
  
  throw new Error(`Unknown key: ${key}`);
};

// Main hook to get client data
export function useClientDataFromDB() {
  const { data: roles, error: rolesError, isLoading: rolesLoading } = useSWR<DBRole[]>('roles', fetcher);
  const { data: applications, error: appsError, isLoading: appsLoading } = useSWR<DBApplication[]>('applications', fetcher);
  const { data: recruiters, error: recsError, isLoading: recsLoading } = useSWR<DBUserProfile[]>('recruiters', fetcher);

  const isLoading = rolesLoading || appsLoading || recsLoading;
  const error = rolesError || appsError || recsError;

  // Get client-visible stages
  const VISIBLE_TO_CLIENT = new Set(['Sent to Client', 'On-site', 'Offer', 'Hired', 'Rejected']);

  // Transform data when available
  const transformedData = {
    roles: [] as RoleRow[],
    candidates: [] as Candidate[],
    activeRecruiters: [] as Recruiter[],
    stages: ['New', 'Screening', 'Phone', 'Technical', 'Sent to Client', 'On-site', 'Offer', 'Hired', 'Rejected'],
    orgName: '',
  };

  if (roles && applications && recruiters) {
    // Build recruiter lookup
    const recruiterLookup = new Map<string, DBUserProfile>();
    recruiters.forEach(r => recruiterLookup.set(r.id, r));

    // Build role stats
    const roleStats = new Map<string, { candidates: number; recruiters: Set<string> }>();
    applications.forEach(app => {
      const stats = roleStats.get(app.role_id) || { candidates: 0, recruiters: new Set<string>() };
      stats.candidates++;
      if (app.sourced_by) stats.recruiters.add(app.sourced_by);
      roleStats.set(app.role_id, stats);
    });

    // Transform roles
    transformedData.roles = roles.map(r => {
      const stats = roleStats.get(r.id) || { candidates: 0, recruiters: new Set() };
      return transformRole(r, stats.candidates, stats.recruiters.size);
    });

    // Build pipeline for each role
    applications.forEach(app => {
      const role = transformedData.roles.find(r => r.id === app.role_id);
      if (role) {
        const stageMap: Record<string, keyof typeof role.pipeline> = {
          'new': 'New',
          'screening': 'Screening', 
          'phone_interview': 'Phone',
          'technical_interview': 'Technical',
          'sent_to_client': 'SentToClient',
          'onsite_interview': 'OnSite',
          'final_interview': 'OnSite',
          'offer': 'Offer',
          'hired': 'Hired',
          'rejected': 'Rejected',
        };
        const pipelineKey = stageMap[app.interview_status || 'new'];
        if (pipelineKey && role.pipeline[pipelineKey] !== undefined) {
          role.pipeline[pipelineKey]++;
        }
      }
    });

    // Transform candidates (only client-visible stages)
    const allCandidates = applications.map(app => {
      const recruiter = app.sourced_by ? recruiterLookup.get(app.sourced_by) : null;
      const recruiterName = recruiter 
        ? recruiter.full_name || `${recruiter.first_name || ''} ${recruiter.last_name || ''}`.trim() || 'Unknown'
        : '';
      const roleName = app.role?.title || 'Unknown Role';
      return transformCandidate(app, roleName, recruiterName);
    });

    transformedData.candidates = allCandidates.filter(c => VISIBLE_TO_CLIENT.has(c.stage));

    // Build recruiter stats
    const recruiterStats = new Map<string, { submitted: number; placed: number; rev: number }>();
    applications.forEach(app => {
      if (app.sourced_by) {
        const stats = recruiterStats.get(app.sourced_by) || { submitted: 0, placed: 0, rev: 0 };
        stats.submitted++;
        if (app.interview_status === 'hired') {
          stats.placed++;
          stats.rev += 20000; // Estimated placement revenue
        }
        recruiterStats.set(app.sourced_by, stats);
      }
    });

    // Transform recruiters who have submitted candidates visible to client
    const recruiterIdsWithCandidates = new Set(
      transformedData.candidates.map(c => 
        applications.find(a => a.id === c.id)?.sourced_by
      ).filter(Boolean)
    );

    transformedData.activeRecruiters = recruiters
      .filter(r => recruiterIdsWithCandidates.has(r.id))
      .map(r => {
        const stats = recruiterStats.get(r.id) || { submitted: 0, placed: 0, rev: 0 };
        return transformRecruiter(r, stats);
      });
    
    // Get org name from first role
    if (roles.length > 0) {
      transformedData.orgName = roles[0].company_name || 'Your Company';
    }
  }

  return {
    ...transformedData,
    isLoading,
    error,
    all: {
      orgs: [],
      roles: transformedData.roles,
      candidates: transformedData.candidates,
      recruiters: transformedData.activeRecruiters,
      activity: [] as ActivityRow[],
      stages: transformedData.stages,
      pendingOrgs: [],
      pendingAgencies: [],
      roleSubmittals: [],
    } as AdminData,
  };
}

// Hook specifically for a single role with its candidates
export function useRoleWithCandidates(roleId: string) {
  const { roles, candidates, activeRecruiters, isLoading, error } = useClientDataFromDB();
  
  const role = roles.find(r => r.id === roleId);
  const roleCandidates = candidates.filter(c => c.roleId === roleId);
  
  return {
    role,
    candidates: roleCandidates,
    recruiters: activeRecruiters,
    isLoading,
    error,
  };
}
