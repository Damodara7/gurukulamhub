#!/bin/bash

# --- Configuration ---
APP_NAME="gurukulamhub"
REPO_URL="https://github.com/Damodara7/gurukulamhub.git"
DEPLOY_DIR="/var/www/$APP_NAME" # Provide the deployment directory name
GIT_BRANCH="main" # Or 'master', 'develop', etc.

# --- Pre-deployment Checks ---
echo "Starting deployment for $APP_NAME..."

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "Git is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting."; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "PM2 is not installed. Installing PM2 globally..."; npm install -g pm2; }
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Deployment directory not found. Creating $DEPLOY_DIR..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR" # Adjust ownership as needed
fi

# --- Code Retrieval ---
echo "Cloning or pulling latest code..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git pull origin "$GIT_BRANCH"
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# --- Dependency Installation ---
echo "Installing Node.js dependencies..."
npm ci --production=false # Install all dependencies including devDependencies for build

# --- Environment Setup ---
echo "Setting up environment variables..."
if [ ! -f "$DEPLOY_DIR/.env.local" ]; then
    echo "Creating .env.local file..."
    cat > "$DEPLOY_DIR/.env.local" << EOF
# Database Configuration
DATABASE_URL=mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0

# NextAuth Configuration
NEXTAUTH_URL=http://192.168.31.199:3000
NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development

# API Configuration
API_BASE_URL=http://192.168.31.199:3000/api
EOF
fi

# --- Build Step ---
echo "Building the Next.js application..."
npm run build

# --- Application Management (e.g., PM2, systemd, Supervisord) ---
echo "Restarting application service..."
# Example using PM2:
pm2 stop "$APP_NAME" || true # Stop if running, ignore if not
pm2 start npm --name "$APP_NAME" -- start # Use npm start (now configured for dev mode)
pm2 save # Save PM2 process list

# Setup PM2 startup script
pm2 startup 2>/dev/null || true

# --- Health Check ---
echo "Performing health check..."
sleep 5

# Get server IP for display
SERVER_IP="192.168.31.199"

# Check if the application is responding
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Application is responding on port 3000"
else
    echo "⚠️  Application may not be responding on port 3000. Check PM2 logs: pm2 logs $APP_NAME"
fi

echo ""
echo "=== Deployment Summary ==="
echo "Application Name: $APP_NAME"
echo "Deployment Directory: $DEPLOY_DIR"
echo "PM2 Process Name: $APP_NAME"
echo "Port: 3000"
echo "Server IP: $SERVER_IP"
echo ""
echo "=== Access Your App ==="
echo "Local: http://localhost:3000"
echo "Network: http://$SERVER_IP:3000"
echo "Any device on same WiFi: http://$SERVER_IP:3000"
echo ""
echo "=== Useful Commands ==="
echo "View logs: pm2 logs $APP_NAME"
echo "Restart app: pm2 restart $APP_NAME"
echo "Stop app: pm2 stop $APP_NAME"
echo "View status: pm2 status"
echo "Monitor: pm2 monit"
echo ""

echo "✅ Deployment complete for $APP_NAME."