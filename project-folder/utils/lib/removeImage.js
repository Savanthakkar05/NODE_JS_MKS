/* eslint-disable no-console */
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
// const s3 = require('./s3-client');

const basePath = path.join(__dirname, '../..');

/**
 * Deletes a file from S3.
 * @param {string} key - S3 object key
 */
const deleteFromS3 = async (key) => {
  try {
    const response = await s3.send(new DeleteObjectCommand({
      Bucket: 'eduwity-documents',
      Key: key,
    }));
    console.log(`Deleted ${key} from S3 successfully.`);
    return response;
  } catch (err) {
    console.error(`Failed to delete ${key} from S3:`, err);
  }
};

/**
 * Deletes a local file using create-wise folder structure (year/month)
 * @param {string} relativePath - Relative path stored in DB
 */
const deleteLocalFile = (relativePath) => {
  if (!relativePath) return;

  // Normalize slashes
  const normalizedPath = relativePath.replace(/\\/g, '/');

  // If the path is already complete, join with basePath
  const fullPath = path.join(basePath, normalizedPath);

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted ${relativePath} from local successfully.`);
    } else {
      console.warn('File does not exist:', relativePath);
    }
  } catch (err) {
    console.error('Error deleting file:', relativePath, err);
  }
};

/**
 * Removes images from S3 or local storage (supports single or multiple files)
 * @param {Object|Array} data - Each item can be:
 *  - { location: 's3'|'local', key: string }
 *  - string (local path)
 */
exports.removeImage = async (data) => {
  if (!data) return;

  const items = Array.isArray(data) ? data : [data];

  await Promise.all(items.map(async (item) => {
    if (item?.location === 's3' && item.path) {
      await deleteFromS3(item.path);
    } else if (item.path) {
      deleteLocalFile(item.path);
    } else if (typeof item === 'string') {
      deleteLocalFile(item);
    }
  }));
};
