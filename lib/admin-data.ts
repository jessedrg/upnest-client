'use client';

// Admin data — shared mock dataset for all admin views.
// Migrated from JSX module to TS for native imports.

export type OrgRow = {
  id: string;
  name: string;
  type: 'company' | 'agency';
  tier: string;
  logo: string;
  joined: string;
  mrr: number;
  health: 'healthy' | 'at-risk' | 'dormant';
  seats: number;
  roles: number;
  candidates: number;
  primary: string;
  domain: string;
};

export type RolePipeline = {
  New: number; Screening: number; Phone: number; Technical: number;
  SentToClient: number; OnSite: number; Offer: number; Hired: number; Rejected: number;
};

export type RoleRow = {
  id: string; num: string; org: string; title: string; location: string;
  workMode: string; status: 'open' | 'paused' | 'closed';
  salary: string; opened: string; focused: boolean; confidential: boolean;
  recruiters: number; candidates: number; pipeline: RolePipeline;
  age: number; tta: string; fee: string; priority: 'high' | 'med' | 'low';
};

export type Rejection = {
  code: string; label: string; tone: string; note: string;
  at: string; atIso: string;
  by: { name: string; role: string };
  fromStage: string; kind: 'reject' | 'withdraw';
};

export type Candidate = {
  id: string; num: string; name: string; initials: string; title: string;
  current: string; role: string; roleId: string; org: string;
  stage: string; source: string; submitted: string; recruiter: string;
  location: string; salary: string; years: number; quote: string;
  flagged: boolean; saved: boolean;
  sentAt?: string;
  rejection?: Rejection;
};

export type Recruiter = {
  id: string; name: string; org: string; status: string; tier: string;
  roles: number; submitted: number; placed: number; rev: number;
  fee: string; joined: string; email: string; phone: string;
  linkedin: string; location: string; timezone: string;
  portfolio: string; bio: string;
  specialties?: string[]; yearsExp?: number; appliedAt?: string;
  prevClients?: string[];
  references?: { name: string; role: string; email: string }[];
  notes?: string;
};

export type ActivityRow = {
  id: string; at: string; kind: string; actor: string; verb: string; target: string; to: string;
};

export type PendingOrg = {
  id: string; name: string; type: string; tier: string; logo: string;
  domain: string; primary: string; primaryTitle: string;
  email: string; phone: string; linkedin: string; website: string;
  size: string; hq: string; appliedAt: string;
  expectedRoles?: string[]; expectedHires?: number;
  funding?: string; investors?: string;
  specialties?: string[]; recruiterCount?: number; yearsActive?: number;
  prevClients?: string[];
  notes: string; stage: string;
};

export type RoleSubmittal = {
  id: string; num: string; org: string; submittedBy: string; submittedAt: string;
  title: string; location: string; workMode: string;
  salary: string; bounty: string; feePct: string; guarantee: string;
  headcount: number; priority: string; confidential: boolean;
  description: string; skills: string[]; seniority: string;
  status: 'pending' | 'needs-info' | 'approved' | 'rejected';
  agencyRestriction: string; needsInfo?: string;
  department: string; industry: string; type: string; level: string;
  visaSponsor: boolean; phoneScreen: boolean; difficulty: string;
  requirements: string; about: string; benefits: string;
  requiredSkills: string[]; niceToHave: string[]; redFlags: string[];
  screeningQs: string[];
  hiringManager: { name: string; title: string; linkedin: string };
  calibrationBenchmarks: any[];
  recommendedCandidates: any[];
  aiInsight: string;
};

export type AdminData = {
  orgs: OrgRow[];
  roles: RoleRow[];
  candidates: Candidate[];
  recruiters: Recruiter[];
  activity: ActivityRow[];
  stages: string[];
  pendingOrgs: PendingOrg[];
  pendingAgencies: PendingOrg[];
  roleSubmittals: RoleSubmittal[];
};

