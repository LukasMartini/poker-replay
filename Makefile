.PHONY: help build up down restart logs clean health

# Default target
help:
	@echo "Poker Replay Docker Commands"
	@echo "============================"
	@echo "Development Commands:"
	@echo "  build          - Build all Docker images"
	@echo "  up             - Start all services in detached mode"
	@echo "  up-logs        - Start all services with logs visible"
	@echo "  down           - Stop all services"
	@echo "  restart        - Restart all services"
	@echo "  dev            - Start development environment with rebuild"
	@echo ""
	@echo "Logging Commands:"
	@echo "  logs           - Show logs from all services"
	@echo "  logs-backend   - Show logs from backend service only"
	@echo "  logs-frontend  - Show logs from frontend service only"
	@echo "  logs-database  - Show logs from database service only"
	@echo ""
	@echo "Shell Access:"
	@echo "  db-shell       - Open PostgreSQL shell"
	@echo "  backend-shell  - Open backend container shell"
	@echo "  frontend-shell - Open frontend container shell"
	@echo ""
	@echo "Production Commands:"
	@echo "  prod-up        - Start production environment"
	@echo "  prod-down      - Stop production environment"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean          - Remove all containers, networks, and volumes (WARNING: Removes all data!)"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Start all services with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Restart all services
restart: down up

# Show logs
logs:
	docker-compose logs -f

# Clean everything (WARNING: This removes all data!)
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker system prune -f

# Database shell
db-shell:
	docker exec -it poker-replay-db psql -U poker_user -d poker_replay

# Backend shell
backend-shell:
	docker exec -it poker-replay-backend /bin/bash

# Frontend shell  
frontend-shell:
	docker exec -it poker-replay-frontend /bin/sh

# Production deployment
prod-up:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Development with rebuild
dev:
	docker-compose up --build

# View specific service logs
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-database:
	docker-compose logs -f database
