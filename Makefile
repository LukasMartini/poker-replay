.PHONY: help build up down restart logs clean health

# Default target
help:
	@echo "Poker Replay Docker Commands"
	@echo "============================"
	@echo "Standard Commands (Development):"
	@echo "  up             - Start development environment"
	@echo "  up-logs        - Start development environment with logs visible"
	@echo "  build          - Build and start development environment"
	@echo "  down           - Stop development environment"
	@echo "  restart        - Restart development environment"
	@echo "  logs           - Show logs from all services"
	@echo ""
	@echo "Production Commands:"
	@echo "  prod-up        - Start production environment"
	@echo "  prod-build     - Start production environment with rebuild"
	@echo "  prod-down      - Stop production environment"
	@echo "  prod-logs      - Show production logs from all services"
	@echo ""
	@echo "Logging Commands:"
	@echo "  logs-backend   - Show logs from backend service only"
	@echo "  logs-frontend  - Show logs from frontend service only"
	@echo "  logs-database  - Show logs from database service only"
	@echo ""
	@echo "Shell Access:"
	@echo "  db-shell       - Open PostgreSQL shell"
	@echo "  backend-shell  - Open backend container shell"
	@echo "  frontend-shell - Open frontend container shell"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean          - Remove all containers, networks, and volumes (WARNING: Removes all data!)"

# === STANDARD COMMANDS (Development) ===
# Start development environment
up:
	docker-compose up -d

# Start development environment with logs visible
up-logs:
	docker-compose up

# Build and start development environment
build:
	docker-compose up --build

# Stop development environment
down:
	docker-compose down

# Restart development environment
restart: down up

# === PRODUCTION COMMANDS ===
# Start production environment
prod-up:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Start production environment with rebuild
prod-build:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Stop production environment
prod-down:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Production logs
prod-logs:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# === SHARED COMMANDS ===
# Show logs (development by default)
logs:
	docker-compose logs -f

# View specific service logs (development)
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-database:
	docker-compose logs -f database

# === SHELL ACCESS (Development) ===
# Database shell
db-shell:
	docker exec -it poker-replay-db psql -U poker_user -d poker_replay

# Backend shell
backend-shell:
	docker exec -it poker-replay-backend /bin/bash

# Frontend shell  
frontend-shell:
	docker exec -it poker-replay-frontend /bin/sh

# === MAINTENANCE ===
# Clean everything (WARNING: This removes all data!)
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v --rmi all --remove-orphans
	docker system prune -f
