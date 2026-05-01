export type Opening = { title: string; dept: string };

export type CompanyProfile = {
  name: string;
  logo: string;
  logoColor: string;
  tagline: string;
  industry: string;
  hq: string;
  size: string;
  headcount: string;
  funding: string;
  stage: string;
  founded: string;
  stack: string[];
  openings: Opening[];
};

export function mockPullCompany(
  f: { website: string; linkedin: string },
  kind: "website" | "linkedin",
): CompanyProfile {
  const url = kind === "website" ? f.website : f.linkedin;
  let name = "Ramp";
  let logo = "R";
  let logoColor = "#3D4D2A";
  try {
    const m = (url || "").match(/(?:linkedin\.com\/company\/|https?:\/\/)([^/?]+)/i);
    if (m && m[1]) {
      const raw = m[1].replace(/^www\./, "").split(/[./-]/)[0];
      name = raw.charAt(0).toUpperCase() + raw.slice(1);
      logo = name[0].toUpperCase();
      const palette = ["#3D4D2A", "#5A2E63", "#2E5A63", "#63452E", "#7A4A8E", "#0A4D40"];
      let h = 0;
      for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
      logoColor = palette[Math.abs(h) % palette.length];
    }
  } catch {}
  return {
    name,
    logo,
    logoColor,
    tagline: "Spend management for finance teams who want to move fast.",
    industry: "Fintech",
    hq: "New York, NY",
    size: "500–1,000",
    headcount: "~720",
    funding: "$1.4B raised",
    stage: "Series E",
    founded: "2019",
    stack: ["React", "TypeScript", "Go", "Postgres", "Kafka", "AWS"],
    openings: [
      { title: "Senior Platform Engineer", dept: "Engineering" },
      { title: "Staff iOS Engineer", dept: "Engineering" },
      { title: "Product Manager, Cards", dept: "Product" },
    ],
  };
}
