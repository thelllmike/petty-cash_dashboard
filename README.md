# Cash Book — Admin dashboard

A Next.js web dashboard for the Cash Book app. It uses the same Supabase project
as the mobile app.

- **Overview**: user totals, active users, sign-ups and entries per day, record
  counts, business types and base currencies
- **Users**: search, filter (active / new / unconfirmed / admins), sort and CSV export
- **User detail**: account facts, activity counts, businesses, and a control to grant or remove admin access

## Setup

1. **Database.** In the Supabase SQL Editor, run `supabase/0009_admin_dashboard.sql` (also kept in the mobile app repo under `supabase/migrations/`).
   It adds `admin_overview()`, `admin_user_detail()` and `admin_set_admin()`.
   `0008_admin.sql` must already be applied.
2. **Env.** Copy `.env.example` to `.env.local` and fill in the URL and anon key
   (the same values as `EXPO_PUBLIC_*` in the mobile app's `.env`).
3. **Run.**
   ```bash
   npm install
   npm run dev      # http://localhost:3100
   ```
4. Sign in with an account that is listed in `public.admins`.

## Security

Only the public anon key is used. Each admin read and write goes through a
`security definer` RPC that checks `public.admins` in the database, so the
dashboard cannot reveal anything a non-admin session could not get anyway.
`src/proxy.ts` refreshes the session and sends signed-out visitors to `/login`.

## Deploy

Deploy this folder to Vercel: set the project's **Root Directory** to `admin-web`
and add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
