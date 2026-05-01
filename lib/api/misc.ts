import { createClient } from "@/lib/supabase/client";
import {
  StatsSchema,
  ActivitySchema,
  EmailSchema,
  ContractSchema,
  type Stats,
  type Activity,
  type Email,
  type Contract,
} from "@/lib/schemas";
import { z } from "zod";

export async function fetchStats(): Promise<Stats> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return empty stats for unauthenticated users
    return StatsSchema.parse({
      earningsThisMonth: 0,
      earningsAllTime: 0,
      rolesActive: 0,
      candidatesSubmitted: 0,
      hires: 0,
      responseRate: 0,
    });
  }

  // Count active roles
  const { count: rolesCount } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("is_hidden", false);

  // Count candidates submitted by this user
  const { count: candidatesCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("sourced_by", user.id);

  // Count hires
  const { count: hiresCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("sourced_by", user.id)
    .eq("status", "hired");

  return StatsSchema.parse({
    earningsThisMonth: 0,
    earningsAllTime: 0,
    rolesActive: rolesCount || 0,
    candidatesSubmitted: candidatesCount || 0,
    hires: hiresCount || 0,
    responseRate: candidatesCount && hiresCount ? Math.round((hiresCount / candidatesCount) * 100) : 0,
  });
}

export async function fetchActivity(): Promise<Activity[]> {
  const supabase = createClient();
  
  // Get recent notifications as activity
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[v0] Error fetching activity:", error);
    return [];
  }

  return (data || []).map((notification, index) =>
    ActivitySchema.parse({
      id: notification.id || `activity_${index}`,
      actor: notification.title || "System",
      verb: notification.type || "notification",
      target: notification.body || "",
      at: notification.created_at,
      kind: "system",
    })
  );
}

export async function fetchEmails(): Promise<Email[]> {
  const supabase = createClient();
  
  // Try to get from email_tracking table
  const { data, error } = await supabase
    .from("email_tracking")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[v0] Error fetching emails:", error);
    return [];
  }

  return (data || []).map((email, index) =>
    EmailSchema.parse({
      id: email.id || `email_${index}`,
      candidateId: email.recipient_id,
      roleId: email.role_id,
      to: email.recipient_email || "",
      from: email.from_email || "noreply@upnest.com",
      subject: email.subject || "No Subject",
      body: email.body || "",
      sentAt: email.created_at || email.sent_at,
      status: email.status || "sent",
    })
  );
}

export async function fetchContracts(): Promise<Contract[]> {
  const supabase = createClient();
  
  // Try agency_placements as contracts
  const { data, error } = await supabase
    .from("agency_placements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[v0] Error fetching contracts:", error);
    return [];
  }

  return (data || []).map((placement, index) =>
    ContractSchema.parse({
      id: placement.id || `contract_${index}`,
      roleId: placement.role_id,
      recruiterId: placement.recruiter_id,
      orgId: placement.agency_id,
      bounty: {
        amount: Number(placement.bounty_amount) || 0,
        currency: "USD",
      },
      status: placement.status === "completed" ? "completed" : "active",
      signedAt: placement.created_at,
      countersignedAt: placement.approved_at,
      paidAt: placement.paid_at,
    })
  );
}
