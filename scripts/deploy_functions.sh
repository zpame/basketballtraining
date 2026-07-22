#!/usr/bin/env bash
set -euo pipefail

# Deploy all Supabase Edge Functions in supabase/functions
# Requires supabase CLI and SUPABASE_PROJECT_REF env var or logged-in default

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
  exit 1
fi

PROJECT_REF=${SUPABASE_PROJECT_REF:-}
if [ -z "$PROJECT_REF" ]; then
  echo "Warning: SUPABASE_PROJECT_REF not set. supabase CLI will use default project if configured."
fi

for fn in supabase/functions/*; do
  if [ -d "$fn" ]; then
    name=$(basename "$fn")
    echo "Deploying function: $name"
    supabase functions deploy "$name" --project-ref "$PROJECT_REF"
  fi
done

echo "All functions deployed (or attempted)."
