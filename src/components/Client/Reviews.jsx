import React, { useState } from 'react';
import { Star, Edit3, MessageSquare, ThumbsUp, Calendar, Award } from 'lucide-react';
import ClientLayout from '../Layout/ClientLayout';

const Reviews = () => {
  const [activeTab, setActiveTab] = useState('given');

  // Mock data - replace with actual data from Firebase
  const [reviewsGiven] = useState([
    {
      id: '1',
      listingTitle: 'Spacious Garage Storage',
      hostName: 'John Doe',
      rating: 5,
      date: '2025-01-15',
      review: 'Excellent storage space! Very clean, secure, and the host was extremely helpful. The 24/7 access was perfect for my needs. Highly recommend!',
      helpfulCount: 3,
      hostResponse: 'Thank you so much for your kind words! It was a pleasure having you as a client.',
      bookingPeriod: 'Oct 2024 - Jan 2025'
    },
    {
      id: '2',
      listingTitle: 'Climate Controlled Unit',
      hostName: 'Sarah Johnson',
      rating: 4,
      date: '2024-12-20',
      review: 'Good storage space with excellent climate control. The only downside was limited parking during peak hours. Overall, a positive experience.',
      helpfulCount: 1,
      hostResponse: null,
      bookingPeriod: 'Sep 2024 - Dec 2024'
    },
    {
      id: '3',
      listingTitle: 'Outdoor Storage Shed',
      hostName: 'Mike Davis',
      rating: 3,
      date: '2024-11-10',
      review: 'The space served its purpose but could use some maintenance. The host was responsive to issues when they arose.',
      helpfulCount: 0,
      hostResponse: 'Thank you for your feedback. We\'ve since completed the maintenance work you mentioned.',
      bookingPeriod: 'Aug 2024 - Nov 2024'
    }
  ]);

  const [reviewsReceived] = useState([
    {
      id: '1',
      clientName: 'Emma Wilson',
      rating: 5,
      date: '2025-01-20',
      review: 'Great client! Always paid on time and kept the space clean and organized. Would rent to them again anytime.',
      forListing: 'Your Profile',
      verified: true
    },
    {
      id: '2',
      clientName: 'Robert Chen',
      rating: 4,
      date: '2024-12-15',
      review: 'Reliable client who took good care of the storage space. Communication was smooth throughout the rental period.',
      forListing: 'Your Profile',
      verified: true
    }
  ]);

  const [pendingReviews] = useState([
    {
      id: '1',
      listingTitle: 'Secure Basement Storage',
      hostName: 'Lisa Anderson',
      bookingEndDate: '2025-01-25',
      daysLeft: 5
    },
    {
      id: '2',
      listingTitle: 'Large Attic Space',
      hostName: 'Tom Wilson',
      bookingEndDate: '2025-01-20',
      daysLeft: 10
    }
  ]);

  const tabs = [
    { id: 'given', label: 'Reviews Given', count: reviewsGiven.length },
    { id: 'received', label: 'Reviews Received', count: reviewsReceived.length },
    { id: 'pending', label: 'Pending Reviews', count: pendingReviews.length }
  ];

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const handleEditReview = (reviewId) => {
    // TODO: Implement edit review
    console.log('Edit review:', reviewId);
  };

  const handleMarkHelpful = (reviewId) => {
    // TODO: Implement mark as helpful
    console.log('Mark helpful:', reviewId);
  };

  const handleWriteReview = (pendingReviewId) => {
    // TODO: Navigate to review form
    console.log('Write review for:', pendingReviewId);
  };

  const calculateStats = () => {
    const totalGiven = reviewsGiven.length;
    const averageRating = totalGiven > 0 
      ? reviewsGiven.reduce((sum, r) => sum + r.rating, 0) / totalGiven 
      : 0;
    const totalReceived = reviewsReceived.length;
    const verifiedCount = reviewsReceived.filter(r => r.verified).length;
    
    return {
      totalGiven,
      averageRating,
      totalReceived,
      verifiedCount
    };
  };

  const stats = calculateStats();

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Manage your reviews and feedback</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.totalGiven}</div>
            <div className="text-sm text-gray-600">Reviews Written</div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
              <Star className="text-yellow-500 fill-current" size={20} />
            </div>
            <div className="text-sm text-gray-600">Average Rating Given</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.totalReceived}</div>
            <div className="text-sm text-gray-600">Reviews Received</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600">{stats.verifiedCount}</div>
            <div className="text-sm text-gray-600">Verified Reviews</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Reviews Given */}
            {activeTab === 'given' && (
              <div className="space-y-6">
                {reviewsGiven.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews written yet</h3>
                    <p className="text-gray-600">Your reviews help other clients make informed decisions</p>
                  </div>
                ) : (
                  reviewsGiven.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{review.listingTitle}</h3>
                          <p className="text-sm text-gray-600">Host: {review.hostName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar size={12} className="inline mr-1" />
                            Stayed {review.bookingPeriod}
                          </p>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{review.review}</p>

                      {review.hostResponse && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">Host Response:</p>
                          <p className="text-sm text-gray-700">{review.hostResponse}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleMarkHelpful(review.id)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <ThumbsUp size={14} />
                            <span>{review.helpfulCount} found helpful</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleEditReview(review.id)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                        >
                          <Edit3 size={14} />
                          Edit Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reviews Received */}
            {activeTab === 'received' && (
              <div className="space-y-6">
                {reviewsReceived.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews received yet</h3>
                    <p className="text-gray-600">Reviews from hosts will appear here</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These reviews appear on your public profile and help build trust with hosts.
                      </p>
                    </div>
                    {reviewsReceived.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium">{review.clientName.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{review.clientName}</h3>
                              {review.verified && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <Award size={12} />
                                  Verified Review
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {renderStars(review.rating)}
                            <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                          </div>
                        </div>

                        <p className="text-gray-700">{review.review}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Pending Reviews */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">You don't have any pending reviews</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-yellow-800">
                        <strong>Reminder:</strong> Reviews can only be submitted within 14 days after your booking ends.
                      </p>
                    </div>
                    {pendingReviews.map((pending) => (
                      <div key={pending.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{pending.listingTitle}</h3>
                            <p className="text-sm text-gray-600">Host: {pending.hostName}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Booking ended: {pending.bookingEndDate}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{pending.daysLeft}</div>
                            <p className="text-xs text-gray-600">days left</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleWriteReview(pending.id)}
                          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Write Review
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Reviews;