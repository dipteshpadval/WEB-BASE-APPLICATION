const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const JSZip = require('jszip');
const { body, query, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
// const { supabase } = require('../config/database');
// const { uploadFile, generateSignedUrl, deleteFile } = require('../config/aws');
// const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const db = require('../config/database');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
}).single('file');

// Wrapper to handle multer with timeout
const uploadWithTimeout = (req, res, next) => {
  const timeout = setTimeout(() => {
    console.error('❌ File upload timeout');
    res.status(408).json({ error: 'Upload timeout - file too large or slow connection' });
  }, 120000); // 2 minutes

  upload(req, res, (err) => {
    clearTimeout(timeout);
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Validate Excel file content
const validateExcelFile = async (file) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    if (workbook.worksheets.length === 0) {
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
  uploadWithTimeout,
  [
    body('fileType').isIn(['WORKING', 'REPORT', 'SCHEME MASTER', 'DATA']),
    body('assetType').notEmpty().trim(),
    body('clientCode').notEmpty().trim()
  ],
  async (req, res) => {
    console.log('🚀 File upload started at:', new Date().toISOString());
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
        await validateExcelFile(req.file);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

      const fileId = uuidv4();
      const uploadedAt = new Date().toISOString();

      // Create file entry with file buffer stored in MongoDB
      const fileData = {
        id: fileId,
        filename: req.file.originalname,
        file_buffer: req.file.buffer, // Store file buffer in MongoDB
        file_type: fileType,
        asset_type: assetType,
        client_code: clientCode,
        file_date: fileDate,
        file_size: req.file.size,
        uploaded_at: uploadedAt,
        uploaded_by: req.headers['x-user'] || 'unknown@certitude.com' // Add user tracking
      };

      console.log('📋 File data created:', {
        id: fileData.id,
        filename: fileData.filename,
        file_type: fileData.file_type,
        asset_type: fileData.asset_type,
        client_code: fileData.client_code,
        file_date: fileData.file_date,
        file_size: fileData.file_size,
        uploaded_by: fileData.uploaded_by,
        buffer_size: fileData.file_buffer ? fileData.file_buffer.length : 0
      });

      // Save to storage (now local/OneDrive via database module)
      console.log('💾 Attempting to save file to database...');
      console.log('📁 File size:', req.file.size, 'bytes');
      
      const addFileResult = await db.addFile(fileData);
      console.log('📁 addFile result:', addFileResult);
      
      if (!addFileResult) {
        console.error('❌ Failed to add file to database');
        return res.status(500).json({ error: 'Failed to save file to database' });
      }
      
      console.log('📊 Updating stats...');
      await db.updateStats(fileData);
      console.log('✅ Stats updated successfully');

      console.log('✅ File uploaded successfully:', {
        id: fileId,
        filename: req.file.originalname,
        fileType,
        assetType,
        clientCode,
        fileDate
      });

      console.log('🏁 File upload completed at:', new Date().toISOString());

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

// Bulk download files (merge into single Excel or as ZIP)
router.get('/bulk-download', async (req, res) => {
  try {
    const { fileType, assetType, clientCode, startDate, endDate, mode = 'merge' } = req.query;

    // Fetch and filter files similar to list endpoint
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

    if (!filteredFiles.length) {
      return res.status(404).json({ error: 'No files found for given filters' });
    }

    // Default filename parts
    const safe = (v) => (v ? String(v).replace(/[^a-zA-Z0-9_-]+/g, '-') : 'all');
    const filenameBase = `files_${safe(fileType)}_${safe(assetType)}_${safe(clientCode)}_${safe(startDate)}_to_${safe(endDate)}`;

    if (mode === 'zip') {
      const zip = new JSZip();
      for (const f of filteredFiles) {
        if (f.file_buffer) {
          zip.file(f.filename, f.file_buffer);
        }
      }
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.zip"`);
      return res.send(zipBuffer);
    }

    // Merge into a single worksheet called "Consolidated"
    const mergedWorkbook = new ExcelJS.Workbook();
    mergedWorkbook.creator = 'File Manager';
    mergedWorkbook.created = new Date();
    const consolidated = mergedWorkbook.addWorksheet('Consolidated');

    let wroteHeader = false;

    for (const f of filteredFiles) {
      if (!f.file_buffer) continue;
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(f.file_buffer);

        for (const ws of wb.worksheets) {
          if (ws.rowCount === 0) continue;

          // Header row (first row)
          const headerRow = ws.getRow(1);
          const headerValues = Array.isArray(headerRow.values) ? headerRow.values : [];

          if (!wroteHeader) {
            const newHeader = consolidated.addRow(headerValues);
            newHeader.font = { bold: true };
            wroteHeader = true;
          } else {
            // Separate sections with a blank row and repeat header for clarity
            consolidated.addRow([]);
            const repeatedHeader = consolidated.addRow(headerValues);
            repeatedHeader.font = { bold: true };
          }

          // Append data rows
          for (let r = 2; r <= ws.rowCount; r++) {
            const srcRow = ws.getRow(r);
            const values = Array.isArray(srcRow.values) ? srcRow.values : [];
            consolidated.addRow(values);
          }
        }
      } catch (e) {
        console.warn('Skipping file during merge (unable to parse):', f.filename, e.message);
        continue;
      }
    }

    const buffer = await mergedWorkbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}_consolidated.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Bulk download error:', error);
    res.status(500).json({ error: 'Failed to prepare bulk download' });
  }
});

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

    // Log file download (we'll need to get user info from request)
    const user = req.headers['x-user'] || 'unknown@certitude.com';
    const fileSize = file.file_size || 0;
    
    // Import the logFileDownload function
    const { logFileDownload } = require('./auth');
    logFileDownload(file.filename, user, `${Math.round(fileSize / 1024)} KB`);

    // Serve from disk if available; else from buffer
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    if (file.file_path && fs.existsSync(file.file_path)) {
      return fs.createReadStream(file.file_path).pipe(res);
    }
    if (file.file_buffer) {
      return res.send(file.file_buffer);
    }
    return res.status(404).json({ error: 'File not found in local storage' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete file (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info before deletion
    const files = await db.getFiles();
    const file = files.find(f => f.id === id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove from database
    const removed = await db.removeFile(id);

    if (!removed) {
      return res.status(500).json({ error: 'Failed to remove file from database' });
    }

    // File is stored in MongoDB, no need to remove from disk
    console.log('🗑️ File removed from database');

    // Update stats
    await db.updateStats(file);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file statistics
router.get('/stats', async (req, res) => {
  try {
    const files = await db.getFiles()
    
    // Calculate real statistics
    const totalFiles = files.length
    let totalStorage = 0
    const fileTypeStats = {}
    const clientCodeStats = {}
    const assetTypeStats = {}
    const monthlyStats = {}

    files.forEach(file => {
      // Calculate storage using actual file size
      totalStorage += file.file_size || 0

      // File type stats
      const fileType = file.file_type || 'Unknown'
      fileTypeStats[fileType] = (fileTypeStats[fileType] || 0) + 1

      // Client code stats
      const clientCode = file.client_code || 'Unknown'
      clientCodeStats[clientCode] = (clientCodeStats[clientCode] || 0) + 1

      // Asset type stats
      const assetType = file.asset_type || 'Unknown'
      assetTypeStats[assetType] = (assetTypeStats[assetType] || 0) + 1

      // Monthly stats
      if (file.file_date) {
        const dateStr = file.file_date;
        const month = dateStr.substring(0, 7) // YYYY-MM
        monthlyStats[month] = (monthlyStats[month] || 0) + 1
      }
    })

    // Convert total storage to human readable format
    const formatStorage = (bytes) => {
      if (bytes === 0) return '0 MB'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const stats = {
      total_files: totalFiles,
      total_storage: formatStorage(totalStorage),
      file_type_stats: fileTypeStats,
      client_code_stats: clientCodeStats,
      asset_type_stats: assetTypeStats,
      monthly_stats: monthlyStats
    }

    res.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to get statistics' })
  }
})

// Get database status
router.get('/db-status', async (req, res) => {
  try {
    const status = {
      type: 'Local JSON Database',
      status: 'Connected',
      timestamp: new Date().toISOString()
    };
    res.json(status);
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({ error: 'Failed to fetch database status' });
  }
});

// GET /options - Return fileTypes, assetTypes, clientCodes

router.get('/options', (req, res) => {
  try {
    const optionsPath = path.join(__dirname, '../data/options.json');
    if (!fs.existsSync(optionsPath)) {
      return res.status(404).json({ error: 'Options file not found' });
    }
    const data = fs.readFileSync(optionsPath, 'utf8');
    const options = JSON.parse(data);
    res.json({
      fileTypes: options.fileTypes || [],
      assetTypes: options.assetTypes || [],
      clientCodes: options.clientCodes || []
    });
  } catch (error) {
    console.error('Error reading options:', error);
    res.status(500).json({ error: 'Failed to load options' });
  }
});

module.exports = router; 