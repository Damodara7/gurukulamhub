# Deploy Next.js App to Digital Ocean with Docker CI/CD

Complete guide for deploying your GurukulamHub Next.js application to Digital Ocean droplet using Docker with automated CI/CD via GitHub Actions.

## Prerequisites

- ✅ Digital Ocean droplet (Ubuntu 24.04) - IP: `139.59.6.209`
- ✅ Domain name: `gurukulamhub.org`
- ✅ GitHub repository with your code
- ✅ SSH access to droplet: `ssh root@139.59.6.209`

## Table of Contents

1. [Initial Server Setup](#1-initial-server-setup)
2. [Setup GitHub Secrets](#2-setup-github-secrets)
3. [Configure CI/CD Pipeline](#3-configure-cicd-pipeline)
4. [First Deployment](#4-first-deployment)
5. [Manual Deployment (Alternative)](#5-manual-deployment-alternative)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Initial Server Setup

### Connect to Your Droplet

```bash
ssh root@139.59.6.209
```

### Install Docker and Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git ufw

# Install Docker
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

# Verify installation
docker --version
docker compose version
```

### Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Create Application Directory

```bash
mkdir -p /var/www/gurukulamhub
cd /var/www/gurukulamhub
```

### Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Setup Nginx Configuration

```bash
cat > /etc/nginx/sites-available/gurukulamhub << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name gurukulamhub.org www.gurukulamhub.org;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gurukulamhub.org www.gurukulamhub.org;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/gurukulamhub.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gurukulamhub.org/privkey.pem;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/gurukulamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### Setup SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace email with your email)
certbot --nginx -d gurukulamhub.org -d www.gurukulamhub.org --non-interactive --agree-tos --email surnaganesh123@gmail.com --redirect

# Test auto-renewal
certbot renew --dry-run
```

### Generate SSH Key for GitHub Actions

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Display private key (copy this for GitHub Secrets)
cat ~/.ssh/github_actions
```

**Copy the private key output** - you'll need it for GitHub Secrets.

---

## 2. Setup GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

### Required Secrets

These secrets contain sensitive information and must be added to GitHub Actions secrets.

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DROPLET_SSH_KEY` | Private SSH key for droplet access | `-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | `LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=` |
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `872140549132-k3ndunp63cl0j05mmi9uh1bctrt0pla9.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `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` |
| `AWS_S3_ACCESS_KEY_ID` | AWS S3 access key | `AKIAU6GDX5HJIHWTXVMD` |
| `AWS_S3_ACCESS_KEY_SECRET` | AWS S3 secret key | `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` |
| `AWS_S3_GAMES_UPLOAD_BUCKET` | S3 bucket name | `squizmegames` |
| `AWS_S3_REGION` | AWS region | `ap-south-1` |
| `AWS_S3_USERPROFILE_UPLOAD_BUCKET` | S3 bucket name | `squizme-userprofile` |
| `AWS_S3_QUIZ_UPLOAD_BUCKET` | S3 bucket name | `squizme-quiz` |
| `RECAPTCHA_SITE_KEY` | Google ReCAPTCHA site key | `6LdybtIrAAAAAB1ZeuTJ-m-okYqu4tN2YN2Fkjms` |
| `RECAPTCHA_SECRET_KEY` | Google ReCAPTCHA secret key | `6LdybtIrAAAAAODGKuB-bcesbOlM_qsd1V7SXmEA` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_51OZar7SBB7wnYOSIs4gZrZqWeEJFlGlKP0KUREQBdJFn4TytYos3hfNb7XSTDeEjZmC0oaNOzZL4MeFrE34SrkXF00rWrNG7Yh` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_51OZar7SBB7wnYOSIxgxrydQim2M1f1oVPg6ty5yiU7McIYKM1qCwj7fDibjlXCqOps8xMZsDIk686MqiDDh3TsF500xWdlk6VD` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_7e58bb3bbfef88f65591b5bbbb2e931b3cccf8f906edb012ea8a4aeff3fc2586` |
| `SUPER_ADMIN_EMAIL` | Super admin email | `rnoonegen@gmail.com` |
| `SOCKET_IO_SERVER` | Socket.IO server URL | `http://ec2-65-2-71-250.ap-south-1.compute.amazonaws.com:4001` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for web push | `BKhx1Hzlzfw4n96m1KnTaP_HEoYPB5Xef5opphQ3eQ9H6kXFeRj1YyeOTwWsMReJL2yJr5Gyuqem8qlMMXaINcA` |
| `VAPID_PRIVATE_KEY` | VAPID private key for web push | `YIQahzM7Mp8SHnoi0eXbelSRGybUE43hHY1oyJH_BAo` |
| `VAPID_EMAIL` | VAPID email contact | `mailto:rnoonegen@gmail.com` |

### Environment Variables (Auto-generated)

The following environment variables are automatically generated by the CI/CD workflow based on your domain and configuration. They don't need to be added as secrets:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `BASEPATH` | (empty) | Can be configured in workflow if needed |
| `DOMAIN` | `gurukulamhub.org` | Set in workflow env |
| `NEXT_PUBLIC_APP_URL` | `https://gurukulamhub.org` | Auto-generated from DOMAIN |
| `NODE_ENV` | `production` | Hardcoded |
| `PORT` | `3000` | Hardcoded |
| `NEXTAUTH_BASEPATH` | `/api/auth` | Hardcoded |
| `NEXTAUTH_URL` | `https://gurukulamhub.org` | Auto-generated from DOMAIN |
| `AUTH_TRUST_HOST` | `https://gurukulamhub.org` | Auto-generated from DOMAIN |
| `API_URL` | `https://gurukulamhub.org/api` | Auto-generated from DOMAIN |
| `NEXT_PUBLIC_API_URL` | `https://gurukulamhub.org/api` | Auto-generated from DOMAIN |
| `USE_FALLBACK_MUTATION` | `true` | Hardcoded in workflow |
| `MONGODB_DB` | `gurkulhub` | Hardcoded |
| `REDIS_URL` | `redis://redis:6379` | For Docker Compose |
| `REDIS_HOST` | `redis` | For Docker Compose |
| `REDIS_PORT` | `6379` | Hardcoded |
| `NEXT_PUBLIC_DOCS_URL` | (default Materio docs URL) | Hardcoded in workflow |

**Note**: If you need to customize any of the auto-generated variables, edit the `.github/workflows/deploy-digitalocean.yml` file.

### How to Add Secrets

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Enter the **Name** and **Value**
4. Click **"Add secret"**

### How Environment Variables Work

The CI/CD workflow automatically creates/updates the `.env.production` file on the server during each deployment with:

1. **Secrets from GitHub Actions** - Sensitive values like API keys, database URLs, etc.
2. **Auto-generated values** - Variables like `API_URL`, `NEXTAUTH_URL` that are built from your `DOMAIN`
3. **Hardcoded values** - Configuration constants like `USE_FALLBACK_MUTATION=true`

**Important**: The workflow **always recreates** the `.env.production` file during deployment, ensuring all variables are up-to-date with your GitHub Secrets.

If you need to customize any auto-generated or hardcoded variables, edit the workflow file at `.github/workflows/deploy-digitalocean.yml` in the "Create .env.production on server" step.

---

## 3. Configure CI/CD Pipeline

The CI/CD pipeline is already configured in `.github/workflows/deploy-digitalocean.yml`.

### How It Works

1. **Trigger**: Automatically runs on push to `main` or `production` branch
2. **Build**: Copies code to server (excluding node_modules, .next, .env files)
3. **Deploy**: Creates `.env.production` from GitHub Secrets and deploys with Docker Compose
4. **Verify**: Checks if app is healthy

### Update Workflow (if needed)

Edit `.github/workflows/deploy-digitalocean.yml` to change:
- `DROPLET_IP`: Your droplet IP
- `DOMAIN`: Your domain name
- `APP_DIR`: Application directory on server

---

## 4. First Deployment

### Option A: Automatic (via GitHub Actions)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Setup CI/CD deployment"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
   - Watch the deployment workflow run
   - Check logs if there are any errors

3. **Verify deployment:**
   ```bash
   # SSH to server
   ssh root@139.59.6.209
   
   # Check containers
   cd /var/www/gurukulamhub
   docker compose ps
   
   # Check logs
   docker compose logs -f app
   ```

### Option B: Manual First Deployment

If you want to deploy manually first:

```bash
# On your local machine
scp -r . root@139.59.6.209:/var/www/gurukulamhub/

# SSH to server
ssh root@139.59.6.209
cd /var/www/gurukulamhub

# Create .env.production manually (copy from your local .env.production)
nano .env.production

# Build and start
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f app
```

---

## 5. Manual Deployment (Alternative)

If you prefer manual deployment without CI/CD:

### Create Deployment Script on Server

```bash
# On server
cat > /var/www/gurukulamhub/deploy.sh << 'EOF'
#!/bin/bash
set -e

cd /var/www/gurukulamhub

echo "🔄 Pulling latest code..."
git pull origin main

echo "⏹️  Stopping containers..."
docker compose down

echo "🔨 Building and starting containers..."
docker compose up -d --build

echo "⏳ Waiting for app to be ready..."
sleep 15

echo "✅ Deployment completed!"
docker compose ps
EOF

chmod +x /var/www/gurukulamhub/deploy.sh
```

### Run Deployment

```bash
# SSH to server
ssh root@139.59.6.209

# Run deployment script
cd /var/www/gurukulamhub
./deploy.sh
```

---

## 6. Troubleshooting

### CI/CD Deployment Fails

1. **Check GitHub Actions logs:**
   - Go to Actions tab in GitHub
   - Click on the failed workflow
   - Check the error messages

2. **Common issues:**
   - **SSH connection failed**: Verify `DROPLET_SSH_KEY` secret is correct
   - **Permission denied**: Check SSH key permissions on server
   - **Build failed**: Check Docker logs on server

### Application Not Starting

```bash
# SSH to server
ssh root@139.59.6.209
cd /var/www/gurukulamhub

# Check container status
docker compose ps

# Check logs
docker compose logs app

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart containers
docker compose restart
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
docker compose ps

# Test app directly
curl http://localhost:3000/api/health

# Check Nginx error log
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Environment Variables Not Working

```bash
# Check .env.production file
cat /var/www/gurukulamhub/.env.production

# Verify environment variables in container
docker compose exec app env | grep -E "DATABASE_URL|NEXTAUTH"

# Recreate containers with new env vars
docker compose down
docker compose up -d --build
```

### SSL Certificate Issues

```bash
# Renew certificate manually
certbot renew

# Check certificate status
certbot certificates

# Test renewal
certbot renew --dry-run
```

---

## Quick Reference Commands

```bash
# View logs
docker compose logs -f app

# Restart app
docker compose restart app

# Rebuild and restart
docker compose up -d --build

# Stop all services
docker compose down

# Check container status
docker compose ps

# Check Nginx status
systemctl status nginx

# Reload Nginx
nginx -t && systemctl reload nginx

# View app logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Security Checklist

- [x] Firewall configured (UFW)
- [x] SSH key authentication enabled
- [x] SSL certificate installed and auto-renewal configured
- [x] Environment variables secured (GitHub Secrets)
- [x] `.env.production` not in Git
- [x] Docker containers running as non-root user
- [x] Nginx security headers configured
- [x] Regular backups configured

---

## Next Steps

1. **Set up monitoring** (e.g., UptimeRobot, Pingdom)
2. **Configure automated backups** for Redis and database
3. **Set up log rotation** to prevent disk space issues
4. **Configure alerts** for deployment failures
5. **Set up staging environment** for testing before production

---

## Support

If you encounter issues:

1. Check GitHub Actions logs: `https://github.com/YOUR_REPO/actions`
2. Check application logs: `docker compose logs -f app`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Verify DNS: `nslookup gurukulamhub.org`
5. Test application: `curl http://localhost:3000/api/health`

---

**Your app should now be live at `https://gurukulamhub.org` with automated CI/CD! 🎉**

