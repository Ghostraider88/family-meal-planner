# Family Meal Planner

Self-hosted weekly meal planner with recipes and shopping lists.

**Stack:** React/Vite + Express + PostgreSQL + Docker

## Quick start

The repository ships **two** Docker Compose files:

| File | Use |
|---|---|
| `docker-compose.yml` | Local development only — mounts source for hot reload, exposes Postgres, uses weak default secrets. |
| `docker-compose.prod.yml` | Production — only the frontend publishes a host port (`8087`); backend and Postgres stay internal. Requires a real `.env`. |

### Development

```bash
docker compose up -d --build
```

- Frontend: http://localhost:3029
- Backend (dev only): http://localhost:3030
- Postgres (dev only): localhost:5432

### Production (selfhost)

```bash
cp .env.example .env
# Edit .env: strong POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET,
# correct CORS_ORIGIN, COOKIE_SECURE.
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm backend npm run db:migrate
```

Open http://`<docker-host>`:8087.

Full instructions — env reference, migrations, backups, HTTPS, rollback —
are in **[DEPLOYMENT_PROD.md](DEPLOYMENT_PROD.md)**. Pre-flight checks live
in **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**.

## Repository layout

```
family-meal-planner/
├── backend/
│   ├── src/
│   │   ├── config/      env.js (validation), database.js, sequelize-cli.cjs
│   │   ├── middleware/  auth, validation, rate limiters
│   │   ├── models/      Sequelize models
│   │   ├── routes/      auth, recipes, meals, shopping, users, invites
│   │   ├── services/    auth, invite, email, pdf parser
│   │   ├── utils/       logger
│   │   └── app.js
│   ├── migrations/      sequelize-cli migrations (production schema source of truth)
│   ├── test/            node:test unit tests
│   ├── Dockerfile       development image
│   └── Dockerfile.prod  multi-stage prod image (non-root, tini)
│
├── frontend/
│   ├── src/
│   │   ├── components/  modals (recipe editor, meal editor, PDF import, invite)
│   │   ├── context/     AuthContext
│   │   ├── pages/       Dashboard, Login, Register, Recipes, Meals, Shopping, Family
│   │   ├── services/    api.js (single fetch wrapper, 401 handling)
│   │   └── App.jsx
│   ├── nginx.conf       production Nginx config (security headers, /api proxy)
│   ├── Dockerfile       development (Vite dev server)
│   └── Dockerfile.prod  multi-stage build → Nginx
│
├── scripts/
│   ├── backup-db.{sh,ps1}   gzip pg_dump via docker compose exec
│   └── restore-db.{sh,ps1}
│
├── docker-compose.yml          dev
├── docker-compose.prod.yml     prod
├── .env.example                template; never commit a real .env
├── DEPLOYMENT_PROD.md
└── DEPLOYMENT_CHECKLIST.md
```

## API summary

All routes under `/api`. Auth uses bearer tokens.

| Verb | Path | Notes |
|---|---|---|
| GET | `/health` | liveness, no DB call |
| GET | `/ready` | readiness, includes DB ping |
| POST | `/auth/register` | rate-limited |
| POST | `/auth/login` | rate-limited |
| POST | `/auth/refresh` | rate-limited |
| POST | `/auth/logout` | stateless |
| GET/POST/PUT/DELETE | `/recipes[/:id]` | family-scoped |
| POST | `/recipes/import/pdf` | multipart, 10 MB max |
| GET/POST/PUT/DELETE | `/meals[/:id]` | family-scoped |
| GET/POST/PUT/DELETE | `/shopping/lists[/:id]` | family-scoped |
| GET/POST/PUT/DELETE | `/shopping/[lists/:list_id/items|items/:id]` | IDOR-safe |
| GET/PUT | `/users/me` | self only |
| GET | `/users/family/members` | family-scoped |
| POST/GET/DELETE | `/users/family/invite[s][/:id]` | rate-limited |
| GET/POST | `/invites/:token[/accept|/decline]` | public, rate-limited |

## Security posture

- Strict env validation on startup; production aborts on missing or weak secrets.
- Helmet, `x-powered-by` off, CORS allowlist, body size capped.
- Global API rate limit + strict auth-endpoint limit. `trust proxy` configurable for reverse-proxy deployments.
- All write endpoints whitelist input via `express-validator`.
- All resource lookups scope by `family_id` / list ownership; no IDOR.
- bcrypt cost factor 12; minimum password length 12.
- JWT signed with separate access/refresh secrets, includes issuer/audience claims.
- Production never auto-syncs DB schema; migrations are mandatory.
- Backend runs as non-root with `tini`; Nginx drops capabilities and runs read-only-friendly.
- Logger redacts password / token / authorization keys.

## Testing

```bash
# Backend
cd backend && npm ci && npm test

# Frontend build
cd frontend && npm ci && npm run build
```

CI runs both, plus `docker compose config` validation and a production
image build, on every PR and push to `main` / `main-update`.

## License

MIT
