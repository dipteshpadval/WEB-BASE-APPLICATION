const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { body, query, validationResult } = require('express-validator');
// const { supabase } = require('../config/database');
// const { uploadFile, generateSignedUrl, deleteFile } = require('../config/aws');
// const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const db = require('../config/database');

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Validate Excel file content
const validateExcelFile = (file) => {
  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      throw new Error('Excel file must contain at least one sheet');
    }
    
    return true;
  } catch (error) {
    throw new Error('Invalid Excel file format');
  }
};

// Upload file
router.post('/upload', 
  // authenticateToken,
  // requireRole([ROLES.ADMIN, ROLES.UPLOADER]),
  upload.single('file'),
  [
    body('fileType').isIn(['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis']),
    body('assetType').notEmpty().trim(),
    body('clientCode').notEmpty().trim()
  ],
  async (req, res) => {
    try {
      console.log('📤 Upload request received from:', req.ip);
      console.log('📋 Request body:', req.body);
      console.log('📋 All form fields:', Object.keys(req.body));
      console.log('📁 File info:', req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { fileType, assetType, clientCode, fileDate } = req.body;
      console.log('🔍 Extracted fields:', { fileType, assetType, clientCode, fileDate });
      
      // Manual fileDate validation for multipart/form-data
      if (!fileDate || fileDate.trim() === '') {
        console.log('❌ File date is required');
        return res.status(400).json({ error: 'File date is required' });
      }

      if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate Excel file
      try {
        validateExcelFile(req.file);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

      const fileId = uuidv4();
      const uploadedAt = new Date().toISOString();

      // Create file entry
      const fileData = {
        id: fileId,
        filename: req.file.originalname,
        file_type: fileType,
        asset_type: assetType,
        client_code: clientCode,
        file_date: fileDate,
        file_size: req.file.size,
        uploaded_at: uploadedAt,
        buffer: req.file.buffer // Store file buffer for download
      };

      // Save to database
      await db.addFile(fileData);
      await db.updateStats();

      console.log('✅ File uploaded successfully:', {
        id: fileId,
        filename: req.file.originalname,
        fileType,
        assetType,
        clientCode,
        fileDate
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileData.id,
          filename: fileData.filename,
          file_type: fileData.file_type,
          asset_type: fileData.asset_type,
          client_code: fileData.client_code,
          file_date: fileData.file_date,
          file_size: fileData.file_size,
          uploaded_at: fileData.uploaded_at
        }
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Handle specific multer errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
      }
      
      if (error.message === 'Only Excel files are allowed') {
        return res.status(400).json({ error: 'Only Excel files are allowed' });
      }
      
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// Get files with filtering
router.get('/', 
  // authenticateToken,
  [
    query('fileType').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis'].includes(value);
    }),
    query('assetType').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return true;
    }),
    query('clientCode').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return true;
    }),
    query('startDate').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return true;
    }),
    query('endDate').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return true;
    }),
    query('search').optional().custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      return true;
    }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fileType, assetType, clientCode, startDate, endDate, page = 1, limit = 20, search } = req.query;
      const offset = (page - 1) * limit;

      // Get files from database
      let filteredFiles = [...(await db.getFiles())];

      if (fileType) {
        filteredFiles = filteredFiles.filter(file => file.file_type === fileType);
      }
      if (assetType) {
        filteredFiles = filteredFiles.filter(file => file.asset_type === assetType);
      }
      if (clientCode) {
        filteredFiles = filteredFiles.filter(file => file.client_code === clientCode);
      }
      if (startDate) {
        filteredFiles = filteredFiles.filter(file => file.file_date >= startDate);
      }
      if (endDate) {
        filteredFiles = filteredFiles.filter(file => file.file_date <= endDate);
      }
      if (search) {
        filteredFiles = filteredFiles.filter(file => 
          file.filename.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Sort by upload date (newest first)
      filteredFiles.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

      // Apply pagination
      const paginatedFiles = filteredFiles.slice(offset, offset + parseInt(limit));

      res.json({
        files: paginatedFiles,
        total: filteredFiles.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  }
);

// Download file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Find file in database
    const files = await db.getFiles();
    const file = files.find(f => f.id === id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Return file buffer as blob
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete file (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from database
    const removed = await db.removeFile(id);

    if (!removed) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update stats
    await db.updateStats();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get database status
router.get('/db-status', async (req, res) => {
  try {
    const status = db.oneDriveDb.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({ error: 'Failed to fetch database status' });
  }
});

module.exports = router; 