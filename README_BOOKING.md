Backyard Basketball — Booking scaffolds

What I added:
- SQL migration: `db/migrations/001_init.sql` (schema for availability, bookings, payments, integrations)
- Supabase Edge function scaffolds: `supabase/functions/{create_booking,stripe-webhook,sync-to-google}`
- Vue components: `src/components/CalendarView.vue`, `BookingForm.vue`, `PaymentForm.vue`, `AdminAvailabilityEditor.vue`
- Helpers: `src/lib/supabase.ts`, `src/lib/stripe.ts`

Next steps:
1. Run the SQL migration in your Supabase project.
2. Configure environment variables for Supabase functions:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (optional for verification)
3. Implement or adjust production-level webhook signature verification and Google OAuth flow.
4. Wire frontend components to call Edge functions and render availability.

Quick dev commands:
```bash
npm install
npm run dev
# For Supabase functions (using supabase cli):
supabase functions serve
```

Environment example (.env.local for frontend):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Environment for Supabase Edge functions (set in Supabase dashboard or CLI):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # optional but recommended
```

Quick setup & tests
1. Create a `./.env.local` file for local dev (Vite) using the variables from `.env.example`.

2. Set Edge Function environment variables in the Supabase Dashboard:
    - Go to Project -> Functions -> Environment
    - Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`

3. Run Supabase functions locally (supabase CLI required):
```bash
# install supabase CLI if needed
# brew install supabase/tap/supabase
supabase login
supabase functions serve
```

4. Test `create_booking` locally (replace placeholders):
```bash
curl -X POST http://localhost:54321/functions/v1/create_booking \
   -H 'Content-Type: application/json' \
   -d '{ "start": "2026-04-10T15:00:00Z", "end": "2026-04-10T16:00:00Z", "coach_id": "<coach-uuid>", "user_id": "<user-uuid>", "amount_cents": 3000 }'
```

5. Test Stripe webhook handling with the Stripe CLI (recommended):
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
# Then trigger events, e.g. `stripe trigger payment_intent.succeeded`
```

6. Test expanding recurring rule via server function:
```bash
curl -X POST http://localhost:54321/functions/v1/expand-recurring \
   -H 'Content-Type: application/json' \
   -d '{ "availability_id": "<availability-uuid>" }'
```

Security reminders
- Never commit `.env.local` or service role keys to source control. Add `.env.local` to `.gitignore`.
- Use Supabase RLS policies to restrict inserts/updates on `availability` and `bookings`.
- Encrypt refresh tokens before storing in `integrations` (or store in Secrets Manager).

Helper scripts
- `scripts/test_endpoints.sh`: quick smoke tests for the main functions (requires `jq`)
- `scripts/deploy_functions.sh`: deploy all functions using the `supabase` CLI (set `SUPABASE_PROJECT_REF` or configure CLI)

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

