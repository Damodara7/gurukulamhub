#!/bin/bash

# Server Setup Script for GurukulamHub
# This script prepares a fresh Ubuntu server for deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

log "Starting server setup for GurukulamHub..."

# Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18
log "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
success "Node.js $NODE_VERSION and npm $NPM_VERSION installed"

# Install PM2 globally
log "Installing PM2..."
sudo npm install -g pm2

# Install Redis
log "Installing Redis..."
sudo apt install redis-server -y

# Configure Redis
log "Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis connection
if redis-cli ping | grep -q "PONG"; then
    success "Redis is running"
else
    error "Redis failed to start"
    exit 1
fi

# Install Nginx
log "Installing Nginx..."
sudo apt install nginx -y

# Configure Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Test Nginx
if curl -f http://localhost >/dev/null 2>&1; then
    success "Nginx is running"
else
    warning "Nginx may not be responding properly"
fi

# Install PostgreSQL (optional, for production)
read -p "Do you want to install PostgreSQL for production? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Installing PostgreSQL..."
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    success "PostgreSQL installed"
fi

# Install Certbot for SSL
log "Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Install UFW firewall
log "Configuring firewall..."
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create deployment directory
log "Creating deployment directory..."
sudo mkdir -p /var/www/gurukulamhub
sudo chown -R $USER:$USER /var/www/gurukulamhub

# Create log directories
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Create backup directory
sudo mkdir -p /backup/gurukulamhub
sudo chown -R $USER:$USER /backup/gurukulamhub

# Setup log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/gurukulamhub > /dev/null <<EOF
/var/log/pm2/gurukulamhub-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Display system information
echo ""
echo "=== System Information ==="
echo "Node.js Version: $(node -v)"
echo "npm Version: $(npm -v)"
echo "PM2 Version: $(pm2 -v)"
echo "Redis Version: $(redis-server --version | head -n1)"
echo "Nginx Version: $(nginx -v 2>&1 | head -n1)"
echo "PostgreSQL Version: $(psql --version 2>/dev/null || echo 'Not installed')"
echo ""

# Display next steps
echo "=== Next Steps ==="
echo "1. Update the deploy.sh script with your repository URL"
echo "2. Run the deployment script: ./deploy.sh"
echo "3. Configure Nginx with your domain"
echo "4. Setup SSL certificates with Certbot"
echo "5. Configure environment variables in .env.local"
echo ""

success "Server setup completed successfully!"
echo ""
echo "Your server is now ready for GurukulamHub deployment."
echo "Run './deploy.sh' to deploy your application."
