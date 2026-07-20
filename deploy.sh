#!/bin/bash

# Affvance Frontend Deployment Script
# This script deploys the frontend application to staging or production

set -e  # Exit on any error

# Disable BuildKit to prevent hanging issues over SSH
export DOCKER_BUILDKIT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="affvance-frontend-${ENVIRONMENT}"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}🚀 Affvance Frontend Deployment${NC}"
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Compose File: ${COMPOSE_FILE}${NC}"
echo -e "${BLUE}=================================${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
    exit 1
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    warning ".env file not found. Make sure environment variables are set."
fi

# Stop existing containers
log "Stopping existing containers..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down || true

# Remove old images (optional - comment out to keep old images as backup)
log "Cleaning up old images..."
docker image prune -f || true

# Build new images
log "Building new Docker images..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache

# Start services
log "Starting services..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 10

# Check if containers are running
RUNNING_CONTAINERS=$(docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps --status running --format json | wc -l)

if [ "$RUNNING_CONTAINERS" -eq "0" ]; then
    error "No containers are running. Deployment failed!"
    docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=50
    exit 1
fi

# Display container status
log "Container status:"
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps

# Display logs (last 20 lines)
log "Recent logs:"
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=20

# Cleanup
log "Cleaning up unused Docker resources..."
docker system prune -f || true

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}=================================${NC}"

# Show URLs
if [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${GREEN}🌐 Staging URL: https://stage.affvance.com${NC}"
    echo -e "${GREEN}🔗 Backend API: https://api-stage.affvance.com${NC}"
else
    echo -e "${GREEN}🌐 Production URL: https://affvance.com${NC}"
    echo -e "${GREEN}🔗 Backend API: https://api.affvance.com${NC}"
fi

echo -e "${GREEN}=================================${NC}"
