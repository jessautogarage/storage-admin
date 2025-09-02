import { storage } from '../utils/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

/**
 * Image upload service with utility functions
 */
class ImageUploadService {
  constructor() {
    this.storage = storage;
  }

  /**
   * Generate a unique filename with timestamp and random string
   */
  generateFileName(file, userId, folder = 'images') {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return `${folder}/${userId}/${timestamp}_${randomString}.${fileExtension}`;
  }

  /**
   * Validate image file
   */
  validateImageFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    } = options;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${this.formatFileSize(maxSize)}`);
    }

    return true;
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create image thumbnail using canvas
   */
  async createThumbnail(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload single image to Firebase Storage
   */
  async uploadSingleImage(file, userId, options = {}) {
    const {
      folder = 'images',
      createThumbnail = false,
      thumbnailSize = { width: 300, height: 300 },
      onProgress = null
    } = options;

    try {
      // Validate file
      this.validateImageFile(file);

      // Generate filename
      const fileName = this.generateFileName(file, userId, folder);
      const imageRef = ref(this.storage, fileName);

      // Create metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          originalSize: file.size.toString()
        }
      };

      // Upload original image
      const uploadResult = await uploadBytes(imageRef, file, metadata);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const result = {
        url: downloadURL,
        path: fileName,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      };

      // Create thumbnail if requested
      if (createThumbnail) {
        try {
          const thumbnailBlob = await this.createThumbnail(
            file,
            thumbnailSize.width,
            thumbnailSize.height
          );
          
          const thumbnailFileName = fileName.replace(
            `.${file.name.split('.').pop()}`,
            `_thumb.${file.name.split('.').pop()}`
          );
          
          const thumbnailRef = ref(this.storage, thumbnailFileName);
          const thumbnailUploadResult = await uploadBytes(thumbnailRef, thumbnailBlob, {
            ...metadata,
            customMetadata: {
              ...metadata.customMetadata,
              thumbnail: 'true'
            }
          });
          
          const thumbnailURL = await getDownloadURL(thumbnailUploadResult.ref);
          
          result.thumbnail = {
            url: thumbnailURL,
            path: thumbnailFileName
          };
        } catch (thumbnailError) {
          console.warn('Failed to create thumbnail:', thumbnailError);
        }
      }

      return { success: true, ...result };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files, userId, options = {}) {
    const results = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const result = await this.uploadSingleImage(file, userId, options);
      results.push(result);

      // Call progress callback if provided
      if (options.onProgress) {
        const progress = ((i + 1) / fileArray.length) * 100;
        options.onProgress(progress);
      }
    }

    return results;
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(this.storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(imagePaths) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      const result = await this.deleteImage(imagePath);
      results.push({ path: imagePath, ...result });
    }
    
    return results;
  }

  /**
   * List all images in a folder
   */
  async listImagesInFolder(folderPath) {
    try {
      const folderRef = ref(this.storage, folderPath);
      const result = await listAll(folderRef);
      
      const images = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url: url
          };
        })
      );
      
      return { success: true, images };
    } catch (error) {
      console.error('List images error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up temporary files (older than specified hours)
   */
  async cleanupTempFiles(userId, hoursOld = 24) {
    try {
      const tempFolderRef = ref(this.storage, `temp/${userId}`);
      const result = await listAll(tempFolderRef);
      
      const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
      const filesToDelete = [];
      
      // Check each file's timestamp (assuming filename contains timestamp)
      for (const itemRef of result.items) {
        const fileName = itemRef.name;
        const timestampMatch = fileName.match(/^(\d+)_/);
        
        if (timestampMatch) {
          const fileTimestamp = parseInt(timestampMatch[1]);
          if (fileTimestamp < cutoffTime) {
            filesToDelete.push(itemRef.fullPath);
          }
        }
      }
      
      // Delete old files
      const deleteResults = await this.deleteMultipleImages(filesToDelete);
      
      return {
        success: true,
        deletedCount: deleteResults.filter(r => r.success).length,
        errors: deleteResults.filter(r => !r.success)
      };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get storage usage for a user
   */
  async getUserStorageUsage(userId) {
    try {
      const folders = ['images', 'listings', 'verification', 'temp'];
      let totalSize = 0;
      const folderSizes = {};
      
      for (const folder of folders) {
        const folderPath = `${folder}/${userId}`;
        const folderRef = ref(this.storage, folderPath);
        
        try {
          const result = await listAll(folderRef);
          let folderSize = 0;
          
          // Note: Firebase Storage doesn't provide file sizes directly
          // This is a placeholder - in production, you'd track sizes in Firestore
          folderSizes[folder] = result.items.length;
          
        } catch (err) {
          // Folder doesn't exist or no access
          folderSizes[folder] = 0;
        }
      }
      
      return {
        success: true,
        totalFiles: Object.values(folderSizes).reduce((a, b) => a + b, 0),
        folderSizes
      };
    } catch (error) {
      console.error('Storage usage error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new ImageUploadService();