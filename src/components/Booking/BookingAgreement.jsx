import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Check, 
  X, 
  Download, 
  Printer,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Shield,
  PenTool,
  RefreshCw
} from 'lucide-react';

const BookingAgreement = ({ 
  listing, 
  bookingDetails, 
  onAccept, 
  onDecline,
  hostInfo,
  clientInfo 
}) => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState('type'); // 'type' or 'draw'
  const [showSignatureAnimation, setShowSignatureAnimation] = useState(false);
  const canvasRef = useRef(null);
  const [canvasSignature, setCanvasSignature] = useState(null);

  // Canvas drawing functions
  const startDrawing = (e) => {
    if (signatureMode !== 'draw') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || signatureMode !== 'draw') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e40af';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (signatureMode !== 'draw' && isDrawing) {
      const canvas = canvasRef.current;
      setCanvasSignature(canvas.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasSignature(null);
  };

  const handleAccept = async () => {
    const finalSignature = signatureMode === 'draw' ? canvasSignature : signature;
    
    if (!agreed || (!finalSignature || (signatureMode === 'type' && !signature.trim()))) {
      alert('Please agree to the terms and provide your signature');
      return;
    }
    
    // Show signature animation
    setShowSignatureAnimation(true);
    setLoading(true);
    
    // Simulate signature processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onAccept({
      signature: finalSignature,
      signatureType: signatureMode,
      agreedAt: new Date().toISOString(),
      agreementVersion: '1.0'
    });
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Storage Rental Agreement</h2>
              <p className="text-blue-100">Please review and sign before proceeding</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Print Agreement"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Agreement Content */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Parties Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Agreement Between
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Host (Lessor)</span>
              </div>
              <p className="text-sm text-gray-700">{hostInfo?.name || 'Host Name'}</p>
              <p className="text-sm text-gray-600">{hostInfo?.email}</p>
              <p className="text-sm text-gray-600">{hostInfo?.phone}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Client (Lessee)</span>
              </div>
              <p className="text-sm text-gray-700">{clientInfo?.name || 'Your Name'}</p>
              <p className="text-sm text-gray-600">{clientInfo?.email}</p>
              <p className="text-sm text-gray-600">{clientInfo?.phone}</p>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Storage Space Details
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{listing?.title}</p>
                <p className="text-sm text-gray-600">{listing?.address}</p>
                <p className="text-sm text-gray-600">
                  Type: {listing?.storageType} | Size: {listing?.size?.value} {listing?.size?.unit}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Details */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Booking Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Check-in Date</p>
                <p className="font-semibold">{formatDate(bookingDetails?.startDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Check-out Date</p>
                <p className="font-semibold">{formatDate(bookingDetails?.endDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-lg">₱{bookingDetails?.totalAmount?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold capitalize">{bookingDetails?.paymentMethod}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Terms and Conditions
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm text-gray-700">
            <div className="space-y-2">
              <p className="font-semibold">1. Use of Storage Space</p>
              <p className="pl-4">The lessee agrees to use the storage space solely for lawful storage purposes and not for any illegal activities.</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">2. Payment Terms</p>
              <p className="pl-4">Payment must be made according to the selected payment method. For cash payments, payment must be made upon key handover.</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">3. Access and Security</p>
              <p className="pl-4">The lessee will be provided with access details/keys. The lessee is responsible for securing their stored items.</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">4. Liability</p>
              <p className="pl-4">The lessor is not responsible for loss, damage, or theft of items stored unless due to gross negligence.</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">5. Termination</p>
              <p className="pl-4">Either party may terminate this agreement with proper notice as per the booking terms.</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">6. Prohibited Items</p>
              <p className="pl-4">The following items are prohibited: hazardous materials, illegal substances, perishable goods, live animals, or any items that may cause damage or pose risks.</p>
            </div>
          </div>
        </section>

        {/* Agreement Checkbox */}
        <section className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions stated above.</p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to all the terms and conditions of this Storage Rental Agreement
            </span>
          </label>

          {/* Digital Signature with Animation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                <PenTool className="inline w-4 h-4 mr-1" />
                Digital Signature
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSignatureMode('type')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    signatureMode === 'type' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Type
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    signatureMode === 'draw' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Draw
                </button>
              </div>
            </div>
            
            {signatureMode === 'type' ? (
              <div className="relative">
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => {
                    setSignature(e.target.value);
                    if (e.target.value && showSignatureAnimation) {
                      setShowSignatureAnimation(false);
                    }
                  }}
                  placeholder="Enter your full name as signature"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                    showSignatureAnimation 
                      ? 'border-green-500 bg-green-50 animate-pulse' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  } font-signature text-lg`}
                  style={{ fontFamily: 'cursive' }}
                />
                {showSignatureAnimation && signature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg animate-bounce">
                      ✓ Signature Applied
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full h-[150px] cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  {!canvasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-gray-400">Draw your signature here</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Signature
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Time: {new Date().toLocaleTimeString()}</p>
              <p>IP: {window.location.hostname}</p>
            </div>
            
            {showSignatureAnimation && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="font-medium">Signature Verified & Encrypted</span>
                </div>
                <p className="text-sm mt-1">Your signature has been securely recorded</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
        <button
          onClick={onDecline}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Decline
        </button>
        
        <button
          onClick={handleAccept}
          disabled={loading || !agreed || !signature.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Accept & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingAgreement;