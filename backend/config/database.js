const fs = require('fs');
const path = require('path');

// Try to import OneDrive database, but don't crash if it fails
let OneDriveFolderDB = null;
try {
  const { OneDriveDB } = require('./onedrive-db');
  OneDriveFolderDB = OneDriveDB;
} catch (error) {
  console.log('⚠️  OneDrive database not available:', error.message);
}

// Production database path (when OneDrive is not available)
const PRODUCTION_DB_PATH = path.join(__dirname, '../data');

class Database {
  constructor() {
    this.oneDriveDb = null;
    this.useOneDrive = false;
    this.filesPath = path.join(PRODUCTION_DB_PATH, 'files.json');
    this.statsPath = path.join(PRODUCTION_DB_PATH, 'stats.json');
  }

  initialize() {
    try {
      // Try to initialize OneDrive database
      if (OneDriveFolderDB) {
        this.oneDriveDb = new OneDriveFolderDB();
        
        // Check if OneDrive is properly configured
        const oneDriveStatus = this.oneDriveDb.getStatus();
        
        if (oneDriveStatus.found && this.oneDriveDb.accessToken) {
          this.useOneDrive = true;
          console.log('✅ OneDrive folder found:', oneDriveStatus.onedrivePath);
          return true;
        } else {
          console.log('⚠️  OneDrive folder not found, using production database');
          this.useOneDrive = false;
          this.ensureDataDirectory();
          return false;
        }
      } else {
        console.log('⚠️  OneDrive database not available, using production database');
        this.useOneDrive = false;
        this.ensureDataDirectory();
        return false;
      }
    } catch (error) {
      console.log('⚠️  OneDrive initialization failed, using production database:', error.message);
      this.useOneDrive = false;
      this.ensureDataDirectory();
      return false;
    }
  }

  ensureDataDirectory() {
    if (!fs.existsSync(PRODUCTION_DB_PATH)) {
      fs.mkdirSync(PRODUCTION_DB_PATH, { recursive: true });
    }
  }

  getOneDrivePath() {
    if (this.oneDriveDb) {
      const status = this.oneDriveDb.getStatus();
      return status.onedrivePath;
    }
    return 'Production Database';
  }

  getFiles() {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.getFiles();
      } catch (error) {
        console.error('OneDrive getFiles failed, falling back to local:', error.message);
        return this.getLocalFiles();
      }
    } else {
      return this.getLocalFiles();
    }
  }

  saveFiles(files) {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.saveFiles(files);
      } catch (error) {
        console.error('OneDrive saveFiles failed, falling back to local:', error.message);
        return this.saveLocalFiles(files);
      }
    } else {
      return this.saveLocalFiles(files);
    }
  }

  addFile(fileData) {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.addFile(fileData);
      } catch (error) {
        console.error('OneDrive addFile failed, falling back to local:', error.message);
        return this.addLocalFile(fileData);
      }
    } else {
      return this.addLocalFile(fileData);
    }
  }

  removeFile(fileId) {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.removeFile(fileId);
      } catch (error) {
        console.error('OneDrive removeFile failed, falling back to local:', error.message);
        return this.removeLocalFile(fileId);
      }
    } else {
      return this.removeLocalFile(fileId);
    }
  }

  getStats() {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.getStats();
      } catch (error) {
        console.error('OneDrive getStats failed, falling back to local:', error.message);
        return this.getLocalStats();
      }
    } else {
      return this.getLocalStats();
    }
  }

  saveStats(stats) {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.saveStats(stats);
      } catch (error) {
        console.error('OneDrive saveStats failed, falling back to local:', error.message);
        return this.saveLocalStats(stats);
      }
    } else {
      return this.saveLocalStats(stats);
    }
  }

  updateStats(newFileData) {
    if (this.useOneDrive && this.oneDriveDb) {
      try {
        return this.oneDriveDb.updateStats(newFileData);
      } catch (error) {
        console.error('OneDrive updateStats failed, falling back to local:', error.message);
        return this.updateLocalStats(newFileData);
      }
    } else {
      return this.updateLocalStats(newFileData);
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
      fs.writeFileSync(this.filesPath, JSON.stringify(files, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving local files:', error);
      return false;
    }
  }

  addLocalFile(fileData) {
    try {
      const files = this.getLocalFiles();
      files.push(fileData);
      this.saveLocalFiles(files);
      return true;
    } catch (error) {
      console.error('Error adding local file:', error);
      return false;
    }
  }

  removeLocalFile(fileId) {
    try {
      const files = this.getLocalFiles();
      const updatedFiles = files.filter(file => file.id !== fileId);
      if (files.length !== updatedFiles.length) {
        this.saveLocalFiles(updatedFiles);
        return true;
      }
      return false;
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
      return {
        total_files: 0,
        total_storage: '0 MB',
        file_type_stats: {},
        client_code_stats: {},
        asset_type_stats: {},
        monthly_stats: {}
      };
    } catch (error) {
      console.error('Error reading local stats:', error);
      return {
        total_files: 0,
        total_storage: '0 MB',
        file_type_stats: {},
        client_code_stats: {},
        asset_type_stats: {},
        monthly_stats: {}
      };
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
      
      // Update stats based on current files
      stats.total_files = files.length;
      
      // Calculate total storage
      let totalStorage = 0;
      files.forEach(file => {
        totalStorage += file.size || 102400; // Default 100KB
      });
      
      // Convert to human readable format
      const formatStorage = (bytes) => {
        if (bytes === 0) return '0 MB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      stats.total_storage = formatStorage(totalStorage);
      
      // Update file type stats
      stats.file_type_stats = {};
      files.forEach(file => {
        const fileType = file.fileType || 'Unknown';
        stats.file_type_stats[fileType] = (stats.file_type_stats[fileType] || 0) + 1;
      });
      
      // Update client code stats
      stats.client_code_stats = {};
      files.forEach(file => {
        const clientCode = file.clientCode || 'Unknown';
        stats.client_code_stats[clientCode] = (stats.client_code_stats[clientCode] || 0) + 1;
      });
      
      // Update asset type stats
      stats.asset_type_stats = {};
      files.forEach(file => {
        const assetType = file.assetType || 'Unknown';
        stats.asset_type_stats[assetType] = (stats.asset_type_stats[assetType] || 0) + 1;
      });
      
      // Update monthly stats
      stats.monthly_stats = {};
      files.forEach(file => {
        if (file.fileDate) {
          const month = file.fileDate.substring(0, 7); // YYYY-MM
          stats.monthly_stats[month] = (stats.monthly_stats[month] || 0) + 1;
        }
      });
      
      this.saveLocalStats(stats);
      return true;
    } catch (error) {
      console.error('Error updating local stats:', error);
      return false;
    }
  }
}

module.exports = Database; 