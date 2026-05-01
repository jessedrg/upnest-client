import * as React from "react";
import type { CompanyProfile } from "./types";

export function CompanyAnalyzingPanel({
  beats,
  url,
  kind,
}: {
  beats: number;
  url: string;
  kind: "website" | "linkedin";
}) {
  const lines = [
    kind === "website" ? "Crawling homepage" : "Resolving company page",
    "Reading about, team & jobs",
    "Identifying funding & headcount",
    "Matching tech stack & industry",
    "Done",
  ];
  return (
    <div
      style={{
        border: "1px solid var(--hair-strong)",
        borderRadius: 14,
        padding: "26px 28px",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(120,75,140,.04) 3px 4px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--plum-700)", marginBottom: 14 }}
      >
        — ANALYZING COMPANY
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--t-3)", wordBreak: "break-all", marginBottom: 18 }}>
        ⌁ {url}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lines.map((l, i) => {
          const done = i < beats;
          const active = i === beats;
          return (
            <div
              key={l}
              style={{ display: "flex", alignItems: "center", gap: 12, opacity: done || active ? 1 : 0.35, transition: "opacity .3s" }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  border: done ? "1px solid var(--plum-600)" : "1px solid var(--hair-strong)",
                  background: done ? "var(--plum-600)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                }}
              >
                {done && "✓"}
              </span>
              <span className="serif" style={{ fontSize: 18, fontStyle: active ? "italic" : "normal", letterSpacing: "-0.01em" }}>
                {l}
                {active && (
                  <span className="dots-pulse" style={{ marginLeft: 6, color: "var(--t-4)" }}>
                    …
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ParsedCompanyPanel({ profile, onFinish }: { profile: CompanyProfile; onFinish: () => void }) {
  return (
    <div>
      <div style={{ border: "1px solid var(--hair-strong)", borderRadius: 14, background: "#fff", padding: "24px 26px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", borderBottom: "1px solid var(--hair)", paddingBottom: 18, marginBottom: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              background: profile.logoColor,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--mono)",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {profile.logo}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="serif" style={{ fontSize: 24, letterSpacing: "-0.02em", fontStyle: "italic" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--t-3)" }}>{profile.tagline}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--t-4)", marginTop: 4 }}>
              {profile.industry.toUpperCase()} · {profile.hq.toUpperCase()} · {profile.size}
            </div>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", color: "var(--t-4)", marginBottom: 12 }}>
          § WHAT WE FOUND
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--hair)", borderRadius: 10 }}>
          {([
            ["HEADCOUNT", profile.headcount],
            ["FUNDING", profile.funding],
            ["STAGE", profile.stage],
            ["FOUNDED", profile.founded],
          ] as const).map(([k, v], i) => (
            <div
              key={k}
              style={{
                padding: "14px 16px",
                borderRight: i % 2 === 0 ? "1px solid var(--hair)" : "none",
                borderBottom: i < 2 ? "1px solid var(--hair)" : "none",
              }}
            >
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", color: "var(--t-4)" }}>
                {k}
              </div>
              <div className="serif" style={{ fontSize: 18, letterSpacing: "-0.01em", marginTop: 2 }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", color: "var(--t-4)", marginTop: 18, marginBottom: 10 }}>
          § TECH STACK
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {profile.stack.map((s) => (
            <span
              key={s}
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: ".14em",
                padding: "5px 10px",
                borderRadius: 999,
                border: "1px solid var(--hair-strong)",
                color: "var(--t-2)",
              }}
            >
              {s.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", color: "var(--t-4)", marginTop: 18, marginBottom: 10 }}>
          § RECENT OPENINGS
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {profile.openings.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "10px 0",
                borderBottom: i < profile.openings.length - 1 ? "1px solid var(--hair)" : "none",
              }}
            >
              <span className="serif" style={{ fontSize: 16 }}>
                {r.title}
              </span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--t-4)" }}>
                {r.dept.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
        <button
          onClick={onFinish}
          style={{
            flex: 1,
            appearance: "none",
            border: 0,
            cursor: "pointer",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "16px",
            borderRadius: 999,
            fontFamily: "var(--serif)",
            fontSize: 18,
            fontStyle: "italic",
          }}
        >
          Looks right — create my workspace <span style={{ fontStyle: "normal" }}>→</span>
        </button>
      </div>
    </div>
  );
}
