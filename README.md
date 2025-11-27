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
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Beautiful Interface**: Built with Tailwind CSS, Framer Motion, and Lucide Icons.
- **Dark Mode Support**: (Implicit support via Tailwind classes).

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

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd storage-bucket
    ```

2.  **Install dependencies**:
    You can install dependencies for both frontend and backend from the root:
    ```bash
    npm install
    cd frontend && npm install
    cd ../backend && npm install
    cd ..
    ```

---

## 🏃‍♂️ How to Run

### Concurrent Mode (Recommended)
Run both the frontend and backend with a single command from the root directory:

```bash
npm run dev
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Manual Mode
Run them separately in different terminal windows:

**Backend:**
```bash
cd backend
PORT=3001 npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
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
└── package.json            # Root configuration
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
