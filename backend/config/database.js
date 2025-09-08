const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const File = require('../models/File');

// Local/OneDrive database path (prefer env, then OneDrive path, then ./data)
const PRODUCTION_DB_PATH = process.env.LOCAL_DB_PATH ||
  'C:/Users/Lenovo/OneDrive - CERTITUDE FIN TECH SERVICES PRIVATE LIMITED/AUTOMATION/DATABASE/web base/DATA' ||
  path.join(__dirname, '../data');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dipteshpadval:diptesh6272@cluster0.avhq4bo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('❌ Please check your MongoDB connection string and IP whitelist');
    return null;
  }
};

// Mock Supabase for compatibility (since we're using local storage)
const supabase = {
  auth: {
    getUser: async (token) => {
      // Mock implementation - you can replace this with actual Supabase auth
      return { data: { user: null }, error: null };
    }
  },
  from: (table) => ({
    select: (fields) => ({
      order: (field, direction) => ({
        then: (callback) => {
          // Mock implementation for users table
          if (table === 'users') {
            try {
              const usersFile = path.join(__dirname, '../data/users.json');
              if (fs.existsSync(usersFile)) {
                const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
                const formattedUsers = users.map(user => ({
                  id: user.employeeCode,
                  email: `${user.employeeCode}@certitude.com`,
                  role: user.role,
                  created_at: user.createdAt
                }));
                callback({ data: formattedUsers, error: null });
              } else {
                callback({ data: [], error: null });
              }
            } catch (error) {
              callback({ data: null, error: error.message });
            }
          }
        }
      })
    }),
    update: (data) => ({
      eq: (field, value) => ({
        select: (fields) => ({
          single: () => {
            // Mock implementation for updating users
            try {
              const usersFile = path.join(__dirname, '../data/users.json');
              if (fs.existsSync(usersFile)) {
                const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
                const userIndex = users.findIndex(u => u.employeeCode === value);
                if (userIndex !== -1) {
                  users[userIndex] = { ...users[userIndex], ...data };
                  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
                  return { data: users[userIndex], error: null };
                }
              }
              return { data: null, error: 'User not found' };
            } catch (error) {
              return { data: null, error: error.message };
            }
          }
        })
      })
    }),
    delete: () => ({
      eq: (field, value) => ({
        then: (callback) => {
          // Mock implementation for deleting users
          try {
            const usersFile = path.join(__dirname, '../data/users.json');
            if (fs.existsSync(usersFile)) {
              const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
              const filteredUsers = users.filter(u => u.employeeCode !== value);
              fs.writeFileSync(usersFile, JSON.stringify(filteredUsers, null, 2));
              callback({ error: null });
            } else {
              callback({ error: 'Users file not found' });
            }
          } catch (error) {
            callback({ error: error.message });
          }
        }
      })
    })
  })
};

class Database {
  constructor() {
    this.useOneDrive = false;
    this.filesPath = path.join(PRODUCTION_DB_PATH, 'files.json');
    this.statsPath = path.join(PRODUCTION_DB_PATH, 'stats.json');
    this.mongoConnection = null;
  }

  async initialize() {
    console.log('✅ Using local/OneDrive storage for database');
    this.ensureDataDirectory();
    this.mongoConnection = null;
    return true;
  }

  ensureDataDirectory() {
    if (!fs.existsSync(PRODUCTION_DB_PATH)) {
      fs.mkdirSync(PRODUCTION_DB_PATH, { recursive: true });
    }
  }

  getOneDrivePath() {
    return 'Local Database';
  }

  async getFiles() {
    try {
      const files = this.getLocalFiles();
      console.log(`✅ Retrieved ${files.length} files from local storage`);
      return files.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    } catch (error) {
      console.error('❌ Error retrieving files from local storage:', error);
      return [];
    }
  }

  saveFiles(files) {
    return this.saveLocalFiles(files);
  }

