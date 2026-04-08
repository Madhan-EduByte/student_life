# =============================================
# DestinAI — Developer Shortcuts
# =============================================

.PHONY: setup up down restart logs migrate seed test lint build deploy backup-db restore-db shell-backend shell-db clean

# ─── First-Time Setup ───────────────────────────────────
setup:
	@chmod +x setup.sh
	@./setup.sh

# ─── Start / Stop ───────────────────────────────────────
up:
	docker compose up -d
	@echo "✅ DestinAI is running"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

down:
	docker compose down
	@echo "🛑 DestinAI stopped"

restart:
	docker compose restart
	@echo "🔄 DestinAI restarted"

# ─── Logs ────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f mysql

# ─── Database ───────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head
	@echo "✅ Migrations applied"

seed:
	docker compose exec backend python -m app.utils.seed
	@echo "✅ Database seeded"

# ─── Testing ────────────────────────────────────────────
test:
	@echo "🧪 Running backend tests..."
	docker compose exec backend pytest --tb=short -q
	@echo "🧪 Running frontend tests..."
	docker compose exec frontend npm test -- --run
	@echo "✅ All tests passed"

test-backend:
	docker compose exec backend pytest --tb=short -v

test-frontend:
	docker compose exec frontend npm test -- --run

test-coverage:
	docker compose exec backend pytest --cov=app --cov-report=html
	@echo "📊 Coverage report: backend/htmlcov/index.html"

# ─── Linting ────────────────────────────────────────────
lint:
	@echo "🔍 Linting backend..."
	docker compose exec backend black --check app/
	docker compose exec backend flake8 app/
	@echo "🔍 Linting frontend..."
	docker compose exec frontend npm run lint
	@echo "✅ Linting passed"

format:
	docker compose exec backend black app/
	docker compose exec backend isort app/
	docker compose exec frontend npm run format

# ─── Build ───────────────────────────────────────────────
build:
	docker compose build --no-cache
	@echo "✅ Build complete"

# ─── Deploy ─────────────────────────────────────────────
deploy:
	docker compose -f docker-compose.prod.yml up -d --build
	@echo "🚀 Deployed to production"

# ─── Database Backup / Restore ──────────────────────────
backup-db:
	@mkdir -p backups
	docker compose exec mysql mysqldump -u root -p$(DB_ROOT_PASSWORD) $(DB_NAME) | gzip > backups/destinai_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Database backup created"

restore-db:
	@echo "⚠️  Usage: make restore-db FILE=backups/your_backup.sql.gz"
	@test -n "$(FILE)" || (echo "❌ FILE is required" && exit 1)
	gunzip < $(FILE) | docker compose exec -T mysql mysql -u root -p$(DB_ROOT_PASSWORD) $(DB_NAME)
	@echo "✅ Database restored from $(FILE)"

# ─── Shell Access ───────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec mysql mysql -u root -p$(DB_ROOT_PASSWORD) $(DB_NAME)

shell-redis:
	docker compose exec redis redis-cli -a $(REDIS_PASSWORD)

# ─── Cleanup ────────────────────────────────────────────
clean:
	docker compose down -v --rmi all --remove-orphans
	@echo "🧹 All containers, images, and volumes removed"
