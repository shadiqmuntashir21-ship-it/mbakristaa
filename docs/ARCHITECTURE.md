# ETOS Pembinaan — Architecture & Handover

## Deployment baseline
- GitHub: `shadiqmuntashir21-ship-it/mbakristaa`
- Vercel project: `mbakristaa`
- Vercel project ID: `prj_ZgJ5frLeweY78k0ikj61q3GVT5cZ`
- Production: `https://mbakristaa.vercel.app`
- Function region: `sin1` (Singapore)
- Supabase project ref: `wqjscijjncvuqhemocum`
- Supabase region: Singapore

## Product architecture
The product is activity-driven:

```
Program
  -> Activity
      -> Target
      -> Requirement
          -> Assignment per Etoser
              -> Attendance / Submission
                  -> Review
                      -> Progress / Evaluation
```

New workshop, journal, assessment, or program names should not require new database columns.

## Roles
- `superadmin`: full operational control
- `tim_pusat`: national management
- `pic`: program management
- `fasilitator`: scoped to assigned region
- `etoser`: own profile, assignments, attendance, submissions

## Core tables
- `profiles`, `regions`, `cohorts`
- `programs`, `activities`, `activity_targets`, `activity_requirements`
- `assignments`
- `attendance_sessions`, `attendance_records`
- `submissions`, `submission_files`, `reviews`
- `monthly_reports`
- `point_transactions`
- `notifications`
- `documents`
- `regional_activity_plans`
- `audit_logs`

## Automatic status synchronization
Database triggers keep operational status in sync:
1. A submission updates its assignment to submitted / under review / verified / revision.
2. A review updates the submission state, which then updates the assignment.
3. Attendance marked present/late/excused/sick completes the attendance assignment.
4. Supabase Cron marks overdue unfinished assignments as `late` hourly.

## Targeting
Supported activity target selectors:
- all active Etoser
- one region
- one cohort
- one individual
- region + cohort segment

## RLS / security
All public operational tables use Row Level Security.

Important boundaries:
- Etoser can only access their own participant data and activities assigned to them.
- Etoser cannot set their own submission to verified.
- Etoser self check-in is limited to status `present`.
- Fasilitator is restricted to participants in their region.
- Tim Pusat/PIC/Superadmin can operate at the national/program level.
- `etos-files` is a private Storage bucket.
- Facilitators can read evidence files only for participants in their own region.
- Security helper functions are stored in the private schema.

## Participant progress
`participant_progress_summary` is a `security_invoker` view. It aggregates:
- total assignments
- completed/submitted assignments
- verified assignments
- assignments needing attention
- credit points

The view is written so assignments and point transactions are aggregated independently to avoid multiplication when a participant has many point transactions.

## Storage convention
Upload participant evidence under:

```
<profile_uuid>/<activity_uuid>/<filename>
```

This convention is required by Storage RLS.

## Environment variables
Required on Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not place service-role credentials in browser/public environment variables.

## First operational account
The auth trigger creates every new Supabase Auth user as an Etoser profile by default.

For initial setup:
1. Create the first user in Supabase Authentication.
2. Promote only the intended owner/administrator in SQL:

```sql
update public.profiles
set app_role = 'superadmin'
where email = 'ADMIN_EMAIL_HERE';
```

After an authenticated admin exists, user provisioning should be moved behind an admin-only invitation workflow rather than exposing open signup.

## Demo mode
`/demo` is intentionally public and uses local dummy data. It is designed for product demonstration without touching production participant records.

## Production auth
`/login` uses Supabase email/password authentication.
`/app` requires a valid Supabase session and redirects unauthenticated visitors to login.

## Development principles
- Avoid adding one database column per activity.
- Prefer requirement configuration + assignments.
- Never trust role restrictions that exist only in React; enforce them in RLS.
- Preserve submission versions instead of overwriting history.
- Correct points with ledger transactions rather than silently editing totals.
- Cancel activities/assignments instead of deleting historical evidence.