  async addFile(fileData) {
    console.log('📁 Database.addFile called with:', {
      id: fileData.id,
      filename: fileData.filename,
      file_type: fileData.file_type,
      asset_type: fileData.asset_type,
      client_code: fileData.client_code,
      file_size: fileData.file_size,
      uploaded_by: fileData.uploaded_by,
      buffer_size: fileData.file_buffer ? fileData.file_buffer.length : 0
    });
    
    try {
      // Validate required fields
      if (!fileData.id || !fileData.filename || !fileData.file_type || !fileData.asset_type || !fileData.client_code || !fileData.file_date || !fileData.file_size || !fileData.uploaded_at || !fileData.uploaded_by || !fileData.file_buffer) {
        console.error('❌ Missing required fields:', {
          id: !!fileData.id,
          filename: !!fileData.filename,
          file_type: !!fileData.file_type,
          asset_type: !!fileData.asset_type,
          client_code: !!fileData.client_code,
          file_date: !!fileData.file_date,
          file_size: !!fileData.file_size,
          uploaded_at: !!fileData.uploaded_at,
          uploaded_by: !!fileData.uploaded_by,
          file_buffer: !!fileData.file_buffer
        });
        return false;
      }

      // Persist file to disk and save metadata locally
      this.ensureDataDirectory();
      const uploadsDir = path.join(PRODUCTION_DB_PATH, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = fileData.filename.replace(/[^a-zA-Z0-9._ -]+/g, '_');
      const diskFilename = `${fileData.id}_${safeName}`;
      const fullPath = path.join(uploadsDir, diskFilename);
      fs.writeFileSync(fullPath, fileData.file_buffer);

      const metadata = { ...fileData, file_path: fullPath };
      delete metadata.file_buffer;

      const saved = this.addLocalFile(metadata);
      if (!saved) {
        console.error('❌ Failed to write metadata to local storage');
        return false;
      }
      console.log('✅ File saved to local storage at:', fullPath);
      return true;
    } catch (error) {
      console.error('❌ Error saving file to local storage:', error.message);
      console.error('❌ Error details:', {
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      return false;
    }
  }

  async removeFile(fileId) {
    try {
      const files = this.getLocalFiles();
      const file = files.find(f => f.id === fileId);
      if (file && file.file_path && fs.existsSync(file.file_path)) {
        try { fs.unlinkSync(file.file_path); } catch {}
      }
      return this.removeLocalFile(fileId);
    } catch (error) {
      console.error('❌ Error removing local file:', error);
      return false;
    }
  }

  getStats() {
    return this.getLocalStats();
  }

  saveStats(stats) {
    return this.saveLocalStats(stats);
  }

  async updateStats(newFileData) {
    try {
      const files = await this.getFiles();
      return this.updateLocalStats(newFileData);
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      return this.getLocalStats();
    }
  }

  // Local database methods
  getLocalFiles() {
    try {
      if (fs.existsSync(this.filesPath)) {
        const data = fs.readFileSync(this.filesPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error reading local files:', error);
      return [];
    }
  }

  saveLocalFiles(files) {
    try {
      console.log('💾 Attempting to save files to database...');
      console.log('📁 Files path:', this.filesPath);
      console.log('📊 Number of files to save:', files.length);
      
      const data = JSON.stringify(files, null, 2);
      console.log('📄 Data size:', data.length, 'characters');
      
      fs.writeFileSync(this.filesPath, data);
      console.log('✅ Files saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving local files:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        path: this.filesPath
      });
      return false;
    }
  }

  addLocalFile(fileData) {
    try {
      console.log('📁 Adding file to database:', {
        id: fileData.id,
        filename: fileData.filename,
        file_type: fileData.file_type,
        asset_type: fileData.asset_type,
        client_code: fileData.client_code
      });
      
      const files = this.getLocalFiles();
      files.push(fileData);
      const saveResult = this.saveLocalFiles(files);
      
      if (!saveResult) {
        console.error('❌ Failed to save files to database');
        return false;
      }
      
      this.updateLocalStats(fileData);
      console.log('✅ File added to database successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding local file:', error);
      return false;
    }
  }

  removeLocalFile(fileId) {
    try {
      const files = this.getLocalFiles();
      const filteredFiles = files.filter(file => file.id !== fileId);
      this.saveLocalFiles(filteredFiles);
      return true;
    } catch (error) {
      console.error('Error removing local file:', error);
      return false;
    }
  }

  getLocalStats() {
    try {
      if (fs.existsSync(this.statsPath)) {
        const data = fs.readFileSync(this.statsPath, 'utf8');
        return JSON.parse(data);
      }
      return this.calculateInitialStats();
    } catch (error) {
      console.error('Error reading local stats:', error);
      return this.calculateInitialStats();
    }
  }

  saveLocalStats(stats) {
    try {
      fs.writeFileSync(this.statsPath, JSON.stringify(stats, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving local stats:', error);
      return false;
    }
  }

  updateLocalStats(newFileData) {
    try {
      const stats = this.getLocalStats();
      const files = this.getLocalFiles();
      
      // Recalculate all stats
      const fileTypeStats = {};
      const clientCodeStats = {};
      const assetTypeStats = {};
      let totalStorage = 0;
      
      files.forEach(file => {
        // File type stats - check both old and new field names
        const fileType = file.file_type || file.fileType;
        if (fileType) {
          fileTypeStats[fileType] = (fileTypeStats[fileType] || 0) + 1;
        }
        
        // Client code stats - check both old and new field names
        const clientCode = file.client_code || file.clientCode;
        if (clientCode) {
          clientCodeStats[clientCode] = (clientCodeStats[clientCode] || 0) + 1;
        }
        
        // Asset type stats - check both old and new field names
        const assetType = file.asset_type || file.assetType;
        if (assetType) {
          assetTypeStats[assetType] = (assetTypeStats[assetType] || 0) + 1;
        }
        
        // Storage calculation
        const fileSize = file.file_size || file.size || 0;
        totalStorage += fileSize;
      });
      
      const formatStorage = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      const updatedStats = {
        total_files: files.length,
        total_storage: formatStorage(totalStorage),
        file_type_stats: fileTypeStats,
        client_code_stats: clientCodeStats,
        asset_type_stats: assetTypeStats
      };
      
      this.saveLocalStats(updatedStats);
      return updatedStats;
    } catch (error) {
      console.error('Error updating local stats:', error);
      return this.getLocalStats();
    }
  }

  calculateInitialStats() {
    return {
      total_files: 0,
      total_storage: '0 B',
      file_type_stats: {},
      client_code_stats: {},
      asset_type_stats: {}
    };
  }
}

const databaseInstance = new Database();
module.exports = {
  // Database methods
  initialize: databaseInstance.initialize.bind(databaseInstance),
  getFiles: databaseInstance.getFiles.bind(databaseInstance),
  saveFiles: databaseInstance.saveFiles.bind(databaseInstance),
  addFile: databaseInstance.addFile.bind(databaseInstance),
  removeFile: databaseInstance.removeFile.bind(databaseInstance),
  getStats: databaseInstance.getStats.bind(databaseInstance),
  saveStats: databaseInstance.saveStats.bind(databaseInstance),
  updateStats: databaseInstance.updateStats.bind(databaseInstance),
  // Supabase mock
  supabase
}; 