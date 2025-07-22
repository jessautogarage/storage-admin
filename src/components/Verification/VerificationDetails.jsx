// src/components/Verification/VerificationDetails.jsx
import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  User, 
  Building, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import DocumentViewer from './DocumentViewer';

const VerificationDetails = ({ verification, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [showDocument, setShowDocument] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this verification?')) {
      onApprove(verification.id, reviewNotes);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(verification.id, rejectionReason);
  };

  const renderPersonalInfo = () => {
    const info = verification.personalInfo || {};
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{info.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">
              {info.dateOfBirth ? format(new Date(info.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{verification.userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{info.phone || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">
              {info.address ? 
                `${info.address.street}, ${info.address.city}, ${info.address.province} ${info.address.postalCode}` 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Type</p>
            <p className="font-medium">{info.idType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Number</p>
            <p className="font-medium">{info.idNumber || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessInfo = () => {
    const info = verification.businessInfo || {};
    
    if (!verification.businessInfo) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Building size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No business information provided</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="font-medium">{info.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="font-medium">{info.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Type</p>
            <p className="font-medium">{info.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tax ID</p>
            <p className="font-medium">{info.taxId || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Business Address</p>
            <p className="font-medium">
              {info.address ? 
                `${info.address.street}, ${info.address.city}, ${info.address.province} ${info.address.postalCode}` 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium">{info.website || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Years in Operation</p>
            <p className="font-medium">{info.yearsInOperation || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    const documents = verification.documents || [];
    
    if (documents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No documents uploaded</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="font-medium">{doc.type}</p>
                  <p className="text-sm text-gray-500">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploaded {format(doc.uploadedAt?.toDate() || new Date(), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDocument(doc)}
                  className="text-blue-600 hover:text-blue-800"
                  title="View"
                >
                  <Eye size={18} />
                </button>
                <a
                  href={doc.url}
                  download
                  className="text-green-600 hover:text-green-800"
                  title="Download"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield size={24} />
            Verification Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Status Banner */}
        {verification.status === 'pending' && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Pending Review</p>
              <p className="text-sm text-yellow-600">
                This verification request is awaiting your review
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* User Info Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{verification.personalInfo?.name}</h3>
                <p className="text-gray-600">{verification.userEmail}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    verification.type === 'host' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {verification.type === 'host' ? 'Host Verification' : 'Premium Client'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Submitted {format(verification.submittedAt?.toDate() || new Date(), 'PPP')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'business', label: 'Business Info', icon: Building },
                { id: 'documents', label: 'Documents', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'business' && renderBusinessInfo()}
            {activeTab === 'documents' && renderDocuments()}
          </div>

          {/* Review Notes */}
          {verification.status === 'pending' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                className="input h-24"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
              />
            </div>
          )}

          {/* Previous Review */}
          {verification.status !== 'pending' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Review Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${
                    verification.status === 'approved' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verification.status}
                  </span>
                </div>
                {verification.approvedAt && (
                  <div>
                    <span className="text-gray-500">Approved on:</span>
                    <span className="ml-2">
                      {format(verification.approvedAt.toDate(), 'PPP')}
                    </span>
                  </div>
                )}
                {verification.rejectedAt && (
                  <div>
                    <span className="text-gray-500">Rejected on:</span>
                    <span className="ml-2">
                      {format(verification.rejectedAt.toDate(), 'PPP')}
                    </span>
                  </div>
                )}
                {verification.rejectionReason && (
                  <div>
                    <span className="text-gray-500">Rejection reason:</span>
                    <p className="mt-1">{verification.rejectionReason}</p>
                  </div>
                )}
                {verification.reviewNotes && (
                  <div>
                    <span className="text-gray-500">Review notes:</span>
                    <p className="mt-1">{verification.reviewNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {verification.status === 'pending' && (
          <div className="p-6 border-t flex justify-between">
            <button
              onClick={() => setShowRejectModal(true)}
              className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <XCircle size={20} />
              Reject
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Approve Verification
              </button>
            </div>
          </div>
        )}

        {verification.status !== 'pending' && (
          <div className="p-6 border-t">
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocument && (
        <DocumentViewer
          document={showDocument}
          onClose={() => setShowDocument(null)}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Verification</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Rejection Reason
              </label>
              <textarea
                className="input h-32"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleReject();
                  setShowRejectModal(false);
                }}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetails;