import { fetchRoleServer, fetchCandidatesServer } from "@/lib/api/server";
import { notFound } from "next/navigation";
import { RoleDetailClient } from "./client";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [role, candidates] = await Promise.all([
    fetchRoleServer(id),
    fetchCandidatesServer(id),
  ]);
  
  if (!role) notFound();
  
  return <RoleDetailClient role={role} initialCandidates={candidates} />;
}
