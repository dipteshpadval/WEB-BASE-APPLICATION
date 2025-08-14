const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  file_type: {
    type: String,
    required: true,
    enum: ['WORKING', 'REPORT', 'SCHEME MASTER', 'DATA']
  },
  asset_type: {
    type: String,
    required: true
  },
  client_code: {
    type: String,
    required: true
  },
  file_date: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  uploaded_at: {
    type: Date,
    required: true
  },
  uploaded_by: {
    type: String,
    required: true
  },
  file_buffer: {
    type: Buffer,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
fileSchema.index({ file_type: 1, asset_type: 1, client_code: 1, file_date: 1 });
fileSchema.index({ uploaded_by: 1 });
fileSchema.index({ id: 1 });

module.exports = mongoose.model('File', fileSchema);
