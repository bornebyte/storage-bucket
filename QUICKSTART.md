# Production Deployment - Quick Reference

## 🎯 What Was Done

✅ **Ports Changed**: Frontend → 3200, Backend → 3201  
✅ **Environment Files**: Created `.env.example` templates  
✅ **Production Configs**: PM2, systemd, nginx ready  
✅ **Documentation**: DEPLOYMENT.md, SETUP.md, updated README.md  

---

## 🚀 Quick Start (Development)

```bash
# 1. Copy environment files
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env && cp .env.local.example .env.local && cd ..

# 2. Generate NextAuth secret
openssl rand -base64 32
# Add to frontend/.env.local as NEXTAUTH_SECRET

# 3. Start the app
npm run dev

# 4. Access
# Frontend: http://localhost:3200
# Backend: http://localhost:3201
# Login: admin / admin
```

---

## 📦 Production Deployment

See **[DEPLOYMENT.md](file:///home/shubham/dev/storage-bucket/DEPLOYMENT.md)** for complete guide.

Quick production start:
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Start with PM2
cd backend && pm2 start ecosystem.config.js --env production
cd ../frontend && pm2 start ecosystem.config.js --env production
```

---

## 📚 Documentation

- **[SETUP.md](file:///home/shubham/dev/storage-bucket/SETUP.md)** - Quick setup for new users
- **[DEPLOYMENT.md](file:///home/shubham/dev/storage-bucket/DEPLOYMENT.md)** - Complete production guide
- **[README.md](file:///home/shubham/dev/storage-bucket/README.md)** - Project overview

---

## 🔧 Key Files

**Configuration:**
- `backend/.env.example` - Backend environment template
- `frontend/.env.example` - Frontend environment template
- `frontend/.env.local.example` - NextAuth secrets template

**Deployment:**
- `deployment/nginx.conf` - Nginx reverse proxy
- `deployment/storage-bucket-backend.service` - Systemd backend
- `deployment/storage-bucket-frontend.service` - Systemd frontend
- `backend/ecosystem.config.js` - PM2 backend config
- `frontend/ecosystem.config.js` - PM2 frontend config

---

## ⚡ Important Notes

1. **Ports**: 3200 (frontend), 3201 (backend) - ensure they're available
2. **Environment**: Copy `.env.example` to `.env` and configure
3. **NextAuth Secret**: Generate with `openssl rand -base64 32`
4. **Production**: Always build frontend before deploying
5. **Security**: Review DEPLOYMENT.md security section

---

**Ready to deploy!** 🎉
