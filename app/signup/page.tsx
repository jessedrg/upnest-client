"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import { Aurora } from "@/components/editorial/aurora";
import { Button, Input, Label } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const confirmPassword = fd.get("confirmPassword") as string;
    const firstName = fd.get("firstName") as string;
    const lastName = fd.get("lastName") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", tone: "error" });
      setPending(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", tone: "error" });
      setPending(false);
      return;
    }

    try {
      const { user } = await signUp(email, password, {
        full_name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
      });

      if (user?.identities?.length === 0) {
        // User already exists
        toast({ 
          title: "An account with this email already exists", 
          tone: "error" 
        });
      } else {
        toast({ 
          title: "Check your email to confirm your account", 
          tone: "success" 
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("[v0] Signup error:", error);
      toast({ 
        title: error instanceof Error ? error.message : "Couldn't create account", 
        tone: "error" 
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative min-h-screen grid place-items-center bg-paper px-6">
      <Aurora intensity={0.7} />
      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="label">Upnest</div>
          <div className="serif text-[40px] leading-none mt-2">Create an account</div>
          <p className="serif italic text-t-3 mt-3">Join our network of recruiters and clients.</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="card p-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input 
                id="firstName"
                name="firstName" 
                required 
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input 
                id="lastName"
                name="lastName" 
                required 
                autoComplete="family-name"
              />
            </div>
          </div>
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input 
              id="confirmPassword"
              name="confirmPassword" 
              type="password" 
              required 
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full justify-center"
            disabled={pending}
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>
          <div className="text-center text-xs text-t-3 pt-1">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-t-1">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
