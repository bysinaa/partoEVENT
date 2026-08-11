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
COMPOSE="docker compose --env-file .env.production -f compose.production.yml"
for service in website admin api; do
  $COMPOSE build --pull "$service"
done
$COMPOSE up -d --remove-orphans
$COMPOSE ps

AVAILABLE_KB=$(df -Pk / | awk 'NR == 2 { print $4 }')
[ "$AVAILABLE_KB" -ge 3145728 ] || docker builder prune -af >/dev/null
