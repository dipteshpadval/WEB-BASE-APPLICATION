const fs = require('fs');
const path = require('path');
const axios = require('axios');

// OneDrive API configuration
const ONEDRIVE_API_BASE = 'https://graph.microsoft.com/v1.0/me/drive';
const ONEDRIVE_FOLDER = 'FileManagerDB'; // Folder name in OneDrive

class OneDriveDB {
  constructor() {
    this.accessToken = process.env.ONEDRIVE_ACCESS_TOKEN;
    this.folderId = null;
    this.filesDbPath = 'files.json';
    this.statsDbPath = 'stats.json';
    this.onedrivePath = null;
  }

  // Get status for compatibility
  getStatus() {
    return {
      found: this.accessToken && this.folderId,
      onedrivePath: this.onedrivePath || 'OneDrive Database'
    };
  }

  // Initialize OneDrive connection
  async initialize() {
    if (!this.accessToken) {
      console.warn('⚠️  OneDrive access token not found. Using local database as fallback.');
      return false;
    }

    try {
      // Create or get the database folder
      await this.ensureFolderExists();
      console.log('✅ OneDrive database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ OneDrive initialization failed:', error.message);
      return false;
    }
  }

  // Ensure the database folder exists in OneDrive
  async ensureFolderExists() {
    if (!this.accessToken) {
      throw new Error('No OneDrive access token available');
    }

    try {
      // Check if folder exists
      const response = await axios.get(`${ONEDRIVE_API_BASE}/root:/${ONEDRIVE_FOLDER}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      this.folderId = response.data.id;
      this.onedrivePath = response.data.webUrl;
    } catch (error) {
      if (error.response?.status === 404) {
        // Create folder if it doesn't exist
        const createResponse = await axios.post(`${ONEDRIVE_API_BASE}/root/children`, {
          name: ONEDRIVE_FOLDER,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        }, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        this.folderId = createResponse.data.id;
        this.onedrivePath = createResponse.data.webUrl;
      } else {
        throw error;
      }
    }
  }

  // Upload file to OneDrive
  async uploadFile(filePath, content) {
    if (!this.accessToken || !this.folderId) {
      throw new Error('OneDrive not properly initialized');
    }

    try {
      const response = await axios.put(
        `${ONEDRIVE_API_BASE}/items/${this.folderId}:/${filePath}:/content`,
        content,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('OneDrive upload error:', error.message);
      throw error;
    }
  }

  // Download file from OneDrive
  async downloadFile(filePath) {
    if (!this.accessToken || !this.folderId) {
      throw new Error('OneDrive not properly initialized');
    }

    try {
      const response = await axios.get(
        `${ONEDRIVE_API_BASE}/items/${this.folderId}:/${filePath}:/content`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // File doesn't exist, return empty data
        return [];
      }
      console.error('OneDrive download error:', error.message);
      throw error;
    }
  }

  // Get files from OneDrive
  async getFiles() {
    try {
      const data = await this.downloadFile(this.filesDbPath);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting files from OneDrive:', error.message);
      return [];
    }
  }

  // Save files to OneDrive
  async saveFiles(files) {
    try {
      await this.uploadFile(this.filesDbPath, JSON.stringify(files, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving files to OneDrive:', error.message);
      return false;
    }
  }

  // Add file to OneDrive
  async addFile(file) {
    try {
      const files = await this.getFiles();
      files.push(file);
      return await this.saveFiles(files);
    } catch (error) {
      console.error('Error adding file to OneDrive:', error.message);
      return false;
    }
  }

  // Remove file from OneDrive
  async removeFile(id) {
    try {
      const files = await this.getFiles();
      const updatedFiles = files.filter(file => file.id !== id);
      return await this.saveFiles(updatedFiles);
    } catch (error) {
      console.error('Error removing file from OneDrive:', error.message);
      return false;
    }
  }

  // Get stats from OneDrive
  async getStats() {
    try {
      const data = await this.downloadFile(this.statsDbPath);
      if (Array.isArray(data) || !data) {
        // Return default stats if no data or wrong format
        return {
          total_files: 0,
          total_storage: '0 MB',
          file_type_stats: {},
          client_code_stats: {},
          asset_type_stats: {},
          monthly_stats: {}
        };
      }
      return data;
    } catch (error) {
      console.error('Error getting stats from OneDrive:', error.message);
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

  // Save stats to OneDrive
  async saveStats(stats) {
    try {
      await this.uploadFile(this.statsDbPath, JSON.stringify(stats, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving stats to OneDrive:', error.message);
      return false;
    }
  }

  // Update stats in OneDrive
  async updateStats(newFileData) {
    try {
      const stats = await this.getStats();
      const files = await this.getFiles();
      
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
      
      return await this.saveStats(stats);
    } catch (error) {
      console.error('Error updating stats in OneDrive:', error.message);
      return false;
    }
  }
}

module.exports = { OneDriveDB }; 