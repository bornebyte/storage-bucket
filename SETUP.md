# Storage Bucket - Quick Setup Guide

This guide will help you quickly set up the Storage Bucket application on your local machine or server.

## 📋 Table of Contents

- [For New Users (First Time Setup)](#for-new-users-first-time-setup)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Environment Configuration](#environment-configuration)
- [Common Issues](#common-issues)

---

## For New Users (First Time Setup)

### 1. Clone the Repository

```bash
git clone <repository-url> storage-bucket
cd storage-bucket
```

### 2. Install Dependencies

The application has three levels of dependencies: root, backend, and frontend.

```bash
# Install all dependencies at once
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

Or use this one-liner:

```bash
npm install && (cd backend && npm install) && (cd frontend && npm install)
```

### 3. Configure Environment Variables

**Backend Configuration:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` if you want to change default settings. The defaults work fine for development.

**Frontend Configuration:**

```bash
cd frontend
cp .env.example .env
cp .env.local.example .env.local
```

Edit `frontend/.env.local` and set a secure NextAuth secret:

```bash
# Generate a random secret
openssl rand -base64 32

# Add it to .env.local
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=http://localhost:3200
```

### 4. Start the Application

From the root directory:

```bash
npm run dev
```

This will start both the backend (port 3201) and frontend (port 3200) concurrently.

### 5. Access the Application

- **Frontend**: http://localhost:3200
- **Backend API**: http://localhost:3201
- **Default Login**: username: `admin`, password: `admin`

**🎉 You're all set!** Start uploading files and exploring the features.

---

## Development Setup

### Prerequisites

- **Node.js** >= 14.0.0 (recommended: 18.x or 20.x LTS)
- **npm** (comes with Node.js)
- **Git**

### Quick Start

```bash
# Clone and navigate
git clone <repository-url> storage-bucket
cd storage-bucket

# Install dependencies
npm install && (cd backend && npm install) && (cd frontend && npm install)

# Setup environment files
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env && cp .env.local.example .env.local && cd ..

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> frontend/.env.local
echo "NEXTAUTH_URL=http://localhost:3200" >> frontend/.env.local

# Start development servers
npm run dev
```

### Development Ports

- **Frontend**: http://localhost:3200
- **Backend**: http://localhost:3201

### Running Services Separately

If you prefer to run services in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
PORT=3201 npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
PORT=3200 npm run dev
```

---

## Production Setup

For production deployment, please refer to the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide.

### Quick Production Checklist

1. ✅ Clone repository to production server
2. ✅ Install dependencies
3. ✅ Configure environment variables (use production values)
4. ✅ Build frontend: `cd frontend && npm run build`
5. ✅ Choose deployment method (PM2 or systemd)
6. ✅ Configure nginx reverse proxy (optional but recommended)
7. ✅ Set up SSL/TLS certificates
8. ✅ Configure firewall
9. ✅ Set up automated backups
10. ✅ Test the deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Environment Configuration

### Backend Environment Variables

Located in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3201 | Backend server port |
| `NODE_ENV` | development | Environment mode |
| `HOST` | 0.0.0.0 | Server host |
| `UPLOAD_DIR` | ./uploads | Upload directory path |
| `MAX_FILE_SIZE` | 104857600 | Max file size (100MB) |
| `MAX_FILES_PER_UPLOAD` | 10 | Max files per upload |
| `DB_PATH` | ./storage.db | SQLite database path |
| `CORS_ORIGINS` | * | Allowed CORS origins |
| `TRUST_PROXY` | false | Enable if behind proxy |
| `LOG_LEVEL` | info | Logging level |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

### Frontend Environment Variables

**`frontend/.env`:**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | http://localhost:3201 | Backend API URL |

**`frontend/.env.local`:**

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | NextAuth encryption secret |
| `NEXTAUTH_URL` | Yes | Frontend URL |

---

## Common Issues

### Port Already in Use

**Problem**: Error: `EADDRINUSE: address already in use :::3200` or `:::3201`

**Solution**:
```bash
# Find process using the port
lsof -i :3200  # or :3201

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3300 npm run dev
```

### Dependencies Installation Failed

**Problem**: npm install errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install && (cd backend && npm install) && (cd frontend && npm install)
```

### Frontend Can't Connect to Backend

**Problem**: API calls failing, CORS errors

**Solution**:
1. Verify backend is running: `curl http://localhost:3201/health`
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env`
3. Ensure CORS is configured correctly in `backend/.env`

### Database Locked

**Problem**: SQLite database locked error

**Solution**:
```bash
# Stop all running instances
pkill -f "node.*index.js"
pkill -f "next"

# Restart services
npm run dev
```

### NextAuth Configuration Error

**Problem**: NextAuth errors on startup

**Solution**:
1. Ensure `frontend/.env.local` exists
2. Generate a new secret: `openssl rand -base64 32`
3. Add to `.env.local`:
   ```
   NEXTAUTH_SECRET=<your-secret>
   NEXTAUTH_URL=http://localhost:3200
   ```

### File Upload Fails

**Problem**: Files fail to upload

**Solution**:
1. Check `backend/uploads` directory exists and is writable
2. Verify file size is within `MAX_FILE_SIZE` limit
3. Check backend logs for errors
4. Ensure sufficient disk space

---

## Project Structure

```
storage-bucket/
├── backend/                 # Express.js backend
│   ├── uploads/            # File storage (created automatically)
│   ├── index.js            # Main server file
│   ├── ecosystem.config.js # PM2 configuration
│   ├── .env.example        # Environment template
│   ├── storage.db          # SQLite database (created automatically)
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   ├── public/            # Static assets
│   ├── ecosystem.config.js # PM2 configuration
│   ├── .env.example       # Environment template
│   ├── .env.local.example # NextAuth secrets template
│   └── package.json
├── deployment/            # Deployment configurations
│   ├── nginx.conf         # Nginx reverse proxy config
│   ├── storage-bucket-backend.service   # Systemd backend
│   └── storage-bucket-frontend.service  # Systemd frontend
├── DEPLOYMENT.md          # Production deployment guide
├── SETUP.md              # This file
├── README.md             # Project overview
└── package.json          # Root package file
```

---

## Next Steps

After setup:

1. **Explore the Application**: Upload files, try search and filters, preview files
2. **Read the Documentation**: Check [README.md](README.md) for features
3. **Customize**: Modify environment variables for your needs
4. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

---

## Getting Help

- **Features**: See [README.md](README.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation**: Visit http://localhost:3201 when backend is running

---

**Happy coding! 🚀**
