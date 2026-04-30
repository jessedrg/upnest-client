"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { Aurora } from "@/components/editorial/aurora";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  // Show error toast if redirected with error
  React.useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast({ title: "Authentication error. Please try again.", tone: "error" });
    }
  }, [searchParams, toast]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    try {
      await signIn(email, password);
      toast({ title: "Welcome back", tone: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("[v0] Login error:", error);
      toast({ 
        title: error instanceof Error ? error.message : "Couldn't sign in", 
        tone: "error" 
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative min-h-screen grid place-items-center bg-paper px-6">
      <Aurora intensity={0.7} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="serif text-[44px] leading-none">Upnest</div>
          <div className="label mt-2">Sign in to your account</div>
        </div>
        <form
          onSubmit={onSubmit}
          className="card p-6 space-y-4 backdrop-blur-sm"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full justify-center"
            disabled={pending}
          >
            {pending ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-xs text-t-3">
            New here?{" "}
            <Link href="/signup" className="underline hover:text-t-1">
              Create an account
            </Link>
          </div>
        </form>
        <p className="serif italic text-center text-t-3 text-sm mt-6">
          See who's working your roles.
        </p>
      </div>
    </div>
  );
}
