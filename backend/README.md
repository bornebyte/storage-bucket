# 🗂️ Local Storage Bucket API

A production-ready, self-hosted file storage API built with Node.js, Express, and SQLite. Upload, manage, and retrieve files with a simple REST API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

## ✨ Features

- 📤 **Single & Multiple File Uploads** - Upload one or multiple files in a single request
- 💾 **SQLite Database** - Lightweight database for metadata storage
- 🔐 **Security** - Helmet.js, rate limiting, and input validation
- 🗜️ **Compression** - Automatic response compression for better performance
- 📊 **Storage Statistics** - Track file counts, sizes, and types
- 🔍 **File Management** - List, download, and delete files via REST API
- 🏥 **Health Checks** - Built-in health check endpoint
- 📝 **Comprehensive Logging** - Detailed logging with configurable levels
- 🌐 **CORS Support** - Configurable cross-origin resource sharing
- ⚙️ **Environment Configuration** - Easy configuration via .env file

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bornebyte/storage-bucket.git
   cd storage-bucket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm run prod
   ```

The server will start at `http://localhost:3000` by default.

## 📋 Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as a template):

```env
# Server Configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Storage Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB in bytes
MAX_FILES_PER_UPLOAD=10

# Database
DB_PATH=./storage.db

# CORS
CORS_ORIGINS=*  # Or specific origins: https://example.com,https://app.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
TRUST_PROXY=false  # Set to true if behind nginx/apache

# Logging
LOG_LEVEL=info  # Options: error, warn, info, debug
```

## 📡 API Endpoints

### Health & Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API documentation |
| `GET` | `/health` | Health check |

### File Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload a single file |
| `POST` | `/upload-multiple` | Upload multiple files |
| `GET` | `/files` | List all files (paginated) |
| `GET` | `/file/:id` | Get file metadata |
| `GET` | `/download/:id` | Download file |
| `DELETE` | `/file/:id` | Delete file |
| `GET` | `/stats` | Get storage statistics |

### API Examples

#### Upload a Single File

```bash
curl -X POST -F 'file=@/path/to/file.jpg' http://localhost:3000/upload
```

Response:
```json
{
  "success": true,
  "file": {
    "id": 1,
    "filename": "file-1234567890-123456789.jpg",
    "originalName": "file.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "hash": "a1b2c3d4...",
    "uploadDate": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Upload Multiple Files

```bash
curl -X POST \
  -F 'files=@file1.jpg' \
  -F 'files=@file2.pdf' \
  -F 'files=@file3.mp4' \
  http://localhost:3000/upload-multiple
```

#### List Files

```bash
curl "http://localhost:3000/files?page=1&limit=10"
```

#### Download File

```bash
curl -O -J http://localhost:3000/download/1
```

#### Delete File

```bash
curl -X DELETE http://localhost:3000/file/1
```

#### Get Statistics

```bash
curl http://localhost:3000/stats
```

## 🔒 Production Deployment

### Option 1: PM2 Process Manager (Recommended)

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**
   ```bash
   npm run pm2:start
   ```

3. **Other PM2 commands**
   ```bash
   npm run pm2:stop      # Stop the app
   npm run pm2:restart   # Restart the app
   npm run pm2:logs      # View logs
   npm run pm2:delete    # Remove from PM2
   ```

4. **Setup PM2 to start on boot**
   ```bash
   pm2 startup
   pm2 save
   ```

### Option 2: Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t storage-bucket .
   ```

2. **Run with Docker**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v $(pwd)/uploads:/app/uploads \
     -v $(pwd)/storage.db:/app/storage.db \
     --name storage-bucket \
     storage-bucket
   ```

3. **Or use Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Option 3: Nginx Reverse Proxy

See `nginx.conf.example` for a complete nginx configuration example.

Basic nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Development

### Project Structure

```
storage-bucket/
├── index.js              # Main application file
├── client.html           # Web client interface
├── package.json          # Dependencies and scripts
├── .env.example          # Environment configuration template
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── ecosystem.config.js  # PM2 configuration
├── nginx.conf.example   # Nginx configuration example
├── uploads/             # Upload directory (created automatically)
└── storage.db           # SQLite database (created automatically)
```

### Available Scripts

```bash
npm start          # Start server in production mode
npm run dev        # Start server with nodemon (auto-reload)
npm run prod       # Start server with NODE_ENV=production
npm run pm2:start  # Start with PM2
npm run pm2:stop   # Stop PM2 process
npm run pm2:restart # Restart PM2 process
npm run pm2:logs   # View PM2 logs
```

## 📊 Logging

The application includes comprehensive logging with different levels:

- `error` - Error messages only
- `warn` - Warnings and errors
- `info` - General information, warnings, and errors (default)
- `debug` - Detailed debug information

Set the `LOG_LEVEL` environment variable to control verbosity.

## 🔐 Security Features

- **Helmet.js** - Sets security-related HTTP headers
- **Rate Limiting** - Prevents abuse by limiting requests per IP
- **File Type Validation** - Configurable file type restrictions
- **File Size Limits** - Configurable maximum file size
- **Input Sanitization** - Validates all inputs
- **CORS Configuration** - Configurable cross-origin policies

## 🧪 Testing with Thunder Client / Postman

Import the API collection from the project documentation. All endpoints are documented with example requests and responses.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Use Cases

- Personal file storage server
- Team file sharing
- Backup storage for applications
- Media library for web applications
- Document management system
- Mobile app backend storage

## ⚠️ Important Notes

- **Data Backup**: Regularly backup your `uploads/` directory and `storage.db` file
- **File Size**: Adjust `MAX_FILE_SIZE` based on your server capacity
- **Security**: In production, always use HTTPS and configure CORS appropriately
- **Storage**: Monitor disk space usage, especially for large file uploads
- **Database**: Consider migrating to PostgreSQL/MySQL for high-traffic scenarios

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Permission Denied
```bash
# Ensure uploads directory is writable
chmod 755 uploads
```

### Database Locked
SQLite can have lock issues under high concurrency. Consider:
- Using connection pooling
- Migrating to PostgreSQL/MySQL for production

## 📞 Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/bornebyte/storage-bucket).

---

Made with ❤️ by [bornebyte](https://github.com/bornebyte)
