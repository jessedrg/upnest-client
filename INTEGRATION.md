# Client Panel — Integration Guide

The company/agency-facing console: 8 views (Overview, Roles, Submit Role,
Pipeline, Recruiters, Stats, Settings, Billing).

---

## What this panel reads & writes

| Action | API call | UI surface |
|---|---|---|
| Org dashboard | `GET /v1/me/stats` | Overview |
| List my org's roles | `GET /v1/roles` (scoped to org) | Roles, Overview |
| Role detail + recruiters working | `GET /v1/roles/:id` | Role Detail |
| Submit a new role (creates submittal) | `POST /v1/roles` | Submit Role |
| My pending submittals | `GET /v1/admin/role-submittals?orgId=me` | Submit Role sidebar |
| Pipeline by stage | `GET /v1/roles/:id/candidates` | Pipeline view |
| Advance candidate stage | `POST /v1/candidates/:id/stage` | Pipeline drag |
| Reject candidate | `POST /v1/candidates/:id/reject` | Pipeline |
| Hold / unhold a role | `POST /v1/roles/:id/status` | Role actions |
| Set priority | `POST /v1/roles/:id/priority` | Role actions |
| Active recruiters on a role | `GET /v1/roles/:id` (`recruiters[]`) | Recruiters view |
| Countersign contract | `POST /v1/contracts/:id/countersign` | Billing |
| Org billing / contracts | `GET /v1/contracts?orgId=me` | Billing |
| Org stats | `GET /v1/me/stats` | Stats |

See `nextjs/API_CONTRACT.md` for full request/response shapes.

---

## Auth flow

Clients sign up as either `company` or `agency`. The signup form posts to
`POST /v1/auth/signup` with `role: 'client'` plus `orgName` and `orgType`.
Backend creates the org (status `pending`) and the user, returns a JWT.
The client hits a "pending approval" state until an admin approves the org.

Same NextAuth wiring as the recruiter panel — see
`recruiter/INTEGRATION.md → Auth flow` for the JWT callback pattern.

---

## Permissions to enforce server-side

The frontend assumes the backend enforces:
- A client can only `GET /v1/roles` for their own `orgId`.
- A client cannot move a candidate's stage past `interviewing` without a
  signed contract on the role.
- Only org owners (not regular members) can submit new roles.

These are not enforced in the frontend — the backend MUST enforce them.

---

## Local dev

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

---

## Pre-launch checklist

- [ ] `lib/auth.ts` `authorize()` + signup wired to real endpoints
- [ ] Backend respects org scoping on every endpoint
- [ ] Submittal approval flow tested end-to-end (client submit → admin approve → role appears in client dashboard)
- [ ] `NEXT_PUBLIC_USE_MOCKS=false` in production
- [ ] CORS allows the client panel origin
