import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { useToast } from '../Notifications/EnhancedToast';
import ModernHeader from '../Layout/ModernHeader';
import useUserBookings from '../../hooks/useUserBookings';
import useHostMessages from '../../hooks/useHostMessages';
import { useHostAnalytics } from '../../hooks/useHostAnalytics';
import useHostWallet from '../../hooks/useHostWallet';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Star, 
  Users,
  Building,
  Car,
  Package,
  Eye,
  MessageCircle,
  Clock,
  Shield,
  ArrowRight,
  BarChart3,
  PieChart,
  MapPin,
  Camera,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Coins,
  BellRing,
  WifiOff,
  RefreshCw
} from 'lucide-react';

const ModernHostDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { listings, stats, loading, error, refresh } = useListings();
  const { showSuccess, showInfo } = useToast();
  const [timeframe, setTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real-time data hooks
  const { bookings, stats: bookingStats, loading: bookingsLoading } = useUserBookings(user?.uid, 'host');
  const { conversations, unreadCount, loading: messagesLoading } = useHostMessages();
  const { analytics, loading: analyticsLoading } = useHostAnalytics('30d');
  const { walletData, transactions, earnings, loading: walletLoading } = useHostWallet(user?.uid);
  
  // Handle success message from location state
  useEffect(() => {
    if (location.state?.message) {
      showSuccess(location.state.message, {
        duration: 5000,
        title: 'Welcome Back!'
      });
      
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
    // ESLint disable next line - showSuccess is now memoized but we don't want to trigger this effect on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.message]);

  // Calculate real dashboard stats
  const dashboardStats = {
    totalEarnings: {
      today: earnings?.thisMonth || 0,
      month: earnings?.thisMonth || 0,
      year: earnings?.thisYear || 0,
      growth: earnings?.growth || 0
    },
    bookings: {
      active: bookingStats?.activeCount || 0,
      pending: bookings?.filter(b => b.status === 'pending')?.length || 0,
      total: bookingStats?.completedCount + bookingStats?.activeCount || 0,
      completed: bookingStats?.completedCount || 0,
      upcoming: bookingStats?.upcomingCount || 0,
      growth: analytics?.overview?.bookingsChange || 0
    },
    listings: {
      active: stats?.activeListings || 0,
      views: stats?.totalViews || 0,
      avgRating: stats?.averageRating || 0,
      growth: analytics?.overview?.viewsChange || 0
    },
    occupancy: {
      rate: analytics?.overview?.occupancyRate || 0,
      growth: analytics?.overview?.occupancyChange || 0
    },
    messages: {
      total: conversations?.length || 0,
      unread: unreadCount || 0
    },
    revenue: {
      available: walletData?.balance || 0,
      pending: walletData?.pending || 0,
      withdrawn: walletData?.withdrawn || 0
    }
  };

  // Real recent bookings from Firebase with safety checks
  const recentBookings = bookings?.slice(0, 5).map(booking => {
    const startDate = booking.startDate?.seconds 
      ? new Date(booking.startDate.seconds * 1000)
      : booking.createdAt?.seconds 
      ? new Date(booking.createdAt.seconds * 1000)
      : new Date();
      
    const endDate = booking.endDate?.seconds 
      ? new Date(booking.endDate.seconds * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to next day
      
    const guestName = booking.client?.displayName || booking.client?.name || booking.client?.email || 'Guest';
    
    return {
      id: booking.id,
      guest: guestName,
      guestEmail: booking.client?.email || '',
      listingTitle: booking.listing?.title || 'Listing',
      dates: `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`,
      amount: booking.totalAmount || booking.hostEarnings || 0,
      status: booking.status || 'pending',
      avatar: booking.client?.photoURL || `/api/placeholder/40/40?text=${guestName.charAt(0)}`,
      createdAt: booking.createdAt?.seconds * 1000 || Date.now(),
      bookingId: booking.id
    };
  }) || [];

  // Use real listings data
  const displayListings = listings.map(listing => ({
    id: listing.id,
    title: listing.title,
    type: listing.type,
    size: `${listing.size} sq ft`,
    price: listing.pricing?.daily || 0,
    status: listing.status,
    occupancy: Math.floor(Math.random() * 100), // Would be calculated from bookings
    rating: listing.rating || 0,
    reviews: listing.reviewCount || 0,
    views: listing.views || 0,
    image: listing.images?.[0]?.url || '/api/placeholder/200/150?text=Storage+Space',
    nextBooking: null // Would come from bookings data
  }));

  // Real earnings data from analytics
  const earningsData = analytics?.revenueData?.map(item => ({
    month: format(new Date(item.date || item.month || Date.now()), 'MMM'),
    amount: item.revenue || item.amount || 0
  })) || [
    { month: format(new Date(), 'MMM'), amount: earnings?.thisMonth || 0 }
  ];
  
  // Recent messages from real data with safety checks
  const recentMessages = conversations?.slice(0, 3).map(conv => ({
    id: conv.id,
    clientName: conv.clientName || 'Unknown Client',
    clientEmail: conv.clientEmail || '',
    lastMessage: conv.lastMessage || 'No messages yet',
    timestamp: conv.lastMessageTime || new Date(),
    unread: (conv.unreadCount || 0) > 0,
    listingTitle: conv.listingTitle || 'General Inquiry'
  })) || [];
  
  // Action items and alerts
  const actionItems = [
    ...(bookings?.filter(b => b.status === 'pending')?.map(b => ({
      id: `booking-${b.id}`,
      type: 'booking',
      title: 'New booking request',
      description: `${b.client?.displayName || 'Guest'} wants to book ${b.listing?.title}`,
      action: () => navigate('/host/bookings'),
      priority: 'high'
    })) || []),
    ...(conversations?.filter(c => c.unreadCount > 0)?.map(c => ({
      id: `message-${c.id}`,
      type: 'message', 
      title: 'Unread messages',
      description: `${c.clientName}: ${c.lastMessage.substring(0, 50)}...`,
      action: () => navigate('/host/messages'),
      priority: 'medium'
    })) || []),
    ...(listings?.filter(l => l.status === 'pending')?.map(l => ({
      id: `listing-${l.id}`,
      type: 'listing',
      title: 'Listing needs attention',
      description: `${l.title} is pending approval`,
      action: () => navigate(`/host/listings/${l.id}/edit`),
      priority: 'low'
    })) || [])
  ];
  
  // Upcoming bookings for calendar widget with safety checks
  const upcomingBookings = bookings?.filter(b => 
    b.status === 'confirmed' || b.status === 'upcoming'
  ).map(booking => ({
    ...booking,
    startDate: booking.startDate || booking.createdAt,
    endDate: booking.endDate || booking.createdAt
  })).slice(0, 5) || [];

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };
  
  // Handle loading states
  const isLoading = loading || bookingsLoading || messagesLoading || analyticsLoading || walletLoading;
  
  // Handle errors
  const hasError = error;
  
  // Refresh all data
  const refreshAllData = useCallback(async () => {
    try {
      await refresh();
      showSuccess('Dashboard data refreshed');
    } catch (err) {
      showInfo('Some data may not be current');
    }
  }, [refresh, showSuccess, showInfo]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const StatCard = ({ title, value, subtitle, growth, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
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
        {growth !== undefined && (
          <div className={`flex items-center space-x-1 ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${growth < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {Math.abs(growth)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/host/listings/new')}
          className="flex items-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Listing</span>
        </button>
        <button
          onClick={() => navigate('/host/bookings')}
          className="flex items-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Bookings</span>
          {dashboardStats.bookings.pending > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {dashboardStats.bookings.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/host/messages')}
          className="flex items-center space-x-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Messages</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/host/wallet')}
          className="flex items-center space-x-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Coins className="w-4 h-4" />
          <span className="text-sm font-medium">Wallet</span>
          {dashboardStats.revenue.available > 0 && (
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              ₱{Math.round(dashboardStats.revenue.available / 1000)}k
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/host/analytics')}
          className="flex items-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">Analytics</span>
        </button>
        <button
          onClick={() => navigate('/host/settings')}
          className="flex items-center space-x-2 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );

  const RecentBookings = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
        <button
          onClick={() => navigate('/host/bookings')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>View all ({dashboardStats.bookings.total})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                 onClick={() => navigate(`/host/bookings/${booking.bookingId}`)}>
              <div className="flex items-center space-x-3">
                <img
                  src={booking.avatar}
                  alt={booking.guest}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.src = `/api/placeholder/40/40?text=${booking.guest.charAt(0)}`;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{booking.guest}</p>
                  <p className="text-sm text-gray-600">{booking.listingTitle}</p>
                  <p className="text-xs text-gray-500">{booking.dates}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₱{booking.amount.toLocaleString()}</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent bookings</p>
            <button
              onClick={() => navigate('/host/listings')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Promote your listings →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MyListings = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">My Listings</h3>
        <button
          onClick={() => navigate('/host/listings')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <span>Manage all</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid gap-4">
        {displayListings.length > 0 ? (
          displayListings.slice(0, 3).map((listing) => (
            <div key={listing.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-16 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/200/150?text=Storage+Space';
                }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{listing.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{listing.size}</span>
                  <span>₱{listing.price.toLocaleString()}/day</span>
                  {listing.rating > 0 && (
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{listing.rating} ({listing.reviews})</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{listing.views} views</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{listing.occupancy}%</div>
                <div className="text-xs text-gray-500">occupancy</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No listings created yet</p>
            <button
              onClick={() => navigate('/host/listings/new')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your first listing →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const EarningsChart = () => {
    const maxEarning = Math.max(...earningsData.map(d => d.amount), 1000);
    const avgDailyEarnings = earningsData.length > 0 
      ? Math.round((earningsData.reduce((sum, d) => sum + d.amount, 0) / earningsData.length) / 30)
      : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Growth:</span>
            <span className={`text-sm font-medium ${
              earnings?.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {earnings?.growth > 0 ? '+' : ''}{earnings?.growth?.toFixed(1) || 0}%
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">₱{dashboardStats.revenue.available.toLocaleString()}</div>
            <div className="text-xs text-green-700">Available</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">₱{dashboardStats.revenue.pending.toLocaleString()}</div>
            <div className="text-xs text-yellow-700">Pending</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">₱{dashboardStats.totalEarnings.month.toLocaleString()}</div>
            <div className="text-xs text-blue-700">This Month</div>
          </div>
        </div>
        
        <div className="h-48 flex items-end space-x-2 mb-4">
          {earningsData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer"
                style={{ height: `${maxEarning > 0 ? (data.amount / maxEarning) * 100 : 5}%`, minHeight: '8px' }}
                title={`${data.month}: ₱${data.amount.toLocaleString()}`}
              />
              <div className="text-xs text-gray-600 mt-2">{data.month}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Avg Daily</span>
              <span className="text-lg font-bold text-blue-900">₱{avgDailyEarnings.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900">This Year</span>
              <span className="text-lg font-bold text-green-900">₱{dashboardStats.totalEarnings.year.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Tips = () => {
    // Dynamic tips based on user data
    const tips = [
      {
        icon: CheckCircle,
        text: 'Add high-quality photos to attract more bookings',
        color: 'green',
        completed: listings.some(l => l.images && l.images.length >= 3)
      },
      {
        icon: CheckCircle, 
        text: 'Respond to inquiries within 1 hour',
        color: 'green',
        completed: true // Could check actual response time
      },
      {
        icon: AlertTriangle,
        text: 'Enable instant booking for 15% more bookings',
        color: 'yellow',
        completed: listings.some(l => l.instantBooking)
      },
      {
        icon: Star,
        text: 'Maintain a 4.5+ rating for better visibility',
        color: dashboardStats.listings.avgRating >= 4.5 ? 'green' : 'yellow',
        completed: dashboardStats.listings.avgRating >= 4.5
      }
    ];

    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Tips to Boost Your Earnings</span>
        </h3>
        <div className="space-y-2">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <div key={index} className="flex items-start space-x-2">
                <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  tip.color === 'green' ? 'text-green-500' : 'text-yellow-500'
                }`} />
                <p className={`text-sm ${
                  tip.completed ? 'text-blue-800 line-through opacity-75' : 'text-blue-800'
                }`}>
                  {tip.text}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/host/help')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Learn more →
          </button>
          <div className="text-xs text-blue-700">
            {tips.filter(t => t.completed).length}/{tips.length} completed
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="host"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.profile?.name || user?.user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your spaces today
              </p>
            </div>
            <button
              onClick={() => navigate('/host/listings/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Listing</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        )}
        
        {/* Error State */}
        {hasError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Unable to load some data</h3>
                <p className="text-sm text-red-700">Some dashboard information may be outdated. Check your connection and try refreshing.</p>
              </div>
              <button
                onClick={refreshAllData}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Stats Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Monthly Earnings"
              value={`₱${dashboardStats.totalEarnings[timeframe].toLocaleString()}`}
              growth={dashboardStats.totalEarnings.growth}
              icon={Coins}
              color="green"
            />
            <StatCard
              title="Total Bookings"
              value={dashboardStats.bookings.active}
              subtitle={`${dashboardStats.bookings.pending} pending`}
              growth={dashboardStats.bookings.growth}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Active Listings"
              value={dashboardStats.listings.active}
              subtitle={`${dashboardStats.listings.views} total views`}
              growth={dashboardStats.listings.growth}
              icon={Building}
              color="purple"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${dashboardStats.occupancy.rate}%`}
              growth={dashboardStats.occupancy.growth}
              icon={PieChart}
              color="orange"
            />
          </div>
        )}

        {/* Main Content Grid */}
        {!isLoading && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <EarningsChart />
              <MyListings />
              {/* Calendar Widget */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Upcoming Bookings</h3>
                  <button
                    onClick={() => navigate('/host/bookings')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>Manage calendar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => {
                      const startDate = booking.startDate?.seconds 
                        ? new Date(booking.startDate.seconds * 1000)
                        : new Date();
                      const endDate = booking.endDate?.seconds 
                        ? new Date(booking.endDate.seconds * 1000)
                        : new Date();
                        
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.listing?.title || 'Listing'}</p>
                              <p className="text-sm text-gray-600">{booking.client?.displayName || booking.client?.name || 'Guest'}</p>
                              <p className="text-xs text-gray-500">
                                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isToday(startDate) 
                                ? 'bg-red-100 text-red-700' 
                                : isThisWeek(startDate)
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isToday(startDate) ? 'Today' :
                               isThisWeek(startDate) ? 'This Week' : 'Upcoming'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No upcoming bookings</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <RecentBookings />
              {/* Recent Messages */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <span>Recent Messages</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => navigate('/host/messages')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {recentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                        message.unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                      }`}
                           onClick={() => navigate('/host/messages')}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">{message.clientName}</p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.listingTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent messages</p>
                  </div>
                )}
              </div>
              
              {/* Action Items & Alerts */}
              {actionItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span>Action Required</span>
                  </h3>
                  <div className="space-y-3">
                    {actionItems.slice(0, 3).map((item) => (
                      <div key={item.id} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                        item.priority === 'high' ? 'bg-red-50 border border-red-200' :
                        item.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                           onClick={item.action}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Tips />
            </div>
          </div>
        )}

        {/* Performance Analytics & Payout History */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
              <button
                onClick={() => navigate('/host/analytics')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-600">
                  {dashboardStats.listings.avgRating > 0 ? dashboardStats.listings.avgRating.toFixed(1) : '--'}
                </div>
                <div className="text-sm text-green-700">Average Rating</div>
                <div className="text-xs text-green-600 mt-1">
                  {dashboardStats.listings.avgRating >= 4.5 ? 'Excellent!' : 
                   dashboardStats.listings.avgRating >= 4.0 ? 'Good!' : 
                   dashboardStats.listings.avgRating > 0 ? 'Improve' : 'No ratings'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-600">{dashboardStats.listings.views}</div>
                <div className="text-sm text-blue-700">Total Views</div>
                <div className={`text-xs mt-1 ${
                  dashboardStats.listings.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardStats.listings.growth > 0 ? '+' : ''}{dashboardStats.listings.growth.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-purple-600">{dashboardStats.occupancy.rate}%</div>
                <div className="text-sm text-purple-700">Occupancy Rate</div>
                <div className={`text-xs mt-1 ${
                  dashboardStats.occupancy.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardStats.occupancy.growth > 0 ? '+' : ''}{dashboardStats.occupancy.growth.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {analytics?.overview?.averageBookingValue 
                    ? `₱${Math.round(analytics.overview.averageBookingValue).toLocaleString()}` 
                    : '₱0'}
                </div>
                <div className="text-sm text-orange-700">Avg Booking</div>
                <div className={`text-xs mt-1 ${
                  analytics?.overview?.avgBookingChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(analytics?.overview?.avgBookingChange || 0) > 0 ? '+' : ''}{(analytics?.overview?.avgBookingChange || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Payout History */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Payout History</h3>
              <button
                onClick={() => navigate('/host/wallet')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Manage wallet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Available Balance</p>
                    <p className="text-sm text-green-700">Ready for withdrawal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-900">₱{dashboardStats.revenue.available.toLocaleString()}</p>
                  <button 
                    onClick={() => navigate('/host/wallet')}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Withdraw →
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 3).map((transaction) => {
                  const transactionDate = transaction.createdAt?.toDate?.() 
                    ? transaction.createdAt.toDate()
                    : transaction.createdAt
                    ? new Date(transaction.createdAt)
                    : new Date();
                    
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-500' :
                          transaction.status === 'pending' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === 'earning' ? 'Booking Payment' : 'Withdrawal'}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.description || 'Transaction'}</p>
                          <p className="text-xs text-gray-500">
                            {format(transactionDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          (transaction.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(transaction.amount || 0) > 0 ? '+' : ''}₱{Math.abs(transaction.amount || 0).toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No transaction history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHostDashboard;