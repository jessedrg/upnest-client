"use client";

import * as React from "react";
import Link from "next/link";
import { Aurora } from "@/components/editorial/aurora";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";

export default function SignupPage() {
  const { toast } = useToast();
  return (
    <div className="relative min-h-screen grid place-items-center bg-paper px-6">
      <Aurora intensity={0.7} />
      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="label">Upnest · Clients</div>
          <div className="serif text-[40px] leading-none mt-2">Open an account</div>
          <p className="serif italic text-t-3 mt-3">Briefs in. Hires out.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast({ title: "Application received — we'll be in touch", tone: "success" });
          }}
          className="card p-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Input name="company" required />
            </div>
            <div>
              <Label>Website</Label>
              <Input name="website" type="url" placeholder="https://" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Your name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Work email</Label>
              <Input name="email" type="email" required />
            </div>
          </div>
          <div>
            <Label>What roles are you hiring for?</Label>
            <Input name="roles" placeholder="e.g. Senior Eng, Founding GTM" />
          </div>
          <Button type="submit" className="w-full justify-center">Open account</Button>
          <div className="text-center text-xs text-t-3 pt-1">
            Already in? <Link href="/login" className="underline hover:text-t-1">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
