# Deployment Checklist

Use this list before going live with `docker-compose.prod.yml`. The dev
stack (`docker-compose.yml`) does not require these checks.

---

## 1. Environment

- [ ] `.env` exists in repo root (copied from `.env.example`).
- [ ] `POSTGRES_PASSWORD` is strong, unique, not committed anywhere.
- [ ] `JWT_SECRET` is at least 32 characters and freshly generated
      (`openssl rand -base64 48`).
- [ ] `JWT_REFRESH_SECRET` is at least 32 characters and **differs** from
      `JWT_SECRET`.
- [ ] No `.env` value matches a known dev default
      (`dev-jwt-secret-...`, `your-super-secret-...`, `secure_password_123`,
      etc.). `git grep` for those strings should return nothing in tracked
      files.
- [ ] `CORS_ORIGIN` is set to the exact public origin and is **not** `*`.
- [ ] `COOKIE_SECURE=true` if behind HTTPS, `false` only on plain LAN HTTP.
- [ ] `TRUST_PROXY` matches your topology (`loopback` for the bundled
      Nginx; numeric hops if you add an external reverse proxy).

## 2. Compose

- [ ] `docker compose -f docker-compose.prod.yml config --quiet` exits 0.
- [ ] Only the `frontend` service publishes a host port (`8087:80`).
- [ ] `backend` and `postgres` have **no** `ports:` block.
- [ ] `postgres` is on `backend_net` only; not on `frontend_net`.
- [ ] All services have `restart: unless-stopped` and a healthcheck.
- [ ] `postgres_data` named volume is backed up regularly.

## 3. Database

- [ ] First boot: `docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate` ran clean.
- [ ] `db:migrate:status` shows all migrations as `up`.
- [ ] No production code path triggers `sequelize.sync({alter:...})` (the
      app refuses to sync in production).
- [ ] A backup job is scheduled (cron / Task Scheduler) calling
      `scripts/backup-db.sh` or `scripts/backup-db.ps1`.
- [ ] Restore tested at least once on a non-production volume.

## 4. Health and security

- [ ] `curl http://<host>:8087/api/health` returns `{ "status": "ok" }`.
- [ ] `curl http://<host>:8087/api/ready` returns `db: connected`.
- [ ] Backend container reports `healthy` in `docker compose ps`.
- [ ] `docker compose logs backend | grep -iE "secret|password|token"`
      contains no secret values (only `[REDACTED]` if at all).
- [ ] `nmap` or equivalent against the host shows only port 8087 (and
      whatever ports your reverse proxy listens on); 3001 and 5432 are
      closed.
- [ ] Auth endpoints are rate-limited (try 11 logins from one IP within
      the window — the 11th should be rejected with HTTP 429).

## 5. Frontend

- [ ] Frontend image built without warnings about source maps or env leaks.
- [ ] Browser dev tools network tab shows `/api/...` calls go to the same
      origin (no `localhost:3030` leaking from a dev build).
- [ ] On 401 the SPA logs the user out instead of looping refreshes.

## 6. Operations

- [ ] Update procedure documented and rehearsed (`git pull` →
      `docker compose -f docker-compose.prod.yml up -d --build` →
      migrate).
- [ ] Rollback path documented (previous image tag or `git checkout`).
- [ ] Reverse proxy / HTTPS termination decided (or explicitly skipped
      because the host is LAN-only).
- [ ] Off-host backup copy strategy in place (rsync / S3 / external drive).
