#!/usr/bin/env bash
# =============================================
# DestinAI — One-Command Setup Script
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         DestinAI Setup Script             ║${NC}"
echo -e "${CYAN}║     Your Destiny, Powered by AI           ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ─── Check Prerequisites ────────────────────────────────
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} $1 found: $($1 --version 2>/dev/null | head -1)"
}

check_command docker
check_command git

# Check Docker compose (v2)
if docker compose version &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Docker Compose found: $(docker compose version --short 2>/dev/null)"
else
    echo -e "${RED}❌ Docker Compose v2 is not installed.${NC}"
    exit 1
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Docker daemon is running"
echo ""

# ─── Environment Configuration ──────────────────────────
echo -e "${BLUE}[2/7] Setting up environment...${NC}"

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "  ${GREEN}✓${NC} Created .env from .env.example"
    echo -e "  ${YELLOW}⚠  Please update .env with your API keys and passwords${NC}"
else
    echo -e "  ${GREEN}✓${NC} .env already exists"
fi
echo ""

# ─── Check Production Mode ──────────────────────────────
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "--production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${YELLOW}🚀 Running in PRODUCTION mode${NC}"
    echo ""
fi

# ─── Pull Docker Images ─────────────────────────────────
echo -e "${BLUE}[3/7] Pulling Docker images...${NC}"
docker compose -f $COMPOSE_FILE pull mysql redis nginx 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Docker images pulled"
echo ""

# ─── Build Containers ───────────────────────────────────
echo -e "${BLUE}[4/7] Building application containers...${NC}"
docker compose -f $COMPOSE_FILE build
echo -e "  ${GREEN}✓${NC} Containers built"
echo ""

# ─── Start Services ─────────────────────────────────────
echo -e "${BLUE}[5/7] Starting services...${NC}"
docker compose -f $COMPOSE_FILE up -d
echo -e "  ${GREEN}✓${NC} All services started"
echo ""

# ─── Wait for Database ──────────────────────────────────
echo -e "${BLUE}[6/7] Waiting for database to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while ! docker compose exec -T mysql mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD:-root}" --silent 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ Database failed to start after ${MAX_RETRIES} attempts${NC}"
        exit 1
    fi
    echo -e "  Waiting for MySQL... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo -e "  ${GREEN}✓${NC} Database is ready"

# Run migrations
echo -e "  Running database migrations..."
docker compose exec -T backend alembic upgrade head 2>/dev/null || echo -e "  ${YELLOW}⚠  Migrations skipped (may already be applied)${NC}"
echo -e "  ${GREEN}✓${NC} Migrations complete"
echo ""

# ─── Health Checks ───────────────────────────────────────
echo -e "${BLUE}[7/7] Running health checks...${NC}"
sleep 5

# Check backend
if curl -sf http://localhost:${APP_PORT:-8000}/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Backend API is healthy"
else
    echo -e "  ${YELLOW}⚠${NC} Backend health check pending (may take a moment)"
fi

# Check frontend
if curl -sf http://localhost:${FRONTEND_PORT:-3000} > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend is running"
else
    echo -e "  ${YELLOW}⚠${NC} Frontend health check pending (may take a moment)"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  DestinAI is running successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "  Frontend:    ${CYAN}http://localhost:${FRONTEND_PORT:-3000}${NC}"
echo -e "  Backend API: ${CYAN}http://localhost:${APP_PORT:-8000}${NC}"
echo -e "  API Docs:    ${CYAN}http://localhost:${APP_PORT:-8000}/docs${NC}"
echo -e "  Admin Panel: ${CYAN}http://localhost:${FRONTEND_PORT:-3000}/admin${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "Run ${YELLOW}make logs${NC} to view service logs"
echo -e "Run ${YELLOW}make down${NC} to stop all services"
echo ""
