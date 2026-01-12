# Deploy Next.js App to DigitalOcean Droplet

This guide will help you deploy your GurukulamHub Next.js application to a DigitalOcean droplet with Docker, Nginx, and SSL.

## Prerequisites

- ✅ DigitalOcean droplet created (Ubuntu 24.04)
- ✅ Domain name configured
- ✅ SSH access to your droplet
- ✅ Your droplet IP: `139.59.6.209` (update if different)

## Table of Contents

1. [Initial Server Setup](#1-initial-server-setup)
2. [Install Docker and Docker Compose](#2-install-docker-and-docker-compose)
3. [Configure Domain DNS](#3-configure-domain-dns)
4. [Deploy Application](#4-deploy-application)
5. [Setup Nginx Reverse Proxy](#5-setup-nginx-reverse-proxy)
6. [Setup SSL with Let's Encrypt](#6-setup-ssl-with-lets-encrypt)
7. [Maintenance & Updates](#7-maintenance--updates)

---

## 1. Initial Server Setup

### Connect to Your Droplet

```bash
# Replace with your actual SSH key or password
ssh root@139.59.6.209
# Or if you created a user:
ssh your-username@139.59.6.209
```

### Update System

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git ufw
```

### Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS (we'll configure these later)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 2. Install Docker and Docker Compose

### Install Docker

```bash
# Remove old versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
# Or run: newgrp docker
```

### Test Docker

```bash
sudo docker run hello-world
```

---

## 3. Configure Domain DNS

### Point Your Domain to Droplet IP

1. **Go to your domain registrar** (where you bought your domain)
2. **Add/Edit DNS A Records:**
   - **Type:** A
   - **Name:** `@` (or leave blank for root domain)
   - **Value:** `139.59.6.209`
   - **TTL:** 3600 (or default)

   - **Type:** A
   - **Name:** `www`
   - **Value:** `139.59.6.209`
   - **TTL:** 3600

3. **Wait for DNS propagation** (5 minutes to 48 hours)
   - Check with: `nslookup yourdomain.com`
   - Or: `dig yourdomain.com`

### Verify DNS

```bash
# From your local machine
nslookup yourdomain.com
# Should return: 139.59.6.209
```

---

## 4. Deploy Application

### Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/gurukulamhub
sudo chown -R $USER:$USER /var/www/gurukulamhub
cd /var/www/gurukulamhub
```

### Option A: Clone from Git Repository

```bash
# Clone your repository
git clone https://github.com/your-username/gurukulamhub.git .

# Or if you have a private repo:
# git clone git@github.com:your-username/gurukulamhub.git .
```

### Option B: Upload Files via SCP

From your local machine:

```bash
# Upload project files
scp -r /path/to/your/project/* root@139.59.6.209:/var/www/gurukulamhub/

# Or use rsync (better for updates)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /path/to/your/project/ root@139.59.6.209:/var/www/gurukulamhub/
```

### Create Production Environment File

```bash
cd /var/www/gurukulamhub

# Create .env.production file
nano .env.production
```

**Copy the contents from `.env.production` file** and update these values:

```bash
# IMPORTANT: Update these with your actual domain
NEXTAUTH_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SOCKET_IO_SERVER=https://yourdomain.com
SOCKET_SERVER_URL=https://yourdomain.com

# Update Redis URL for Docker Compose
REDIS_URL=redis://redis:6379
```

Save and exit (Ctrl+X, then Y, then Enter).

### Build and Start Containers

```bash
# Build and start services
sudo docker compose up -d --build

# Check logs
sudo docker compose logs -f app

# Check if containers are running
sudo docker compose ps
```

**Expected output:**
```
NAME                    STATUS
gurukulamhub-app        Up
gurukulamhub-redis      Up
```

### Verify Application is Running

```bash
# Test locally on the server
curl http://localhost:3000

# Check container logs
sudo docker compose logs app
```

---

## 5. Setup Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gurukulamhub
```

**Add this configuration** (replace `yourdomain.com` with your actual domain):

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

Save and exit.

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/gurukulamhub /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 6. Setup SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Auto-renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
# You can verify with:
sudo systemctl status certbot.timer
```

### Verify SSL

Visit `https://yourdomain.com` in your browser. You should see a secure connection.

---

## 7. Maintenance & Updates

### View Logs

```bash
# Application logs
sudo docker compose logs -f app

# Redis logs
sudo docker compose logs -f redis

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart application
sudo docker compose restart app

# Restart all services
sudo docker compose restart

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application

```bash
cd /var/www/gurukulamhub

# Pull latest code (if using Git)
git pull origin main

# Rebuild and restart
sudo docker compose up -d --build

# Or just restart if no code changes
sudo docker compose restart app
```

### Backup

```bash
# Backup Redis data
sudo docker compose exec redis redis-cli SAVE
sudo docker cp gurukulamhub-redis:/data/dump.rdb ~/redis-backup-$(date +%Y%m%d).rdb

# Backup environment file
cp .env.production ~/.env.production.backup-$(date +%Y%m%d)
```

### Monitor Resources

```bash
# Check Docker container stats
sudo docker stats

# Check disk space
df -h

# Check memory
free -h

# Check system logs
sudo journalctl -u docker -f
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check container status
sudo docker compose ps

# Check logs
sudo docker compose logs app

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart containers
sudo docker compose down
sudo docker compose up -d
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
sudo docker compose ps

# Check app logs
sudo docker compose logs app

# Test app directly
curl http://localhost:3000

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### DNS Not Resolving

```bash
# Check DNS from server
nslookup yourdomain.com

# Check DNS from local machine
dig yourdomain.com

# Wait for DNS propagation (can take up to 48 hours)
```

### Database Connection Issues

```bash
# Verify DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL

# Test MongoDB connection (if you have mongo client)
# Make sure your MongoDB Atlas allows connections from droplet IP
```

### Redis Connection Issues

```bash
# Check Redis container
sudo docker compose ps redis

# Test Redis connection
sudo docker compose exec redis redis-cli ping

# Check Redis logs
sudo docker compose logs redis
```

---

## Quick Reference Commands

```bash
# Navigate to app directory
cd /var/www/gurukulamhub

# View running containers
sudo docker compose ps

# View logs
sudo docker compose logs -f app

# Restart app
sudo docker compose restart app

# Rebuild and restart
sudo docker compose up -d --build

# Stop all services
sudo docker compose down

# Start all services
sudo docker compose up -d

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx config
sudo nginx -t && sudo systemctl reload nginx

# Check SSL certificate
sudo certbot certificates
```

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled (disable password auth)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Environment variables secured (`.env.production` not in Git)
- [ ] Database credentials are secure
- [ ] Regular backups configured
- [ ] System updates automated
- [ ] Nginx security headers configured

---

## Next Steps

1. **Set up monitoring** (e.g., PM2, New Relic, or DataDog)
2. **Configure automated backups** for Redis and database
3. **Set up CI/CD pipeline** for automated deployments
4. **Configure log rotation** to prevent disk space issues
5. **Set up monitoring alerts** for downtime

---

## Support

If you encounter issues:

1. Check application logs: `sudo docker compose logs -f app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `nslookup yourdomain.com`
4. Test application directly: `curl http://localhost:3000`

---

**Your app should now be live at `https://yourdomain.com`! 🎉**

