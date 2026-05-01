"use client";

import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchRecruiters, type Recruiter } from "@/lib/api/recruiters";

function useRecruiters() {
  return useQuery({
    queryKey: ["recruiters"],
    queryFn: fetchRecruiters,
  });
}

export function RecruitersClient() {
  const recruiters = useRecruiters();
  
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Recruiters</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-t-3">
              {recruiters.data?.length || 0} recruiters
            </span>
          </div>
        </div>
        <TopProgress active={recruiters.isFetching} />
      </header>
      {recruiters.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : (
        <div className="px-9 py-8">
          <div className="rounded-lg border border-rule-2 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft text-left">
                <tr>
                  <th className="px-4 py-3 label">Recruiter</th>
                  <th className="px-4 py-3 label">Email</th>
                  <th className="px-4 py-3 label">Status</th>
                  <th className="px-4 py-3 label">Type</th>
                  <th className="px-4 py-3 label text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {(recruiters.data ?? []).map((r) => (
                  <RecruiterRow key={r.id} recruiter={r} />
                ))}
                {recruiters.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-t-3">
                      No recruiters found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function RecruiterRow({ recruiter }: { recruiter: Recruiter }) {
  const name = recruiter.fullName || 
    [recruiter.firstName, recruiter.lastName].filter(Boolean).join(" ") ||
    recruiter.email.split("@")[0];
    
  const statusColors: Record<string, string> = {
    approved: "text-forest bg-forest/10",
    pending: "text-amber-600 bg-amber-100",
    rejected: "text-rust bg-rust/10",
  };
  
  const statusColor = statusColors[recruiter.status || "pending"] || statusColors.pending;
  
  return (
    <tr className="border-t border-rule-2 hover:bg-paper-soft/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-plum-100 flex items-center justify-center text-plum-700 text-xs font-medium"
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-t-3">{recruiter.email}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${statusColor}`}>
          {recruiter.status || "pending"}
        </span>
      </td>
      <td className="px-4 py-3 text-t-3 capitalize">
        {recruiter.contractType || "freelancer"}
      </td>
      <td className="px-4 py-3 text-right mono text-xs">
        {recruiter.bountyPercentage || 30}%
      </td>
    </tr>
  );
}
