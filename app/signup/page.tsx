"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { mockPullCompany, type CompanyProfile } from "./types";
import { CompanyAnalyzingPanel, ParsedCompanyPanel } from "./panels";

const RIGHT_LINES = [
  ["§ 01", "We pull your company info from LinkedIn or your site"],
  ["§ 02", "You confirm the basics — size, stack, what you ship"],
  ["§ 03", "We open a clean console for posting roles, paying bounties, and tracking submissions"],
  ["§ 04", "First role is on us. Pay only on hire."],
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  border: "1px solid var(--hair-strong)",
  borderRadius: 12,
  background: "#fff",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
  transition: "border-color .15s",
};

export default function ClientSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState<"form" | "analyzing" | "parsed">("form");
  const [pullKind, setPullKind] = React.useState<"website" | "linkedin">("linkedin");
  const [analyzeBeats, setAnalyzeBeats] = React.useState(0);
  const [profile, setProfile] = React.useState<CompanyProfile | null>(null);
  const [form, setForm] = React.useState({
    fullName: "",
    workEmail: "",
    role: "",
    website: "",
    linkedin: "",
  });

  function handle<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function pullFrom(kind: "website" | "linkedin") {
    if (kind === "website" && !form.website) return toast({ title: "Add your website first", tone: "error" });
    if (kind === "linkedin" && !form.linkedin) return toast({ title: "Add a LinkedIn URL first", tone: "error" });
    setPullKind(kind);
    setStep("analyzing");
    setAnalyzeBeats(0);
  }

  React.useEffect(() => {
    if (step !== "analyzing") return;
    if (analyzeBeats >= 5) {
      const p = mockPullCompany(form, pullKind);
      setProfile(p);
      setStep("parsed");
      return;
    }
    const t = setTimeout(() => setAnalyzeBeats((b) => b + 1), 700);
    return () => clearTimeout(t);
  }, [step, analyzeBeats, form, pullKind]);

  function finish() {
    toast({ title: "Workspace created", tone: "success" });
    setTimeout(() => router.push("/dashboard"), 320);
  }

  return (
    <div
      className="signup-split"
      style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", background: "var(--paper)" }}
    >
      {/* LEFT */}
      <div
        style={{
          padding: "48px 64px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Link
            href="/login"
            className="serif"
            style={{ fontSize: 22, letterSpacing: "-0.02em", textDecoration: "none", color: "var(--ink)" }}
          >
            Upnest <span style={{ fontStyle: "italic", color: "var(--plum-700)" }}>· companies</span>
          </Link>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--t-4)" }}>
            REQUEST ACCESS · TIER I
          </div>
        </div>

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--plum-700)" }}>
                — STEP 01 OF 02 — TELL US WHO YOU ARE
              </div>
              <div
                className="serif"
                style={{ fontSize: 44, fontStyle: "italic", letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 10 }}
              >
                Open a workspace
                <br />
                for your company.
              </div>
              <div
                style={{ fontSize: 15, color: "var(--t-3)", marginTop: 10, fontFamily: "var(--serif)", fontStyle: "italic" }}
              >
                We&apos;ll do the rest from your LinkedIn.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
                    YOUR NAME
                  </div>
                  <input
                    style={inputStyle}
                    value={form.fullName}
                    onChange={(e) => handle("fullName", e.target.value)}
                    placeholder="Catherine Wu"
                  />
                </label>
                <label>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
                    YOUR ROLE
                  </div>
                  <input
                    style={inputStyle}
                    value={form.role}
                    onChange={(e) => handle("role", e.target.value)}
                    placeholder="Head of Talent"
                  />
                </label>
              </div>
              <label>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
                  WORK EMAIL
                </div>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.workEmail}
                  onChange={(e) => handle("workEmail", e.target.value)}
                  placeholder="catherine@ramp.com"
                />
              </label>

              <div style={{ height: 1, background: "var(--hair)", margin: "8px 0" }} />

              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--plum-700)" }}>
                — TELL US ABOUT YOUR COMPANY
              </div>

              <label>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
                  COMPANY LINKEDIN URL
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={form.linkedin}
                    onChange={(e) => handle("linkedin", e.target.value)}
                    placeholder="linkedin.com/company/ramp"
                  />
                  <button onClick={() => pullFrom("linkedin")} className="btn btn-plum" style={{ borderRadius: 12, padding: "0 18px" }}>
                    Pull from LinkedIn
                  </button>
                </div>
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--t-4)" }}>
                <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
                <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em" }}>
                  OR
                </span>
                <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
              </div>

              <label>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--t-4)", marginBottom: 6 }}>
                  COMPANY WEBSITE
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={form.website}
                    onChange={(e) => handle("website", e.target.value)}
                    placeholder="ramp.com"
                  />
                  <button
                    onClick={() => pullFrom("website")}
                    className="btn btn-ghost"
                    style={{ borderRadius: 12, padding: "0 18px" }}
                  >
                    Pull from website
                  </button>
                </div>
              </label>

              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--t-4)", marginTop: 6 }}>
                BY CONTINUING YOU AGREE TO THE COMPANY TERMS — NO CHARGE UNTIL FIRST HIRE
              </div>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <CompanyAnalyzingPanel
            beats={analyzeBeats}
            url={pullKind === "website" ? form.website : form.linkedin}
            kind={pullKind}
          />
        )}

        {step === "parsed" && profile && <ParsedCompanyPanel profile={profile} onFinish={finish} />}
      </div>

      {/* RIGHT */}
      <div
        style={{
          background: "var(--paper-2)",
          padding: "48px 56px 64px",
          borderLeft: "1px solid var(--hair-strong)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--t-4)" }}>
          THE LEDGER · NO. 14
        </div>
        <div className="serif" style={{ fontSize: 38, fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 1.08 }}>
          What happens next.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {RIGHT_LINES.map(([n, t], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 16, alignItems: "baseline" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--plum-700)" }}>
                {n}
              </div>
              <div className="serif" style={{ fontSize: 20, letterSpacing: "-0.01em", lineHeight: 1.35 }}>
                {t}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              padding: 24,
              borderRadius: 14,
              background: "#fff",
              border: "1px solid var(--hair-strong)",
              boxShadow: "0 4px 18px rgba(20,10,40,.04)",
            }}
          >
            <div className="serif" style={{ fontSize: 22, fontStyle: "italic", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              &ldquo;Posted three roles on Tuesday. Had four credible candidates by Thursday.&rdquo;
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3D4D2A,#5A2E63)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                }}
              >
                MK
              </div>
              <div>
                <div style={{ fontSize: 13 }}>Maya Klein</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", color: "var(--t-4)" }}>
                  HEAD OF PEOPLE · SERIES B INFRA CO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
