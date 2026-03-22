'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROADVIEW_STORAGE } = require('../config');

// Marketplace storage paths
const MARKETPLACE_ROOT = path.join(ROADVIEW_STORAGE, 'marketplace');
const LISTINGS_DIR = path.join(MARKETPLACE_ROOT, 'listings');
const SELLERS_DIR = path.join(MARKETPLACE_ROOT, 'sellers');
const TEMP_DIR = path.join(MARKETPLACE_ROOT, 'temp');

// Ensure directories exist
function ensureDirectories() {
  [MARKETPLACE_ROOT, LISTINGS_DIR, SELLERS_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

ensureDirectories();

/**
 * Generate safe filename
 */
function generateSafeFilename(originalName, prefix = '') {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}${timestamp}-${random}${ext}`;
}

/**
 * Get listing directory path
 */
function getListingDir(listingId) {
  const dir = path.join(LISTINGS_DIR, listingId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get seller directory path
 */
function getSellerDir(sellerId) {
  const dir = path.join(SELLERS_DIR, sellerId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Save uploaded file (base64)
 */
function saveBase64File(base64Data, listingId, filename, type = 'listing') {
  const targetDir = type === 'seller' ? getSellerDir(listingId) : getListingDir(listingId);
  const safeFilename = generateSafeFilename(filename);
  const filePath = path.join(targetDir, safeFilename);

  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');

  fs.writeFileSync(filePath, buffer);

  // Return relative URL
  return `/storage/marketplace/${type === 'seller' ? 'sellers' : 'listings'}/${listingId}/${safeFilename}`;
}

/**
 * Save buffer file
 */
function saveBufferFile(buffer, listingId, filename, type = 'listing') {
  const targetDir = type === 'seller' ? getSellerDir(listingId) : getListingDir(listingId);
  const safeFilename = generateSafeFilename(filename);
  const filePath = path.join(targetDir, safeFilename);

  fs.writeFileSync(filePath, buffer);

  return `/storage/marketplace/${type === 'seller' ? 'sellers' : 'listings'}/${listingId}/${safeFilename}`;
}

/**
 * Delete file
 */
function deleteFile(fileUrl) {
  try {
    const filePath = path.join(ROADVIEW_STORAGE, '..', fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  return false;
}

/**
 * Delete listing directory
 */
function deleteListingFiles(listingId) {
  try {
    const dir = path.join(LISTINGS_DIR, listingId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    }
  } catch (err) {
    console.error('Error deleting listing directory:', err);
  }
  return false;
}

/**
 * Validate file type
 */
function isValidFileType(filename, allowedTypes) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return allowedTypes.includes(ext);
}

/**
 * Get file size limit by type
 */
function getFileSizeLimit(fileType) {
  const limits = {
    image: 5 * 1024 * 1024,      // 5MB for images
    model: 100 * 1024 * 1024,    // 100MB for 3D models
    scene: 200 * 1024 * 1024,    // 200MB for complete scenes
    archive: 500 * 1024 * 1024   // 500MB for archives
  };
  return limits[fileType] || 10 * 1024 * 1024; // Default 10MB
}

// Allowed file extensions
const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  model: ['obj', 'fbx', 'gltf', 'glb', 'dae', 'stl', 'blend'],
  scene: ['json', 'scene', 'unity', 'unreal'],
  archive: ['zip', 'tar', 'gz', '7z', 'rar']
};

module.exports = {
  generateSafeFilename,
  getListingDir,
  getSellerDir,
  saveBase64File,
  saveBufferFile,
  deleteFile,
  deleteListingFiles,
  isValidFileType,
  getFileSizeLimit,
  ALLOWED_EXTENSIONS,
  MARKETPLACE_ROOT,
  LISTINGS_DIR,
  SELLERS_DIR,
  TEMP_DIR
};
