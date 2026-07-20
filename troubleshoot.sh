#!/bin/bash

# Quick troubleshooting script for frontend deployment

echo "========================================="
echo "Frontend Deployment Troubleshooting"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check if container is running
echo -e "\n${YELLOW}1. Container Status:${NC}"
docker ps | grep affvance_frontend || echo "Container not found!"

# 2. Check container logs
echo -e "\n${YELLOW}2. Container Logs (last 20 lines):${NC}"
docker logs --tail 20 affvance_frontend_staging 2>&1

# 3. Test from inside container
echo -e "\n${YELLOW}3. Testing from inside container:${NC}"
docker exec affvance_frontend_staging curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container is serving requests${NC}"
else
    echo -e "${RED}✗ Container is NOT serving requests${NC}"
fi

# 4. Check Traefik network
echo -e "\n${YELLOW}4. Traefik Network Connection:${NC}"
docker network inspect traefik_proxy | grep affvance_frontend_staging > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container is connected to traefik_proxy network${NC}"
else
    echo -e "${RED}✗ Container is NOT connected to traefik_proxy network${NC}"
fi

# 5. Check Traefik routing
echo -e "\n${YELLOW}5. Traefik Logs (looking for stage.affvance.com):${NC}"
docker logs traefik 2>&1 | grep -i "stage.affvance.com" | tail -5

# 6. Test DNS resolution
echo -e "\n${YELLOW}6. DNS Resolution:${NC}"
host stage.affvance.com 2>/dev/null || echo "DNS not resolved yet"

# 7. Check environment variables
echo -e "\n${YELLOW}7. Environment Variables:${NC}"
docker exec affvance_frontend_staging env | grep NEXT_PUBLIC || echo "No NEXT_PUBLIC vars found"

# 8. Health check status
echo -e "\n${YELLOW}8. Health Check:${NC}"
docker inspect affvance_frontend_staging --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check defined"

echo -e "\n========================================="
echo "Troubleshooting complete!"
echo "========================================="
