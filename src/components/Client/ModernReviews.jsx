import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserBookings from '../../hooks/useUserBookings';
import ModernHeader from '../Layout/ModernHeader';
import {
  Star,
  Filter,
  Search,
  ChevronDown,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Plus,
  Award,
  TrendingUp
} from 'lucide-react';

const ModernReviews = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fetch user bookings to get completed bookings
  const userId = user?.user?.uid || user?.uid;
  const { bookings, loading: bookingsLoading } = useUserBookings(userId, 'client');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    tags: []
  });

  // Generate reviews from completed bookings
  // In a full implementation, this would query the Firebase reviews collection
  // For now, we'll show which bookings are available for review
  const reviewableBookings = bookings ? bookings.filter(booking => 
    booking.status === 'completed' && !booking.reviewSubmitted
  ) : [];

  const existingReviews = bookings ? bookings.filter(booking => 
    booking.reviewSubmitted && booking.review
  ).map(booking => ({
    id: `review_${booking.id}`,
    bookingId: booking.id,
    listingTitle: booking.listingTitle || 'Storage Space',
    listingId: booking.listingId,
    hostName: booking.hostName || 'Host',
    hostAvatar: booking.hostProfileImage || '/api/placeholder/40/40?text=H',
    rating: booking.review?.rating || 5,
    title: booking.review?.title || 'Great experience',
    comment: booking.review?.comment || 'Had a good experience with this storage space.',
    tags: booking.review?.tags || ['Good Value'],
    createdAt: booking.review?.createdAt || booking.updatedAt,
    status: 'completed',
    helpful: booking.review?.helpful || 0,
    images: booking.review?.images || [],
    hostReply: booking.review?.hostReply || null
  })) : [];

  // Mock reviews for demonstration - in a real app, remove this section
  const mockReviews = [
    {
      id: 'review_1',
      bookingId: 'BK-2024-001',
      listingTitle: 'Secure Storage Unit in Makati CBD',
      listingId: 'listing_1',
      hostName: 'Maria Santos',
      hostAvatar: '/api/placeholder/40/40?text=MS',
      rating: 5,
      title: 'Excellent storage facility with great security',
      comment: 'The storage unit was exactly as described. Clean, secure, and easily accessible. Maria was very helpful throughout the process and responded quickly to all my questions. The 24/7 access was a huge plus for my business needs.',
      tags: ['Clean', 'Secure', 'Helpful Host', 'Good Value'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      status: 'completed',
      helpful: 12,
      images: ['/api/placeholder/200/150?text=Storage+Unit', '/api/placeholder/200/150?text=Clean+Space'],
      hostReply: {
        comment: 'Thank you for the wonderful review! It was a pleasure hosting you.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
      }
    },
    {
      id: 'review_2',
      bookingId: 'BK-2024-002',
      listingTitle: 'Climate-Controlled Warehouse Space',
      listingId: 'listing_2',
      hostName: 'Anna Reyes',
      hostAvatar: '/api/placeholder/40/40?text=AR',
      rating: 4,
      title: 'Good space but could use better lighting',
      comment: 'The climate control works perfectly and the space is exactly the right size for my inventory. Anna is responsive and professional. Only issue was the lighting could be brighter in some corners, but overall a good experience.',
      tags: ['Climate Control', 'Right Size', 'Professional Host'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      status: 'completed',
      helpful: 8,
      images: [],
      hostReply: null
    },
    {
      id: 'review_3',
      bookingId: 'BK-2024-003',
      listingTitle: 'Budget Storage Room - Quezon City',
      listingId: 'listing_3',
      hostName: 'Carlos Mendoza',
      hostAvatar: '/api/placeholder/40/40?text=CM',
      rating: 3,
      title: 'Average experience, good for the price',
      comment: 'For the price point, this storage is decent. It\'s basic but functional. The area could be cleaner and the access hours are limited, but Carlos was accommodating when I needed to pick up items outside normal hours.',
      tags: ['Budget-Friendly', 'Accommodating Host'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      status: 'completed',
      helpful: 3,
      images: [],
      hostReply: {
        comment: 'Thank you for the feedback. We\'re working on improving the cleaning schedule.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      }
    }
  ];

  // Get completed bookings that need reviews
  const completedBookings = bookings?.filter(booking => 
    booking.status === 'completed' && 
    !mockReviews.some(review => review.bookingId === booking.id)
  ) || [];

  // Combine existing reviews with mock data for demonstration
  const allReviews = [...existingReviews, ...mockReviews];
  const [reviews, setReviews] = useState(allReviews);

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = 
        review.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || review.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const renderStarRating = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.hostAvatar}
            alt={review.hostName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{review.listingTitle}</h3>
            <p className="text-sm text-gray-600">Host: {review.hostName}</p>
            <div className="flex items-center space-x-2 mt-1">
              {renderStarRating(review.rating)}
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {review.images.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
            />
          ))}
        </div>
      )}

      {/* Host Reply */}
      {review.hostReply && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Host Response</span>
            <span className="text-sm text-gray-500">
              {formatDate(review.hostReply.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.hostReply.comment}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful} helpful</span>
          </button>
          <button
            onClick={() => navigate(`/client/listing/${review.listingId}`)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Listing
          </button>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          review.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {review.status === 'completed' ? 'Published' : 'Pending'}
        </span>
      </div>
    </div>
  );

  const PendingReviewCard = ({ booking }) => (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Review Pending</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {booking.listing?.title || 'Storage Space'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Booking completed on {formatDate(booking.completedAt?.seconds * 1000 || Date.now())}
          </p>
          <p className="text-sm text-gray-700">
            Help other users by sharing your experience with this storage space and host.
          </p>
        </div>
        
        <button
          onClick={() => {
            setSelectedReview(booking);
            setShowReviewModal(true);
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
        >
          <Star className="w-4 h-4" />
          <span>Write Review</span>
        </button>
      </div>
    </div>
  );

  const ReviewStats = () => {
    const distribution = getRatingDistribution();
    const totalReviews = reviews.length;

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Award className="w-6 h-6 text-blue-600" />
          <span>Your Review Summary</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {getAverageRating()}
            </div>
            <div className="flex justify-center mb-2">
              {renderStarRating(Math.round(parseFloat(getAverageRating())))}
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-xs text-gray-500">{totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-6">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: totalReviews > 0 ? `${(distribution[rating] / totalReviews) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-6">{distribution[rating]}</span>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <span className="font-semibold text-gray-900">{totalReviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Reviews</span>
              <span className="font-semibold text-orange-600">{completedBookings.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Helpful Votes</span>
              <span className="font-semibold text-green-600">
                {reviews.reduce((sum, review) => sum + review.helpful, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while bookings are loading
  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="client"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="client"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <span>My Reviews</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Share your experiences and help other users find great storage spaces
          </p>
        </div>

        {/* Review Stats */}
        {reviews.length > 0 && <ReviewStats />}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews by listing or host name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reviews</option>
              <option value="completed">Published</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Pending Reviews */}
        {completedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-orange-500" />
              <span>Pending Reviews ({completedBookings.length})</span>
            </h2>
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <PendingReviewCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {bookingsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading reviews...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : reviews.length === 0 && completedBookings.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Complete your first booking to leave reviews and help other users find great storage spaces.
              </p>
              <button
                onClick={() => navigate('/client/browse')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Storage Spaces
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernReviews;