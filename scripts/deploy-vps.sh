#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Missing .env.production (copy .env.production.example first)." >&2
  exit 1
fi

git pull --ff-only
if grep -Eq 'example\.com|replace-with-' .env.production; then
  echo "Replace every example domain and placeholder secret in .env.production." >&2
  exit 1
fi
docker compose --env-file .env.production -f compose.production.yml config --quiet
docker compose --env-file .env.production -f compose.production.yml build --pull
docker compose --env-file .env.production -f compose.production.yml up -d --remove-orphans
docker compose --env-file .env.production -f compose.production.yml ps
