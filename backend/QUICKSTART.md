# 🚀 Quick Start Guide

Get your Storage Bucket API up and running in 5 minutes!

## Prerequisites

- Node.js 14+ installed
- Git installed (optional)
- 10 GB+ free disk space

## Installation

### 1. Get the Code

```bash
# Clone the repository
git clone https://github.com/bornebyte/storage-bucket.git
cd storage-bucket

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# The defaults work fine for development!
# Edit .env only if you need to change ports or limits
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:

```
🚀 Local Storage Bucket API Server - PRODUCTION
============================================================
📡 Server running on: http://192.168.1.100:3000
🏠 Localhost: http://localhost:3000
✨ Ready to accept file uploads!
```

## Test It Out!

### Upload a File

```bash
# Replace 'test.jpg' with your file
curl -X POST -F 'file=@test.jpg' http://localhost:3000/upload
```

### List Files

```bash
curl http://localhost:3000/files
```

### View in Browser

1. Open your browser
2. Go to `http://localhost:3000`
3. See the API documentation
4. Or open `client.html` for a web interface

## What's Next?

### For Development

- Edit files and the server will auto-reload (in dev mode)
- Check logs in the terminal
- Use the client.html for easy testing

### For Production

See the [Deployment Guide](DEPLOYMENT.md) for:
- PM2 process management
- Docker deployment
- Nginx reverse proxy
- SSL/HTTPS setup

## Common Commands

```bash
# Development
npm run dev              # Start with auto-reload

# Production
npm start                # Start normally
npm run prod            # Start with NODE_ENV=production

# PM2 (production process manager)
npm run pm2:start       # Start with PM2
npm run pm2:logs        # View logs
npm run pm2:restart     # Restart
npm run pm2:stop        # Stop
```

## Configuration

### Change Port

Edit `.env`:
```env
PORT=8080
```

### Increase File Size Limit

Edit `.env`:
```env
MAX_FILE_SIZE=524288000  # 500MB in bytes
```

### Enable Debug Logging

Edit `.env`:
```env
LOG_LEVEL=debug
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Change port in .env file
PORT=3001
```

### Permission Errors

```bash
# Fix upload directory permissions
chmod 755 uploads
```

### Database Locked

```bash
# Stop the server and restart
# Press Ctrl+C to stop
npm start
```

## File Structure

```
storage-bucket/
├── index.js           # Main server file
├── client.html        # Web interface
├── .env              # Your configuration
├── uploads/          # Uploaded files stored here
└── storage.db        # SQLite database
```

## API Endpoints

- `POST /upload` - Upload file
- `POST /upload-multiple` - Upload multiple files
- `GET /files` - List all files
- `GET /file/:id` - Get file info
- `GET /download/:id` - Download file
- `DELETE /file/:id` - Delete file
- `GET /stats` - Storage statistics
- `GET /health` - Health check

## Need Help?

- 📖 [Full API Documentation](API_DOCUMENTATION.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 📝 [README](README.md)
- 🐛 [Report Issues](https://github.com/bornebyte/storage-bucket/issues)

---

Happy coding! 🎉
