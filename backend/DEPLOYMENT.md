# 🚀 Deployment Guide - Storage Bucket API

This guide covers various deployment options for the Storage Bucket API in production environments.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Installation Steps](#installation-steps)
3. [PM2 Deployment (Recommended)](#pm2-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL/HTTPS Setup](#ssl-https-setup)
7. [Environment Configuration](#environment-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / Amazon Linux 2
- **CPU**: 1 vCPU
- **RAM**: 512 MB (1 GB recommended)
- **Storage**: 10 GB + space for uploads
- **Node.js**: 14.0.0 or higher (18 LTS recommended)

### Recommended Requirements
- **CPU**: 2+ vCPUs
- **RAM**: 2 GB+
- **Storage**: 50 GB+ SSD
- **Network**: 100 Mbps+

---

## Installation Steps

### 1. Update System

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Install Node.js

```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/bornebyte/storage-bucket.git
cd storage-bucket
sudo chown -R $USER:$USER /var/www/storage-bucket
```

### 4. Install Dependencies

```bash
npm install --production
```

### 5. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit configuration
```

---

## PM2 Deployment

PM2 is a production process manager for Node.js applications.

### Install PM2

```bash
sudo npm install -g pm2
```

### Start Application

```bash
# Start with ecosystem file
npm run pm2:start

# Or directly with PM2
pm2 start index.js --name storage-bucket-api

# Start in production mode
pm2 start ecosystem.config.js --env production
```

### Configure PM2 to Start on Boot

```bash
# Generate startup script
pm2 startup

# Run the command that PM2 outputs (will be similar to):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-username --hp /home/your-username

# Save PM2 process list
pm2 save
```

### PM2 Management Commands

```bash
# View logs
pm2 logs storage-bucket-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart storage-bucket-api

# Stop application
pm2 stop storage-bucket-api

# Delete from PM2
pm2 delete storage-bucket-api

# List all processes
pm2 list

# View detailed info
pm2 info storage-bucket-api
```

---

## Docker Deployment

### Prerequisites

Install Docker and Docker Compose:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Build and Run

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or build manually
docker build -t storage-bucket .
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/storage.db:/app/storage.db \
  --name storage-bucket \
  storage-bucket
```

### Docker Management

```bash
# View logs
docker-compose logs -f

# Restart container
docker-compose restart

# Stop container
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove everything
docker-compose down -v
```

---

## Nginx Configuration

### Install Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Nginx

```bash
# Copy example configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/storage-bucket

# Edit configuration
sudo nano /etc/nginx/sites-available/storage-bucket

# Update these values:
# - server_name: your-domain.com
# - proxy_pass: http://localhost:3000

# Enable site
sudo ln -s /etc/nginx/sites-available/storage-bucket /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Manual SSL Configuration

If you have your own SSL certificates:

```bash
# Copy certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp your-certificate.crt /etc/nginx/ssl/
sudo cp your-private-key.key /etc/nginx/ssl/

# Update Nginx configuration
sudo nano /etc/nginx/sites-available/storage-bucket

# Add SSL configuration (see nginx.conf.example)
```

---

## Environment Configuration

### Production Environment Variables

Edit `.env` file:

```env
# Server
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Storage
UPLOAD_DIR=/var/www/storage-bucket/uploads
MAX_FILE_SIZE=104857600
MAX_FILES_PER_UPLOAD=10

# Database
DB_PATH=/var/www/storage-bucket/storage.db

# CORS (restrict to your domains)
CORS_ORIGINS=https://your-domain.com,https://api.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
TRUST_PROXY=true  # Set to true when behind Nginx

# Logging
LOG_LEVEL=info
```

### File Permissions

```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/storage-bucket/uploads
sudo chmod 755 /var/www/storage-bucket/uploads

# For database
sudo chown www-data:www-data /var/www/storage-bucket/storage.db
sudo chmod 644 /var/www/storage-bucket/storage.db
```

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# PM2 logs
pm2 logs storage-bucket-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/storage-bucket-access.log
sudo tail -f /var/log/nginx/storage-bucket-error.log

# Application logs
tail -f logs/pm2-combined.log
```

### Disk Space Monitoring

```bash
# Check disk usage
df -h

# Check uploads directory size
du -sh /var/www/storage-bucket/uploads

# Find large files
find /var/www/storage-bucket/uploads -type f -size +100M -exec ls -lh {} \;
```

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-storage-bucket.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/storage-bucket"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/storage-bucket/storage.db $BACKUP_DIR/storage_$DATE.db

# Backup uploads (optional - can be large)
# tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/storage-bucket/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-storage-bucket.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-storage-bucket.sh") | crontab -
```

### Health Check Monitoring

```bash
# Create health check script
cat > /usr/local/bin/check-storage-bucket.sh << 'EOF'
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down! Response code: $RESPONSE"
    # Restart the service
    pm2 restart storage-bucket-api
    # Or send notification
fi
EOF

chmod +x /usr/local/bin/check-storage-bucket.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/check-storage-bucket.sh >> /var/log/storage-bucket-health.log") | crontab -
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

#### Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/storage-bucket
chmod 755 /var/www/storage-bucket
chmod 755 /var/www/storage-bucket/uploads
```

#### Database Locked

```bash
# Stop all processes
pm2 stop all

# Remove lock file if exists
rm -f /var/www/storage-bucket/storage.db-journal

# Restart
pm2 start all
```

#### Nginx 502 Bad Gateway

```bash
# Check if application is running
pm2 status

# Check application logs
pm2 logs

# Restart application
pm2 restart storage-bucket-api

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

#### Out of Memory

```bash
# Increase Node.js memory limit
pm2 delete storage-bucket-api
pm2 start index.js --name storage-bucket-api --node-args="--max-old-space-size=2048"
pm2 save
```

### Performance Tuning

#### PM2 Cluster Mode

For better performance on multi-core systems:

```javascript
// In ecosystem.config.js
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

#### Nginx Caching

Add to Nginx configuration:

```nginx
# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Checklist

- [ ] Use HTTPS (SSL/TLS)
- [ ] Configure firewall (UFW/firewalld)
- [ ] Set strong CORS policies
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup data regularly
- [ ] Use strong file permissions
- [ ] Keep Node.js and dependencies updated
- [ ] Use environment variables for sensitive data

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/bornebyte/storage-bucket/issues
- Documentation: https://github.com/bornebyte/storage-bucket

---

**Last Updated**: November 2024
