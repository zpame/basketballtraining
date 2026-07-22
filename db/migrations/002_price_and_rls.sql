-- Add pricing to availability and enable row-level security policies

-- Add price column for availability slots
alter table availability
  add column if not exists price_cents integer;

alter table availability
  add constraint availability_price_nonnegative check (price_cents >= 0);

-- Enable RLS on relevant tables
alter table availability enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table integrations enable row level security;

-- Availability policies
create policy "Public select availability" on availability
  for select using (true);

create policy "Coach manage own availability" on availability
  for all using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

-- Bookings policies
create policy "Coach or user select own bookings" on bookings
  for select using (auth.uid() = coach_id or auth.uid() = user_id);

create policy "Logged-in user insert own bookings" on bookings
  for insert with check (auth.uid() = user_id);

create policy "Coach or user update own bookings" on bookings
  for update using (auth.uid() = coach_id or auth.uid() = user_id)
  with check (auth.uid() = coach_id or auth.uid() = user_id);

create policy "Coach delete own bookings" on bookings
  for delete using (auth.uid() = coach_id);

-- Payments policies
create policy "Payments select by booking owner or coach" on payments
  for select using (
    exists (
      select 1
      from bookings
      where bookings.id = payments.booking_id
        and (bookings.coach_id = auth.uid() or bookings.user_id = auth.uid())
    )
  );

-- Integrations policies
create policy "Coach manage own integrations" on integrations
  for all using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);
