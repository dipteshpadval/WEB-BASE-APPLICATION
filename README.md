# Excel File Manager - Secure File Management System

A comprehensive file management system built with React, TypeScript, and Node.js for handling Excel files with advanced filtering, upload, and download capabilities.

## 🚀 Features

### File Management
- **Multi-file Upload**: Upload multiple Excel files with metadata
- **File Date Tracking**: Specify file dates when uploading
- **Advanced Filtering**: Filter by file type, asset type, client code, and date range
- **Bulk Download**: Download multiple files as ZIP archives
- **Cross-device Sync**: OneDrive integration for data persistence

### User Interface
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live file statistics and activity tracking
- **Drag & Drop**: Easy file upload with drag and drop support

### Backend Features
- **RESTful API**: Express.js backend with comprehensive endpoints
- **File Validation**: Excel file format validation
- **Database Integration**: File-based database with OneDrive sync
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **Multer** for file upload handling
- **XLSX** for Excel file processing
- **UUID** for unique file identification
- **Express Validator** for input validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd web-base
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy environment example files
   cp backend/env.example backend/.env
   ```

4. **Start the development server**
   ```bash
   # From the root directory
   npm run dev
   ```

## 🌐 Usage

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5002
- **Network Access**: http://192.168.29.211:3000

### Production
- **Frontend**: http://192.168.29.211:3000
- **Backend**: http://192.168.29.211:5002

## 📁 Project Structure

```
web-base/
├── frontend/                 # React frontend application
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

## 🔧 Configuration

### Database Configuration
The system uses a hybrid database approach:
- **Local Storage**: File-based JSON database for development
- **OneDrive Sync**: Cloud storage integration for production

### File Upload Limits
- **Maximum File Size**: 50MB
- **Supported Formats**: Excel files (.xlsx, .xls)
- **File Types**: Holding, Offsite, Client Query, Value Price, Report, Analysis

## 📊 API Endpoints

### File Management
- `GET /api/files` - Get all files with filtering
- `POST /api/files/upload` - Upload new file
- `GET /api/files/:id/download` - Download specific file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/stats` - Get file statistics

### Authentication (Future)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** - Initial release with file upload, download, and filtering capabilities
- **v1.1.0** - Added file date tracking and OneDrive integration
- **v1.2.0** - Enhanced UI and cross-device synchronization

---

**Built with ❤️ using React, TypeScript, and Node.js** 