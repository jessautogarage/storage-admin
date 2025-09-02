import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader, 
  AlertCircle, 
  Check,
  Trash2,
  Eye
} from 'lucide-react';
import useImageUpload from '../../hooks/useImageUpload';

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 10, 
  folder = 'images',
  existingImages = [],
  allowMultiple = true,
  showPreview = true,
  className = '',
  accept = 'image/*',
  placeholder = 'Upload images',
  description = 'Drag and drop files here, or click to browse'
}) => {
  const [images, setImages] = useState(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const { 
    uploadImage, 
    uploadImages, 
    deleteImage, 
    uploading, 
    progress, 
    error, 
    reset 
  } = useImageUpload();

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      if (allowMultiple && fileArray.length > 1) {
        // Upload multiple files
        const results = await uploadImages(fileArray, {
          folder,
          onProgress: (progress) => {
            // Progress is handled by the hook
          }
        });
        
        const successfulUploads = results
          .filter(result => result.success)
          .map(result => ({
            url: result.url,
            path: result.path,
            name: result.metadata.name,
            size: result.metadata.size
          }));
        
        if (successfulUploads.length > 0) {
          const newImages = [...images, ...successfulUploads];
          setImages(newImages);
          onImagesChange && onImagesChange(newImages);
        }
        
        // Show errors for failed uploads
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
          console.error('Some uploads failed:', failedUploads);
        }
      } else {
        // Upload single file
        const file = fileArray[0];
        const result = await uploadImage(file, { folder });
        
        if (result.success) {
          const newImage = {
            url: result.url,
            path: result.path,
            name: result.metadata.name,
            size: result.metadata.size
          };
          
          const newImages = [...images, newImage];
          setImages(newImages);
          onImagesChange && onImagesChange(newImages);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  }, [images, maxImages, allowMultiple, uploadImage, uploadImages, folder, onImagesChange]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // Remove image
  const removeImage = useCallback(async (index) => {
    const imageToRemove = images[index];
    
    if (imageToRemove.path) {
      // Delete from Firebase Storage
      await deleteImage(imageToRemove.path);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange && onImagesChange(newImages);
  }, [images, deleteImage, onImagesChange]);

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : uploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? openFilePicker : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-3">
            <Loader className="mx-auto text-blue-600 animate-spin" size={48} />
            <div className="space-y-2">
              <p className="text-blue-600 font-medium">Uploading images...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`mx-auto ${dragActive ? 'text-blue-600' : 'text-gray-400'} transition-colors`}>
              <Upload size={48} />
            </div>
            <div>
              <p className={`font-medium ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {placeholder}
              </p>
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Choose Files
            </button>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Maximum {maxImages} images</p>
              <p>Supported: JPEG, PNG, WebP (max 10MB each)</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
          <button 
            onClick={reset}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image.url);
                      }}
                      className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="bg-red-500 bg-opacity-90 text-white p-2 rounded-full hover:bg-opacity-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Image info */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600 truncate">{image.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-opacity-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;