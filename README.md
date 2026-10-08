# ETOS Pembinaan Management System

Satu ruang kerja digital untuk seluruh perjalanan pembinaan Etoser.

## Live
- Production: https://mbakristaa.vercel.app
- Public demo: https://mbakristaa.vercel.app/demo
- Login: https://mbakristaa.vercel.app/login

## Stack
- Next.js 16.4 / React 19.3
- TypeScript strict
- Supabase Auth + PostgreSQL + Storage + RLS
- Vercel, runtime region `sin1`

## MVP yang sudah diimplementasikan
- Landing page & public demo
- Role workspace: Tim Pusat, Fasilitator, Etoser
- Supabase email/password auth
- Activity Builder
- Dynamic activity targets & requirements
- Automatic assignment generation
- Attendance session & Etoser check-in
- Worksheet / journal submission
- Automatic assignment-state synchronization
- Facilitator / Tim Pusat review: verify or request revision
- National monitoring matrix
- Participant 360° summary
- Early attention status
- Credit Perform ledger foundation
- Monitoring CSV export
- Private evidence storage
- Hourly overdue-assignment cron
- Responsive mobile-first interface

## Core flow

```
Program
→ Activity
→ Target
→ Requirement
→ Assignment
→ Attendance / Submission
→ Review
→ Progress / Evaluation
```

The system intentionally does **not** add one database column for every new workshop or program.

## Supabase
Project ref: `wqjscijjncvuqhemocum`.

All exposed operational tables use Row Level Security. Security decisions are enforced in PostgreSQL, not only in the frontend.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never put a Supabase service-role key into a `NEXT_PUBLIC_*` variable.

## First admin
New Auth users are provisioned as `etoser` by default. For the first administrator, create the intended user in Supabase Authentication and promote only that profile:

```sql
update public.profiles
set app_role = 'superadmin'
where email = 'ADMIN_EMAIL_HERE';
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for role boundaries, database structure, RLS, storage, cron, and handover notes.
