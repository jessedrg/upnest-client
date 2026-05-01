"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useRoles, useSubmitCandidate } from "@/lib/queries";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--hair)",
  borderRadius: 8,
  background: "var(--paper)",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

export function SubmitClient() {
  const router = useRouter();
  const { toast } = useToast();
  const roles = useRoles();
  const submitMutation = useSubmitCandidate();
  
  const [form, setForm] = React.useState({
    roleId: "",
    name: "",
    title: "",
    email: "",
    linkedin: "",
    notes: "",
  });

  function handle<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.roleId || !form.name || !form.title) {
      toast({ title: "Please fill in required fields", tone: "error" });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        roleId: form.roleId,
        name: form.name,
        title: form.title,
        email: form.email || undefined,
        linkedin: form.linkedin || undefined,
        notes: form.notes || undefined,
      });
      
      toast({ title: "Candidate submitted successfully", tone: "success" });
      router.push("/candidates");
    } catch {
      toast({ title: "Failed to submit candidate", tone: "error" });
    }
  }

  const loading = roles.isLoading;
  const submitting = submitMutation.isPending;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Submit a Candidate</h1>
        </div>
        <TopProgress active={loading || submitting} />
      </header>
      {loading ? (
        <PageSkeleton variant="form" />
      ) : (
        <div className="px-9 py-8 max-w-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block">
                <span className="label mb-2 block">Select Role *</span>
                <select
                  value={form.roleId}
                  onChange={(e) => handle("roleId", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  disabled={submitting}
                >
                  <option value="">Choose a role...</option>
                  {(roles.data ?? []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title} at {role.company}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="label mb-2 block">Candidate Name *</span>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handle("name", e.target.value)}
                  placeholder="John Smith"
                  disabled={submitting}
                />
              </label>
              <label className="block">
                <span className="label mb-2 block">Current Title *</span>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => handle("title", e.target.value)}
                  placeholder="Senior Engineer"
                  disabled={submitting}
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="label mb-2 block">Email</span>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => handle("email", e.target.value)}
                  placeholder="john@example.com"
                  disabled={submitting}
                />
              </label>
              <label className="block">
                <span className="label mb-2 block">LinkedIn URL</span>
                <input
                  type="url"
                  style={inputStyle}
                  value={form.linkedin}
                  onChange={(e) => handle("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={submitting}
                />
              </label>
            </div>
            
            <label className="block">
              <span className="label mb-2 block">Notes</span>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={form.notes}
                onChange={(e) => handle("notes", e.target.value)}
                placeholder="Why is this candidate a good fit?"
                disabled={submitting}
              />
            </label>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Candidate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
