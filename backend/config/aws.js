const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Generate signed URL for secure file access
const generateSignedUrl = async (key, operation = 'getObject', expiresIn = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn
  };

  try {
    const url = await s3.getSignedUrlPromise(operation, params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Upload file to S3
const uploadFile = async (file, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private',
    ServerSideEncryption: 'AES256'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Delete file from S3
const deleteFile = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

module.exports = {
  s3,
  bucketName,
  generateSignedUrl,
  uploadFile,
  deleteFile
}; 