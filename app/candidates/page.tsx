import { fetchCandidatesServer } from "@/lib/api/server";
import { CandidatesClient } from "./client";

export default async function CandidatesPage() {
  const candidates = await fetchCandidatesServer();
  return <CandidatesClient initial={candidates} />;
}
