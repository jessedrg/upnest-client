import { fetchRolesServer, fetchStatsServer } from "@/lib/api/server";
import { DashboardClient } from "./client";

/** Server Component - initial data + SSR. Hydrates the client cache. */
export default async function DashboardPage() {
  const [roles, stats] = await Promise.all([
    fetchRolesServer(),
    fetchStatsServer(),
  ]);
  return <DashboardClient initialRoles={roles} initialStats={stats} />;
}
