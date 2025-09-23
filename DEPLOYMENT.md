# GurukulamHub Deployment Guide

This guide will help you deploy the GurukulamHub Next.js application to a production server.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended

### Software Requirements
- Node.js 18+ 
- npm or yarn
- Git
- PM2 (Process Manager)
- Nginx (Web Server)
- Redis (Session Store)
- Database (SQLite/PostgreSQL/MySQL)

## Quick Deployment

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Git
sudo apt install git -y
```

### 2. Configure Deployment Script

1. **Update the deployment script** (`deploy.sh`):
   ```bash
   # Edit these variables in deploy.sh
   REPO_URL="https://github.com/Damodara7/gurukulamhub.git"  # Your actual repo URL
   DEPLOY_DIR="/var/www/gurukulamhub"  # Your deployment directory
   ```

2. **Make the script executable**:
   ```bash
   chmod +x deploy.sh
   ```

### 3. Run Deployment

```bash
# Run the deployment script
./deploy.sh
```

## Manual Deployment Steps

### 1. Clone Repository

```bash
sudo mkdir -p /var/www/gurukulamhub
sudo chown -R $USER:$USER /var/www/gurukulamhub
cd /var/www/gurukulamhub
git clone https://github.com/Damodara7/gurukulamhub.git .
```

### 2. Install Dependencies

```bash
npm ci --production=false
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.template .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**
```bash
DATABASE_URL="mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0"
NEXTAUTH_URL="http://152.57.161.5:3000"
NEXTAUTH_SECRET="LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0="
REDIS_URL="redis://localhost:6379"
NODE_ENV="production"
API_BASE_URL="http://152.57.161.5:3000/api"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

### 5. Build Application

```bash
npm run build
```

### 6. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## Nginx Configuration

### 1. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf.template /etc/nginx/sites-available/gurukulamhub

# Edit configuration with your domain
sudo nano /etc/nginx/sites-available/gurukulamhub
```

**Update these values in the config:**
- `YOUR_SERVER_IP` → Your actual server IP address
- SSL certificate paths (only if you have a domain and SSL certificates)

### 2. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/gurukulamhub /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. SSL Certificate (Optional - Only if you have a domain)

If you have a domain name, you can set up SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**Note**: For IP-based deployment, SSL certificates are not required. Your application will be accessible via HTTP on your server's IP address.

## Database Configuration

### SQLite (Default)
No additional setup required. Database file will be created automatically.


## Monitoring & Maintenance

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs gurukulamhub-app

# Restart application
pm2 restart gurukulamhub-app

# Monitor resources
pm2 monit

# Stop application
pm2 stop gurukulamhub-app
```

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/gurukulamhub

# Add:
/var/log/pm2/gurukulamhub-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Checks

```bash
# Check application health
curl -f http://localhost:3000/health

# Check Nginx status
sudo systemctl status nginx

# Check Redis status
sudo systemctl status redis-server
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Server Hardening

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh
```

### 3. Environment Security

- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Enable Redis authentication in production
- Use HTTPS only in production
- Regularly update dependencies

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs gurukulamhub-app
   # Check for missing environment variables or database connection issues
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   # Check if application is running
   pm2 status
   
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Database connection issues**
   ```bash
   # Test database connection
   npx prisma db push
   
   # Check database URL format
   echo $DATABASE_URL
   ```

4. **Redis connection issues**
   ```bash
   # Check Redis status
   sudo systemctl status redis-server
   
   # Test Redis connection
   redis-cli ping
   ```

### Performance Optimization

1. **Enable Gzip compression** (already in Nginx config)
2. **Setup CDN** for static assets
3. **Enable Redis caching** for sessions
4. **Use PM2 cluster mode** for multiple instances
5. **Setup database connection pooling**

## Backup Strategy

### Database Backup

```bash
# SQLite backup
cp /var/www/gurukulamhub/dev.db /backup/gurukulamhub-$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump gurukulamhub > /backup/gurukulamhub-$(date +%Y%m%d).sql
```

### Application Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-gurukulamhub.sh

#!/bin/bash
BACKUP_DIR="/backup/gurukulamhub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/gurukulamhub-$DATE.tar.gz /var/www/gurukulamhub

# Setup cron job
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-gurukulamhub.sh
```

## Updates & Maintenance

### Application Updates

```bash
# Pull latest changes
cd /var/www/gurukulamhub
git pull origin main

# Install new dependencies
npm ci --production=false

# Run database migrations
npx prisma db push

# Rebuild application
npm run build

# Restart application
pm2 restart gurukulamhub-app
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Support

For issues and support:
1. Check application logs: `pm2 logs gurukulamhub-app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `cat .env.local`
4. Test database connection: `npx prisma db push`

---

**Note**: Remember to replace placeholder values (yourdomain.com, your-username, etc.) with your actual configuration values before deployment.
