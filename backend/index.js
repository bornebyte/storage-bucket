require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
const os = require('os');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10;
const DB_PATH = process.env.DB_PATH || './storage.db';

// Configure trust proxy if behind reverse proxy
if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
    console.log('✅ Trust proxy enabled');
}

// Logging helper
const log = {
    info: (message, ...args) => {
        if (['info', 'debug'].includes(process.env.LOG_LEVEL)) {
            console.log(`[INFO] [${new Date().toISOString()}]`, message, ...args);
        }
    },
    warn: (message, ...args) => {
        if (['warn', 'info', 'debug'].includes(process.env.LOG_LEVEL || 'info')) {
            console.warn(`[WARN] [${new Date().toISOString()}]`, message, ...args);
        }
    },
    error: (message, ...args) => {
        console.error(`[ERROR] [${new Date().toISOString()}]`, message, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.log(`[DEBUG] [${new Date().toISOString()}]`, message, ...args);
        }
    }
};

console.log('\n🚀 Starting Local Storage Bucket API...');
console.log(`📋 Environment: ${NODE_ENV}`);
console.log(`🔧 Configuration loaded from environment variables`);

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    log.info(`📁 Created uploads directory: ${uploadsDir}`);
} else {
    log.info(`📁 Using existing uploads directory: ${uploadsDir}`);
}

// Initialize SQLite database
log.info(`💾 Initializing database: ${DB_PATH}`);
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        log.error('Failed to connect to database:', err);
        process.exit(1);
    }
    log.info('✅ Database connection established');
});

// Create files table if it doesn't exist
db.serialize(() => {
    log.info('🔨 Setting up database schema...');
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            file_hash TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            log.error('Failed to create files table:', err);
        } else {
            log.info('✅ Database schema ready');
        }
    });
});

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp and random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        log.debug(`File filter check: ${file.originalname} (${file.mimetype})`);
        // Accept all file types for this example
        cb(null, true);
    }
});

log.info(`📤 Upload configuration:`);
log.info(`   Max file size: ${formatBytes(MAX_FILE_SIZE)}`);
log.info(`   Max files per upload: ${MAX_FILES_PER_UPLOAD}`);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
log.info('🔒 Security headers enabled (helmet)');

// Compression middleware
app.use(compression());
log.info('🗜️  Response compression enabled');

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        log.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
});
// app.use(limiter);
log.info('🚦 Rate limiting enabled');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to calculate file hash
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

// CORS middleware for API access
const corsOrigins = process.env.CORS_ORIGINS || '*';
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOrigins);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
log.info(`🌐 CORS enabled for origins: ${corsOrigins}`);

