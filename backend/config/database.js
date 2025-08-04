const fs = require('fs');
const path = require('path');
const { OneDriveFolderDB } = require('./onedrive-folder-db');

// Database file paths (fallback)
const DB_DIR = path.join(__dirname, '..', 'data');
const FILES_DB = path.join(DB_DIR, 'files.json');
const STATS_DB = path.join(DB_DIR, 'stats.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database files if they don't exist
if (!fs.existsSync(FILES_DB)) {
  fs.writeFileSync(FILES_DB, JSON.stringify([], null, 2));
}

if (!fs.existsSync(STATS_DB)) {
  fs.writeFileSync(STATS_DB, JSON.stringify({
    total_files: 0,
    file_type_stats: {},
    asset_type_stats: {},
    client_code_stats: {},
    monthly_stats: {}
  }, null, 2));
}

// Local database operations (fallback)
const localDb = {
  getFiles: () => {
    try {
      const data = fs.readFileSync(FILES_DB, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading files database:', error);
      return [];
    }
  },

  saveFiles: (files) => {
    try {
      fs.writeFileSync(FILES_DB, JSON.stringify(files, null, 2));
    } catch (error) {
      console.error('Error saving files database:', error);
    }
  },

  getStats: () => {
    try {
      const data = fs.readFileSync(STATS_DB, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading stats database:', error);
      return {
        total_files: 0,
        file_type_stats: {},
        asset_type_stats: {},
        client_code_stats: {},
        monthly_stats: {}
      };
    }
  },

  saveStats: (stats) => {
    try {
      fs.writeFileSync(STATS_DB, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Error saving stats database:', error);
    }
  }
};

// Hybrid database that uses OneDrive folder first, falls back to local
class HybridDB {
  constructor() {
    this.oneDriveDb = new OneDriveFolderDB();
    this.useOneDrive = false;
  }

  async initialize() {
    this.useOneDrive = this.oneDriveDb.useOneDrive;
    return this.useOneDrive;
  }

  async getFiles() {
    if (this.useOneDrive) {
      return this.oneDriveDb.getFiles();
    }
    return localDb.getFiles();
  }

  async saveFiles(files) {
    if (this.useOneDrive) {
      this.oneDriveDb.saveFiles(files);
    }
    localDb.saveFiles(files); // Always save locally as backup
  }

  async addFile(file) {
    const files = await this.getFiles();
    files.push(file);
    await this.saveFiles(files);
    return file;
  }

  async removeFile(id) {
    const files = await this.getFiles();
    const filteredFiles = files.filter(f => f.id !== id);
    await this.saveFiles(filteredFiles);
    return files.length - filteredFiles.length > 0;
  }

  async getStats() {
    if (this.useOneDrive) {
      return this.oneDriveDb.getStats();
    }
    return localDb.getStats();
  }

  async saveStats(stats) {
    if (this.useOneDrive) {
      this.oneDriveDb.saveStats(stats);
    }
    localDb.saveStats(stats); // Always save locally as backup
  }

  async updateStats() {
    const files = await this.getFiles();
    const stats = {
      total_files: files.length,
      file_type_stats: {},
      asset_type_stats: {},
      client_code_stats: {},
      monthly_stats: {}
    };

    files.forEach(file => {
      // File type stats
      stats.file_type_stats[file.file_type] = (stats.file_type_stats[file.file_type] || 0) + 1;
      
      // Asset type stats
      stats.asset_type_stats[file.asset_type] = (stats.asset_type_stats[file.asset_type] || 0) + 1;
      
      // Client code stats
      stats.client_code_stats[file.client_code] = (stats.client_code_stats[file.client_code] || 0) + 1;
      
      // Monthly stats
      const month = new Date(file.uploaded_at).toISOString().slice(0, 7);
      stats.monthly_stats[month] = (stats.monthly_stats[month] || 0) + 1;
    });

    await this.saveStats(stats);
    return stats;
  }
}

const db = new HybridDB();

module.exports = { db }; 