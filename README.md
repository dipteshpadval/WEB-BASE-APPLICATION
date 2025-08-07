# Excel File Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, secure, and user-friendly Excel file management system with role-based access, built using React, TypeScript, Node.js, and Express. Easily upload, manage, and download Excel files with advanced filtering, user management, and cloud sync.

---

## 🚀 Features
- **Multi-file Upload**: Upload multiple Excel files with metadata
- **Advanced Filtering**: Filter by file type, asset type, client code, and date range
- **Bulk Download**: Download multiple files as ZIP archives
- **User Management**: Admin dashboard for managing users and roles
- **Role-Based Access**: Secure access for admins and users
- **OneDrive Sync**: Cloud storage integration for data persistence
- **Modern UI**: Responsive, mobile-friendly design with drag & drop support

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query, React Router
- **Backend**: Node.js, Express.js, Multer, XLSX, UUID, Express Validator

---

## 📸 Screenshots

> **Tip:** For public display on GitHub, replace these relative paths with the raw GitHub URLs after pushing.

### Login Page
![Login Page](frontend/public/images/Screenshot%202025-08-07%20131815.png)

### Dashboard Page
![Dashboard Page](frontend/public/images/Screenshot%202025-08-07%20132100.png)

### File Manager Page
![File Manager Page](frontend/public/images/Screenshot%202025-08-07%20132114.png)

### Upload Page
![Upload Page](frontend/public/images/Screenshot%202025-08-07%20132128.png)

### Admin Overview Page
![Admin Overview Page](frontend/public/images/Screenshot%202025-08-07%20132142.png)

### Admin Users Page
![Admin Users Page](frontend/public/images/Screenshot%202025-08-07%20132153.png)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd web-base
```

### 2. Install dependencies
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configure environment variables
```bash
cp backend/env.example backend/.env
```

### 4. Start the development server
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:5002

---

## 📁 Project Structure
```
web-base/
├── frontend/                 # React frontend application
│   ├── public/images/        # App screenshots and static images
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # API and utility functions
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js backend server
│   ├── config/             # Database and configuration
│   ├── middleware/         # Express middleware
│   ├── routes/            # API route handlers
│   ├── data/              # File-based database
│   └── server.js          # Server entry point
├── package.json
└── README.md
```

---

## 🔧 Configuration
- **Database**: Local JSON for dev, OneDrive for production
- **Max File Size**: 50MB
- **Supported Formats**: .xlsx, .xls
- **File Types**: Holding, Offsite, Client Query, Value Price, Report, Analysis

---

## 📊 API Endpoints
- `GET /api/files` - Get all files with filtering
- `POST /api/files/upload` - Upload new file
- `GET /api/files/:id/download` - Download specific file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/stats` - Get file statistics
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

---

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support
For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using React, TypeScript, and Node.js** 