// API Documentation endpoint
app.get('/', (req, res) => {
    log.info(`📖 API documentation requested from ${req.ip}`);
    res.json({
        name: "Local Storage Bucket API",
        version: "1.0.0",
        description: "A local file storage API for uploading, managing, and retrieving files",
        endpoints: {
            "POST /upload": {
                description: "Upload a single file",
                body: "multipart/form-data with 'file' field",
                example: "curl -X POST -F 'file=@example.jpg' http://localhost:3000/upload"
            },
            "POST /upload-multiple": {
                description: "Upload multiple files",
                body: "multipart/form-data with 'files' field (array)",
                example: "curl -X POST -F 'files=@file1.jpg' -F 'files=@file2.pdf' http://localhost:3000/upload-multiple"
            },
            "GET /files": {
                description: "List all files with pagination",
                parameters: "?page=1&limit=10",
                example: "curl http://localhost:3000/files?page=1&limit=5"
            },
            "GET /file/:id": {
                description: "Get file metadata by ID",
                example: "curl http://localhost:3000/file/1"
            },
            "GET /download/:id": {
                description: "Download file by ID",
                example: "curl -O -J http://localhost:3000/download/1"
            },
            "DELETE /file/:id": {
                description: "Delete file by ID",
                example: "curl -X DELETE http://localhost:3000/file/1"
            },
            "GET /stats": {
                description: "Get storage statistics",
                example: "curl http://localhost:3000/stats"
            },
            "GET /health": {
                description: "Health check endpoint",
                example: "curl http://localhost:3000/health"
            }
        },
        usage: {
            "Upload with curl": "curl -X POST -F 'file=@/path/to/your/file.jpg' http://${localIpAddress}:3000/upload",
            "Upload with JavaScript fetch": `
                fetch('http://${localIpAddress}:3000/upload', {
                method: 'POST',
                body: formData
            }).then(response => response.json())`,
            "Upload with Python requests": `
            import requests
            files = {'file': open('example.jpg', 'rb')}
            response = requests.post('http://${localIpAddress}:3000/upload', files=files)`
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    log.debug(`Health check requested from ${req.ip}`);
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: NODE_ENV
    });
});

// Routes

// Upload single file
app.post('/upload', upload.single('file'), async (req, res) => {
    const startTime = Date.now();
    try {
        if (!req.file) {
            log.warn(`Upload failed: No file provided from ${req.ip}`);
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        log.info(`📤 Processing upload: ${file.originalname} (${formatBytes(file.size)}) from ${req.ip}`);

        const fileHash = await calculateFileHash(file.path);
        log.debug(`Calculated hash for ${file.originalname}: ${fileHash}`);

        // Store file info in database
        db.run(`
            INSERT INTO files (filename, original_name, file_path, file_size, mime_type, file_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            file.filename,
            file.originalname,
            file.path,
            file.size,
            file.mimetype,
            fileHash
        ], function (err) {
            if (err) {
                log.error('Database error during file upload:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const duration = Date.now() - startTime;
            log.info(`✅ Upload successful: ${file.originalname} (ID: ${this.lastID}) in ${duration}ms`);

            res.json({
                success: true,
                file: {
                    id: this.lastID,
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    hash: fileHash,
                    uploadDate: new Date().toISOString()
                }
            });
        });
    } catch (error) {
        log.error('Upload failed with error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// Upload multiple files
app.post('/upload-multiple', upload.array('files', MAX_FILES_PER_UPLOAD), async (req, res) => {
    const startTime = Date.now();
    try {
        if (!req.files || req.files.length === 0) {
            log.warn(`Multiple upload failed: No files provided from ${req.ip}`);
            return res.status(400).json({ error: 'No files uploaded' });
        }

        log.info(`📤 Processing ${req.files.length} files upload from ${req.ip}`);
        const uploadedFiles = [];

        for (const file of req.files) {
            log.debug(`Processing: ${file.originalname} (${formatBytes(file.size)})`);
            const fileHash = await calculateFileHash(file.path);

            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO files (filename, original_name, file_path, file_size, mime_type, file_hash)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    file.filename,
                    file.originalname,
                    file.path,
                    file.size,
                    file.mimetype,
                    fileHash
                ], function (err) {
                    if (err) {
                        log.error(`Failed to save file ${file.originalname}:`, err);
                        reject(err);
                    } else {
                        uploadedFiles.push({
                            id: this.lastID,
                            filename: file.filename,
                            originalName: file.originalname,
                            size: file.size,
                            mimeType: file.mimetype,
                            hash: fileHash
                        });
                        resolve();
                    }
                });
            });
        }

        const duration = Date.now() - startTime;
        log.info(`✅ Multiple upload successful: ${uploadedFiles.length} files in ${duration}ms`);

        res.json({
            success: true,
            files: uploadedFiles,
            count: uploadedFiles.length
        });
    } catch (error) {
        log.error('Multiple upload failed with error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// Get file by ID
app.get('/file/:id', (req, res) => {
    const fileId = req.params.id;
    log.debug(`File metadata requested: ID ${fileId} from ${req.ip}`);

    db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, row) => {
        if (err) {
            log.error(`Database error fetching file ${fileId}:`, err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            log.warn(`File not found: ID ${fileId}`);
            return res.status(404).json({ error: 'File not found' });
        }

        log.info(`✅ File metadata retrieved: ${row.original_name} (ID: ${fileId})`);
        res.json({
            id: row.id,
            filename: row.filename,
            originalName: row.original_name,
            size: row.file_size,
            mimeType: row.mime_type,
            uploadDate: row.upload_date,
            hash: row.file_hash
        });
    });
});

// Download file by ID
app.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
    log.info(`📥 Download requested: ID ${fileId} from ${req.ip}`);

    db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, row) => {
        if (err) {
            log.error(`Database error during download for file ${fileId}:`, err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            log.warn(`Download failed: File not found (ID: ${fileId})`);
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = row.file_path;

        if (!fs.existsSync(filePath)) {
            log.error(`File exists in DB but not on disk: ${filePath} (ID: ${fileId})`);
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${row.original_name}"`);
        res.setHeader('Content-Type', row.mime_type);

        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (streamErr) => {
            log.error(`File stream error for ${filePath}:`, streamErr);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to read file' });
            }
        });

        fileStream.on('end', () => {
            log.info(`✅ Download completed: ${row.original_name} (ID: ${fileId})`);
        });

        fileStream.pipe(res);
    });
});

