import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStorageListings from '../../hooks/useStorageListings';
import useUserBookings from '../../hooks/useUserBookings';
import useUserFavorites from '../../hooks/useUserFavorites';
import { useNotifications } from '../../hooks/useNotifications';
import useMessages from '../../hooks/useMessages';
import usePaymentHistory from '../../hooks/usePaymentHistory';
import ModernHeader from '../Layout/ModernHeader';
import { 
  Search, 
  Calendar, 
  Heart, 
  MapPin, 
  Star, 
  Clock, 
  ArrowRight, 
  Package,
  Car,
  Building,
  Shield,
  Wifi,
  DollarSign,
  MessageCircle,
  Plus,
  Filter,
  TrendingUp,
  Bell,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Settings,
  Eye
} from 'lucide-react';

const ModernClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fetch real data from Firebase
  const userId = user?.user?.uid || user?.uid;
  const userProfile = user?.profile;
  
  const { 
    bookings: userBookings, 
    stats: bookingStats,
    loading: bookingsLoading,
    getUpcomingBookings 
  } = useUserBookings(userId, 'client');
  
  const { 
    listings: recommendedListings, 
    loading: listingsLoading,
    loadMore 
  } = useStorageListings({
    filters: { available: true },
    pageSize: 6
  });
  
  const { 
    favorites,
    loading: favoritesLoading 
  } = useUserFavorites(userId);
  
  const {
    notifications,
    unreadCount: notificationCount,
    markAsRead,
    loading: notificationsLoading
  } = useNotifications(userId);
  
  const {
    conversations,
    unreadCount: messageCount,
    loading: messagesLoading
  } = useMessages(userId, 'client');
  
  const {
    payments,
    stats: paymentStats,
    loading: paymentsLoading
  } = usePaymentHistory(userId, 'client');
  
  // Profile completion check
  const profileCompletion = userProfile ? (
    (userProfile.name ? 1 : 0) +
    (userProfile.phone ? 1 : 0) +
    (userProfile.address ? 1 : 0) +
    (userProfile.profileImage ? 1 : 0)
  ) / 4 * 100 : 0;

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Calculate user stats from real data
  const userStats = {
    activeBookings: bookingStats?.activeCount || 0,
    totalSpent: paymentStats?.totalPaid || bookingStats?.totalSpent || 0,
    favoriteSpaces: favorites?.length || 0,
    reviewsGiven: bookingStats?.reviewsCount || 0
  };

  // Process bookings for display
  const recentBookings = userBookings?.slice(0, 3).map(booking => ({
    id: booking.id,
    title: booking.listing?.title || 'Storage Space',
    location: `${booking.listing?.location?.city || 'Metro Manila'}, ${booking.listing?.location?.district || ''}`,
    dates: booking.startDate && booking.endDate ? 
      `${new Date(booking.startDate.seconds * 1000).toLocaleDateString()} - ${new Date(booking.endDate.seconds * 1000).toLocaleDateString()}` : 
      'Date pending',
    price: booking.totalAmount || 0,
    status: booking.status,
    image: booking.listing?.images?.[0] || '/api/placeholder/100/80',
    host: booking.host?.name || 'Host'
  })) || [];

  // Process favorite spaces
  const favoriteSpaces = favorites?.slice(0, 3).map(fav => ({
    id: fav.listing?.id || fav.id,
    title: fav.listing?.title || 'Storage Space',
    location: `${fav.listing?.location?.city || 'City'}, ${fav.listing?.location?.district || 'District'}`,
    price: fav.listing?.pricing?.daily || 0,
    rating: fav.listing?.rating || 4.5,
    reviews: fav.listing?.reviewCount || 0,
    image: fav.listing?.images?.[0] || '/api/placeholder/200/150',
    available: fav.listing?.status === 'available'
  })) || [];
  
  // Get upcoming bookings
  const upcomingBookings = getUpcomingBookings ? getUpcomingBookings().slice(0, 2) : [];
  
  // Get recent notifications
  const recentNotifications = notifications?.slice(0, 3) || [];
  
  // Get recent messages
  const recentConversations = conversations?.slice(0, 3) || [];
  
  // Get recent payments
  const recentPayments = payments?.slice(0, 3) || [];

  // Process recommended spaces
  const recommendedSpaces = recommendedListings?.slice(0, 2).map(listing => {
    // Debug log to see what image fields are available
    console.log('Listing image data:', {
      id: listing.id,
      title: listing.title,
      images: listing.images,
      imageUrl: listing.imageUrl,
      image: listing.image,
      photos: listing.photos
    });
    
    // Try different possible image fields
    const imageUrl = listing.images?.[0] || 
                     listing.imageUrl || 
                     listing.image || 
                     listing.photos?.[0] || 
                     'https://via.placeholder.com/300x200?text=Storage+Space';
    
    return {
      id: listing.id,
      title: listing.title,
      location: `${listing.location?.city || 'Unknown'}, ${listing.location?.district || 'Location'}`,
      type: listing.type,
      size: `${listing.size?.value || 0} ${listing.size?.unit || 'sqm'}`,
      price: listing.pricing?.daily || listing.price || 0,
      rating: listing.rating || 4.5,
      reviews: listing.reviewCount || 0,
      image: imageUrl,
      features: listing.features || [],
      distance: '2.3 km away' // This could be calculated if we have user location
    };
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'verified': case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  // Format time ago
  const timeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  // Calculate days until next booking
  const getDaysUntilBooking = (startDate) => {
    if (!startDate) return 0;
    const now = new Date();
    const booking = new Date(startDate.seconds ? startDate.seconds * 1000 : startDate);
    const diffTime = booking - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/client/browse')}
          className="flex items-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Find Storage</span>
        </button>
        <button
          onClick={() => navigate('/client/bookings')}
          className="flex items-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">My Bookings</span>
        </button>
        <button
          onClick={() => navigate('/client/favorites')}
          className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Favorites</span>
        </button>
        <button
          onClick={() => navigate('/client/messages')}
          className="flex items-center space-x-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Messages</span>
        </button>
      </div>
    </div>
  );

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
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.name || user?.user?.email?.split('@')[0] || 'Client'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Find the perfect storage space for your needs
              </p>
            </div>
            {(notificationCount > 0 || messageCount > 0) && (
              <div className="flex items-center space-x-4">
                {notificationCount > 0 && (
                  <button
                    onClick={() => navigate('/client/notifications')}
                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notificationCount}
                    </span>
                  </button>
                )}
                {messageCount > 0 && (
                  <button
                    onClick={() => navigate('/client/messages')}
                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {messageCount}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Bookings"
            value={userStats.activeBookings}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Spent"
            value={`₱${userStats.totalSpent.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Favorite Spaces"
            value={userStats.favoriteSpaces}
            icon={Heart}
            color="red"
          />
          <StatCard
            title="Reviews Given"
            value={userStats.reviewsGiven}
            icon={Star}
            color="yellow"
          />
        </div>

        {/* Upcoming Bookings Alert */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Upcoming Booking Reminder</h3>
                  <p className="text-sm text-orange-700">You have bookings starting soon</p>
                </div>
              </div>
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const daysUntil = getDaysUntilBooking(booking.startDate);
                  return (
                    <div key={booking.id} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.listing?.title || 'Storage Space'}</h4>
                          <p className="text-sm text-gray-600">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {booking.listing?.location?.city}, {booking.listing?.location?.district}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-orange-600">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.startDate ? new Date(booking.startDate.seconds * 1000).toLocaleDateString() : 'Date pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Need more storage space?</h2>
              <p className="text-blue-100 mb-4">Find secure, affordable storage in your neighborhood</p>
              <button
                onClick={() => navigate('/client/browse')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Browse Storage Spaces</span>
              </button>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                <button
                  onClick={() => navigate('/client/bookings')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {bookingsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading bookings...</p>
                  </div>
                ) : recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={booking.image}
                        alt={booking.title}
                        className="w-16 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{booking.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{booking.location}</span>
                        </div>
                        <p className="text-xs text-gray-500">{booking.dates}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₱{booking.price.toLocaleString()}</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No bookings yet</p>
                    <button
                      onClick={() => navigate('/client/browse')}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Browse available spaces →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Spaces */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recommended for You</h3>
                <button
                  onClick={() => navigate('/client/browse')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>See more</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {listingsLoading ? (
                  <div className="col-span-2 text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading recommendations...</p>
                  </div>
                ) : recommendedSpaces.length > 0 ? (
                  recommendedSpaces.map((space) => (
                    <div key={space.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1">{space.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{space.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">₱{space.price.toLocaleString()}/day</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{space.rating} ({space.reviews})</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {space.features.map((feature, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate(`/client/listing/${space.id}`)}
                        className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No recommendations available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            
            {/* Favorite Spaces */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Favorite Spaces</h3>
                <button
                  onClick={() => navigate('/client/favorites')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {favoritesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3 p-2">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : favoriteSpaces.length > 0 ? (
                  favoriteSpaces.map((space) => (
                    <div 
                      key={space.id} 
                      className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/client/listing/${space.id}`)}
                    >
                      <img
                        src={space.image}
                        alt={space.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{space.title}</h4>
                        <p className="text-xs text-gray-600">{space.location}</p>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="font-medium">₱{space.price.toLocaleString()}/day</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{space.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${space.available ? 'bg-green-400' : 'bg-gray-300'}`} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No favorite spaces yet</p>
                    <button
                      onClick={() => navigate('/client/browse')}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Browse spaces to add favorites →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion Prompt */}
            {profileCompletion < 100 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Complete Your Profile</span>
                </h3>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-700">Profile Completion</span>
                    <span className="text-blue-700">{Math.round(profileCompletion)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-blue-800 mb-4">
                  Complete your profile to build trust with hosts and get better booking rates.
                </p>
                <button
                  onClick={() => navigate('/client/profile')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            )}
            
            {/* Notifications Widget */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Notifications</span>
                  {notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/client/notifications')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              <div className="space-y-3">
                {notificationsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Widget */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Recent Messages</span>
                  {messageCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {messageCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/client/messages')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              <div className="space-y-3">
                {messagesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : recentConversations.length > 0 ? (
                  recentConversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/client/messages/${conversation.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {conversation.listingTitle || 'Conversation'}
                          </h4>
                          <p className="text-xs text-gray-600">
                            with {conversation.otherUserName || 'Host'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment History Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment History</span>
                </h3>
                <button
                  onClick={() => navigate('/client/payments')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              <div className="space-y-3">
                {paymentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {payment.listing?.title || 'Payment'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {payment.method?.toUpperCase()} • {payment.referenceNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.createdAt ? payment.createdAt.toLocaleDateString() : 'Date unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₱{payment.amount?.toLocaleString() || '0'}
                        </p>
                        <p className={`text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No payments yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Storage Tips</span>
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-green-800">💡 Book early for better rates and availability</p>
                <p className="text-sm text-green-800">🔒 Always check security features before booking</p>
                <p className="text-sm text-green-800">📱 Use our mobile app for instant access codes</p>
              </div>
              <button
                onClick={() => navigate('/client/help')}
                className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Learn more →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernClientDashboard;