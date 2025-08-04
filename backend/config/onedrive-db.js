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
    try {
      // Check if folder exists
      const response = await axios.get(`${ONEDRIVE_API_BASE}/root:/${ONEDRIVE_FOLDER}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      this.folderId = response.data.id;
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
      } else {
        throw error;
      }
    }
  }

  // Upload file to OneDrive
  async uploadFile(filePath, content) {
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
        return null; // File doesn't exist
      }
      console.error('OneDrive download error:', error.message);
      throw error;
    }
  }

  // Database operations
  async getFiles() {
    try {
      const data = await this.downloadFile(this.filesDbPath);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading files from OneDrive:', error);
      return [];
    }
  }

  async saveFiles(files) {
    try {
      await this.uploadFile(this.filesDbPath, JSON.stringify(files, null, 2));
    } catch (error) {
      console.error('Error saving files to OneDrive:', error);
    }
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
    try {
      const data = await this.downloadFile(this.statsDbPath);
      return data ? JSON.parse(data) : {
        total_files: 0,
        file_type_stats: {},
        asset_type_stats: {},
        client_code_stats: {},
        monthly_stats: {}
      };
    } catch (error) {
      console.error('Error reading stats from OneDrive:', error);
      return {
        total_files: 0,
        file_type_stats: {},
        asset_type_stats: {},
        client_code_stats: {},
        monthly_stats: {}
      };
    }
  }

  async saveStats(stats) {
    try {
      await this.uploadFile(this.statsDbPath, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Error saving stats to OneDrive:', error);
    }
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

module.exports = { OneDriveDB }; 