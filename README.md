# Storage Bucket

A modern, feature-rich, and beautiful file storage application built with **Next.js** and **Express**. Manage your files with ease, analyze storage usage, and preview content directly in your browser.

## 🚀 Features

### 🔐 Authentication
- Secure login system using **NextAuth.js**.
- Protected routes and API endpoints.
- Default credentials: `admin` / `admin`.

### 📊 Dashboard & Analytics
- **Real-time Statistics**: View total files, storage usage, and file type distribution.
- **Interactive Charts**: Visual breakdown of your storage using Pie and Bar charts.
- **Recent Activity**: Quickly access your most recently uploaded files.

### 📂 Advanced File Management
- **Universal Upload**: Drag & drop support for any file type and size.
- **Search & Filter**: Find files instantly by name, type, size, or date.
- **File Actions**:
    - **Rename**: Edit filenames directly.
    - **Delete**: Remove single or multiple files (Bulk Delete).
    - **Download**: Secure file downloads.
- **Inline Preview**: View images, videos, audio, and PDFs without downloading.

### 🎨 Modern UI/UX
- **Fully Responsive Design**: Optimized for all screen sizes from mobile phones to desktops.
  - Mobile-first approach with touch-friendly interfaces.
  - Hamburger menu navigation for mobile devices.
  - Card-based layouts for small screens, table views for desktop.
  - See [MOBILE_RESPONSIVE_CHANGES.md](./MOBILE_RESPONSIVE_CHANGES.md) for details.
- **Beautiful Interface**: Built with Tailwind CSS, Framer Motion, and Lucide Icons.
- **Dark Mode Support**: (Implicit support via Tailwind classes).
- **Smooth Animations**: Powered by Framer Motion for delightful interactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

### Backend
- **Server**: [Express.js](https://expressjs.com/)
- **Database**: [SQLite](https://www.sqlite.org/)
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## 📦 Installation

### Quick Setup (Development)

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd storage-bucket
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    cd frontend && npm install
    cd ../backend && npm install
    cd ..
    ```

3.  **Configure environment variables**:
    ```bash
    # Backend
    cd backend
    cp .env.example .env
    
    # Frontend
    cd ../frontend
    cp .env.example .env
    cp .env.local.example .env.local
    # Edit .env.local and add your NextAuth secret
    ```

4.  **Start the application**:
    ```bash
    cd ..
    npm run dev
    ```

📖 **For detailed setup instructions**, see [SETUP.md](SETUP.md)

---

## 🏃‍♂️ How to Run

### Development Mode (Recommended)
Run both the frontend and backend with a single command from the root directory:

```bash
npm run dev
```
- **Frontend**: http://localhost:3200
- **Backend API**: http://localhost:3201
- **Default Login**: `admin` / `admin`

### Manual Mode
Run them separately in different terminal windows:

**Backend:**
```bash
cd backend
PORT=3201 npm start
```

**Frontend:**
```bash
cd frontend
PORT=3200 npm run dev
```

---

## 🚀 Production Deployment

For production deployment with PM2, systemd, nginx, and SSL configuration:

📖 **See the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide**

Quick production start:
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Start with PM2
cd backend && pm2 start ecosystem.config.js --env production
cd ../frontend && pm2 start ecosystem.config.js --env production
```

---

## 🔌 API Documentation

The backend provides a RESTful API for file operations.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Upload a single file |
| `POST` | `/upload-multiple` | Upload multiple files |
| `GET` | `/files` | List files (supports filters: `search`, `type`, `minSize`, `maxSize`, `startDate`, `endDate`) |
| `GET` | `/file/:id` | Get file metadata |
| `PUT` | `/file/:id` | Rename a file |
| `DELETE` | `/file/:id` | Delete a file |
| `POST` | `/files/delete` | Bulk delete files (Body: `{ ids: [1, 2, 3] }`) |
| `GET` | `/preview/:id` | Get file content for inline preview |
| `GET` | `/download/:id` | Download a file |
| `GET` | `/stats` | Get storage statistics |

---

## 📁 Project Structure

```
storage-bucket/
├── backend/                # Express server
│   ├── uploads/            # File storage directory
│   ├── index.js            # Main server entry point
│   └── storage.db          # SQLite database
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities and API client
│   └── public/             # Static assets
├── deployment/             # Production deployment configs
│   ├── nginx.conf          # Nginx reverse proxy
│   ├── storage-bucket-backend.service
│   └── storage-bucket-frontend.service
├── DEPLOYMENT.md           # Production deployment guide
├── SETUP.md               # Quick setup guide
└── package.json           # Root configuration
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Quick setup guide for new users
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive production deployment guide
- **[MOBILE_RESPONSIVE_CHANGES.md](MOBILE_RESPONSIVE_CHANGES.md)** - Mobile responsiveness details
- **[API Documentation](http://localhost:3201)** - Available when backend is running

---

## 📱 Mobile Responsiveness Testing

The application is fully responsive and optimized for all device sizes. To test:

```bash
# Run the responsive test checklist
./test-responsive.sh
```

Or manually test using browser DevTools:
1. Start the app: `npm run dev`
2. Open http://localhost:3200 in browser
3. Press `F12` → `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)
4. Test different device presets (iPhone, iPad, etc.)

**Key responsive features:**
- Mobile hamburger menu navigation
- Card-based file view on mobile, table view on desktop
- Touch-friendly buttons and interactions
- Optimized text sizes and layouts for all screens

See [MOBILE_RESPONSIVE_CHANGES.md](./MOBILE_RESPONSIVE_CHANGES.md) for complete details.

---

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration:

**Backend** (`backend/.env`):
- `PORT` - Server port (default: 3201)
- `MAX_FILE_SIZE` - Maximum file upload size
- `CORS_ORIGINS` - Allowed CORS origins
- See `backend/.env.example` for all options

**Frontend** (`frontend/.env`):
- `NEXT_PUBLIC_API_URL` - Backend API URL

**Frontend** (`frontend/.env.local`):
- `NEXTAUTH_SECRET` - NextAuth encryption secret
- `NEXTAUTH_URL` - Frontend URL

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
