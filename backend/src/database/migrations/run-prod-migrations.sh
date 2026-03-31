#!/bin/bash
# ============================================================
# Production Migration Runner
# Run this ON THE PRODUCTION SERVER after git pull.
#
# Usage:
#   ssh root@143.244.135.165
#   cd /opt/eastern-estate-erp
#   bash backend/src/database/migrations/run-prod-migrations.sh
# ============================================================

set -e

CONTAINER=$(docker ps -q --filter name=postgres)
if [ -z "$CONTAINER" ]; then
  echo "ERROR: postgres container not found"
  exit 1
fi

echo "Using postgres container: $CONTAINER"
# Resolve migrations dir relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR"

run_migration() {
  local file="$1"
  local name=$(basename "$file")
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Running: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  docker exec -i "$CONTAINER" psql -U eastern_estate -d eastern_estate_erp < "$file"
  echo "✅ Done: $name"
}

# ── STEP 1: Run diagnostic first ─────────────────────────────────────────────
echo "======================================================"
echo " STEP 1: PRE-MIGRATION DIAGNOSTIC"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/check-prod-schema.sql" 2>/dev/null || true

# ── STEP 2: Core accounting module migrations ──────────────────────────────
echo ""
echo "======================================================"
echo " STEP 2: ACCOUNTING MODULE SCHEMA MIGRATIONS"
echo "======================================================"

run_migration "$MIGRATIONS_DIR/006_add_journal_entry_audit_columns.sql"
run_migration "$MIGRATIONS_DIR/007_fix_journal_entry_lines_columns.sql"
run_migration "$MIGRATIONS_DIR/008_create_bank_tables.sql"
run_migration "$MIGRATIONS_DIR/009_accounting_integrations.sql"
run_migration "$MIGRATIONS_DIR/009_rename_salary_payments_columns.sql"
run_migration "$MIGRATIONS_DIR/010_cleanup_payments_table.sql"

# ── STEP 3: Construction module ────────────────────────────────────────────
echo ""
echo "======================================================"
echo " STEP 3: CONSTRUCTION MODULE SCHEMA MIGRATIONS"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/013_fix_material_columns.sql"
run_migration "$MIGRATIONS_DIR/014_create_ra_bills_and_qc_tables.sql"

# ── STEP 4: Flats array type fix ───────────────────────────────────────────
echo ""
echo "======================================================"
echo " STEP 4: FLATS COLUMN TYPE FIX"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/v002_fix_flats_array_columns.sql"

# ── STEP 5: Comprehensive column sync ─────────────────────────────────────
echo ""
echo "======================================================"
echo " STEP 5: COMPREHENSIVE COLUMN SYNC"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/v003_prod_schema_sync.sql"

# ── STEP 6: Fix flats.images JSONB → TEXT ──────────────────────────────────
echo ""
echo "======================================================"
echo " STEP 6: FIX FLATS.IMAGES COLUMN TYPE"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/v004_fix_flats_images_column.sql"

# ── STEP 7: Fix vendors.name NOT NULL legacy column ───────────────────────
echo ""
echo "======================================================"
echo " STEP 7: FIX VENDORS.NAME LEGACY COLUMN"
echo "======================================================"
run_migration "$MIGRATIONS_DIR/v005_fix_vendors_name_column.sql"

echo ""
echo "======================================================"
echo " ✅ ALL MIGRATIONS COMPLETE"
echo " Now restart the application:"
echo "   docker compose -f docker-compose.prod.yml restart backend"
echo "======================================================"
