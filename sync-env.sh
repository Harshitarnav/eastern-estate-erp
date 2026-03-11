#!/bin/bash
# ─────────────────────────────────────────────────────────────
# sync-env.sh — Push local .env files to the production server
#
# Usage:
#   ./sync-env.sh           → syncs all three env files
#   ./sync-env.sh backend   → syncs only backend/.env
#   ./sync-env.sh frontend  → syncs only frontend/.env.production
#   ./sync-env.sh root      → syncs only root .env
#
# After syncing, restarts affected containers automatically.
# ─────────────────────────────────────────────────────────────

SERVER="root@143.244.135.165"
REMOTE_DIR="~/eastern-estate-erp"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

sync_backend() {
  echo -e "${YELLOW}→ Syncing backend/.env to server...${NC}"
  scp backend/.env.production "$SERVER:$REMOTE_DIR/backend/.env"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ backend/.env synced${NC}"
    echo -e "${YELLOW}→ Restarting backend container...${NC}"
    ssh "$SERVER" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml restart backend"
    echo -e "${GREEN}✅ Backend restarted${NC}"
  else
    echo -e "${RED}❌ Failed to sync backend/.env${NC}"
    exit 1
  fi
}

sync_frontend() {
  echo -e "${YELLOW}→ Syncing frontend/.env.production to server...${NC}"
  scp frontend/.env.production "$SERVER:$REMOTE_DIR/frontend/.env.production"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ frontend/.env.production synced${NC}"
    echo -e "${YELLOW}  Note: Rebuild frontend to apply changes: docker compose build frontend${NC}"
  else
    echo -e "${RED}❌ Failed to sync frontend/.env.production${NC}"
    exit 1
  fi
}

sync_root() {
  if [ -f ".env" ]; then
    echo -e "${YELLOW}→ Syncing root .env to server...${NC}"
    scp .env "$SERVER:$REMOTE_DIR/.env"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ root .env synced${NC}"
    else
      echo -e "${RED}❌ Failed to sync root .env${NC}"
      exit 1
    fi
  else
    echo -e "${YELLOW}⚠️  No root .env found — skipping${NC}"
  fi
}

TARGET="${1:-all}"

case "$TARGET" in
  backend)  sync_backend ;;
  frontend) sync_frontend ;;
  root)     sync_root ;;
  all)
    sync_root
    sync_backend
    sync_frontend
    echo -e "\n${GREEN}✅ All env files synced!${NC}"
    ;;
  *)
    echo -e "${RED}Unknown target: $TARGET${NC}"
    echo "Usage: ./sync-env.sh [all|backend|frontend|root]"
    exit 1
    ;;
esac
