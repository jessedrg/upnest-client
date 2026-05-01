'use client';

import * as React from 'react';
import { type Candidate } from './admin-data';
import { createClient } from '@/lib/supabase/client';
import { emitToast } from '../components/Toast';

// CandidateStore — handles candidate stage changes with Supabase integration
// Changes are persisted to the database and trigger UI updates

const subs = new Set<() => void>();

// Local cache for optimistic updates
let localCandidates: Candidate[] = [];

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

// Map frontend stage names to database interview_status values
const stageToDbStatus: Record<string, string> = {
  'New': 'new',
  'Screening': 'screening',
  'Phone': 'phone_interview',
  'Technical': 'technical_interview',
  'Sent to Client': 'sent_to_client',
  'On-site': 'onsite_interview',
  'Offer': 'offer',
  'Hired': 'hired',
  'Rejected': 'rejected',
  'Withdrawn': 'rejected',
};

export async function setStage(id: string, stage: string, opts: { silent?: boolean } = {}) {
  const supabase = createClient();
  const dbStatus = stageToDbStatus[stage] || 'new';
  
  // Update in Supabase
  const { error } = await supabase
    .from('applications')
    .update({ 
      interview_status: dbStatus,
      status_entered_at: new Date().toISOString(),
    })
    .eq('id', id);
  
  if (error) {
    console.error('Failed to update candidate stage:', error);
    emitToast({
      kind: 'error',
      title: 'Failed to update',
      body: error.message,
    });
    return;
  }
  
  // Show toast
  if (opts.silent !== true) {
    const visible = VISIBLE_TO_CLIENT.has(stage);
    const verb = stage === 'Sent to Client' ? 'sent to client'
      : stage === 'Rejected' ? 'rejected'
      : stage === 'Hired' ? 'marked hired'
      : 'moved to ' + stage;
    emitToast({
      kind: stage === 'Hired' ? 'success' : stage === 'Rejected' ? 'error' : 'info',
      title: 'Candidate ' + verb,
      body: visible ? 'Now visible to client.' : 'Internal stage update.',
    });
  }
  notify();
}

export async function reject(id: string, reason: string, note?: string, actor?: { name: string; role: string }) {
  const supabase = createClient();
  const r = REJECT_REASONS.find(x => x.code === reason) || REJECT_REASONS[REJECT_REASONS.length - 1];
  
  // Update in Supabase
  const { error } = await supabase
    .from('applications')
    .update({ 
      interview_status: 'rejected',
      rejection_reason: r.label + (note ? ': ' + note : ''),
      status_entered_at: new Date().toISOString(),
    })
    .eq('id', id);
  
  if (error) {
    console.error('Failed to reject candidate:', error);
    emitToast({
      kind: 'error',
      title: 'Failed to reject',
      body: error.message,
    });
    return;
  }
  
  emitToast({
    kind: 'error',
    title: 'Candidate rejected',
    body: r.label + (note ? ' — ' + note.slice(0, 60) + (note.length > 60 ? '…' : '') : ''),
  });
  notify();
}

export async function withdraw(id: string, reason: string, note?: string, actor?: { name: string; role: string }) {
  const supabase = createClient();
  const r = WITHDRAW_REASONS.find(x => x.code === reason) || WITHDRAW_REASONS[WITHDRAW_REASONS.length - 1];
  
  // Update in Supabase - use rejected status for withdrawn
  const { error } = await supabase
    .from('applications')
    .update({ 
      interview_status: 'rejected',
      rejection_reason: 'Withdrawn: ' + r.label + (note ? ': ' + note : ''),
      status_entered_at: new Date().toISOString(),
    })
    .eq('id', id);
  
  if (error) {
    console.error('Failed to withdraw candidate:', error);
    emitToast({
      kind: 'error',
      title: 'Failed to withdraw',
      body: error.message,
    });
    return;
  }
  
  emitToast({
    kind: 'info',
    title: 'Candidate withdrawn',
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
    candidates: localCandidates,
    setStage, reject, withdraw, visibleToClient,
    STAGES, REJECT_REASONS, WITHDRAW_REASONS,
  };
}
