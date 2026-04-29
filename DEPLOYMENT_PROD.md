# Production Deployment

This guide covers deploying the Family Meal Planner to a self-hosted Docker
host (e.g. a NAS, mini-PC, or VPS in your home LAN). The production stack
exposes only the frontend on a single host port; backend and Postgres stay
on internal Docker networks.

## Architecture

```
Browser
  │
  ▼  http://<docker-host>:8087   (only public port)
┌──────────────────────────────────────────────────────┐
│ frontend (Nginx)                                     │
│  - serves the SPA                                    │
│  - reverse-proxies /api/ to backend:3001             │
└──────────────────────────────────────────────────────┘
  │ frontend_net
  ▼
┌──────────────────────────────────────────────────────┐
│ backend (Node, Express)                              │
│  - reads JWT secrets, DB credentials from env        │
└──────────────────────────────────────────────────────┘
  │ backend_net
  ▼
┌──────────────────────────────────────────────────────┐
│ postgres (15-alpine)                                 │
│  - data volume: family-meal-planner-postgres-data    │
└──────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker Engine 24+ and Docker Compose v2 (`docker compose ...`)
- Open TCP port 8087 on the host (or change `FRONTEND_PORT` in `.env`)
- Optional: a reverse proxy (Nginx, Caddy, Traefik) in front for HTTPS

## 1. Provide environment

```bash
cp .env.example .env
```

Edit `.env`. Required for production:

| Variable | Notes |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | DB credentials. Use a strong password. |
| `JWT_SECRET` | Min 32 chars, **must differ** from `JWT_REFRESH_SECRET`. |
| `JWT_REFRESH_SECRET` | Min 32 chars. |
| `CORS_ORIGIN` | The exact origin that serves the SPA, e.g. `http://meal.local:8087`. Must not be `*`. |
| `COOKIE_SECURE` | `true` behind HTTPS, `false` for plain HTTP LAN. |
| `TRUST_PROXY` | `loopback` if accessed only via the bundled Nginx. |

Generate strong secrets:

```bash
# Linux / macOS / WSL
openssl rand -base64 48
```

PowerShell alternative:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

The backend refuses to start in production if any required value is missing,
too short, identical between access and refresh, or matches a known dev
default. This is by design.

## 2. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify:

```bash
# Liveness from the host
curl http://localhost:8087/api/health

# Container status
docker compose -f docker-compose.prod.yml ps

# Backend logs
docker compose -f docker-compose.prod.yml logs -f backend
```

## 3. Run migrations

The production backend never auto-syncs the schema. Run migrations
explicitly after deploy or upgrade:

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate
```

To check status:

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate:status
```

To roll back the most recent migration:

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate:undo
```

## 4. Backups

`scripts/backup-db.sh` and `scripts/backup-db.ps1` create gzip-compressed
SQL dumps via `pg_dump` running inside the postgres container. They read
DB credentials from `.env`; nothing is hard-coded.

```bash
./scripts/backup-db.sh
# -> backups/family_meal_planner-20260101T000000Z.sql.gz
```

Restore (interactive confirmation):

```bash
./scripts/restore-db.sh backups/family_meal_planner-20260101T000000Z.sql.gz
```

`backups/` is in `.gitignore`. Schedule the script via cron / Task Scheduler
for daily backups; rotate or copy off-host as required.

## 5. Update / Rollback

```bash
git pull
docker compose -f docker-compose.prod.yml build --pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate
```

To roll back a code regression:

```bash
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml up -d --build
# If a migration must be reverted:
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate:undo
```

For a full data restore, see `scripts/restore-db.sh` above.

## 6. HTTPS / Reverse proxy

The bundled Nginx terminates plain HTTP on port 8087. For TLS, place a
reverse proxy (Caddy / Nginx / Traefik) in front and forward to
`http://<docker-host>:8087`. Set `CORS_ORIGIN`, `FRONTEND_URL`, and
`COOKIE_SECURE=true` to match the public origin.

If your reverse proxy adds the `X-Forwarded-*` headers, set
`TRUST_PROXY=1` (or the number of proxy hops between the client and the
backend) so rate limiting works against the real client IP.

## 7. What must NOT be publicly reachable

- The backend container's port 3001 — never publish it.
- The Postgres container's port 5432 — never publish it.
- The Postgres data volume — host-readable but not exposed by Docker.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `FATAL: invalid environment configuration` on backend startup | A required prod env value is missing, too short, equal to its sibling, or a known dev default. Read the listed reasons in stderr. |
| 502 / 504 from `/api/...` | Backend container unhealthy. Check `docker compose logs backend`. |
| `pg_isready` healthcheck never goes healthy | DB credentials in `.env` do not match the values the volume was initialized with. The volume keeps the original credentials; either rotate the DB user with `psql` or recreate the volume (data loss). |
| Login works but every request 401s shortly after | Access token TTL is short by design (15m). The frontend should refresh; if it does not, check browser console and `JWT_REFRESH_SECRET` consistency. |