// List all files with pagination and filtering
app.get('/files', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filter parameters
    const search = req.query.search || '';
    const type = req.query.type || '';
    const minSize = parseInt(req.query.minSize) || 0;
    const maxSize = parseInt(req.query.maxSize) || Number.MAX_SAFE_INTEGER;
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    log.debug(`Files list requested: page=${page}, limit=${limit}, search=${search}, type=${type} from ${req.ip}`);

    // Build query
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
        whereClause += ' AND (original_name LIKE ? OR filename LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
        whereClause += ' AND mime_type LIKE ?';
        params.push(`%${type}%`);
    }

    if (minSize > 0) {
        whereClause += ' AND file_size >= ?';
        params.push(minSize);
    }

    if (maxSize < Number.MAX_SAFE_INTEGER) {
        whereClause += ' AND file_size <= ?';
        params.push(maxSize);
    }

    if (startDate) {
        whereClause += ' AND upload_date >= ?';
        params.push(startDate);
    }

    if (endDate) {
        whereClause += ' AND upload_date <= ?';
        params.push(endDate);
    }

    // Get total count
    db.get(`SELECT COUNT(*) as count FROM files ${whereClause}`, params, (err, countRow) => {
        if (err) {
            log.error('Database error counting files:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Get paginated files
        db.all(`
            SELECT id, filename, original_name, file_size, mime_type, upload_date, file_hash
            FROM files 
            ${whereClause}
            ORDER BY upload_date DESC 
            LIMIT ? OFFSET ?
        `, [...params, limit, offset], (err, rows) => {
            if (err) {
                log.error('Database error fetching files:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const files = rows.map(row => ({
                id: row.id,
                filename: row.filename,
                originalName: row.original_name,
                size: row.file_size,
                mimeType: row.mime_type,
                uploadDate: row.upload_date,
                hash: row.file_hash
            }));

            log.info(`✅ Files list retrieved: ${files.length} files (page ${page}/${Math.ceil(countRow.count / limit)})`);

            res.json({
                files,
                pagination: {
                    page,
                    limit,
                    total: countRow.count,
                    totalPages: Math.ceil(countRow.count / limit)
                }
            });
        });
    });
});

