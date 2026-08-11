# استقرار Parto روی VPS لینوکس

## نصب خودکار با یک دستور

ابتدا رکوردهای DNS دامنه اصلی، `cms` و `api` را به IP سرور وصل کنید. سپس روی
Ubuntu/Debian اجرا کنید و دامنه و ایمیل واقعی خودتان را جایگزین کنید:

```sh
curl -fsSL https://raw.githubusercontent.com/bysinaa/partoEVENT/chore/remove-sanity-traces/scripts/install-vps.sh | \
  sudo sh -s -- example.com admin@example.com
```

نصاب Docker و Compose را نصب، پروژه را در `/opt/parto` دریافت، secretها و
passwordهای تصادفی را تولید، migration و seed را اجرا و Caddy/SSL را فعال
می‌کند. اطلاعات ورود فقط در `/root/parto-credentials.txt` با دسترسی محدود
ذخیره می‌شود. برای دامنه‌های سفارشی پنل و API می‌توانید پیش از دستور، متغیرهای
`ADMIN_DOMAIN` و `API_DOMAIN` را به `sudo` منتقل کنید یا روش دستی پایین را به
کار ببرید.

این روش برای یک VPS تازه با Ubuntu/Debian، سه دامنه و Docker Compose طراحی شده
است:

- `example.com` — وب‌سایت
- `cms.example.com` — پنل مدیریت
- `api.example.com` — API و فایل‌های Media

Caddy به‌صورت خودکار SSL می‌گیرد و تمدید می‌کند. PostgreSQL و پورت‌های داخلی
Website/Admin/API مستقیماً روی اینترنت منتشر نمی‌شوند.

## 1. آماده‌سازی DNS و سرور

سه رکورد `A` (و در صورت استفاده `AAAA`) را به IP سرور وصل کنید. قبل از اجرای
Caddy مطمئن شوید DNS resolve شده و پورت‌های `80` و `443` آزاد هستند.

Docker Engine و Compose plugin را با روش رسمی Docker نصب کنید:

<https://docs.docker.com/engine/install/ubuntu/>

فایروال نمونه:

```sh
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

پورت‌های `3000`، `3003`، `3006` و `5432` نباید public شوند.

## 2. دریافت پروژه از Git

برای repository خصوصی، SSH deploy key سرور را در Git provider ثبت کنید؛ سپس:

```sh
git clone git@github.com:OWNER/REPOSITORY.git parto
cd parto
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

تمام domainها و placeholderها را عوض کنید. secretهای مناسب بسازید:

```sh
openssl rand -hex 32
openssl rand -hex 32
openssl rand -hex 32
```

مقادیر `POSTGRES_PASSWORD`، `JWT_SECRET` و `JWT_REFRESH_SECRET` باید مستقل
باشند. فایل `.env.production` را commit نکنید.

## 3. اولین deploy

```sh
docker compose --env-file .env.production -f compose.production.yml config --quiet
docker compose --env-file .env.production -f compose.production.yml build --pull
docker compose --env-file .env.production -f compose.production.yml up -d
docker compose --env-file .env.production -f compose.production.yml ps
```

API هنگام بالا آمدن `prisma migrate deploy` را اجرا می‌کند. در VPS تازه، بعد از
healthy شدن API فقط یک بار کاربران اولیه را بسازید:

```sh
docker compose --env-file .env.production -f compose.production.yml exec api npm run db:seed:prod
```

این دستور passwordهای Admin و Editor را از `.env.production` می‌خواند. اجرای
مجدد آن همان passwordها را روی کاربران seed اعمال می‌کند.

سپس بررسی کنید:

```sh
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs --tail=100 api
curl -I https://example.com
curl -I https://cms.example.com/login
curl -I https://api.example.com/api/v1/api/public/settings
```

## 4. deploy نسخه‌های بعدی از Git

روی branch موردنظر باشید و اجرا کنید:

```sh
sh scripts/deploy-vps.sh
```

اسکریپت `git pull --ff-only`، validation، build و `up -d` را انجام می‌دهد.
Migrationهای جدید نیز هنگام restart شدن API اعمال می‌شوند.

## 5. بکاپ

قبل از هر migration مهم از PostgreSQL و uploads بکاپ بگیرید:

```sh
mkdir -p backups
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "backups/db-$(date +%F-%H%M).sql"

docker run --rm \
  -v parto_api_uploads:/data:ro \
  -v "$PWD/backups":/backup \
  alpine sh -c 'tar czf /backup/uploads-$(date +%F-%H%M).tgz -C /data .'
```

Restore دیتابیس روی دیتابیس خالی:

```sh
cat backups/db-TIMESTAMP.sql | \
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

## 6. عملیات روزمره

```sh
# وضعیت
docker compose --env-file .env.production -f compose.production.yml ps

# log زنده
docker compose --env-file .env.production -f compose.production.yml logs -f --tail=200

# restart یک سرویس
docker compose --env-file .env.production -f compose.production.yml restart api

# توقف بدون حذف data
docker compose --env-file .env.production -f compose.production.yml down
```

هیچ‌وقت `down -v` اجرا نکنید؛ آن گزینه volumeهای PostgreSQL و uploads را حذف
می‌کند.

## نکات migration

repository اکنون یک initial migration از schema نهایی دارد. این مسیر برای VPS
تازه آماده است. اگر دیتابیسی دارید که قبلاً با `prisma db push` ساخته شده، قبل
از اتصال این deploy به آن باید initial migration را با `prisma migrate resolve`
به‌عنوان applied ثبت کنید؛ بدون بکاپ این کار را انجام ندهید.
