# @upnest/client

Next.js 14 (App Router) — client / company-side console.

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

## Routes

```
app/
├── login, signup            ← public
├── dashboard                ← overview KPIs
├── roles                    ← all your roles
├── roles/[id]               ← role detail with pipeline
├── candidates               ← all candidates submitted to you
├── recruiters               ← recruiters working your roles
├── submit                   ← submit a new role (bounty + brief)
├── billing                  ← contracts, payouts
├── stats                    ← analytics
├── settings                 ← org + team
└── api/auth/[...nextauth]
```

Same `lib/` layer as the partners app — see `nextjs/README.md`.

## Wiring real APIs

Identical to the partners app:

1. `.env.local` → set `API_URL`, `NEXT_PUBLIC_USE_MOCKS=false`.
2. Add auth header in `lib/api/_client.ts`.
3. Confirm Zod schemas match real responses.
