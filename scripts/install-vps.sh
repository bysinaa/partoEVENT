#!/bin/sh
set -eu

REPOSITORY_URL=${PARTO_REPOSITORY_URL:-https://github.com/bysinaa/partoEVENT.git}
BRANCH=${PARTO_BRANCH:-master}
INSTALL_DIR=${PARTO_INSTALL_DIR:-/opt/parto}
SITE_DOMAIN=${1:-}
ACME_EMAIL=${2:-}
ADMIN_DOMAIN=${ADMIN_DOMAIN:-cms.$SITE_DOMAIN}
API_DOMAIN=${API_DOMAIN:-api.$SITE_DOMAIN}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[ "$(id -u)" -eq 0 ] || fail "Run this installer with sudo."
[ -n "$SITE_DOMAIN" ] || fail "Usage: sudo sh -s -- example.com admin@example.com"
[ -n "$ACME_EMAIL" ] || fail "An ACME email is required."
for domain in "$SITE_DOMAIN" "$ADMIN_DOMAIN" "$API_DOMAIN"; do
  case "$domain" in
    *://*|*/*|*' '*) fail "Use domain names only, without https:// or paths." ;;
  esac
done

. /etc/os-release
case "$ID" in
  ubuntu|debian) ;;
  *) fail "Only Ubuntu and Debian are supported." ;;
esac

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git openssl

if ! docker compose version >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  ARCH=$(dpkg --print-architecture)
  echo "deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$ID $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker

MEMORY_KB=$(awk '/MemTotal/ { print $2 }' /proc/meminfo)
if [ "$MEMORY_KB" -lt 2000000 ] && [ "$(wc -l < /proc/swaps)" -eq 1 ]; then
  AVAILABLE_KB=$(df -Pk / | awk 'NR == 2 { print $4 }')
  [ "$AVAILABLE_KB" -gt 3145728 ] || fail "At least 3 GB of free disk is required to add build swap."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 443/udp
fi

for domain in "$SITE_DOMAIN" "$ADMIN_DOMAIN" "$API_DOMAIN"; do
  getent hosts "$domain" >/dev/null 2>&1 || fail "DNS is not ready for $domain. Create its A/AAAA record first."
done

if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" fetch origin "$BRANCH"
  git -C "$INSTALL_DIR" checkout "$BRANCH"
  git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH"
elif [ -e "$INSTALL_DIR" ]; then
  fail "$INSTALL_DIR exists but is not a Git checkout."
else
  git clone --branch "$BRANCH" --single-branch "$REPOSITORY_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
if [ ! -f .env.production ]; then
  umask 077
  POSTGRES_PASSWORD=$(openssl rand -hex 32)
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  ADMIN_PASSWORD=$(openssl rand -hex 16)
  EDITOR_PASSWORD=$(openssl rand -hex 16)

  cat > .env.production <<EOF
SITE_DOMAIN=$SITE_DOMAIN
ADMIN_DOMAIN=$ADMIN_DOMAIN
API_DOMAIN=$API_DOMAIN
ACME_EMAIL=$ACME_EMAIL
POSTGRES_DB=parto_cms
POSTGRES_USER=parto
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DEFAULT_ADMIN_EMAIL=admin@$SITE_DOMAIN
DEFAULT_ADMIN_PASSWORD=$ADMIN_PASSWORD
DEFAULT_EDITOR_EMAIL=editor@$SITE_DOMAIN
DEFAULT_EDITOR_PASSWORD=$EDITOR_PASSWORD
EOF

  cat > /root/parto-credentials.txt <<EOF
Admin URL: https://$ADMIN_DOMAIN
Admin email: admin@$SITE_DOMAIN
Admin password: $ADMIN_PASSWORD
Editor email: editor@$SITE_DOMAIN
Editor password: $EDITOR_PASSWORD
EOF
  chmod 600 .env.production /root/parto-credentials.txt
fi

COMPOSE="docker compose --env-file .env.production -f compose.production.yml"
$COMPOSE config --quiet
for service in website admin api; do
  $COMPOSE build --pull "$service"
done
$COMPOSE up -d --remove-orphans

i=0
until $COMPOSE exec -T api wget -qO- http://127.0.0.1:3006/api/v1/api/public/settings >/dev/null 2>&1; do
  i=$((i + 1))
  [ "$i" -lt 60 ] || { $COMPOSE logs --tail=100 api; fail "API did not become healthy."; }
  sleep 5
done

$COMPOSE exec -T api npm run db:seed:prod
$COMPOSE ps

AVAILABLE_KB=$(df -Pk / | awk 'NR == 2 { print $4 }')
[ "$AVAILABLE_KB" -ge 3145728 ] || docker builder prune -af >/dev/null
echo
echo "Installed: https://$SITE_DOMAIN"
echo "CMS:       https://$ADMIN_DOMAIN"
echo "API:       https://$API_DOMAIN"
echo "Credentials: /root/parto-credentials.txt"
