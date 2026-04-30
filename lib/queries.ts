"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "@/lib/api";
import type {
  Role,
  Application,
  Stats,
  UserProfile,
  Notification,
} from "@/lib/schemas";

/* ─── Current User ────────────────────────────────────────────────── */
export const currentUserKey = ["currentUser"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: api.fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      api.updateUserProfile(userId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: currentUserKey });
    },
  });
}

/* ─── Roles ───────────────────────────────────────────────────────── */
export const rolesKey = ["roles"] as const;
export const roleKey = (id: string) => ["role", id] as const;
export const focusedRolesKey = ["roles", "focused"] as const;

export function useRoles(opts?: Partial<UseQueryOptions<Role[]>>) {
  return useQuery({ 
    queryKey: rolesKey, 
    queryFn: api.fetchRoles,
    staleTime: 1000 * 60, // 1 minute
    ...opts,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKey(id),
    queryFn: () => api.fetchRole(id),
    enabled: !!id,
  });
}

export function useFocusedRoles() {
  return useQuery({
    queryKey: focusedRolesKey,
    queryFn: api.fetchFocusedRoles,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useRoleStats(roleId: string) {
  return useQuery({
    queryKey: ["roleStats", roleId],
    queryFn: () => api.fetchRoleStats(roleId),
    enabled: !!roleId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}

export function useUpdateRoleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: Parameters<typeof api.updateRoleStatus>[1] }) =>
      api.updateRoleStatus(input.id, input.status),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: rolesKey });
      qc.invalidateQueries({ queryKey: roleKey(r.id) });
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; updates: Partial<Role> }) =>
      api.updateRole(input.id, input.updates),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: rolesKey });
      qc.invalidateQueries({ queryKey: roleKey(r.id) });
    },
  });
}

/* ─── Candidates / Applications ───────────────────────────────────── */
export const candidatesKey = (roleId?: string) =>
  ["candidates", roleId ?? "all"] as const;

export function useCandidates(roleId?: string) {
  return useQuery({
    queryKey: candidatesKey(roleId),
    queryFn: () => api.fetchCandidates(roleId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => api.fetchCandidate(id),
    enabled: !!id,
  });
}

export function useSubmitCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitCandidate,
    onSuccess: (candidate) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["roleStats", candidate.role_id] });
    },
  });
}

export function useMoveCandidateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; stage: Parameters<typeof api.moveCandidateStage>[1] }) =>
      api.moveCandidateStage(input.id, input.stage),
    onSuccess: (candidate) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", candidate.id] });
      qc.invalidateQueries({ queryKey: ["roleStats", candidate.role_id] });
    },
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; updates: Partial<Application> }) =>
      api.updateCandidate(input.id, input.updates),
    onSuccess: (candidate) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", candidate.id] });
    },
  });
}

export function useRejectCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; reason?: string }) =>
      api.rejectCandidate(input.id, input.reason),
    onSuccess: (candidate) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", candidate.id] });
      qc.invalidateQueries({ queryKey: ["roleStats", candidate.role_id] });
    },
  });
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export function useStats() {
  return useQuery<Stats>({ 
    queryKey: ["stats"], 
    queryFn: api.fetchStats,
    staleTime: 1000 * 60, // 1 minute
  });
}

/* ─── Activity ────────────────────────────────────────────────────── */
export function useActivity() {
  return useQuery({ 
    queryKey: ["activity"], 
    queryFn: api.fetchActivity,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/* ─── Notifications ───────────────────────────────────────────────── */
export function useNotifications() {
  return useQuery<Notification[]>({ 
    queryKey: ["notifications"], 
    queryFn: api.fetchNotifications,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/* ─── Legacy exports for backwards compatibility ──────────────────── */
export function useEmails() {
  return useQuery({ queryKey: ["emails"], queryFn: api.fetchEmails });
}

export function useContracts() {
  return useQuery({ queryKey: ["contracts"], queryFn: api.fetchContracts });
}
