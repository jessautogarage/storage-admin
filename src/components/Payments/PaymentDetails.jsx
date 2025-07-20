// src/components/Payments/PaymentDetails.jsx
import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

const PaymentDetails = ({ payment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Generate PDF receipt logic here
    console.log('Downloading receipt...');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">#{payment.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  payment.status === 'verified' 
                    ? 'bg-green-100 text-green-800'
                    : payment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Created</p>
                <p className="font-medium">
                  {format(payment.createdAt?.toDate() || new Date(), 'PPP p')}
                </p>
              </div>
              {payment.verifiedAt && (
                <div>
                  <p className="text-sm text-gray-500">Date Verified</p>
                  <p className="font-medium">
                    {format(payment.verifiedAt.toDate(), 'PPP p')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{payment.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{payment.userEmail}</p>
              </div>
              {payment.userPhone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{payment.userPhone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">User Type</p>
                <p className="font-medium capitalize">{payment.userType || 'Client'}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Method</p>
                <p className="font-medium capitalize">{payment.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference Number</p>
                <p className="font-medium font-mono">{payment.referenceNumber || 'N/A'}</p>
              </div>
              {payment.accountName && (
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-medium">{payment.accountName}</p>
                </div>
              )}
              {payment.accountNumber && (
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{payment.accountNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amount Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Amount Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₱{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (9%)</span>
                <span className="font-medium">₱{(payment.amount * 0.09).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">₱{payment.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          {payment.bookingId && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Related Booking</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Booking ID: #{payment.bookingId.slice(-6).toUpperCase()}
                </p>
                {payment.listingTitle && (
                  <p className="text-sm text-blue-600 mt-1">{payment.listingTitle}</p>
                )}
              </div>
            </div>
          )}

          {/* Verification Details */}
          {payment.verifiedBy && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Verification Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Verified By</p>
                  <p className="font-medium">{payment.verifiedBy}</p>
                </div>
                {payment.verificationNotes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{payment.verificationNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Details */}
          {payment.status === 'failed' && payment.rejectionReason && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Rejection Details</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-800">{payment.rejectionReason}</p>
                {payment.rejectedBy && (
                  <p className="text-xs text-red-600 mt-2">
                    Rejected by: {payment.rejectedBy}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={handleDownloadReceipt}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Download Receipt
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;