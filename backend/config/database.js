const fs = require('fs');
const path = require('path');

// Production database path
const PRODUCTION_DB_PATH = path.join(__dirname, '../data');

class Database {
  constructor() {
    this.useOneDrive = false;
    this.filesPath = path.join(PRODUCTION_DB_PATH, 'files.json');
    this.statsPath = path.join(PRODUCTION_DB_PATH, 'stats.json');
  }

  initialize() {
    console.log('✅ Using local database');
    this.ensureDataDirectory();
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

  getFiles() {
    return this.getLocalFiles();
  }

  saveFiles(files) {
    return this.saveLocalFiles(files);
  }

  addFile(fileData) {
    return this.addLocalFile(fileData);
  }

  removeFile(fileId) {
    return this.removeLocalFile(fileId);
  }

  getStats() {
    return this.getLocalStats();
  }

  saveStats(stats) {
    return this.saveLocalStats(stats);
  }

  updateStats(newFileData) {
    return this.updateLocalStats(newFileData);
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
      this.updateLocalStats(fileData);
      return true;
    } catch (error) {
      console.error('Error adding local file:', error);
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
        // File type stats
        if (file.fileType) {
          fileTypeStats[file.fileType] = (fileTypeStats[file.fileType] || 0) + 1;
        }
        
        // Client code stats
        if (file.clientCode) {
          clientCodeStats[file.clientCode] = (clientCodeStats[file.clientCode] || 0) + 1;
        }
        
        // Asset type stats
        if (file.assetType) {
          assetTypeStats[file.assetType] = (assetTypeStats[file.assetType] || 0) + 1;
        }
        
        // Storage calculation
        if (file.size) {
          totalStorage += file.size;
        }
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

module.exports = new Database(); 