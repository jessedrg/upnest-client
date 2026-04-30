"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useRoles, useCreateRole } from "@/lib/queries";
import { TopProgress } from "@/components/ui/skeleton";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/lib/schemas";

export function SubmitClient({ initialRoles }: { initialRoles?: Role[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const roles = useRoles({ initialData: initialRoles });
  const createRole = useCreateRole();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData(e.currentTarget);
    
    try {
      await createRole.mutateAsync({
        title: fd.get("title") as string,
        company_name: fd.get("company_name") as string,
        location: fd.get("location") as string,
        remote_policy: fd.get("remote_policy") as "onsite" | "hybrid" | "remote" | undefined,
        description: fd.get("description") as string,
        requirements: fd.get("requirements") as string,
        department: fd.get("department") as string,
        salary_range: fd.get("salary_range") as string,
        experience_level: fd.get("experience_level") as string,
      });

      toast({ title: "Role submitted successfully!", tone: "success" });
      router.push("/roles");
    } catch (error) {
      console.error("[v0] Error submitting role:", error);
      toast({ 
        title: error instanceof Error ? error.message : "Failed to submit role", 
        tone: "error" 
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Submit a role</h1>
        </div>
        <TopProgress active={roles.isFetching || pending} />
      </header>
      
      <div className="px-9 py-8 max-w-2xl">
        <form onSubmit={onSubmit} className="card p-8 space-y-6">
          <div className="space-y-1">
            <div className="serif text-[24px]">New role submission</div>
            <p className="text-t-3 text-sm">
              Submit a new role for review. Once approved, recruiters will be able to source candidates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input 
                id="title"
                name="title" 
                required 
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input 
                id="company_name"
                name="company_name" 
                required 
                placeholder="e.g. Acme Inc"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department"
                name="department" 
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Input 
                id="experience_level"
                name="experience_level" 
                placeholder="e.g. Senior, Mid-level"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                name="location" 
                required 
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor="remote_policy">Remote Policy</Label>
              <select 
                id="remote_policy"
                name="remote_policy" 
                className="input w-full"
              >
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input 
              id="salary_range"
              name="salary_range" 
              placeholder="e.g. $150,000 - $200,000"
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <textarea 
              id="description"
              name="description" 
              required
              rows={5}
              className="input w-full resize-none"
              placeholder="Describe the role, responsibilities, and what makes it exciting..."
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <textarea 
              id="requirements"
              name="requirements" 
              rows={4}
              className="input w-full resize-none"
              placeholder="List the key requirements and qualifications..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              type="button" 
              className="btn-ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-primary"
              disabled={pending}
            >
              {pending ? "Submitting..." : "Submit Role"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
