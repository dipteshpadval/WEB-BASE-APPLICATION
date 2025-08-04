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
        const oneDriveStatus = this.oneDriveDb.getStatus();
        
        if (oneDriveStatus.found) {
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
      return this.oneDriveDb.getFiles();
    } else {
      return this.getLocalFiles();
    }
  }

  saveFiles(files) {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.saveFiles(files);
    } else {
      return this.saveLocalFiles(files);
    }
  }

  addFile(fileData) {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.addFile(fileData);
    } else {
      return this.addLocalFile(fileData);
    }
  }

  removeFile(fileId) {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.removeFile(fileId);
    } else {
      return this.removeLocalFile(fileId);
    }
  }

  getStats() {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.getStats();
    } else {
      return this.getLocalStats();
    }
  }

  saveStats(stats) {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.saveStats(stats);
    } else {
      return this.saveLocalStats(stats);
    }
  }

  updateStats(newFileData) {
    if (this.useOneDrive && this.oneDriveDb) {
      return this.oneDriveDb.updateStats(newFileData);
    } else {
      return this.updateLocalStats(newFileData);
    }
  }

  // Local database methods (for production)
  getLocalFiles() {
    try {
      if (fs.existsSync(this.filesPath)) {
        const data = fs.readFileSync(this.filesPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('❌ Error reading local files:', error);
      return [];
    }
  }

  saveLocalFiles(files) {
    try {
      fs.writeFileSync(this.filesPath, JSON.stringify(files, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Error saving local files:', error);
      return false;
    }
  }

  addLocalFile(fileData) {
    try {
      const files = this.getLocalFiles();
      files.push(fileData);
      this.saveLocalFiles(files);
      this.updateLocalStats(fileData);
      return true;
    } catch (error) {
      console.error('❌ Error adding local file:', error);
      return false;
    }
  }

  removeLocalFile(fileId) {
    try {
      const files = this.getLocalFiles();
      const updatedFiles = files.filter(file => file.id !== fileId);
      this.saveLocalFiles(updatedFiles);
      return true;
    } catch (error) {
      console.error('❌ Error removing local file:', error);
      return false;
    }
  }

  getLocalStats() {
    try {
      if (fs.existsSync(this.statsPath)) {
        const data = fs.readFileSync(this.statsPath, 'utf8');
        const stats = JSON.parse(data);
        // Convert property names to match frontend expectations
        return {
          total_files: stats.total_files || 0,
          total_size: stats.total_size || 0,
          file_type_stats: stats.file_types || {},
          asset_type_stats: stats.asset_types || {},
          client_code_stats: stats.client_codes || {},
          monthly_stats: stats.monthly_stats || {}
        };
      }
      return {
        total_files: 0,
        total_size: 0,
        file_type_stats: {},
        asset_type_stats: {},
        client_code_stats: {},
        monthly_stats: {}
      };
    } catch (error) {
      console.error('❌ Error reading local stats:', error);
      return {
        total_files: 0,
        total_size: 0,
        file_type_stats: {},
        asset_type_stats: {},
        client_code_stats: {},
        monthly_stats: {}
      };
    }
  }

  saveLocalStats(stats) {
    try {
      fs.writeFileSync(this.statsPath, JSON.stringify(stats, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Error saving local stats:', error);
      return false;
    }
  }

  updateLocalStats(newFileData) {
    try {
      const stats = this.getLocalStats();
      
      stats.total_files += 1;
      stats.total_size += newFileData.file_size || 0;
      
      // Update file type stats
      const fileType = newFileData.file_type;
      stats.file_type_stats[fileType] = (stats.file_type_stats[fileType] || 0) + 1;
      
      // Update asset type stats
      const assetType = newFileData.asset_type;
      stats.asset_type_stats[assetType] = (stats.asset_type_stats[assetType] || 0) + 1;
      
      // Update client code stats
      const clientCode = newFileData.client_code;
      stats.client_code_stats[clientCode] = (stats.client_code_stats[clientCode] || 0) + 1;
      
      // Save with the original property names for backward compatibility
      const saveStats = {
        total_files: stats.total_files,
        total_size: stats.total_size,
        file_types: stats.file_type_stats,
        asset_types: stats.asset_type_stats,
        client_codes: stats.client_code_stats,
        monthly_stats: stats.monthly_stats
      };
      
      this.saveLocalStats(saveStats);
      return true;
    } catch (error) {
      console.error('❌ Error updating local stats:', error);
      return false;
    }
  }
}

module.exports = new Database(); 