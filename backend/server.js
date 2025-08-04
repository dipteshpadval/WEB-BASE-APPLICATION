const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://192.168.29.211:3000", "http://192.168.29.32:3000", "https://certitudetech.netlify.app", "https://web-base-application.onrender.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://192.168.29.211:3000",
    "http://192.168.29.32:3000",
    "http://localhost:3000",
    "https://certitudetech.netlify.app",
    "https://web-base-application.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database
try {
  if (db.initialize) {
    db.initialize();
  }
} catch (error) {
  console.log('⚠️  Database initialization failed, continuing with basic setup:', error.message);
}

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    database: 'Local Database'
  });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({
    message: 'File Manager API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Remove static file serving since frontend is deployed separately
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all handler for API routes
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Using local database');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Network access: http://192.168.29.211:${PORT}`);
  console.log('✅ Database initialized successfully');
}); 