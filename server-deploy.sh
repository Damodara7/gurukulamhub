#!/bin/bash

# Server-side deployment script
# This script runs on the Digital Ocean droplet
# Can be used for manual deployments or called by CI/CD

set -e  # Exit on error

APP_DIR="/var/www/gurukulamhub"
cd "$APP_DIR"

echo "=========================================="
echo "🚀 Starting Deployment"
echo "=========================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "   Environment variables should be set via GitHub Secrets or manually"
fi

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker compose down || true

# Pull latest code (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || echo "⚠️  Git pull failed, continuing with existing code"
fi

# Build and start containers
echo "🔨 Building and starting containers..."
docker compose up -d --build

# Wait for app to be ready
echo "⏳ Waiting for app to be ready..."
sleep 15

# Check container status
echo "✅ Checking container status..."
docker compose ps

# Health check
echo "🏥 Checking app health..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ App is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Health check failed after 30 attempts"
        echo "   Check logs: docker compose logs app"
    else
        echo "   Waiting... ($i/30)"
        sleep 2
    fi
done

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "=========================================="
echo "✅ Deployment completed!"
echo "=========================================="
echo ""
echo "View logs: docker compose logs -f app"
echo "Check status: docker compose ps"
echo ""

