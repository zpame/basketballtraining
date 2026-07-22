# Backyard Basketball Booking Service — Setup Guide

Everything is scaffolded and ready to go. This guide walks you through plugging in your credentials.

## Prerequisites
- Supabase project created (https://supabase.com)
- Google OAuth app (optional for calendar sync)
- Node.js 18+ and npm
- Supabase CLI (for local development): `npm install -g supabase`

## Step 1: Set up Supabase Database

Run the migrations in your Supabase project:
1. Go to your Supabase dashboard → SQL Editor
2. Copy and run `db/migrations/001_init.sql` to create tables
3. Copy and run `db/migrations/002_price_and_rls.sql` to add pricing and RLS policies (optional)

## Step 2: Set Up Frontend Environment Variables

Create a `.env.local` file in the project root (`Backyardbasketball`):
```bash
cp .env.example .env.local
```

Fill in the values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from your Supabase project settings (Settings → API).

## Step 3: Set Up Supabase Edge Function Secrets

Set these secrets in your Supabase project (Settings > Secrets):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional environment variables:
```
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://your-project.supabase.co/functions/v1/google-oauth-callback
```

## Step 4: Deploy Supabase Functions

Option A: Deploy via Supabase Dashboard
1. Go to Functions → Create a new function
2. Copy the code from each file in `supabase/functions/{function-name}/index.ts`

Option B: Deploy via CLI
```bash
cd Backyardbasketball
npm install
supabase login
supabase functions deploy create_booking --project-ref your-project-ref
```

## Step 5: Run Locally for Testing

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# In another terminal, serve Supabase functions locally (optional)
supabase functions serve
```

Navigate to `http://localhost:5173` and test:
- Home page
- Schedule page (view availability calendar)
- Admin page (sign in and create availability)

## Step 6: Deploy to Production

1. Push built dist to your hosting (Vercel, Netlify, etc.)
2. Deploy Edge Functions via Supabase Dashboard or CLI
3. Test the booking flow end to end

## Quick Reference

- Frontend: `npm run dev`
- Build: `npm run build`
- Test endpoints: `./scripts/test_endpoints.sh`
- Deploy functions: `./scripts/deploy_functions.sh`
- Admin: go to `http://localhost:5173/admin` and sign in

## Project Structure

```
src/
  pages/
    Home.vue          — landing page with CTA
    Schedule.vue      — public booking page
    AdminDashboard.vue — admin (requires auth)
  components/
    CalendarView.vue              — displays availability
    BookingForm.vue               — customer details and scheduling form
    AdminAvailabilityEditor.vue   — manage availability & recurring rules
  lib/
    supabase.ts       — Supabase client
  router.ts           — Vue Router setup

supabase/
  functions/
    create_booking/           — Supabase Edge Function
    expand-recurring/         — Expand RRULE to occurrences
    google-oauth-start/       — Return OAuth consent URL
    google-oauth-callback/    — Exchange code for tokens
    sync-to-google/           — Create calendar events

db/
  migrations/
    001_init.sql              — Base schema (tables, constraints)
    002_price_and_rls.sql     — Pricing and RLS policies

scripts/
  test_endpoints.sh     — Smoke test the functions
  deploy_functions.sh   — Deploy all functions
```

## What's Included

✅ **Database**
- Tables: availability, bookings, payments, integrations
- RLS policies for multi-user access
- Exclusion constraints to prevent double-booking

✅ **Backend (Supabase Edge Functions)**
- Booking creation for scheduling
- Recurring availability expansion (RRULE parsing)
- Google OAuth flow and event sync

✅ **Frontend (Vue 3 + TypeScript)**
- Router setup (Home, Schedule, Admin)
- Calendar/availability view with weekly navigation
- Booking form with customer details
- Admin dashboard with availability editor
- Recurring rule builder (daily/weekly/monthly)

## Next Steps & Known Limitations

- Refresh tokens are stored plaintext in the `integrations` table. In production, encrypt or use Secrets Manager.
- RRULE expansion is simple (FREQ, BYDAY, UNTIL). Complex rules need additional parsing.
- Admin RLS policies are basic; adjust for multi-coach scenarios.
- Timezone handling is simplified; consider using a server-side timezone library for production.

## Support & Issues

- Supabase Docs: https://supabase.com/docs
- Vue Docs: https://vuejs.org
