#!/usr/bin/env bash
# Restore a Postgres dump produced by backup-db.sh. Accepts a .sql or .sql.gz.
# Usage: scripts/restore-db.sh ./backups/family_meal_planner-20260101T000000Z.sql.gz
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump-file>" >&2
  exit 2
fi
DUMP_FILE="$1"

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: dump file not found: $DUMP_FILE" >&2
  exit 1
fi
if [[ ! -f .env ]]; then
  echo "ERROR: .env not found at $ROOT_DIR" >&2
  exit 1
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a

: "${POSTGRES_DB:?POSTGRES_DB must be set in .env}"
: "${POSTGRES_USER:?POSTGRES_USER must be set in .env}"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

echo "WARNING: this will overwrite the contents of database '$POSTGRES_DB'."
read -r -p "Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

if [[ "$DUMP_FILE" == *.gz ]]; then
  gunzip -c "$DUMP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
else
  docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$DUMP_FILE"
fi

echo "Restore complete from $DUMP_FILE"
