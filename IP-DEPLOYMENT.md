# IP-Based Deployment Guide for GurukulamHub

This guide shows you how to deploy GurukulamHub using your server's IP address instead of a custom domain.

## Prerequisites

- A Linux server (Ubuntu 20.04+ recommended)
- Your server's public IP address
- SSH access to your server

## Quick Deployment Steps

### 1. Get Your Server IP Address

```bash
# On your server, get the public IP
curl ifconfig.me
# or
curl ipinfo.io/ip
```

### 2. Upload Deployment Files

Upload these files to your server:
- `deploy.sh`
- `setup-server.sh`
- `ecosystem.config.js`
- `nginx.conf.template`
- `env.template`

### 3. Run Server Setup (First Time Only)

```bash
# Make scripts executable
chmod +x deploy.sh setup-server.sh

# Run server setup
./setup-server.sh
```

### 4. Configure Environment Variables

```bash
# Copy environment template
cp env.template .env.local

# Edit environment variables
nano .env.local
```

**Your server IP and secret are already configured:**
```bash
# Your server IP: 152.57.161.5
NEXTAUTH_URL="http://152.57.161.5:3000"
NEXTAUTH_SECRET="LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0="
API_BASE_URL="http://152.57.161.5:3000/api"
```

### 5. Deploy Application

```bash
# Run deployment
./deploy.sh
```

### 6. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf.template /etc/nginx/sites-available/gurukulamhub

# Enable the site
sudo ln -s /etc/nginx/sites-available/gurukulamhub /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Configure Firewall

```bash
# Allow HTTP traffic
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw reload
```

## Access Your Application

After deployment, your application will be accessible at:
- **Direct application**: `http://152.57.161.5:3000`
- **Through Nginx**: `http://152.57.161.5` (port 80)

## Example Configuration

Your server IP is `152.57.161.5`, so your configuration would be:

```bash
# In .env.local
NEXTAUTH_URL="http://152.57.161.5:3000"
NEXTAUTH_SECRET="LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0="
API_BASE_URL="http://152.57.161.5:3000/api"
```

And your application would be accessible at:
- `http://152.57.161.5:3000` (direct)
- `http://152.57.161.5` (through Nginx)

## Troubleshooting

### Check Application Status

```bash
# Check if PM2 is running your app
pm2 status

# Check application logs
pm2 logs gurukulamhub-app

# Check if application responds
curl http://localhost:3000
```

### Check Nginx Status

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
```

### Check Firewall

```bash
# Check firewall status
sudo ufw status

# Check if ports are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

## Security Considerations

### For IP-Based Deployment:

1. **Use strong passwords** for your server SSH access
2. **Configure firewall** to only allow necessary ports
3. **Keep system updated** regularly
4. **Monitor logs** for suspicious activity
5. **Use HTTPS** if you get a domain later

### Firewall Configuration:

```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw deny 22  # If you're not using SSH on port 22
sudo ufw enable
```

## Adding a Domain Later

If you get a domain name later, you can easily upgrade to domain-based deployment:

1. **Update DNS** to point your domain to your server IP
2. **Update environment variables** to use your domain
3. **Update Nginx configuration** to use your domain
4. **Get SSL certificates** with Let's Encrypt
5. **Restart services**

## Monitoring

### Basic Monitoring Commands:

```bash
# Check application health
curl -f http://localhost:3000/health

# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

### Log Monitoring:

```bash
# Application logs
pm2 logs gurukulamhub-app --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup

### Simple Backup Script:

```bash
# Create backup script
nano backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/gurukulamhub"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app-$DATE.tar.gz /var/www/gurukulamhub

# Backup database
cp /var/www/gurukulamhub/dev.db $BACKUP_DIR/db-$DATE.db

echo "Backup completed: $BACKUP_DIR/app-$DATE.tar.gz"

# Make executable and run
chmod +x backup.sh
./backup.sh
```

## Updates

### Update Application:

```bash
cd /var/www/gurukulamhub
git pull origin main
npm ci --production=false
npm run build
pm2 restart gurukulamhub-app
```

---

**Your GurukulamHub application is now deployed and accessible via your server's IP address!**

**Next Steps:**
1. Test your application by visiting `http://YOUR_SERVER_IP`
2. Set up monitoring and backups
3. Consider getting a domain name for better accessibility
4. Set up SSL certificates when you have a domain