const orgs: OrgRow[] = [
  { id:'org-1', name:'Ramp',             type:'company', tier:'Enterprise', logo:'R', joined:'2024-03', mrr:18400, health:'healthy',  seats:42, roles:11, candidates:189, primary:'Catherine Hughes', domain:'ramp.com' },
  { id:'org-2', name:'Anthropic',        type:'company', tier:'Enterprise', logo:'A', joined:'2024-01', mrr:22100, health:'healthy',  seats:58, roles:7,  candidates:412, primary:'Dario Odom',       domain:'anthropic.com' },
  { id:'org-3', name:'Stripe',           type:'company', tier:'Growth',     logo:'S', joined:'2023-11', mrr:12400, health:'healthy',  seats:26, roles:14, candidates:301, primary:'Mel Patel',        domain:'stripe.com' },
  { id:'org-4', name:'Linear',           type:'company', tier:'Growth',     logo:'L', joined:'2024-05', mrr:8900,  health:'at-risk',  seats:14, roles:4,  candidates:56,  primary:'Karri Saarinen',   domain:'linear.app' },
  { id:'org-5', name:'Vercel',           type:'company', tier:'Growth',     logo:'V', joined:'2024-04', mrr:9600,  health:'healthy',  seats:18, roles:6,  candidates:142, primary:'Guillermo Rauch',  domain:'vercel.com' },
  { id:'org-6', name:'Parabol Partners', type:'agency',  tier:'Agency',     logo:'P', joined:'2024-02', mrr:3400,  health:'healthy',  seats:8,  roles:0,  candidates:88,  primary:'Rowan Tao',        domain:'parabol.work' },
  { id:'org-7', name:'Northfield Talent',type:'agency',  tier:'Agency',     logo:'N', joined:'2024-06', mrr:2100,  health:'dormant',  seats:5,  roles:0,  candidates:19,  primary:'Yuki Tanabe',      domain:'northfield.io' },
  { id:'org-8', name:'Cedar & Finch',    type:'agency',  tier:'Agency',     logo:'C', joined:'2024-07', mrr:1800,  health:'healthy',  seats:4,  roles:0,  candidates:34,  primary:'Mina Osei',        domain:'cedarfinch.co' },
];

const stages = ['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired','Rejected'];

const roles: RoleRow[] = [
  { id:'r-001', num:'R-01284', org:'Ramp',       title:'Senior Platform Engineer',   location:'New York',    workMode:'Hybrid',  status:'open',   salary:'$190–240k', opened:'14d ago', focused:true,  confidential:false, recruiters:3, candidates:42, pipeline:{New:12, Screening:9, Phone:6, Technical:5, SentToClient:4, OnSite:3, Offer:2, Hired:1, Rejected:0}, age:14, tta:'11d', fee:'22%',  priority:'high' },
  { id:'r-002', num:'R-01281', org:'Ramp',       title:'Staff iOS Engineer',         location:'Remote US',   workMode:'Remote',  status:'open',   salary:'$220–270k', opened:'9d ago',  focused:true,  confidential:true,  recruiters:2, candidates:28, pipeline:{New:5,  Screening:6, Phone:5, Technical:4, SentToClient:3, OnSite:2, Offer:1, Hired:0, Rejected:2}, age:9,  tta:'—',   fee:'22%',  priority:'high' },
  { id:'r-003', num:'R-01277', org:'Anthropic',  title:'Research Scientist — RL',    location:'San Francisco',workMode:'Onsite', status:'open',   salary:'$320–420k', opened:'21d ago', focused:false, confidential:true,  recruiters:4, candidates:87, pipeline:{New:22, Screening:18, Phone:14, Technical:12, SentToClient:9, OnSite:6, Offer:3, Hired:1, Rejected:2}, age:21, tta:'—',   fee:'25%',  priority:'high' },
  { id:'r-004', num:'R-01276', org:'Anthropic',  title:'Product Designer',           location:'Remote',      workMode:'Remote',  status:'open',   salary:'$180–220k', opened:'18d ago', focused:false, confidential:false, recruiters:2, candidates:64, pipeline:{New:15, Screening:14, Phone:10, Technical:8,  SentToClient:7, OnSite:4, Offer:2, Hired:1, Rejected:3}, age:18, tta:'—',   fee:'20%',  priority:'med'  },
  { id:'r-005', num:'R-01272', org:'Stripe',     title:'Financial Crimes Lead',      location:'Dublin',      workMode:'Hybrid',  status:'open',   salary:'€140–180k', opened:'32d ago', focused:false, confidential:false, recruiters:3, candidates:51, pipeline:{New:8,  Screening:12, Phone:11, Technical:8, SentToClient:6, OnSite:3, Offer:1, Hired:1, Rejected:1}, age:32, tta:'29d', fee:'22%',  priority:'med'  },
  { id:'r-006', num:'R-01271', org:'Stripe',     title:'Growth PM',                  location:'London',      workMode:'Hybrid',  status:'paused', salary:'£130–160k', opened:'40d ago', focused:false, confidential:false, recruiters:2, candidates:36, pipeline:{New:4,  Screening:6, Phone:8, Technical:6, SentToClient:5, OnSite:4, Offer:2, Hired:0, Rejected:1}, age:40, tta:'—',   fee:'22%',  priority:'low'  },
  { id:'r-007', num:'R-01268', org:'Linear',     title:'Engineering Manager',        location:'Remote EU',   workMode:'Remote',  status:'open',   salary:'€140–180k', opened:'28d ago', focused:true,  confidential:false, recruiters:2, candidates:31, pipeline:{New:6,  Screening:7, Phone:6, Technical:5, SentToClient:3, OnSite:2, Offer:1, Hired:0, Rejected:1}, age:28, tta:'—',   fee:'22%',  priority:'med'  },
  { id:'r-008', num:'R-01265', org:'Vercel',     title:'Senior Next.js Engineer',    location:'Remote',      workMode:'Remote',  status:'open',   salary:'$180–230k', opened:'12d ago', focused:false, confidential:false, recruiters:3, candidates:58, pipeline:{New:14, Screening:11, Phone:9, Technical:7, SentToClient:6, OnSite:4, Offer:3, Hired:2, Rejected:2}, age:12, tta:'10d', fee:'22%',  priority:'med'  },
  { id:'r-009', num:'R-01261', org:'Ramp',       title:'Head of Revenue Ops',        location:'New York',    workMode:'Onsite',  status:'open',   salary:'$200–250k', opened:'45d ago', focused:false, confidential:false, recruiters:1, candidates:19, pipeline:{New:2,  Screening:4, Phone:5, Technical:3, SentToClient:2, OnSite:1, Offer:1, Hired:0, Rejected:1}, age:45, tta:'—',   fee:'22%',  priority:'low'  },
];

