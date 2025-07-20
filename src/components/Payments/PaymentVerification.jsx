// src/components/Payments/PaymentVerification.jsx
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';

const PaymentVerification = ({ payment, onVerify, onReject, onClose }) => {
  const [verificationData, setVerificationData] = useState({
    notes: '',
    screenshot: null,
    actualAmount: payment.amount.toString()
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleVerify = () => {
    if (!verificationData.actualAmount) {
      alert('Please enter the actual amount received');
      return;
    }

    onVerify(payment.id, {
      ...verificationData,
      actualAmount: parseFloat(verificationData.actualAmount),
      verifiedAt: new Date(),
      verifiedBy: 'admin' // Should be actual admin user
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    onReject(payment.id, rejectReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Verify Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Warning Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Verification Steps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify the reference number in your GCash/Bank app</li>
                <li>Confirm the exact amount matches</li>
                <li>Check the sender's name matches the user</li>
                <li>Ensure the payment date is recent</li>
              </ul>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Payment Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Payment ID</p>
                <p className="font-medium">#{payment.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-500">Method</p>
                <p className="font-medium capitalize">{payment.method}</p>
              </div>
              <div>
                <p className="text-gray-500">Reference Number</p>
                <p className="font-medium font-mono">{payment.referenceNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Expected Amount</p>
                <p className="font-medium text-lg">₱{payment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">User</p>
                <p className="font-medium">{payment.userName}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {format(payment.createdAt?.toDate() || new Date(), 'PPP p')}
                </p>
              </div>
            </div>
          </div>

          {!showRejectForm ? (
            <div className="space-y-4">
              {/* Actual Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Actual Amount Received
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={verificationData.actualAmount}
                  onChange={(e) => setVerificationData({
                    ...verificationData,
                    actualAmount: e.target.value
                  })}
                  placeholder="Enter actual amount"
                />
                {verificationData.actualAmount && 
                 parseFloat(verificationData.actualAmount) !== payment.amount && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Amount differs from expected: ₱{payment.amount}
                  </p>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  className="input h-24"
                  value={verificationData.notes}
                  onChange={(e) => setVerificationData({
                    ...verificationData,
                    notes: e.target.value
                  })}
                  placeholder="Add any notes about this verification..."
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Screenshot (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    Drag and drop screenshot here, or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVerificationData({
                          ...verificationData,
                          screenshot: file
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                >
                  Reject Payment
                </button>
                <div className="flex gap-3">
                  <button onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Verify Payment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-red-600">Reject Payment</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Rejection
                </label>
                <select
                  className="input mb-3"
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="Invalid reference number">Invalid reference number</option>
                  <option value="Amount mismatch">Amount mismatch</option>
                  <option value="Payment not found">Payment not found</option>
                  <option value="Duplicate payment">Duplicate payment</option>
                  <option value="Other">Other</option>
                </select>
                
                <textarea
                  className="input h-24"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide detailed reason for rejection..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="btn-secondary"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle size={20} />
                    Reject Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;