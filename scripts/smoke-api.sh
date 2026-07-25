#!/usr/bin/env bash
# Smoke-test the live API against the real Supabase project.
# There is no sign-in flow — every request acts as the single seeded profile
# (scripts/seed-test-user.mjs), so these routes are expected to succeed
# without an Authorization header.
set -u

BASE="http://localhost:3000"

echo "=== GET /api/health (expect 200) ==="
curl -s -w " HTTP:%{http_code}\n" "$BASE/api/health" --max-time 20

echo
echo "=== GET /api/care-spaces, no auth header (expect 200) ==="
curl -s -w " HTTP:%{http_code}\n" "$BASE/api/care-spaces" --max-time 20

echo
echo "=== GET /api/dashboard, no seeded profile/care space (expect 404 NOT_FOUND) ==="
curl -s -w " HTTP:%{http_code}\n" "$BASE/api/dashboard?careSpaceId=00000000-0000-4000-8000-000000000000" --max-time 20