const firstNames = ['Adrien','Priya','Leo','Yuki','Tomás','Marcus','Sofía','Aki','Rania','Kieran','Dashiell','Anwen','Ezra','Mei','Ola','Claudia','Theo','Hana','Isla','Omar','Finn','Noa','Rhea','Devon','Ines','Kai','Ada','Jules','Ozlem'];
const lastNames  = ['Novak','Ramanathan','Zimmerman','Shimizu','Alvarez','Holt','Vargas','Tanabe','Haddad','Byrne','Mulholland','Ellis','Wolfson','Chen','Wójcik','Beltran','Haakonsen','Pak','Quinn','Rahimi','Crowley','Aasen','Sandoval','Pierce','Mota','Okafor','Kowalski','Durand','Yilmaz'];
const titles     = ['Staff Engineer','Senior iOS Engineer','Principal ML Engineer','Lead Product Designer','Platform Engineer','Product Manager','Senior Backend Engineer','VP of Revenue','Staff PM','Engineering Manager','Senior Data Scientist','Head of Design','Staff Frontend Engineer','Senior RecOps','Research Engineer'];
const sources    = ['Cold email','Referral','LinkedIn','Agency: Parabol','Agency: Cedar & Finch','Direct apply','Inbound'];

const candidates: Candidate[] = [];
for (let i=0; i<48; i++) {
  const r = roles[i % roles.length];
  const fn = firstNames[(i*7) % firstNames.length];
  const ln = lastNames[(i*13) % lastNames.length];
  const stageIdx = Math.min(stages.length-1, (i*3) % stages.length);
  const stage = stages[stageIdx];
  candidates.push({
    id: 'c-' + String(1000 + i),
    num: 'C-' + String(2100 + i).padStart(5,'0'),
    name: fn + ' ' + ln,
    initials: (fn[0] + ln[0]).toUpperCase(),
    title: titles[(i*5) % titles.length],
    current: ['Figma','Plaid','Datadog','Airbnb','Shopify','Notion','Brex','Mercury','Snowflake','Square'][(i*11) % 10],
    role: r.title,
    roleId: r.id,
    org: r.org,
    stage,
    source: sources[(i*17) % sources.length],
    submitted: ['2d ago','4d ago','6d ago','1w ago','2w ago','3w ago'][(i*3) % 6],
    recruiter: ['Jesse Dragstra','Mira Holt','Noor Salim','Ben Ortiz','Aiko Sato'][(i*7) % 5],
    location: ['New York','Remote','San Francisco','Dublin','Berlin','London','Lisbon'][(i*9) % 7],
    salary: ['$220k','$245k','$180k','$260k','$310k','$150k','€140k','£130k'][(i*11) % 8],
    years: 3 + ((i*7) % 14),
    quote: [
      'Rebuilt Airbnb search infra; cut p99 by 36%.',
      "Led 4-person team shipping Plaid's Link 2.0.",
      'Owned $40M ARR growth PM surface end-to-end.',
      'Published 3 papers on RLHF alignment.',
      'Scaled Brex underwriting to 8 countries.',
      "Cut Datadog's iOS crash rate by 81%.",
    ][i % 6],
    flagged: (i % 11) === 0,
    saved: (i % 5) === 0,
  });
}

