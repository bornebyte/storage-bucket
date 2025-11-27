# 📚 API Documentation - Storage Bucket API

Complete API reference for the Storage Bucket API v1.0.0

## Base URL

```
http://localhost:3000
```

Replace with your server's domain/IP in production.

---

## Authentication

Currently, the API does not require authentication. For production use, consider implementing:
- API Keys
- JWT tokens
- OAuth 2.0

---

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "success": true,
  "data": { }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Rate Limiting

- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per window (configurable)
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

---

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 45678592,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1234567
  },
  "version": "1.0.0",
  "environment": "production"
}
```

**Example**:
```bash
curl http://localhost:3000/health
```

---

### 2. API Documentation

Get API documentation and available endpoints.

**Endpoint**: `GET /`

**Response**: Returns comprehensive API documentation

**Example**:
```bash
curl http://localhost:3000/
```

---

### 3. Upload Single File

Upload a single file to the server.

**Endpoint**: `POST /upload`

**Content-Type**: `multipart/form-data`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | File to upload |

**Success Response** (200):
```json
{
  "success": true,
  "file": {
    "id": 1,
    "filename": "file-1640995200000-123456789.jpg",
    "originalName": "image.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "hash": "a1b2c3d4e5f6789abcdef...",
    "uploadDate": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: No file uploaded
- `413`: File too large
- `500`: Upload failed

**Examples**:
```bash
# cURL
curl -X POST -F 'file=@/path/to/image.jpg' http://localhost:3000/upload

# JavaScript (Fetch API)
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
});
const result = await response.json();

# Python (requests)
import requests

files = {'file': open('image.jpg', 'rb')}
response = requests.post('http://localhost:3000/upload', files=files)
print(response.json())
```

---

### 4. Upload Multiple Files

Upload multiple files in a single request.

**Endpoint**: `POST /upload-multiple`

**Content-Type**: `multipart/form-data`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| files | File[] | Yes | Array of files (max 10) |

**Success Response** (200):
```json
{
  "success": true,
  "files": [
    {
      "id": 2,
      "filename": "files-1640995300000-123456789.pdf",
      "originalName": "document.pdf",
      "size": 512000,
      "mimeType": "application/pdf",
      "hash": "b2c3d4e5f6789..."
    },
    {
      "id": 3,
      "filename": "files-1640995300001-987654321.mp4",
      "originalName": "video.mp4",
      "size": 2048000,
      "mimeType": "video/mp4",
      "hash": "c3d4e5f6789..."
    }
  ],
  "count": 2
}
```

**Error Responses**:
- `400`: No files uploaded / Too many files
- `413`: File(s) too large
- `500`: Upload failed

**Examples**:
```bash
# cURL
curl -X POST \
  -F 'files=@file1.jpg' \
  -F 'files=@file2.pdf' \
  -F 'files=@file3.mp4' \
  http://localhost:3000/upload-multiple

# JavaScript
const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('files', file);
}

const response = await fetch('http://localhost:3000/upload-multiple', {
  method: 'POST',
  body: formData
});
```

---

### 5. List Files

Get a paginated list of all uploaded files.

**Endpoint**: `GET /files`

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| page | Integer | No | 1 | Page number |
| limit | Integer | No | 10 | Items per page |

**Success Response** (200):
```json
{
  "files": [
    {
      "id": 1,
      "filename": "file-1640995200000-123456789.jpg",
      "originalName": "image.jpg",
      "size": 245760,
      "mimeType": "image/jpeg",
      "uploadDate": "2024-01-01T12:00:00.000Z",
      "hash": "a1b2c3d4e5f6789..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**Examples**:
```bash
# Get first page (default)
curl http://localhost:3000/files

# Get second page with 5 items
curl "http://localhost:3000/files?page=2&limit=5"

# Get all files on one page
curl "http://localhost:3000/files?limit=1000"
```

---

### 6. Get File Metadata

Get metadata for a specific file by ID.

**Endpoint**: `GET /file/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | Integer | Yes | File ID |

**Success Response** (200):
```json
{
  "id": 1,
  "filename": "file-1640995200000-123456789.jpg",
  "originalName": "image.jpg",
  "size": 245760,
  "mimeType": "image/jpeg",
  "uploadDate": "2024-01-01T12:00:00.000Z",
  "hash": "a1b2c3d4e5f6789..."
}
```

**Error Responses**:
- `404`: File not found
- `500`: Database error

**Examples**:
```bash
curl http://localhost:3000/file/1
```

---

### 7. Download File

Download a file by its ID.

**Endpoint**: `GET /download/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | Integer | Yes | File ID |

**Success Response** (200):
- Returns file with appropriate headers:
  - `Content-Disposition: attachment; filename="original-filename.ext"`
  - `Content-Type: [mime-type]`

**Error Responses**:
- `404`: File not found
- `500`: Read error

**Examples**:
```bash
# Download and save with original filename
curl -O -J http://localhost:3000/download/1

# Download and save with custom name
curl http://localhost:3000/download/1 -o myfile.jpg

# JavaScript download
window.open('http://localhost:3000/download/1', '_blank');

# Or with fetch
const response = await fetch('http://localhost:3000/download/1');
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename.ext';
a.click();
```

---

### 8. Delete File

Permanently delete a file and its metadata.

**Endpoint**: `DELETE /file/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | Integer | Yes | File ID |

**Success Response** (200):
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses**:
- `404`: File not found
- `500`: Delete failed

**Examples**:
```bash
# cURL
curl -X DELETE http://localhost:3000/file/1

# JavaScript
const response = await fetch('http://localhost:3000/file/1', {
  method: 'DELETE'
});
const result = await response.json();
```

---

### 9. Storage Statistics

Get comprehensive storage statistics.

**Endpoint**: `GET /stats`

**Success Response** (200):
```json
{
  "totalFiles": 25,
  "totalSize": 52428800,
  "totalSizeFormatted": "50.00 MB",
  "filesByType": [
    {
      "mimeType": "image/jpeg",
      "count": 15
    },
    {
      "mimeType": "application/pdf",
      "count": 8
    },
    {
      "mimeType": "video/mp4",
      "count": 2
    }
  ]
}
```

**Examples**:
```bash
curl http://localhost:3000/stats
```

---

## File Size Limits

- **Default**: 100 MB per file
- **Configurable**: Set `MAX_FILE_SIZE` in `.env`
- **Multiple uploads**: Each file must be under limit

---

## Supported File Types

Currently accepts all file types. Common types include:

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, DOCX, TXT, CSV, XLSX
- **Videos**: MP4, AVI, MOV, MKV
- **Audio**: MP3, WAV, FLAC, AAC
- **Archives**: ZIP, RAR, TAR, GZ

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found |
| 413 | Payload Too Large |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## CORS

Cross-Origin Resource Sharing is enabled by default. Configure allowed origins in `.env`:

```env
CORS_ORIGINS=*  # Allow all (development only)
CORS_ORIGINS=https://example.com,https://app.example.com  # Specific domains
```

---

## Security Headers

The API includes the following security headers via Helmet.js:

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-XSS-Protection`

---

## Client Libraries

### JavaScript/TypeScript

```javascript
class StorageBucketClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async listFiles(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/files?page=${page}&limit=${limit}`
    );
    return response.json();
  }

  async deleteFile(id) {
    const response = await fetch(`${this.baseUrl}/file/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  getDownloadUrl(id) {
    return `${this.baseUrl}/download/${id}`;
  }
}

// Usage
const client = new StorageBucketClient('http://localhost:3000');
await client.uploadFile(file);
```

### Python

```python
import requests

class StorageBucketClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def upload_file(self, file_path):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{self.base_url}/upload', files=files)
            return response.json()
    
    def list_files(self, page=1, limit=10):
        params = {'page': page, 'limit': limit}
        response = requests.get(f'{self.base_url}/files', params=params)
        return response.json()
    
    def delete_file(self, file_id):
        response = requests.delete(f'{self.base_url}/file/{file_id}')
        return response.json()
    
    def download_file(self, file_id, output_path):
        response = requests.get(f'{self.base_url}/download/{file_id}')
        with open(output_path, 'wb') as f:
            f.write(response.content)

# Usage
client = StorageBucketClient('http://localhost:3000')
result = client.upload_file('image.jpg')
```

---

## Webhooks (Future Feature)

Planned for future releases:
- Upload completion webhooks
- File deletion notifications
- Storage quota alerts

---

## Versioning

Current version: **1.0.0**

API versioning via URL prefix (planned):
- `http://localhost:3000/api/v1/upload`
- `http://localhost:3000/api/v2/upload`

---

## Support

- **GitHub**: https://github.com/bornebyte/storage-bucket
- **Issues**: https://github.com/bornebyte/storage-bucket/issues
- **Documentation**: https://github.com/bornebyte/storage-bucket/wiki

---

**Last Updated**: November 2024
