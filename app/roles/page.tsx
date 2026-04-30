import { fetchRolesServer } from "@/lib/api/server";
import { RolesClient } from "./client";

export default async function RolesPage() {
  const roles = await fetchRolesServer();
  return <RolesClient initialRoles={roles} />;
}
