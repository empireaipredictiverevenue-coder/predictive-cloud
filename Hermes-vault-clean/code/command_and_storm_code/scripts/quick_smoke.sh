#!/usr/bin/env bash
set -euo pipefail

BASE=${BASE:-http://localhost:3000}
echo "Running quick smoke tests against ${BASE}"

echo -n "Hermes route: "
curl -sS -X POST ${BASE}/api/hermes/route -H 'Content-Type: application/json' -d '{"command":"status"}' -w '\nHTTP %{http_code}\n' | tail -n 1

echo -n "Storm route (invalid): "
curl -sS -X POST ${BASE}/api/storm/route -H 'Content-Type: application/json' -d '{"zip":"abc","email":"a@b.c"}' -w '\nHTTP %{http_code}\n' | tail -n 1

echo -n "Storm route (valid): "
curl -sS -X POST ${BASE}/api/storm/route -H 'Content-Type: application/json' -d '{"zip":"12345","email":"user@example.com"}' -w '\nHTTP %{http_code}\n' | tail -n 1

echo -n "Health: "
curl -sS ${BASE}/api/health -w '\nHTTP %{http_code}\n' | tail -n 1
