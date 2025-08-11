import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Image as ImageIcon,
  File,
  AlertCircle
} from 'lucide-react';

const DocumentViewer = ({ document, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name || 'document';
    link.click();
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return <ImageIcon className="w-6 h-6" />;
    if (type?.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const renderContent = () => {
    if (!document.url) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500">Document not available</p>
        </div>
      );
    }

    if (document.type?.includes('image')) {
      return (
        <img
          src={document.url}
          alt={document.name}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
        />
      );
    }

    if (document.type?.includes('pdf')) {
      return (
        <iframe
          src={document.url}
          title={document.name}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          {getFileIcon(document.type)}
        </div>
        <h3 className="text-lg font-semibold mb-2">{document.name}</h3>
        <p className="text-gray-500 mb-4">Preview not available</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Download Document
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getFileIcon(document.type)}
            <span className="font-medium">{document.name}</span>
          </div>
          <span className="text-sm text-gray-400">
            {document.size ? `${(document.size / 1024 / 1024).toFixed(2)} MB` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {document.type?.includes('image') && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-4"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default DocumentViewer;