#!/bin/bash

# DigitalOcean Deployment Script for GurukulamHub
# Run this script on your DigitalOcean droplet

set -e  # Exit on error

echo "=========================================="
echo "GurukulamHub DigitalOcean Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/gurukulamhub"
DOMAIN=""  # Will be prompted
EMAIL=""   # Will be prompted

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}→${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., gurukulamhub.org): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Get email for Let's Encrypt
read -p "Enter your email for SSL certificate: " EMAIL
if [ -z "$EMAIL" ]; then
    print_error "Email is required for SSL certificate"
    exit 1
fi

print_info "Domain: $DOMAIN"
print_info "Email: $EMAIL"
echo ""

# Step 1: Update system
print_info "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install essential tools
print_info "Installing essential tools..."
apt install -y curl wget git ufw
print_success "Essential tools installed"

# Step 3: Configure firewall
print_info "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Step 4: Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    apt install -y ca-certificates curl gnupg lsb-release
    
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    print_success "Docker installed"
else
    print_info "Docker already installed"
fi

# Step 5: Create application directory
print_info "Creating application directory..."
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR
print_success "Application directory created: $APP_DIR"

# Step 6: Check if .env.production exists
if [ ! -f "$APP_DIR/.env.production" ]; then
    print_error ".env.production file not found in $APP_DIR"
    print_info "Please create .env.production file with your environment variables"
    print_info "You can copy it from your local machine or create it manually"
    exit 1
fi

# Step 7: Update .env.production with domain
print_info "Updating .env.production with domain: $DOMAIN"
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" $APP_DIR/.env.production
sed -i "s|API_URL=.*|API_URL=https://$DOMAIN/api|g" $APP_DIR/.env.production
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$DOMAIN/api|g" $APP_DIR/.env.production
sed -i "s|NEXT_PUBLIC_SOCKET_IO_SERVER=.*|NEXT_PUBLIC_SOCKET_IO_SERVER=https://$DOMAIN|g" $APP_DIR/.env.production
sed -i "s|SOCKET_SERVER_URL=.*|SOCKET_SERVER_URL=https://$DOMAIN|g" $APP_DIR/.env.production
print_success ".env.production updated"

# Step 8: Build and start Docker containers
print_info "Building and starting Docker containers..."
cd $APP_DIR
docker compose up -d --build
print_success "Docker containers started"

# Wait for app to be ready
print_info "Waiting for application to be ready..."
sleep 10

# Step 9: Install Nginx
print_info "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed"

# Step 10: Configure Nginx
print_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/gurukulamhub <<EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server (SSL will be added by Certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/gurukulamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
print_success "Nginx configured"

# Step 11: Install Certbot and get SSL certificate
print_info "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

print_info "Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

print_success "SSL certificate installed"

# Step 12: Test SSL renewal
print_info "Testing SSL certificate renewal..."
certbot renew --dry-run
print_success "SSL auto-renewal configured"

# Final checks
print_info "Running final checks..."

# Check Docker containers
if docker compose ps | grep -q "Up"; then
    print_success "Docker containers are running"
else
    print_error "Some Docker containers are not running"
    docker compose ps
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check SSL
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_success "SSL certificate is installed"
else
    print_error "SSL certificate not found"
fi

echo ""
echo "=========================================="
print_success "Deployment completed!"
echo "=========================================="
echo ""
echo "Your application should be available at:"
echo "  https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  View logs:        docker compose -f $APP_DIR/docker-compose.yml logs -f app"
echo "  Restart app:     docker compose -f $APP_DIR/docker-compose.yml restart app"
echo "  Check status:    docker compose -f $APP_DIR/docker-compose.yml ps"
echo "  Nginx logs:      tail -f /var/log/nginx/error.log"
echo ""




