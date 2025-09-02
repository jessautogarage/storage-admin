import { useState, useCallback } from 'react';
import { storage } from '../utils/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from './useAuth';

const useImageUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }
    
    return true;
  };

  // Generate unique filename
  const generateFileName = (file, folder = 'images') => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const userId = user?.user?.uid || user?.uid || 'anonymous';
    return `${folder}/${userId}/${timestamp}_${randomString}.${fileExtension}`;
  };

  // Upload single image
  const uploadImage = useCallback(async (file, options = {}) => {
    const {
      folder = 'images',
      onProgress = null,
      compress = true
    } = options;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Validate file
      validateFile(file);

      // Create file reference
      const fileName = generateFileName(file, folder);
      const imageRef = ref(storage, fileName);

      // Compress image if needed (basic implementation)
      let uploadFile = file;
      if (compress && file.size > 1024 * 1024) { // If larger than 1MB
        uploadFile = await compressImage(file);
      }

      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user?.user?.uid || user?.uid || 'anonymous',
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      };

      // Simulate progress (Firebase uploadBytes doesn't provide progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 100);

      // Upload to Firebase Storage
      const uploadResult = await uploadBytes(imageRef, uploadFile, metadata);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setProgress(100);

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return {
        success: true,
        url: downloadURL,
        path: fileName,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      };
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user]);

  // Upload multiple images
  const uploadImages = useCallback(async (files, options = {}) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file, {
        ...options,
        onProgress: (progress) => {
          if (options.onProgress) {
            const totalProgress = ((i / files.length) + (progress / files.length / 100)) * 100;
            options.onProgress(totalProgress);
          }
        }
      });
      results.push(result);
    }
    
    return results;
  }, [uploadImage]);

  // Delete image from Firebase Storage
  const deleteImage = useCallback(async (imagePath) => {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (err) {
      console.error('Image deletion error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Basic image compression (client-side)
  const compressImage = useCallback((file, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;
        
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
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadImage,
    uploadImages,
    deleteImage,
    uploading,
    progress,
    error,
    reset,
    validateFile
  };
};

export default useImageUpload;