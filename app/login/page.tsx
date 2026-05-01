"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid var(--hair)",
  background: "var(--paper)",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

export default function ClientLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("catherine@ramp.com");
  const [pw, setPw] = React.useState("••••••••••••");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Welcome back", tone: "success" });
    setTimeout(() => router.push("/dashboard"), 320);
  }

  return (
    <div
      className="login-split"
      style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--paper)" }}
    >
      <div
        className="login-brand"
        style={{
          background: "var(--ink)",
          color: "#F3E6CE",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".24em", color: "rgba(243,230,206,.55)" }}>
          UPNEST · COMPANIES
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "#B88858" }}>
            § 01 — ACCESS
          </div>
          <div
            className="serif"
            style={{
              fontSize: "clamp(42px, 5vw, 68px)",
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              marginTop: 20,
              textWrap: "balance",
            }}
          >
            The hiring layer
            <br />
            <span style={{ color: "#B88858" }}>for companies</span>
            <br />
            that ship.
          </div>
          <div
            style={{
              fontSize: 16,
              color: "rgba(243,230,206,.7)",
              fontStyle: "italic",
              fontFamily: "var(--serif)",
              marginTop: 22,
              maxWidth: 440,
              lineHeight: 1.5,
            }}
          >
            &ldquo;We&apos;ve placed 847 senior operators since 2022, at a median of 34 days from brief to offer.&rdquo;
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "rgba(243,230,206,.4)", marginTop: 10 }}>
            — FROM THE LEDGER
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, paddingTop: 24, borderTop: "1px solid rgba(243,230,206,.1)" }}>
          {[
            ["847", "ROLES CLOSED"],
            ["34d", "MEDIAN"],
            ["92%", "RETENTION @ 12MO"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="serif" style={{ fontSize: 28, fontStyle: "italic" }}>
                {v}
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "rgba(243,230,206,.5)", marginTop: 2 }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="login-form"
        style={{ padding: "64px 72px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 560 }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--t-4)" }}>
          SIGN IN · CLIENT CONSOLE
        </div>
        <div
          className="serif"
          style={{ fontSize: 46, fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 12 }}
        >
          Welcome back.
        </div>
        <div style={{ fontSize: 15, color: "var(--t-3)", marginTop: 8, fontStyle: "italic", fontFamily: "var(--serif)" }}>
          Pick up where your pipeline left off.
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
              COMPANY EMAIL
            </div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </label>
          <label>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
              PASSWORD
            </div>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={inputStyle} />
          </label>
          <button
            type="submit"
            className="btn btn-plum"
            style={{ marginTop: 12, padding: "14px 18px", fontSize: 14, justifyContent: "space-between" }}
          >
            <span>Enter the console</span>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>→</span>
          </button>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--t-4)", textAlign: "center", marginTop: 8 }}
          >
            NEW HERE? —{" "}
            <Link href="/signup" style={{ color: "var(--plum-600)" }}>
              REQUEST ACCESS
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
