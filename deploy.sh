#!/bin/bash

# --- Configuration ---
APP_NAME="gurukulamhub"
REPO_URL="https://github.com/Damodara7/gurukulamhub.git"  # Replace with your actual Git repository URL
DEPLOY_DIR="/var/www/$APP_NAME"
GIT_BRANCH="main"  # Or 'master', 'develop', etc.
NODE_VERSION="18"  # Specify Node.js version
PORT="3000"
PM2_APP_NAME="gurukulamhub-app"

# --- Colors for output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Logging function ---
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# --- Pre-deployment Checks ---
log "Starting deployment for $APP_NAME..."

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { error "Git is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { error "npm is required but not installed. Aborting."; exit 1; }
command -v pm2 >/dev/null 2>&1 || { warning "PM2 is not installed. Installing PM2 globally..."; npm install -g pm2; }

# Check Node.js version
NODE_CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT_VERSION" -lt "$NODE_VERSION" ]; then
    error "Node.js version $NODE_VERSION or higher is required. Current version: $(node -v)"
    exit 1
fi

# --- Create deployment directory ---
if [ ! -d "$DEPLOY_DIR" ]; then
    log "Creating deployment directory $DEPLOY_DIR..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
fi

# --- Code Retrieval ---
log "Cloning or pulling latest code..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/$GIT_BRANCH
    git clean -fd
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    git checkout $GIT_BRANCH
fi

# --- Environment Setup ---
log "Setting up environment variables..."
if [ ! -f "$DEPLOY_DIR/.env.local" ]; then
    warning "Environment file .env.local not found. Creating from template..."
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env.local" 2>/dev/null || {
        log "Creating basic .env.local file..."
        cat > "$DEPLOY_DIR/.env.local" << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis
REDIS_URL="redis://localhost:6379"

# Node Environment
NODE_ENV="production"

# API Configuration
API_BASE_URL="http://localhost:3000/api"

# Add your other environment variables here
EOF
        warning "Please update .env.local with your actual configuration values!"
    }
fi

# --- Dependency Installation ---
log "Installing Node.js dependencies..."
npm ci --production=false  # Install all dependencies including devDependencies for build

# --- Database Setup ---
log "Setting up database..."
if command -v npx >/dev/null 2>&1; then
    npx prisma generate
    npx prisma db push
    success "Database setup completed"
else
    error "npx not found. Please ensure Node.js is properly installed."
    exit 1
fi

# --- Build Step ---
log "Building the Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    error "Build failed. Please check the build logs."
    exit 1
fi

success "Build completed successfully"

# --- Application Management with PM2 ---
log "Managing application with PM2..."

# Stop existing PM2 process if running
pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
pm2 delete "$PM2_APP_NAME" 2>/dev/null || true

# Start the application with PM2
log "Starting application with PM2..."
pm2 start next-node-express-server.mjs --name "$PM2_APP_NAME" --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup 2>/dev/null || true

success "Application started with PM2"

# --- Health Check ---
log "Performing health check..."
sleep 5

# Check if the application is responding
if curl -f http://localhost:$PORT >/dev/null 2>&1; then
    success "Application is responding on port $PORT"
else
    warning "Application may not be responding on port $PORT. Check PM2 logs: pm2 logs $PM2_APP_NAME"
fi

# --- Display Status ---
log "Deployment completed for $APP_NAME"
echo ""
echo "=== Deployment Summary ==="
echo "Application Name: $APP_NAME"
echo "Deployment Directory: $DEPLOY_DIR"
echo "PM2 Process Name: $PM2_APP_NAME"
echo "Port: $PORT"
echo ""
echo "=== Useful Commands ==="
echo "View logs: pm2 logs $PM2_APP_NAME"
echo "Restart app: pm2 restart $PM2_APP_NAME"
echo "Stop app: pm2 stop $PM2_APP_NAME"
echo "View status: pm2 status"
echo "Monitor: pm2 monit"
echo ""
echo "=== Next Steps ==="
echo "1. Configure your web server (Nginx/Apache) to proxy requests to port $PORT"
echo "2. Set up SSL certificates if needed"
echo "3. Configure firewall rules"
echo "4. Set up log rotation"
echo "5. Configure monitoring and alerts"
echo ""

success "Deployment script completed successfully!"
