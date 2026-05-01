"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  HomeIcon,
  RolesIcon,
  CandidatesIcon,
  StatsIcon,
  SettingsIcon,
  ContractIcon,
  PlusIcon,
  LogoutIcon,
} from "@/components/icons";
import { signOut } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

// Navigation items for all users
const BASE_NAV = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  { href: "/roles", label: "Roles", icon: RolesIcon },
  { href: "/candidates", label: "Candidates", icon: CandidatesIcon },
];

// Navigation items for recruiters
const RECRUITER_NAV = [
  { href: "/submit", label: "Submit a role", icon: PlusIcon },
];

// Navigation items for admins
const ADMIN_NAV = [
  { href: "/recruiters", label: "Recruiters", icon: CandidatesIcon },
];

// Navigation items for all users
const FOOTER_NAV = [
  { href: "/billing", label: "Billing", icon: ContractIcon },
  { href: "/stats", label: "Stats", icon: StatsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function SideNav() {
  const path = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string>("user");
  const [userName, setUserName] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, full_name, first_name, last_name")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role || "user");
          setUserName(profile.full_name || profile.first_name || user.email?.split("@")[0] || null);
        }
      }
    }
    fetchProfile();
  }, []);
  
  // Build navigation based on role
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isRecruiter = userRole === "user" || userRole === "agency_owner";
  
  const NAV = [
    ...BASE_NAV,
    ...(isRecruiter ? RECRUITER_NAV : []),
    ...(isAdmin ? ADMIN_NAV : []),
    ...FOOTER_NAV,
  ];
  
  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }
  
  return (
    <aside className="hidden md:flex w-[220px] flex-col border-r border-rule-2 bg-paper-soft py-6 px-3">
      <div className="px-3 mb-6">
        <div className="serif text-[28px] leading-none">Upnest</div>
        <div className="label mt-1">
          {isAdmin ? "Admin" : isRecruiter ? "Recruiters" : "Clients"}
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href as never}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] tracking-tight",
                active
                  ? "bg-paper-2 text-t-1"
                  : "text-t-2 hover:bg-paper-2 hover:text-t-1",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 space-y-3">
        {userName && (
          <div className="text-[11px] text-t-3 truncate">
            {userName}
          </div>
        )}
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-[12px] text-t-3 hover:text-t-1"
        >
          <LogoutIcon size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
