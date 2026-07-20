#!/bin/bash

# Simple CI/CD deployment script for Affvance Frontend
# This script can be called from GitHub Actions or any CI/CD system

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
ENVIRONMENT=${DEPLOY_ENV:-"staging"}
BRANCH=${GITHUB_REF_NAME:-$(git branch --show-current)}
COMMIT_SHA=${GITHUB_SHA:-$(git rev-parse HEAD)}
PROJECT_DIR="/home/deploy/projects/affvance-frontend"

echo -e "${BLUE}🚀 Starting CI/CD deployment for ${ENVIRONMENT}...${NC}"
echo -e "${BLUE}Branch: ${BRANCH}${NC}"
echo -e "${BLUE}Commit: ${COMMIT_SHA:0:8}${NC}"

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

# Check if we're on the right branch for deployment
if [ "$ENVIRONMENT" = "staging" ] && [ "$BRANCH" != "staging" ]; then
    error "Staging deployments are only allowed from 'staging' branch. Current branch: $BRANCH"
    exit 1
fi

if [ "$ENVIRONMENT" = "production" ] && [ "$BRANCH" != "main" ]; then
    error "Production deployments are only allowed from 'main' branch. Current branch: $BRANCH"
    exit 1
fi

# Navigate to project directory
log "Navigating to project directory: $PROJECT_DIR"
cd $PROJECT_DIR || {
    error "Failed to navigate to project directory: $PROJECT_DIR"
    exit 1
}

# Pull latest changes
log "Pulling latest changes from $BRANCH branch..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Backup current deployment (optional)
PROJECT_NAME="affvance-frontend-${ENVIRONMENT}"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

if [ -f "$COMPOSE_FILE" ]; then
    log "Stopping current deployment..."
    docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down || true
fi

# Create .env file from secrets (if using CI/CD with secrets)
if [ "$ENVIRONMENT" = "staging" ] && [ -n "$STAGING_ENV_FILE" ]; then
    log "Creating .env file from CI/CD secrets..."
    echo "$STAGING_ENV_FILE" > .env
elif [ "$ENVIRONMENT" = "production" ] && [ -n "$PRODUCTION_ENV_FILE" ]; then
    log "Creating .env file from CI/CD secrets..."
    echo "$PRODUCTION_ENV_FILE" > .env
fi

# Run the deployment script
log "Running deployment script for $ENVIRONMENT..."
chmod +x deploy.sh
./deploy.sh $ENVIRONMENT

# Verify deployment
log "Verifying deployment..."
sleep 15

# Set URLs based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    FRONTEND_URL="https://stage.affvance.com"
    BACKEND_URL="https://api-stage.affvance.com/api/v1/health/"
else
    FRONTEND_URL="https://affvance.com"
    BACKEND_URL="https://api.affvance.com/api/v1/health/"
fi

# Check container health
if ! docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps | grep -q "Up\|running"; then
    error "Deployment verification failed - containers are not running"
    docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=50
    exit 1
fi

# Check application health endpoint
max_attempts=10
attempt=1

log "Checking frontend health at $FRONTEND_URL..."

while [ $attempt -le $max_attempts ]; do
    if curl -f -k -L "$FRONTEND_URL" >/dev/null 2>&1; then
        log "✅ Frontend health check passed!"
        break
    fi

    if [ $attempt -eq $max_attempts ]; then
        error "❌ Frontend health check failed after $max_attempts attempts"
        docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=30 web
        exit 1
    fi

    log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
    sleep 10
    attempt=$((attempt + 1))
done

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker image prune -f

# Send deployment notification (optional - implement as needed)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Affvance Frontend deployed successfully to $ENVIRONMENT\\nBranch: $BRANCH\\nCommit: ${COMMIT_SHA:0:8}\\nURL: $FRONTEND_URL\"}" \
        $SLACK_WEBHOOK_URL || true
fi

if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"content\":\"✅ **Affvance Frontend** deployed successfully to **$ENVIRONMENT**\\n**Branch:** $BRANCH\\n**Commit:** ${COMMIT_SHA:0:8}\\n**Frontend URL:** $FRONTEND_URL\\n**Backend URL:** $BACKEND_URL\"}" \
        $DISCORD_WEBHOOK_URL || true
fi

log "✅ CI/CD deployment completed successfully!"
echo -e "${BLUE}=================================${NC}"
echo -e "${GREEN}🌐 Frontend URL: $FRONTEND_URL${NC}"
echo -e "${GREEN}🔗 Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}📋 Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}🌿 Branch: $BRANCH${NC}"
echo -e "${GREEN}📝 Commit: ${COMMIT_SHA:0:8}${NC}"
echo -e "${BLUE}=================================${NC}"
