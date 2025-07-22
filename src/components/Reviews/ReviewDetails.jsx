// src/components/Reviews/ReviewDetails.jsx
import React, { useState } from 'react';
import { 
  X, 
  Star, 
  User, 
  Calendar, 
  MapPin, 
  Package,
  MessageSquare,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';

const ReviewDetails = ({ review, onClose, onApprove, onReject, onFlag }) => {
  const [actionType, setActionType] = useState(null);
  const [reason, setReason] = useState('');

  const handleAction = async () => {
    if (!reason.trim() && actionType !== 'approve') {
      alert('Please provide a reason');
      return;
    }

    switch (actionType) {
      case 'approve':
        await onApprove(review.id);
        break;
      case 'reject':
        await onReject(review.id, reason);
        break;
      case 'flag':
        await onFlag(review.id, reason);
        break;
    }

    onClose();
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Review Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Review Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={review.rating} />
                <span className="text-lg font-medium">{review.rating}.0</span>
              </div>
              <p className="text-sm text-gray-600">
                Review ID: #{review.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                review.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : review.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : review.status === 'flagged'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {review.status}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                review.type === 'host' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {review.type} review
              </span>
            </div>
          </div>

          {/* Reviewer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} />
                Reviewer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{review.reviewerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{review.reviewerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">User Type</p>
                  <p className="font-medium capitalize">{review.reviewerType}</p>
                </div>
                {review.bookingId && (
                  <div>
                    <p className="text-gray-500">Booking ID</p>
                    <p className="font-medium">#{review.bookingId.slice(-6).toUpperCase()}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Package size={18} />
                Target Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{review.targetName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium capitalize">
                    {review.type === 'host' ? 'Host' : 'Listing'}
                  </p>
                </div>
                {review.targetId && (
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="font-medium">#{review.targetId.slice(-6).toUpperCase()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={18} />
              Review Content
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
              <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                <Calendar size={14} />
                {format(review.createdAt?.toDate() || new Date(), 'PPpp')}
              </p>
            </div>
          </div>

          {/* Response */}
          {review.response && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Response</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700">{review.response}</p>
                {review.responseDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Responded on {format(review.responseDate.toDate(), 'PPP')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rating Breakdown */}
          {review.ratingBreakdown && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Rating Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Cleanliness</p>
                  <p className="font-semibold">{review.ratingBreakdown.cleanliness}/5</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Communication</p>
                  <p className="font-semibold">{review.ratingBreakdown.communication}/5</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{review.ratingBreakdown.location}/5</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-semibold">{review.ratingBreakdown.value}/5</p>
                </div>
              </div>
            </div>
          )}

          {/* Previous Actions */}
          {review.moderationHistory && review.moderationHistory.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Moderation History</h3>
              <div className="space-y-2">
                {review.moderationHistory.map((action, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{action.action}</span>
                      <span className="text-gray-500">
                        {format(action.date.toDate(), 'PPP')}
                      </span>
                    </div>
                    {action.reason && (
                      <p className="text-gray-600 mt-1">{action.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">By: {action.moderator}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Section */}
          {review.status === 'pending' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Take Action</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setActionType('approve')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      actionType === 'approve'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="mx-auto text-green-600 mb-1" size={24} />
                    <p className="text-sm font-medium">Approve</p>
                  </button>
                  <button
                    onClick={() => setActionType('flag')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      actionType === 'flag'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Flag className="mx-auto text-yellow-600 mb-1" size={24} />
                    <p className="text-sm font-medium">Flag</p>
                  </button>
                  <button
                    onClick={() => setActionType('reject')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      actionType === 'reject'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <XCircle className="mx-auto text-red-600 mb-1" size={24} />
                    <p className="text-sm font-medium">Reject</p>
                  </button>
                </div>

                {(actionType === 'flag' || actionType === 'reject') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason for {actionType === 'flag' ? 'flagging' : 'rejection'}
                    </label>
                    <textarea
                      className="input h-24"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Provide a reason for ${actionType}ing this review...`}
                    />
                  </div>
                )}

                {actionType && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setActionType(null);
                        setReason('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAction}
                      className={`flex-1 ${
                        actionType === 'approve'
                          ? 'btn-primary bg-green-600 hover:bg-green-700'
                          : actionType === 'flag'
                          ? 'btn-primary bg-yellow-600 hover:bg-yellow-700'
                          : 'btn-primary bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Confirm {actionType}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;