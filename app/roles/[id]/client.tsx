"use client";

import { useState } from "react";
import Link from "next/link";
import { useCandidates, useRoleStats } from "@/lib/queries";
import { TopProgress } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "@/components/icons";
import type { Role, Application } from "@/lib/schemas";
import { clsx } from "clsx";

const TABS = ["role", "candidates", "sourcing", "rejections"] as const;
type Tab = (typeof TABS)[number];

export function RoleDetailClient({
  role,
  initialCandidates,
}: {
  role: Role;
  initialCandidates: Application[];
}) {
  const [tab, setTab] = useState<Tab>("role");
  const candidates = useCandidates(role.id);
  const stats = useRoleStats(role.id);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-9">
          <Link href="/roles" className="text-t-3 hover:text-t-1">
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <div className="label">{role.company_name || "Company"}</div>
            <h1 className="serif text-[20px] leading-none tracking-editorial">
              {role.title}
            </h1>
          </div>
          <div className="ml-auto flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "px-3 py-1.5 text-[12px] capitalize rounded-full",
                  tab === t
                    ? "bg-ink text-paper"
                    : "text-t-3 hover:text-t-1 hover:bg-paper-2",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <TopProgress active={candidates.isFetching} />
      </header>

      <div className="px-9 py-8 space-y-6">
        {tab === "role" && <RoleTab role={role} stats={stats.data} />}
        {tab === "candidates" && (
          <CandidatesTab list={candidates.data ?? initialCandidates} />
        )}
        {tab === "sourcing" && (
          <p className="text-t-3 italic serif">Sourcing tools coming soon.</p>
        )}
        {tab === "rejections" && (
          <RejectionsTab list={(candidates.data ?? initialCandidates).filter(c => c.interview_status === "rejected")} />
        )}
      </div>
    </>
  );
}

interface PipelineStats {
  total: number;
  new: number;
  sent_to_client: number;
  interviewing: number;
  offer: number;
  hired: number;
  rejected: number;
}

function RoleTab({ role, stats }: { role: Role; stats?: PipelineStats }) {
  const pipeline = stats ?? {
    total: 0,
    new: 0,
    sent_to_client: 0,
    interviewing: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card p-6">
          <div className="label mb-2">Brief</div>
          <p className="text-[15px] leading-relaxed text-t-2 whitespace-pre-wrap">
            {role.description ?? "No description provided yet."}
          </p>
        </div>
        {role.requirements && (
          <div className="card p-6">
            <div className="label mb-2">Requirements</div>
            <p className="text-[15px] leading-relaxed text-t-2 whitespace-pre-wrap">
              {role.requirements}
            </p>
          </div>
        )}
        <div className="card p-6">
          <div className="label mb-3">Pipeline</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { key: "total", label: "Total" },
              { key: "new", label: "New" },
              { key: "sent_to_client", label: "Sent" },
              { key: "interviewing", label: "Interview" },
              { key: "offer", label: "Offer" },
              { key: "hired", label: "Hired" },
            ].map(({ key, label }) => (
              <div key={key} className="rounded-lg bg-paper-2 p-3">
                <div className="label text-[9px]">{label}</div>
                <div className="serif text-[28px] leading-none mt-1">
                  {pipeline[key as keyof PipelineStats]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <div className="label">Bounty</div>
          <div className="serif text-[40px] leading-none mt-1">
            {role.bounty ? `$${(role.bounty / 1000).toFixed(0)}k` : "TBD"}
          </div>
          {role.recruiter_percentage && (
            <div className="text-xs text-t-3 mt-1">
              {role.recruiter_percentage}% to recruiter
            </div>
          )}
        </div>
        <div className="card p-5 space-y-2">
          <div className="label mb-1">Details</div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Location</span>
            <span>{role.location || "Remote"}</span>
          </div>
          {role.remote_policy && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Remote</span>
              <span className="capitalize">{role.remote_policy}</span>
            </div>
          )}
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Status</span>
            <span className={`capitalize ${
              role.status === "active" ? "text-green-600" :
              role.status === "paused" ? "text-amber-600" : ""
            }`}>
              {role.status?.replace("_", " ") || "active"}
            </span>
          </div>
          {role.salary_range && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Salary</span>
              <span>{role.salary_range}</span>
            </div>
          )}
          {role.experience_level && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Level</span>
              <span className="capitalize">{role.experience_level}</span>
            </div>
          )}
          {role.difficulty && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Difficulty</span>
              <span>{"*".repeat(role.difficulty)}</span>
            </div>
          )}
        </div>
        {role.company_description && (
          <div className="card p-5">
            <div className="label mb-2">About {role.company_name}</div>
            <p className="text-sm text-t-2 line-clamp-4">{role.company_description}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function CandidatesTab({ list }: { list: Application[] }) {
  const activeCandidates = list.filter(c => c.interview_status !== "rejected");

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  }

  function formatStatus(status: string | null) {
    if (!status) return "new";
    return status.replace(/_/g, " ");
  }

  if (activeCandidates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-t-3 mb-4">No candidates yet for this role.</p>
        <Link href="/submit" className="btn btn-primary">
          Submit a candidate
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeCandidates.map((c) => (
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
  );
}

function RejectionsTab({ list }: { list: Application[] }) {
  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  }

  if (list.length === 0) {
    return <p className="text-t-3 italic serif">No rejections to review.</p>;
  }

  return (
    <div className="space-y-2">
      {list.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft"
        >
          <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs font-medium">
            {getInitials(c.candidate_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{c.candidate_name || "Unknown"}</div>
            <div className="text-xs text-t-3 truncate">{c.candidate_email}</div>
          </div>
          {c.rejection_reason && (
            <span className="text-xs text-t-3 max-w-[200px] truncate">
              {c.rejection_reason}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
