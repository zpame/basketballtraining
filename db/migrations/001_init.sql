-- Initial schema for Backyard Basketball booking service
-- Run this in your Supabase/Postgres database

-- Enable extension needed for exclusion constraints
create extension if not exists btree_gist;

-- Integrations table for storing encrypted tokens (Google refresh tokens, etc.)
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references auth.users(id) not null,
  provider text not null,
  encrypted_token text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Availability slots (single occurrences and recurring rules)
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references auth.users(id) not null,
  start timestamptz not null,
  "end" timestamptz not null,
  recurring_rule text,
  is_blocked boolean default false,
  created_at timestamptz default now(),
  constraint availability_no_zero_duration check ("end" > start),
  unique (coach_id, start, "end")
);

-- Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  coach_id uuid references auth.users(id) not null,
  availability_id uuid references availability(id),
  start timestamptz not null,
  "end" timestamptz not null,
  status text not null default 'pending', -- pending, paid, confirmed, cancelled, no_show
  google_event_id text,
  created_at timestamptz default now()
);

-- Prevent overlapping bookings per coach using an exclusion constraint
alter table bookings
  add constraint bookings_no_overlap exclude using gist (
    coach_id with =,
    tstzrange(start, "end") with &&
  );

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) not null,
  amount_cents integer not null,
  currency text default 'usd',
  status text not null default 'pending', -- pending, succeeded, failed
  stripe_payment_intent text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_availability_coach_start on availability(coach_id, start);
create index if not exists idx_bookings_coach_start on bookings(coach_id, start);
