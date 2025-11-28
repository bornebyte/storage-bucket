# Storage Bucket - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Storage Bucket application to a production server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
  - [Method 1: PM2 (Recommended)](#method-1-pm2-recommended)
  - [Method 2: Systemd Services](#method-2-systemd-services)
- [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Security Best Practices](#security-best-practices)
- [Monitoring and Logs](#monitoring-and-logs)
- [Backup and Maintenance](#backup-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure your production server has:

- **Node.js** >= 14.0.0 (recommended: LTS version 18.x or 20.x)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **PM2** (optional, for process management): `npm install -g pm2`
- **Nginx** (optional, for reverse proxy)
- **Sufficient disk space** for file uploads
- **Open ports**: 3200 (frontend), 3201 (backend), or 80/443 if using nginx

### Check Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if PM2 is installed
pm2 --version

# Check if nginx is installed
nginx -v
```

---

## Quick Start

### 1. Clone the Repository

```bash
cd /var/www  # or your preferred directory
git clone <your-repository-url> storage-bucket
cd storage-bucket
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your production values
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
cp .env.local.example .env.local
nano .env.local  # Add your NextAuth secret
```

### 4. Build Frontend for Production

```bash
cd frontend
npm run build
cd ..
```

### 5. Start the Application

**Option A: Using PM2 (Recommended)**
```bash
# Start backend
cd backend
pm2 start ecosystem.config.js --env production

# Start frontend
cd ../frontend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup  # Follow the instructions to enable auto-start on boot
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
PORT=3201 NODE_ENV=production npm start

# Terminal 2 - Frontend
cd frontend
PORT=3200 NODE_ENV=production npm start
```

---

## Environment Configuration

### Backend Environment Variables

Edit `backend/.env`:

```bash
# Server Configuration
PORT=3201
NODE_ENV=production
HOST=0.0.0.0

# Storage Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB in bytes

# Database Configuration
DB_PATH=./storage.db

# Upload Limits
MAX_FILES_PER_UPLOAD=10

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com  # Your frontend domain

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
TRUST_PROXY=true  # Set to true if behind nginx/apache

# Logging
LOG_LEVEL=info  # Options: error, warn, info, debug
```

### Frontend Environment Variables

Edit `frontend/.env`:

```bash
# API URL - Point to your backend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Or if using same domain with /api prefix:
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

Edit `frontend/.env.local`:

```bash
# Generate a secure secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

# Your frontend URL
NEXTAUTH_URL=https://yourdomain.com
```

---

## Deployment Methods

### Method 1: PM2 (Recommended)

PM2 is a production process manager for Node.js applications with built-in load balancing, monitoring, and auto-restart capabilities.

#### Install PM2

```bash
npm install -g pm2
```

#### Start Services

```bash
# Backend
cd backend
pm2 start ecosystem.config.js --env production --name storage-bucket-backend

# Frontend
cd ../frontend
pm2 start ecosystem.config.js --env production --name storage-bucket-frontend
```

#### PM2 Management Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs

# View specific service logs
pm2 logs storage-bucket-backend
pm2 logs storage-bucket-frontend

# Restart services
pm2 restart storage-bucket-backend
pm2 restart storage-bucket-frontend

# Stop services
pm2 stop storage-bucket-backend
pm2 stop storage-bucket-frontend

# Delete services
pm2 delete storage-bucket-backend
pm2 delete storage-bucket-frontend

# Monitor resources
pm2 monit

# Save current PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command
```

---

### Method 2: Systemd Services

Systemd is a system and service manager for Linux operating systems.

#### Install Service Files

```bash
# Copy service files
sudo cp deployment/storage-bucket-backend.service /etc/systemd/system/
sudo cp deployment/storage-bucket-frontend.service /etc/systemd/system/

# Edit service files if needed (update paths, user, etc.)
sudo nano /etc/systemd/system/storage-bucket-backend.service
sudo nano /etc/systemd/system/storage-bucket-frontend.service

# Reload systemd
sudo systemctl daemon-reload
```

#### Start Services

```bash
# Enable services to start on boot
sudo systemctl enable storage-bucket-backend
sudo systemctl enable storage-bucket-frontend

# Start services
sudo systemctl start storage-bucket-backend
sudo systemctl start storage-bucket-frontend

# Check status
sudo systemctl status storage-bucket-backend
sudo systemctl status storage-bucket-frontend
```

#### Systemd Management Commands

```bash
# Restart services
sudo systemctl restart storage-bucket-backend
sudo systemctl restart storage-bucket-frontend

# Stop services
sudo systemctl stop storage-bucket-backend
sudo systemctl stop storage-bucket-frontend

# View logs
sudo journalctl -u storage-bucket-backend -f
sudo journalctl -u storage-bucket-frontend -f
```

---

## Nginx Reverse Proxy Setup

Using nginx as a reverse proxy provides SSL termination, load balancing, and better performance.

### Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Configure Nginx

```bash
# Copy the configuration file
sudo cp deployment/nginx.conf /etc/nginx/sites-available/storage-bucket

# Edit the configuration
sudo nano /etc/nginx/sites-available/storage-bucket
# Update: server_name, SSL paths, and any other settings

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/storage-bucket /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Nginx Configuration Highlights

The provided `deployment/nginx.conf` includes:

- **Reverse proxy** for frontend (port 3200) and backend (port 3201)
- **Large file upload support** (100MB default, adjustable)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **SSL/TLS configuration template** (commented out, ready to enable)
- **Alternative subdomain setup** (optional configuration)

---

## SSL/TLS Configuration

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# OR
sudo yum install certbot python3-certbot-nginx  # CentOS/RHEL

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically update your nginx configuration
# Test automatic renewal
sudo certbot renew --dry-run
```

### Manual SSL Configuration

If you have your own SSL certificates:

1. Place certificates in a secure location (e.g., `/etc/ssl/certs/`)
2. Update nginx configuration:

```nginx
ssl_certificate /path/to/your/fullchain.pem;
ssl_certificate_key /path/to/your/privkey.pem;
```

3. Uncomment SSL-related lines in `deployment/nginx.conf`
4. Reload nginx: `sudo systemctl reload nginx`

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If NOT using nginx, allow application ports
# sudo ufw allow 3200/tcp
# sudo ufw allow 3201/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. File Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/storage-bucket

# Set directory permissions
find /var/www/storage-bucket -type d -exec chmod 755 {} \;

# Set file permissions
find /var/www/storage-bucket -type f -exec chmod 644 {} \;

# Make scripts executable
chmod +x /var/www/storage-bucket/backend/index.js

# Secure uploads directory
chmod 755 /var/www/storage-bucket/backend/uploads
```

### 3. Environment Variables Security

```bash
# Ensure .env files are not world-readable
chmod 600 /var/www/storage-bucket/backend/.env
chmod 600 /var/www/storage-bucket/frontend/.env
chmod 600 /var/www/storage-bucket/frontend/.env.local
```

### 4. Database Security

```bash
# Secure database file
chmod 600 /var/www/storage-bucket/backend/storage.db
chown www-data:www-data /var/www/storage-bucket/backend/storage.db
```

### 5. Regular Updates

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade  # Ubuntu/Debian
sudo yum update  # CentOS/RHEL

# Update Node.js dependencies
cd /var/www/storage-bucket
npm audit
npm audit fix
```

### 6. Additional Security Measures

- **Change default credentials**: Update the default admin/admin login
- **Use strong NextAuth secret**: Generate with `openssl rand -base64 32`
- **Enable CORS properly**: Set `CORS_ORIGINS` to your specific domain
- **Set TRUST_PROXY=true**: When behind nginx/apache
- **Implement rate limiting**: Already configured in backend
- **Regular backups**: See [Backup and Maintenance](#backup-and-maintenance)

---

## Monitoring and Logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# View specific service logs
pm2 logs storage-bucket-backend --lines 100

# Flush logs
pm2 flush
```

### Systemd Logs

```bash
# View backend logs
sudo journalctl -u storage-bucket-backend -f

# View frontend logs
sudo journalctl -u storage-bucket-frontend -f

# View logs from last hour
sudo journalctl -u storage-bucket-backend --since "1 hour ago"
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/storage-bucket-access.log

# Error logs
sudo tail -f /var/log/nginx/storage-bucket-error.log
```

### Application Health Check

```bash
# Check backend health
curl http://localhost:3201/health

# Check backend stats
curl http://localhost:3201/stats

# Check if services are listening
sudo netstat -tlnp | grep -E '3200|3201'
```

---

## Backup and Maintenance

### Database Backup

```bash
# Create backup script
cat > /var/www/storage-bucket/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/storage-bucket"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/storage-bucket/backend/storage.db $BACKUP_DIR/storage_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/storage-bucket/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "storage_*.db" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/storage-bucket/backup.sh
```

### Automated Backups with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/storage-bucket/backup.sh >> /var/log/storage-bucket-backup.log 2>&1
```

### Restore from Backup

```bash
# Stop services
pm2 stop all  # or sudo systemctl stop storage-bucket-*

# Restore database
cp /var/backups/storage-bucket/storage_YYYYMMDD_HHMMSS.db /var/www/storage-bucket/backend/storage.db

# Restore uploads
tar -xzf /var/backups/storage-bucket/uploads_YYYYMMDD_HHMMSS.tar.gz -C /

# Restart services
pm2 restart all  # or sudo systemctl start storage-bucket-*
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3201
sudo lsof -i :3201
# or
sudo netstat -tlnp | grep 3201

# Kill the process
sudo kill -9 <PID>
```

### Permission Denied Errors

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/storage-bucket

# Fix permissions
sudo chmod -R 755 /var/www/storage-bucket
```

### Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:3201/health`
2. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env`
3. Check CORS settings in `backend/.env`
4. Review nginx proxy configuration if using reverse proxy

### Database Locked Error

```bash
# Check if multiple processes are accessing the database
ps aux | grep node

# Stop all instances
pm2 stop all

# Restart services one by one
pm2 start storage-bucket-backend
pm2 start storage-bucket-frontend
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart services to free memory
pm2 restart all

# Adjust max_memory_restart in ecosystem.config.js if needed
```

### SSL Certificate Issues

```bash
# Test SSL certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

### Application Crashes on Startup

```bash
# Check logs
pm2 logs storage-bucket-backend --lines 50
pm2 logs storage-bucket-frontend --lines 50

# Common issues:
# - Missing .env file
# - Invalid environment variables
# - Port already in use
# - Missing dependencies (run npm install)
# - Database file permissions
```

---

## Additional Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Check the main [README.md](README.md) for application features
4. Consult the [SETUP.md](SETUP.md) for initial setup

---

**Last Updated**: 2025-11-28
