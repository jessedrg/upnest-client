"use client";

import * as React from "react";

type Variant = "dusk" | "ember" | "dawn";

const PALETTES: Record<Variant, { a: string; b: string; c: string; sun: string; mark: string }> = {
  dusk:  { a: "#4C1F7A", b: "#2A1248", c: "#0F0820", sun: "#E6C680", mark: "#F3E6CE" },
  ember: { a: "#5A2464", b: "#241035", c: "#0B0616", sun: "#E8B06A", mark: "#EADFFF" },
  dawn:  { a: "#3B1E5E", b: "#1A0C33", c: "#08050F", sun: "#F0D498", mark: "#F6ECD6" },
};

/**
 * Editorial aurora — soft mesh gradient + sun band + thin orbits.
 * Direct port of the HTML <Aurora /> component.
 */
export function Aurora({ variant = "dusk" }: { variant?: Variant }) {
  const p = PALETTES[variant];
  const id = `aur-${variant}`;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: p.c }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(1200px 700px at 25% 110%, ${p.a} 0%, transparent 55%),
            radial-gradient(900px 900px at 85% 10%, ${p.b} 0%, transparent 55%),
            radial-gradient(600px 420px at 80% 90%, ${p.sun}33 0%, transparent 60%),
            linear-gradient(180deg, ${p.c} 0%, ${p.b} 60%, ${p.a} 100%)
          `,
        }}
      />
      <svg
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.sun} stopOpacity="0" />
            <stop offset="50%" stopColor={p.sun} stopOpacity=".55" />
            <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.sun} stopOpacity=".9" />
            <stop offset="60%" stopColor={p.sun} stopOpacity=".1" />
            <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="72" cy="38" r="22" fill={`url(#${id}-glow)`} />
        <rect x="0" y="62" width="100" height="0.4" fill={`url(#${id}-sun)`} />
        <rect x="0" y="63.2" width="100" height="0.2" fill={`url(#${id}-sun)`} opacity=".6" />
        <g stroke={p.mark} strokeWidth=".12" fill="none" opacity=".35">
          <ellipse cx="72" cy="38" rx="28" ry="28" />
          <ellipse cx="72" cy="38" rx="38" ry="38" />
        </g>
      </svg>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "overlay",
          opacity: 0.18,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
