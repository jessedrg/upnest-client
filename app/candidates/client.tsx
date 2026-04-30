"use client";

import Link from "next/link";
import { useCandidates } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Application } from "@/lib/schemas";

export function CandidatesClient({ initial }: { initial: Application[] }) {
  const q = useCandidates();
  const list = q.data ?? initial;

  // Get initials from name
  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  }

  // Format interview status for display
  function formatStatus(status: string | null) {
    if (!status) return "new";
    return status.replace(/_/g, " ");
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Candidates</h1>
          <Link href="/submit" className="btn btn-primary">+ Submit candidate</Link>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : list.length === 0 ? (
        <div className="px-9 py-16 text-center">
          <p className="text-t-3 mb-4">No candidates found.</p>
          <Link href="/roles" className="btn btn-primary">
            Browse roles to submit candidates
          </Link>
        </div>
      ) : (
        <div className="px-9 py-8 space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft hover:bg-paper-2 transition-colors"
            >
              {c.profile_image_url ? (
                <img 
                  src={c.profile_image_url} 
                  alt={c.candidate_name || "Candidate"} 
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs font-medium">
                  {getInitials(c.candidate_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.candidate_name || "Unknown"}</div>
                <div className="text-xs text-t-3 truncate">{c.candidate_email}</div>
              </div>
              <span className={`mono text-[10px] uppercase tracking-widest ${
                c.interview_status === "hired" ? "text-green-600" :
                c.interview_status === "rejected" ? "text-red-500" :
                c.interview_status === "offer" ? "text-amber-600" :
                "text-t-3"
              }`}>
                {formatStatus(c.interview_status)}
              </span>
              {c.fit_score != null && (
                <span className="serif text-[20px] tabular-nums">{c.fit_score}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