// Rename file
app.put('/file/:id', (req, res) => {
    const fileId = req.params.id;
    const { newName } = req.body;

    if (!newName) {
        return res.status(400).json({ error: 'New name is required' });
    }

    log.info(`📝 Rename requested: ID ${fileId} to "${newName}" from ${req.ip}`);

    db.run('UPDATE files SET original_name = ? WHERE id = ?', [newName, fileId], function (err) {
        if (err) {
            log.error(`Database error during rename for file ${fileId}:`, err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            log.warn(`Rename failed: File not found (ID: ${fileId})`);
            return res.status(404).json({ error: 'File not found' });
        }

        log.info(`✅ File renamed successfully: ID ${fileId} -> "${newName}"`);
        res.json({
            success: true,
            message: 'File renamed successfully',
            newName
        });
    });
});

// Preview file (inline view)
app.get('/preview/:id', (req, res) => {
    const fileId = req.params.id;
    log.debug(`👀 Preview requested: ID ${fileId} from ${req.ip}`);

    db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, row) => {
        if (err) {
            log.error(`Database error during preview for file ${fileId}:`, err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = row.file_path;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        // Set headers for inline viewing
        res.setHeader('Content-Disposition', `inline; filename="${row.original_name}"`);
        res.setHeader('Content-Type', row.mime_type);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});

// Delete file by ID
app.delete('/file/:id', (req, res) => {
    const fileId = req.params.id;
    log.info(`🗑️  Delete requested: ID ${fileId} from ${req.ip}`);

    db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, row) => {
        if (err) {
            log.error(`Database error during delete for file ${fileId}:`, err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            log.warn(`Delete failed: File not found (ID: ${fileId})`);
            return res.status(404).json({ error: 'File not found' });
        }

        const fileName = row.original_name;

        // Delete file from disk
        if (fs.existsSync(row.file_path)) {
            try {
                fs.unlinkSync(row.file_path);
                log.debug(`Deleted file from disk: ${row.file_path}`);
            } catch (unlinkErr) {
                log.error(`Failed to delete file from disk: ${row.file_path}`, unlinkErr);
            }
        } else {
            log.warn(`File not found on disk during delete: ${row.file_path}`);
        }

        // Delete from database
        db.run('DELETE FROM files WHERE id = ?', [fileId], function (err) {
            if (err) {
                log.error(`Failed to delete file ${fileId} from database:`, err);
                return res.status(500).json({ error: 'Database error' });
            }

            log.info(`✅ File deleted successfully: ${fileName} (ID: ${fileId})`);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        });
    });
});

// Get storage statistics
app.get('/stats', (req, res) => {
    log.debug(`Storage stats requested from ${req.ip}`);

    db.all(`
        SELECT 
            COUNT(*) as total_files,
            SUM(file_size) as total_size,
            AVG(file_size) as avg_size,
            mime_type,
            COUNT(*) as count_by_type
        FROM files 
        GROUP BY mime_type
    `, (err, rows) => {
        if (err) {
            log.error('Database error fetching stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.get('SELECT COUNT(*) as total, SUM(file_size) as size FROM files', (err, totalRow) => {
            if (err) {
                log.error('Database error fetching total stats:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            log.info(`✅ Stats retrieved: ${totalRow.total} files, ${formatBytes(totalRow.size || 0)}`);

            res.json({
                totalFiles: totalRow.total,
                totalSize: totalRow.size,
                totalSizeFormatted: formatBytes(totalRow.size || 0),
                filesByType: rows.map(row => ({
                    mimeType: row.mime_type,
                    count: row.count_by_type
                }))
            });
        });
    });
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            log.warn(`File size limit exceeded from ${req.ip}: ${error.message}`);
            return res.status(400).json({
                error: 'File too large',
                maxSize: formatBytes(MAX_FILE_SIZE)
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            log.warn(`File count limit exceeded from ${req.ip}`);
            return res.status(400).json({
                error: 'Too many files',
                maxFiles: MAX_FILES_PER_UPLOAD
            });
        }
        log.error('Multer error:', error);
        return res.status(400).json({ error: error.message });
    }

    log.error('Unhandled error:', error);
    res.status(500).json({ error: 'Something went wrong!', message: error.message });
});

// 404 handler for undefined routes
app.use((req, res) => {
    log.warn(`404 - Route not found: ${req.method} ${req.path} from ${req.ip}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

let localIpAddress;

for (const interfaceName in os.networkInterfaces()) {
    const networkInterface = os.networkInterfaces()[interfaceName];
    for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
            localIpAddress = iface.address;
            break;
        }
    }
    if (localIpAddress) {
        break;
    }
}

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Local Storage Bucket API Server - ${NODE_ENV.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📡 Server running on: http://${localIpAddress}:${PORT}`);
    console.log(`🏠 Localhost: http://localhost:${PORT}`);
    console.log(`📂 Upload directory: ${uploadsDir}`);
    console.log(`💾 Database: ${DB_PATH}`);
    console.log(`📊 Max file size: ${formatBytes(MAX_FILE_SIZE)}`);
    console.log(`📚 Max files per upload: ${MAX_FILES_PER_UPLOAD}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📚 API Documentation: http://${localIpAddress}:${PORT}`);
    console.log(`\n🔥 Example API calls:`);
    console.log(`   Upload file: curl -X POST -F 'file=@example.jpg' http://localhost:${PORT}/upload`);
    console.log(`   List files:  curl http://localhost:${PORT}/files`);
    console.log(`   Get stats:   curl http://localhost:${PORT}/stats`);
    console.log(`   Health:      curl http://localhost:${PORT}/health`);
    console.log(`\n✨ Ready to accept file uploads!\n`);
    log.info('Server initialization complete');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        log.error(`Port ${PORT} is already in use`);
    } else if (error.code === 'EACCES') {
        log.error(`Permission denied to bind to port ${PORT}`);
    } else {
        log.error('Server error:', error);
    }
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    server.close(() => {
        log.info('HTTP server closed');

        db.close((err) => {
            if (err) {
                log.error('Error closing database:', err.message);
            } else {
                log.info('Database connection closed');
            }
            console.log('✅ Shutdown complete');
            process.exit(0);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        log.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});