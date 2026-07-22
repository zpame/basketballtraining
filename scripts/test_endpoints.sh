#!/usr/bin/env bash
set -euo pipefail

# Test endpoints helper. Configure .env.local or export the following env vars:
# SUPABASE_FUNCTIONS_URL (default http://localhost:54321/functions/v1)
# COACH_ID, USER_ID, AVAILABILITY_ID (for tests)

BASE=${SUPABASE_FUNCTIONS_URL:-http://localhost:54321/functions/v1}

echo "Using functions base: $BASE"

echo "1) create_booking test"
curl -sS -X POST "$BASE/create_booking" \
  -H 'Content-Type: application/json' \
  -d "{ \"start\": \"2026-04-10T15:00:00Z\", \"end\": \"2026-04-10T16:00:00Z\", \"coach_id\": \"${COACH_ID:-changeme}\", \"user_id\": \"${USER_ID:-changeme}\" }" | jq .

echo "\n2) expand-recurring test"
curl -sS -X POST "$BASE/expand-recurring" \
  -H 'Content-Type: application/json' \
  -d "{ \"availability_id\": \"${AVAILABILITY_ID:-changeme}\" }" | jq .

echo "\nTests completed. This site is configured for information and scheduling only."
