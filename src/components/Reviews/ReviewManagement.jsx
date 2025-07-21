// src/components/Reviews/ReviewManagement.jsx
import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Flag,
  Eye,
  Trash2
} from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { reviewService } from '../../services/reviewService';
import { format } from 'date-fns';
import ReviewDetails from './ReviewDetails';
import ReviewModeration from './ReviewModeration';
import ReviewAnalytics from './ReviewAnalytics';

const ReviewManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showModeration, setShowModeration] = useState(false);

  const { data: reviews, loading } = useFirestore('reviews');
  const { data: users } = useFirestore('users');
  const { data: listings } = useFirestore('listings');

  // Calculate metrics
  const calculateMetrics = () => {
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    
    const totalRating = approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;
    
    const ratingDistribution = {
      5: approvedReviews.filter(r => r.rating === 5).length,
      4: approvedReviews.filter(r => r.rating === 4).length,
      3: approvedReviews.filter(r => r.rating === 3).length,
      2: approvedReviews.filter(r => r.rating === 2).length,
      1: approvedReviews.filter(r => r.rating === 1).length
    };

    return {
      total: reviews.length,
      approved: approvedReviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      flagged: reviews.filter(r => r.status === 'flagged').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      averageRating,
      ratingDistribution,
      responseRate: calculateResponseRate(),
      hostReviews: reviews.filter(r => r.type === 'host').length,
      clientReviews: reviews.filter(r => r.type === 'client').length
    };
  };

  const calculateResponseRate = () => {
    const reviewsWithResponses = reviews.filter(r => r.response);
    return reviews.length > 0 ? (reviewsWithResponses.length / reviews.length) * 100 : 0;
  };

  const metrics = calculateMetrics();

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && review.status === 'pending') ||
      (activeTab === 'flagged' && review.status === 'flagged');
    
    const matchesRating = filterRating === 'all' || 
      review.rating === parseInt(filterRating);
    
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    
    const matchesType = filterType === 'all' || review.type === filterType;
    
    const matchesSearch = 
      review.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.targetName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesRating && matchesStatus && matchesType && matchesSearch;
  });

  const handleApprove = async (reviewId) => {
    await reviewService.approveReview(reviewId);
  };

  const handleReject = async (reviewId, reason) => {
    await reviewService.rejectReview(reviewId, reason);
  };

  const handleFlag = async (reviewId, reason) => {
    await reviewService.flagReview(reviewId, reason);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await reviewService.deleteReview(reviewId);
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Monitor and moderate user reviews</p>
        </div>
        <button
          onClick={() => setActiveTab('analytics')}
          className="btn-primary flex items-center gap-2"
        >
          <BarChart3 size={20} />
          View Analytics
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <ReviewAnalytics reviews={reviews} onBack={() => setActiveTab('all')} />
      ) : (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="text-gray-400" size={20} />
                <span className="text-2xl font-bold">{metrics.total}</span>
              </div>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="text-yellow-500" size={20} />
                <span className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-2xl font-bold">{metrics.approved}</span>
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="text-yellow-600" size={20} />
                <span className="text-2xl font-bold">{metrics.pending}</span>
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <Flag className="text-red-600" size={20} />
                <span className="text-2xl font-bold">{metrics.flagged}</span>
              </div>
              <p className="text-sm text-gray-600">Flagged</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = metrics.ratingDistribution[rating];
                const percentage = metrics.approved > 0 
                  ? (count / metrics.approved) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Reviews ({metrics.total})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending ({metrics.pending})
            </button>
            <button
              onClick={() => setActiveTab('flagged')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'flagged'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Flagged ({metrics.flagged})
            </button>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search reviews..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select
                className="input"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="host">Host Reviews</option>
                <option value="client">Client Reviews</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-medium">{review.rating}.0</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        review.type === 'host' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {review.type} review
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewerName} 
                        <span className="text-gray-500 font-normal"> reviewing </span>
                        {review.targetName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(review.createdAt?.toDate() || new Date(), 'PPP')}
                      </p>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-3">{review.content}</p>
                    
                    {review.response && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                        <p className="text-sm text-gray-700">{review.response}</p>
                      </div>
                    )}
                    
                    {review.flagReason && (
                      <div className="bg-red-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-800">
                          <Flag size={14} className="inline mr-1" />
                          Flagged: {review.flagReason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowModeration(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Flag"
                        >
                          <Flag size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No reviews found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showDetails && selectedReview && (
        <ReviewDetails
          review={selectedReview}
          onClose={() => {
            setShowDetails(false);
            setSelectedReview(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onFlag={handleFlag}
        />
      )}

      {showModeration && selectedReview && (
        <ReviewModeration
          review={selectedReview}
          onClose={() => {
            setShowModeration(false);
            setSelectedReview(null);
          }}
          onFlag={handleFlag}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default ReviewManagement;