const recruiters: Recruiter[] = [
  { id:'rc-1', name:'Jesse Dragstra',  org:'Parabol Partners', status:'active',  tier:'owner',   roles:6, submitted:38, placed:5, rev:142000, fee:'22%', joined:'2024-02', email:'jesse@parabol.work', phone:'+1 (415) 555 0129', linkedin:'linkedin.com/in/jessedragstra', location:'New York, NY', timezone:'ET', portfolio:'parabol.work/jesse', bio:'12 years placing platform + infra engineers for fintech and devtools.' },
  { id:'rc-2', name:'Mira Holt',       org:'Parabol Partners', status:'active',  tier:'senior',  roles:5, submitted:29, placed:3, rev:96000,  fee:'22%', joined:'2024-03', email:'mira@parabol.work', phone:'+1 (646) 555 0284', linkedin:'linkedin.com/in/miraholt',    location:'Brooklyn, NY', timezone:'ET', portfolio:'parabol.work/mira',  bio:'Mobile and design recruiter, ex-Figma partnerships.' },
  { id:'rc-3', name:'Noor Salim',      org:'Cedar & Finch',    status:'active',  tier:'senior',  roles:4, submitted:22, placed:2, rev:64000,  fee:'20%', joined:'2024-07', email:'noor@cedarfinch.co', phone:'+44 20 7946 0914', linkedin:'linkedin.com/in/noorsalim',   location:'London, UK',    timezone:'GMT', portfolio:'cedarfinch.co/noor', bio:'Growth + product recruiter based in London.' },
  { id:'rc-4', name:'Ben Ortiz',       org:'Independent',       status:'active',  tier:'junior',  roles:2, submitted:11, placed:0, rev:0,      fee:'20%', joined:'2024-09', email:'ben@ortiz.work', phone:'+1 (510) 555 0447', linkedin:'linkedin.com/in/benortiz',    location:'Oakland, CA',  timezone:'PT',  portfolio:'ortiz.work',          bio:'Solo recruiter focused on early-stage startups.' },
  { id:'rc-5', name:'Aiko Sato',       org:'Northfield Talent',status:'dormant', tier:'senior',  roles:0, submitted:2,  placed:0, rev:0,      fee:'22%', joined:'2024-06', email:'aiko@northfield.io', phone:'+81 3 4560 0192',  linkedin:'linkedin.com/in/aikosato',    location:'Tokyo, JP',    timezone:'JST', portfolio:'northfield.io/aiko', bio:'APAC exec recruiter, dormant since Q3.' },
  { id:'rc-8', name:'Marcus Aalto',    org:'Parabol Partners', status:'revoked', tier:'senior',  roles:0, submitted:14, placed:1, rev:22000,  fee:'22%', joined:'2024-04', email:'marcus@parabol.work', phone:'+358 40 555 0018', linkedin:'linkedin.com/in/marcus-aalto', location:'Helsinki, FI', timezone:'EET', portfolio:'parabol.work/marcus', bio:'Revoked for unresponsive communication.' },
];

const activity: ActivityRow[] = [
  { id:'a-001', at:'2 min ago',  kind:'candidate',  actor:'Jesse Dragstra',  verb:'submitted',        target:'Adrien Novak',          to:'Ramp · Senior Platform Engineer' },
  { id:'a-002', at:'14 min ago', kind:'role',       actor:'Ramp',            verb:'opened role',      target:'Staff iOS Engineer',    to:'' },
  { id:'a-003', at:'32 min ago', kind:'contract',   actor:'Anthropic',       verb:'signed contract',  target:'Agency MSA · v4.2',     to:'' },
  { id:'a-004', at:'1h ago',     kind:'candidate',  actor:'Mira Holt',       verb:'moved',            target:'Priya Ramanathan',      to:'→ Technical' },
  { id:'a-005', at:'2h ago',     kind:'org',        actor:'Cedar & Finch',   verb:'invited',          target:'2 recruiters',          to:'' },
  { id:'a-006', at:'3h ago',     kind:'candidate',  actor:'Noor Salim',      verb:'hired',            target:'Leo Zimmerman',         to:'Stripe · Financial Crimes Lead' },
  { id:'a-007', at:'5h ago',     kind:'comment',    actor:'Catherine Hughes',verb:'commented on',     target:'Marcus Holt',           to:'"Strong signal on systems design."' },
  { id:'a-008', at:'yesterday',  kind:'org',        actor:'Platform',        verb:'flagged',          target:'Linear',                to:'health: at-risk' },
  { id:'a-009', at:'yesterday',  kind:'recruiter',  actor:'Theo Callahan',   verb:'applied to join',  target:'Independent',           to:'' },
  { id:'a-010', at:'2 days ago', kind:'email',      actor:'Jesse Dragstra',  verb:'sent email',       target:'5 recruiters',          to:'"New role open · Ramp"' },
];

// Pending orgs/agencies and role submittals are admin-only — empty here for client-app
// (kept for shape parity; the original full data lives in admin-app).
const pendingOrgs: PendingOrg[] = [];
const pendingAgencies: PendingOrg[] = [];
const roleSubmittals: RoleSubmittal[] = [];

export const ADMIN_DATA: AdminData = {
  orgs, roles, candidates, recruiters, activity, stages,
  pendingOrgs, pendingAgencies, roleSubmittals,
};
