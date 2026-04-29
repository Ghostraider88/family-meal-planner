#!/usr/bin/env bash
# Postgres backup. Reads DB credentials from .env (POSTGRES_USER, POSTGRES_DB).
# Writes a timestamped pg_dump to ./backups/.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found at $ROOT_DIR" >&2
  exit 1
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a

: "${POSTGRES_DB:?POSTGRES_DB must be set in .env}"
: "${POSTGRES_USER:?POSTGRES_USER must be set in .env}"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="$BACKUP_DIR/${POSTGRES_DB}-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Dumping $POSTGRES_DB via $COMPOSE_FILE -> $OUT_FILE"
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump --clean --if-exists --no-owner --no-acl \
  -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$OUT_FILE"

echo "Backup complete: $OUT_FILE"
