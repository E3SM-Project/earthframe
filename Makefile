# ============================================================
#  EarthFrame Project Makefile
#  Description: Unified project-level commands
# ============================================================

# Colors
GREEN=\033[0;32m
NC=\033[0m

# Directories
BACKEND_DIR=backend
FRONTEND_DIR=frontend

# ============================================================
#  Setup & Environment
# ============================================================

.PHONY: install clean

install:
	@echo "$(GREEN)Installing dependencies for backend and frontend...$(NC)"
	cd $(BACKEND_DIR) && make install
	cd $(FRONTEND_DIR) && make install

clean:
	@echo "$(GREEN)Cleaning build artifacts and node_modules...$(NC)"
	cd $(BACKEND_DIR) && make clean
	cd $(FRONTEND_DIR) && make clean

# ============================================================
#  Development
# ============================================================

.PHONY: start backend frontend

start:
	@echo "$(GREEN)Starting backend and frontend concurrently...$(NC)"
	# Start backend in background, frontend in foreground
	cd $(BACKEND_DIR) && make reload &
	cd $(FRONTEND_DIR) && make dev

backend:
	@echo "$(GREEN)Starting backend...$(NC)"
	cd $(BACKEND_DIR) && make reload

frontend:
	@echo "$(GREEN)Starting frontend...$(NC)"
	cd $(FRONTEND_DIR) && make dev

# ============================================================
#  Database & Migrations
# ============================================================

.PHONY: migrate upgrade

migrate:
	@echo "$(GREEN)Generating new Alembic migration...$(NC)"
	cd $(BACKEND_DIR) && make migrate m="$(m)"

upgrade:
	@echo "$(GREEN)Applying Alembic migrations...$(NC)"
	cd $(BACKEND_DIR) && make upgrade

# ============================================================
#  Code Quality
# ============================================================

.PHONY: lint format type-check

lint:
	@echo "$(GREEN)Linting backend and frontend...$(NC)"
	cd $(BACKEND_DIR) && make lint
	cd $(FRONTEND_DIR) && make lint

format:
	@echo "$(GREEN)Formatting backend and frontend code...$(NC)"
	cd $(BACKEND_DIR) && make format
	cd $(FRONTEND_DIR) && make fix

type-check:
	@echo "$(GREEN)Running TypeScript type check...$(NC)"
	cd $(FRONTEND_DIR) && make type-check

# ============================================================
#  Build & Deploy
# ============================================================

.PHONY: build preview

build:
	@echo "$(GREEN)Building backend and frontend...$(NC)"
	cd $(FRONTEND_DIR) && make build

preview:
	@echo "$(GREEN)Previewing frontend build...$(NC)"
	cd $(FRONTEND_DIR) && make preview

# ============================================================
#  Misc
# ============================================================

.PHONY: help

help:
	@echo "$(GREEN)Available top-level commands:$(NC)"
	@echo "  make install        - Install all dependencies (backend + frontend)"
	@echo "  make clean          - Clean build and cache files"
	@echo "  make start          - Run backend and frontend concurrently"
	@echo "  make backend        - Run backend server only"
	@echo "  make frontend       - Run frontend dev server only"
	@echo "  make migrate m='msg'- Generate Alembic migration"
	@echo "  make upgrade        - Apply DB migrations"
	@echo "  make lint           - Lint both backend and frontend"
	@echo "  make format         - Auto-fix code style issues"
	@echo "  make type-check     - Run TypeScript type checking"
	@echo "  make build          - Build frontend for production"
	@echo "  make preview        - Preview production build"
