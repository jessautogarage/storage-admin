import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Shield, 
  AlertCircle, 
  Check,
  PenTool,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

const TermsModal = ({ 
  isOpen, 
  onClose, 
  terms, 
  onAccept,
  requireSignature = true 
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureSection, setShowSignatureSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [scrollPercentage, setScrollPercentage] = useState(0);
  
  const termsContentRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;

      const context = canvas.getContext('2d');
      context.scale(2, 2);
      context.lineCap = 'round';
      context.strokeStyle = '#1e40af';
      context.lineWidth = 2;
      contextRef.current = context;
    }
  }, [isOpen, showSignatureSection]);

  const handleScroll = (e) => {
    const element = e.target;
    const scrolled = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    const percentage = (scrolled / maxScroll) * 100;
    
    setScrollPercentage(percentage);
    
    // Consider terms read when scrolled to at least 90%
    if (percentage >= 90) {
      setHasReadTerms(true);
      if (requireSignature) {
        setShowSignatureSection(true);
      }
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Check if canvas has any drawing
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = imageData.data.some((channel, index) => {
      return index % 4 === 3 && channel > 0; // Check alpha channel
    });
    
    if (hasDrawing) {
      setSignature(canvas.toDataURL());
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleAccept = () => {
    if (!hasReadTerms) {
      alert('Please read the entire terms and conditions first');
      return;
    }

    if (requireSignature) {
      if (!firstName.trim() || !lastName.trim()) {
        alert('Please enter your full name');
        return;
      }
      
      if (!signature) {
        alert('Please provide your signature');
        return;
      }
    }

    onAccept({
      firstName,
      lastName,
      signature,
      acceptedAt: new Date().toISOString(),
      hasReadTerms: true
    });
  };

  const canAccept = hasReadTerms && 
    (!requireSignature || (firstName.trim() && lastName.trim() && signature));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold">Terms and Conditions</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 h-2">
            <div 
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${scrollPercentage}%` }}
            />
          </div>
          
          {!hasReadTerms && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
              <div className="flex items-center space-x-2 text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span>Please scroll down and read the entire terms to continue</span>
                <span className="ml-auto font-medium">
                  {Math.round(scrollPercentage)}% read
                </span>
              </div>
            </div>
          )}

          {/* Terms Content */}
          <div 
            ref={termsContentRef}
            onScroll={handleScroll}
            className="px-6 py-4 max-h-96 overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {terms?.content && Object.entries(terms.content).map(([key, section]) => (
              <div key={key} className="mb-6">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between text-left mb-3 hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${
                      expandedSections[key] === false ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                <div className={`space-y-2 ${expandedSections[key] === false ? 'hidden' : ''}`}>
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Footer */}
            {terms?.footer && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600 italic">
                  {terms.footer.text}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Version: {terms.footer.version} | 
                  Last Updated: {new Date(terms.footer.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {/* Extra padding to ensure full scroll */}
            <div className="h-20"></div>
          </div>

          {/* Signature Section */}
          {showSignatureSection && requireSignature && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Electronic Signature
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Draw Your Signature *
                  </label>
                  <button
                    onClick={clearSignature}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="border-2 border-gray-300 rounded-lg bg-white p-1">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    className="w-full h-32 cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sign above using your mouse or touch screen
                </p>
              </div>
              
              {signature && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-green-800">
                    <Check className="w-4 h-4" />
                    <span>Signature captured</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasReadTerms ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Terms have been read</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Scroll to read all terms</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!canAccept}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canAccept
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {requireSignature ? 'Sign & Accept' : 'Accept Terms'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;