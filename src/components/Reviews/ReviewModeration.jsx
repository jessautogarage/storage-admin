import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Flag,
  Eye,
  Clock,
  User,
  Star,
  TrendingUp,
  Filter
} from 'lucide-react';

const ReviewModeration = ({ review, onApprove, onReject, onFlag }) => {
  const [moderationNotes, setModerationNotes] = useState('');
  const [selectedViolations, setSelectedViolations] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const violations = [
    { id: 'spam', label: 'Spam or promotional content', severity: 'high' },
    { id: 'offensive', label: 'Offensive language', severity: 'high' },
    { id: 'fake', label: 'Suspected fake review', severity: 'high' },
    { id: 'irrelevant', label: 'Irrelevant content', severity: 'medium' },
    { id: 'duplicate', label: 'Duplicate review', severity: 'medium' },
    { id: 'competitor', label: 'Competitor manipulation', severity: 'high' },
    { id: 'personal', label: 'Personal information exposed', severity: 'high' },
    { id: 'other', label: 'Other violation', severity: 'low' }
  ];

  const handleViolationToggle = (violationId) => {
    setSelectedViolations(prev => 
      prev.includes(violationId)
        ? prev.filter(id => id !== violationId)
        : [...prev, violationId]
    );
  };

  const handleApprove = () => {
    onApprove(review.id, {
      notes: moderationNotes,
      moderatedAt: new Date(),
      moderatedBy: 'current-admin' // This should come from auth context
    });
  };

  const handleReject = () => {
    if (selectedViolations.length === 0) {
      alert('Please select at least one violation reason');
      return;
    }
    
    onReject(review.id, {
      violations: selectedViolations,
      notes: moderationNotes,
      moderatedAt: new Date(),
      moderatedBy: 'current-admin'
    });
  };

  const handleFlag = () => {
    onFlag(review.id, {
      violations: selectedViolations,
      notes: moderationNotes,
      flaggedAt: new Date(),
      flaggedBy: 'current-admin'
    });
  };

  if (!review) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Review Moderation
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            review.status === 'approved' ? 'bg-green-100 text-green-700' :
            review.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {review.status || 'Pending'}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">{review.userName}</h4>
              <p className="text-sm text-gray-500">{review.userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{review.comment}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {review.views || 0} views
          </span>
          {review.verified && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Verified Purchase
            </span>
          )}
        </div>
      </div>

      {/* Violation Checklist */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Content Violations
        </h4>
        <div className="space-y-2">
          {violations.map(violation => (
            <label 
              key={violation.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedViolations.includes(violation.id)}
                onChange={() => handleViolationToggle(violation.id)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="flex-1">{violation.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                violation.severity === 'high' ? 'bg-red-100 text-red-600' :
                violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {violation.severity}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Moderation Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Moderation Notes
        </label>
        <textarea
          value={moderationNotes}
          onChange={(e) => setModerationNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Add any additional notes about this moderation decision..."
        />
      </div>

      {/* Review History */}
      {review.history && review.history.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showDetails ? 'Hide' : 'Show'} Review History
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-2">
              {review.history.map((entry, index) => (
                <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                  <span className="font-medium">{entry.action}</span> by {entry.moderator}
                  <br />
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  {entry.notes && (
                    <p className="text-xs mt-1">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Approve Review
        </button>
        <button
          onClick={handleReject}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Reject Review
        </button>
        <button
          onClick={handleFlag}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Flag className="w-4 h-4" />
          Flag for Later
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{review.helpfulCount || 0}</div>
          <div className="text-sm text-gray-500">Found Helpful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{review.reportCount || 0}</div>
          <div className="text-sm text-gray-500">Reports</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{review.responseCount || 0}</div>
          <div className="text-sm text-gray-500">Responses</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModeration;