.PHONY: help up down build logs clean prod-up prod-down prod-build prod-logs shell

# Default target
help:
	@echo "Poker Replay Docker Commands"
	@echo "============================"
	@echo "Development (Default):"
	@echo "  up            - Start development environment"
	@echo "  down          - Stop development environment"
	@echo "  build         - Build and start development environment"
	@echo "  logs          - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  prod-up       - Start production environment"
	@echo "  prod-down     - Stop production environment"
	@echo "  prod-build    - Build and start production environment"
	@echo "  prod-logs     - Show production logs"
	@echo ""
	@echo "Utilities:"
	@echo "  shell-db      - PostgreSQL shell"
	@echo "  shell-be      - Backend container shell"
	@echo "  shell-fe      - Frontend container shell"
	@echo "  clean         - Remove all containers, volumes, and images"

# === DEVELOPMENT COMMANDS (Default) ===
up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose up --build -d

logs:
	docker-compose logs -f

# === PRODUCTION COMMANDS ===
prod-up:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-build:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

prod-logs:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# === UTILITY COMMANDS ===
clean:
	docker-compose down 2>/dev/null || true
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
	docker-compose down -v --rmi all --remove-orphans 2>/dev/null || true
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v --rmi all --remove-orphans 2>/dev/null || true
	docker system prune -f

# === SHELL ACCESS ===
shell-db:
	docker exec -it poker-replay-db psql -U poker_replay_user -d poker_replay

shell-be:
	docker exec -it poker-replay-backend /bin/bash

shell-fe:
	docker exec -it poker-replay-frontend /bin/sh
