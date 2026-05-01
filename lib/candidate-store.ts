'use client';

import * as React from 'react';
import { ADMIN_DATA, type Candidate } from './admin-data';
import { emitToast } from '../components/Toast';

// CandidateStore — pub/sub on top of ADMIN_DATA.candidates so admin
// stage changes instantly propagate to the client-side candidates view.

const subs = new Set<() => void>();

export const STAGES = ['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired','Rejected','Withdrawn'] as const;
const VISIBLE_TO_CLIENT = new Set(['Sent to Client','On-site','Offer','Hired']);

export type ReasonRow = { code: string; label: string; tone: string; detail: string };

export const REJECT_REASONS: ReasonRow[] = [
  { code:'not_qualified',     label:'Not qualified',           tone:'fit',     detail:'Skills/experience gap vs. role spec.' },
  { code:'wrong_seniority',   label:'Wrong seniority',         tone:'fit',     detail:'Too junior or too senior for the level.' },
  { code:'comp_mismatch',     label:'Comp mismatch',           tone:'logistic', detail:'Candidate expectations exceed band.' },
  { code:'location_visa',     label:'Location / visa',         tone:'logistic', detail:'Geo or work-auth blocker.' },
  { code:'culture_fit',       label:'Culture / team fit',      tone:'fit',     detail:'Strong on paper, soft skills off.' },
  { code:'communication',     label:'Communication issues',    tone:'fit',     detail:'Spoken English, async writing, clarity.' },
  { code:'failed_technical',  label:'Failed technical screen', tone:'fit',     detail:'Did not clear coding/technical bar.' },
  { code:'lost_to_competing', label:'Took competing offer',    tone:'withdraw', detail:'Accepted role elsewhere.' },
  { code:'withdrew',          label:'Candidate withdrew',      tone:'withdraw', detail:'No longer interested.' },
  { code:'unresponsive',      label:'Unresponsive',            tone:'logistic', detail:'Did not reply in 7+ days.' },
  { code:'background_check',  label:'Background check',        tone:'logistic', detail:'BG/reference issue surfaced.' },
  { code:'duplicate',         label:'Duplicate submission',    tone:'logistic', detail:'Same candidate already in pipeline.' },
  { code:'other',             label:'Other',                   tone:'fit',     detail:'See note below.' },
];

export const WITHDRAW_REASONS: ReasonRow[] = [
  { code:'candidate_withdrew',  label:'Candidate withdrew',         tone:'candidate', detail:'No longer interested in the role.' },
  { code:'lost_to_competing',   label:'Took competing offer',       tone:'candidate', detail:'Accepted a role elsewhere.' },
  { code:'comp_mismatch',       label:'Comp expectations off',      tone:'candidate', detail:'Asked for outside the disclosed band.' },
  { code:'location_visa',       label:'Location / visa blocker',    tone:'candidate', detail:'Geo, relo, or work-auth issue surfaced.' },
  { code:'unresponsive',        label:'Unresponsive',               tone:'candidate', detail:'Lost contact for 7+ days.' },
  { code:'reconsidering',       label:'Needs more time',            tone:'candidate', detail:'Pausing on their side; revisit later.' },
  { code:'we_misread',          label:'We misread the brief',       tone:'recruiter', detail:"Profile is not a match — pulling before we waste the client's time." },
  { code:'better_match_avail',  label:'Better-fit candidate ready', tone:'recruiter', detail:'Holding this seat for a stronger profile.' },
  { code:'duplicate',           label:'Duplicate submission',       tone:'logistic',  detail:'Already in pipeline through another channel.' },
  { code:'other',               label:'Other',                      tone:'logistic',  detail:'See note below.' },
];

const notify = () => { for (const fn of subs) try { fn(); } catch (e) { console.error(e); } };

export function setStage(id: string, stage: string, opts: { silent?: boolean } = {}) {
  const c = ADMIN_DATA.candidates.find(x => x.id === id);
  if (!c) return;
  const prev = c.stage;
  if (prev === stage) return;
  c.stage = stage;
  if (stage === 'Sent to Client' && !c.sentAt) {
    c.sentAt = 'just now';
  }
  if (prev === 'Rejected' && stage !== 'Rejected') {
    delete c.rejection;
  }
  if (opts.silent !== true) {
    const visible = VISIBLE_TO_CLIENT.has(stage);
    const verb = stage === 'Sent to Client' ? 'sent to client'
      : stage === 'Rejected' ? 'rejected'
      : stage === 'Hired' ? 'marked hired'
      : 'moved to ' + stage;
    emitToast({
      kind: stage === 'Hired' ? 'success' : stage === 'Rejected' ? 'error' : 'info',
      title: c.name + ' ' + verb,
      body: visible ? 'Now visible to ' + (c.org || 'client') + '.' : 'Internal stage update.',
    });
  }
  notify();
}

export function reject(id: string, reason: string, note?: string, actor?: { name: string; role: string }) {
  const c = ADMIN_DATA.candidates.find(x => x.id === id);
  if (!c) return;
  const r = REJECT_REASONS.find(x => x.code === reason) || REJECT_REASONS[REJECT_REASONS.length - 1];
  const prevStage = c.stage;
  c.stage = 'Rejected';
  c.rejection = {
    code: r.code, label: r.label, tone: r.tone,
    note: (note || '').trim(),
    at: 'just now', atIso: new Date().toISOString(),
    by: actor || { name: 'You', role: 'recruiter' },
    fromStage: prevStage, kind: 'reject',
  };
  emitToast({
    kind: 'error',
    title: c.name + ' rejected',
    body: r.label + (note ? ' — ' + note.slice(0, 60) + (note.length > 60 ? '…' : '') : ''),
  });
  notify();
}

export function withdraw(id: string, reason: string, note?: string, actor?: { name: string; role: string }) {
  const c = ADMIN_DATA.candidates.find(x => x.id === id);
  if (!c) return;
  const r = WITHDRAW_REASONS.find(x => x.code === reason) || WITHDRAW_REASONS[WITHDRAW_REASONS.length - 1];
  const prevStage = c.stage;
  c.stage = 'Withdrawn';
  c.rejection = {
    code: r.code, label: r.label, tone: r.tone,
    note: (note || '').trim(),
    at: 'just now', atIso: new Date().toISOString(),
    by: actor || { name: 'You', role: 'recruiter' },
    fromStage: prevStage, kind: 'withdraw',
  };
  emitToast({
    kind: 'info',
    title: c.name + ' withdrawn',
    body: r.label + (note ? ' — ' + note.slice(0, 60) + (note.length > 60 ? '…' : '') : ''),
  });
  notify();
}

export function subscribe(fn: () => void) { subs.add(fn); return () => subs.delete(fn); }

export function visibleToClient(c: Candidate) { return VISIBLE_TO_CLIENT.has(c.stage); }

export function useCandidateStore() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => subscribe(() => setTick(t => t + 1)), []);
  return {
    candidates: ADMIN_DATA.candidates,
    setStage, reject, withdraw, visibleToClient,
    STAGES, REJECT_REASONS, WITHDRAW_REASONS,
  };
}
