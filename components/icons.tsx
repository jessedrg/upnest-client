'use client';

import * as React from 'react';

// Stroke-based icon set — 1.5px, currentColor.

type IcoProps = {
  children?: React.ReactNode;
  size?: number;
  fill?: string;
  sw?: number;
  className?: string;
  style?: React.CSSProperties;
};

const Ico = ({ children, size = 18, fill = 'none', sw = 1.5, className = '', style }: IcoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {children}
  </svg>
);

export type IconProps = Omit<IcoProps, 'children'>;

export const Icons = {
  Bell: (p: IconProps) => <Ico {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Ico>,
  Search: (p: IconProps) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ico>,
  ChevDown: (p: IconProps) => <Ico {...p}><path d="m6 9 6 6 6-6"/></Ico>,
  ChevLeft: (p: IconProps) => <Ico {...p}><path d="m15 6-6 6 6 6"/></Ico>,
  ChevRight: (p: IconProps) => <Ico {...p}><path d="m9 6 6 6-6 6"/></Ico>,
  ChevUp: (p: IconProps) => <Ico {...p}><path d="m18 15-6-6-6 6"/></Ico>,
  Close: (p: IconProps) => <Ico {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Ico>,
  Plus: (p: IconProps) => <Ico {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Ico>,
  Sparkle: (p: IconProps) => <Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></Ico>,
  Flame: (p: IconProps) => <Ico {...p}><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .5 1 1 1 1 0 0-2 2-5 2-5z"/></Ico>,
  Briefcase: (p: IconProps) => <Ico {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Ico>,
  Bookmark: (p: IconProps) => <Ico {...p}><path d="M6 4h12v17l-6-4-6 4z"/></Ico>,
  Users: (p: IconProps) => <Ico {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 20c.5-3.5 3.5-5.5 7-5.5s6.5 2 7 5.5"/><path d="M16 4a3.5 3.5 0 0 1 0 7"/><path d="M22 20c-.3-2.5-2-4.5-4.5-5"/></Ico>,
  Check: (p: IconProps) => <Ico {...p}><path d="m5 12 4.5 4.5L20 6"/></Ico>,
  CheckCircle: (p: IconProps) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></Ico>,
  Building: (p: IconProps) => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/></Ico>,
  Mail: (p: IconProps) => <Ico {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Ico>,
  File: (p: IconProps) => <Ico {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></Ico>,
  Chart: (p: IconProps) => <Ico {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Ico>,
  Key: (p: IconProps) => <Ico {...p}><circle cx="8" cy="15" r="4"/><path d="m11 12 10-10M17 6l3 3M14 9l3 3"/></Ico>,
  Chat: (p: IconProps) => <Ico {...p}><path d="M21 12a8 8 0 0 1-12 7l-5 2 2-4A8 8 0 1 1 21 12z"/></Ico>,
  Settings: (p: IconProps) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ico>,
  Logout: (p: IconProps) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></Ico>,
  Arrow: (p: IconProps) => <Ico {...p}><path d="M5 12h14m-5-5 5 5-5 5"/></Ico>,
  ArrowUpRight: (p: IconProps) => <Ico {...p}><path d="M7 17 17 7M8 7h9v9"/></Ico>,
  Lock: (p: IconProps) => <Ico {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ico>,
  Eye: (p: IconProps) => <Ico {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Ico>,
  Dot: (p: IconProps) => <Ico {...p} fill="currentColor" sw={0}><circle cx="12" cy="12" r="3"/></Ico>,
  Pin: (p: IconProps) => <Ico {...p}><path d="M12 2v8m0 0L6 16v2h12v-2l-6-6zM12 18v4"/></Ico>,
  Calendar: (p: IconProps) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Ico>,
  Agency: (p: IconProps) => <Ico {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5M14 19c.5-2 2-3.5 4-3.5s3.5 1.5 4 3.5"/></Ico>,
};
