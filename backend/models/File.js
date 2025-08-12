const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis']
  },
  assetType: {
    type: String,
    required: true
  },
  clientCode: {
    type: String,
    required: true
  },
  fileDate: {
    type: Date,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
fileSchema.index({ fileType: 1, assetType: 1, clientCode: 1, fileDate: 1 });
fileSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('File', fileSchema);
