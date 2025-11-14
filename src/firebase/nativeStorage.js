/**
 * Native Storage Implementation
 * Uses Capacitor Filesystem and Firebase Storage for iOS/Android
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { FirebaseStorage } from '@capacitor-firebase/storage';

/**
 * Upload a file to Firebase Storage on native platforms
 * @param {string} storagePath - The path in Firebase Storage (e.g., 'profilePictures/userId/filename.jpg')
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadFile = async (storagePath, file) => {
  try {
    console.log('Uploading file to native storage:', storagePath);
    
    // Convert file to base64 if it's a Blob or File
    let base64Data;
    if (file instanceof Blob || file instanceof File) {
      base64Data = await blobToBase64(file);
    } else if (typeof file === 'string') {
      base64Data = file;
    } else {
      throw new Error('Invalid file format');
    }
    
    // Upload to Firebase Storage using Capacitor plugin
    const result = await FirebaseStorage.uploadFile({
      path: storagePath,
      blob: base64Data
    });
    
    // Get download URL
    const downloadUrlResult = await FirebaseStorage.getDownloadUrl({
      path: storagePath
    });
    
    console.log('File uploaded successfully:', downloadUrlResult.downloadUrl);
    return downloadUrlResult.downloadUrl;
  } catch (error) {
    console.error('Error uploading file to native storage:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage on native platforms
 * @param {string} storagePath - The path in Firebase Storage
 * @returns {Promise<void>}
 */
export const deleteFile = async (storagePath) => {
  try {
    console.log('Deleting file from native storage:', storagePath);
    
    await FirebaseStorage.deleteFile({
      path: storagePath
    });
    
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file from native storage:', error);
    throw error;
  }
};

/**
 * Get download URL for a file in Firebase Storage
 * @param {string} storagePath - The path in Firebase Storage
 * @returns {Promise<string>} The download URL
 */
export const getDownloadUrl = async (storagePath) => {
  try {
    const result = await FirebaseStorage.getDownloadUrl({
      path: storagePath
    });
    
    return result.downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

/**
 * Helper function to convert Blob/File to base64
 * @param {Blob|File} blob - The blob to convert
 * @returns {Promise<string>} Base64 string
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1] || base64String;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
