import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ImageUpload from '../Common/ImageUpload';
import useImageUpload from '../../hooks/useImageUpload';
import imageUploadService from '../../services/imageUploadService';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Download, 
  Info, 
  CheckCircle, 
  XCircle,
  Loader
} from 'lucide-react';

const ImageUploadTest = () => {
  const { user } = useAuth();
  const [testImages, setTestImages] = useState([]);
  const [singleImage, setSingleImage] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { uploadImage, uploading, progress, error } = useImageUpload();
  
  const userId = user?.user?.uid || user?.uid || 'test-user';

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [{
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  // Test single image upload
  const testSingleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setLoading(true);
      try {
        const result = await uploadImage(file, { folder: 'test' });
        
        if (result.success) {
          setSingleImage(result);
          addTestResult('Single Upload', true, `Uploaded: ${file.name}`);
        } else {
          addTestResult('Single Upload', false, result.error);
        }
      } catch (err) {
        addTestResult('Single Upload', false, err.message);
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  // Test service upload with thumbnail
  const testServiceUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setLoading(true);
      try {
        const result = await imageUploadService.uploadSingleImage(file, userId, {
          folder: 'test',
          createThumbnail: true,
          thumbnailSize: { width: 200, height: 200 }
        });
        
        if (result.success) {
          addTestResult('Service Upload (w/ Thumbnail)', true, 
            `Original: ${result.url.substring(0, 50)}...`);
          if (result.thumbnail) {
            addTestResult('Thumbnail Creation', true, 
              `Thumbnail: ${result.thumbnail.url.substring(0, 50)}...`);
          }
        } else {
          addTestResult('Service Upload', false, result.error);
        }
      } catch (err) {
        addTestResult('Service Upload', false, err.message);
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  // Test file validation
  const testFileValidation = async () => {
    try {
      // Create a mock large file
      const largeFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });
      
      imageUploadService.validateImageFile(largeFile);
      addTestResult('File Validation', false, 'Should have failed for large file');
    } catch (err) {
      addTestResult('File Validation', true, `Correctly rejected: ${err.message}`);
    }
    
    try {
      // Test invalid file type
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      imageUploadService.validateImageFile(invalidFile);
      addTestResult('File Type Validation', false, 'Should have failed for text file');
    } catch (err) {
      addTestResult('File Type Validation', true, `Correctly rejected: ${err.message}`);
    }
  };

  // Test storage usage
  const testStorageUsage = async () => {
    setLoading(true);
    try {
      const usage = await imageUploadService.getUserStorageUsage(userId);
      if (usage.success) {
        addTestResult('Storage Usage', true, 
          `Total files: ${usage.totalFiles}`);
      } else {
        addTestResult('Storage Usage', false, usage.error);
      }
    } catch (err) {
      addTestResult('Storage Usage', false, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test cleanup temp files
  const testCleanup = async () => {
    setLoading(true);
    try {
      const result = await imageUploadService.cleanupTempFiles(userId, 0); // Clean all
      if (result.success) {
        addTestResult('Cleanup', true, 
          `Deleted ${result.deletedCount} temp files`);
      } else {
        addTestResult('Cleanup', false, result.error);
      }
    } catch (err) {
      addTestResult('Cleanup', false, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to test image upload functionality</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Image Upload System Test</h1>
        <p className="text-gray-600 mb-6">
          Test all aspects of the image upload functionality including validation, 
          Firebase Storage integration, and error handling.
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-blue-500" size={20} />
          <span className="text-sm text-gray-600">
            User: {userId} | Storage Rules: Active
          </span>
        </div>
      </div>

      {/* Multiple Image Upload Component Test */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Test: Multiple Images</h2>
        <ImageUpload
          onImagesChange={setTestImages}
          maxImages={5}
          folder="test"
          existingImages={testImages}
          placeholder="Test multiple image upload"
          description="Upload up to 5 test images to verify drag & drop, validation, and preview"
        />
        
        {testImages.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              ✅ Successfully uploaded {testImages.length} image{testImages.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Individual Test Buttons */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Function Tests</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testSingleUpload}
            disabled={loading || uploading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            Single Upload
          </button>
          
          <button
            onClick={testServiceUpload}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={16} />
            Service + Thumbnail
          </button>
          
          <button
            onClick={testFileValidation}
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700"
          >
            <CheckCircle size={16} />
            Validation
          </button>
          
          <button
            onClick={testStorageUsage}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Info size={16} />
            Storage Usage
          </button>
          
          <button
            onClick={testCleanup}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Cleanup
          </button>
          
          <button
            onClick={clearResults}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
          >
            <XCircle size={16} />
            Clear Results
          </button>
        </div>
        
        {/* Upload Progress */}
        {(uploading || loading) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Loader className="animate-spin text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">
                {uploading ? 'Uploading...' : 'Processing...'}
              </span>
            </div>
            {uploading && progress > 0 && (
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={20} />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Single Image Result */}
      {singleImage && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Single Upload Result</h2>
          <div className="flex items-center gap-4">
            <img 
              src={singleImage.url} 
              alt="Test upload" 
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium">{singleImage.metadata.name}</p>
              <p className="text-sm text-gray-600">
                Size: {imageUploadService.formatFileSize(singleImage.metadata.size)}
              </p>
              <p className="text-sm text-gray-600 truncate max-w-md">
                URL: {singleImage.url}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="text-green-600 mt-0.5" size={16} />
                ) : (
                  <XCircle className="text-red-600 mt-0.5" size={16} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.test}
                  </p>
                  <p className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
                <span className={`text-xs ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTest;