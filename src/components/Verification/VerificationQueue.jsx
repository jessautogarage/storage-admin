// src/components/Verification/VerificationQueue.jsx
import React from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  User,
  Calendar,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const VerificationQueue = ({ verifications, loading, onSelectVerification }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={16} />;
      case 'approved':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={16} />;
      case 'additional_docs_required':
        return <AlertTriangle className="text-orange-600" size={16} />;
      default:
        return <Shield className="text-gray-600" size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      additional_docs_required: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const getPriorityIndicator = (verification) => {
    const daysSinceSubmission = Math.floor(
      (new Date() - (verification.submittedAt?.toDate() || new Date())) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceSubmission > 3) {
      return <div className="w-2 h-2 bg-red-500 rounded-full" title="High Priority" />;
    } else if (daysSinceSubmission > 1) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Medium Priority" />;
    }
    return <div className="w-2 h-2 bg-green-500 rounded-full" title="Low Priority" />;
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading verifications...</p>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Shield size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No verification requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <div 
          key={verification.id} 
          className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectVerification(verification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Priority Indicator */}
              <div className="mt-2">
                {getPriorityIndicator(verification)}
              </div>

              {/* User Avatar */}
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={24} className="text-gray-600" />
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{verification.personalInfo?.name || 'Unknown'}</h3>
                  {getStatusBadge(verification.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    verification.type === 'host' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {verification.type === 'host' ? 'Host' : 'Premium Client'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>{verification.userEmail}</p>
                  {verification.businessInfo?.name && (
                    <p className="font-medium">{verification.businessInfo.name}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Submitted {format(verification.submittedAt?.toDate() || new Date(), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{verification.documents?.length || 0} documents</span>
                  </div>
                </div>

                {/* Status-specific information */}
                {verification.status === 'rejected' && verification.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection Reason:</span> {verification.rejectionReason}
                    </p>
                  </div>
                )}

                {verification.status === 'additional_docs_required' && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <span className="font-medium">Additional documents required</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVerification(verification);
              }}
            >
              <Eye size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerificationQueue;