import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserBookings from '../../hooks/useUserBookings';
import ModernHeader from '../Layout/ModernHeader';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  User,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Edit,
  MoreHorizontal,
  Package,
  Car,
  Building,
  Key,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const ModernBookings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fetch user bookings
  const userId = user?.user?.uid || user?.uid;
  const { 
    bookings, 
    loading, 
    error, 
    stats,
    cancelBooking,
    updateBooking,
    refresh 
  } = useUserBookings(userId, 'client');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter and sort bookings
  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.host?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.listing?.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || booking.listing?.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt?.seconds * 1000) - new Date(a.createdAt?.seconds * 1000);
      case 'oldest':
        return new Date(a.createdAt?.seconds * 1000) - new Date(b.createdAt?.seconds * 1000);
      case 'start-date':
        return new Date(a.startDate?.seconds * 1000) - new Date(b.startDate?.seconds * 1000);
      case 'amount-high':
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      case 'amount-low':
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      default:
        return 0;
    }
  }) || [];

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;

    setIsUpdating(true);
    try {
      const result = await cancelBooking(selectedBooking.id, cancelReason);
      if (result.success) {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
        // Optionally show success message
      } else {
        // Handle error
        console.error('Error cancelling booking:', result.error);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date pending';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Date pending';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'storage':
        return <Package className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'warehouse':
        return <Building className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  const canModifyBooking = (booking) => {
    return booking.status === 'pending';
  };

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <img
            src={booking.listing?.images?.[0] || '/api/placeholder/100/80'}
            alt={booking.listing?.title || 'Storage Space'}
            className="w-20 h-16 rounded-lg object-cover"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {booking.listing?.title || 'Storage Space'}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {booking.listing?.location?.city || 'Metro Manila'}, {booking.listing?.location?.district || ''}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {getTypeIcon(booking.listing?.type)}
                <span className="capitalize">{booking.listing?.type || 'Storage'}</span>
              </div>
              <span>•</span>
              <span>{booking.listing?.size?.value || 0} {booking.listing?.size?.unit || 'sqm'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="font-bold text-xl text-gray-900">
              ₱{(booking.totalAmount || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">total cost</div>
          </div>
          
          <div className="flex items-center space-x-1">
            {getStatusIcon(booking.status)}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">Start Date</p>
          <p className="font-medium text-gray-900">
            {formatDate(booking.startDate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">End Date</p>
          <p className="font-medium text-gray-900">
            {formatDate(booking.endDate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Duration</p>
          <p className="font-medium text-gray-900">
            {booking.duration || 'TBD'} {booking.durationType || 'month(s)'}
          </p>
        </div>
      </div>

      {/* Host Information */}
      <div className="flex items-center space-x-3 mb-4 p-4 border rounded-lg">
        <img
          src={booking.host?.profileImage || booking.host?.avatar || '/api/placeholder/40/40'}
          alt={booking.host?.name || 'Host'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{booking.host?.name || 'Host'}</p>
          <p className="text-sm text-gray-600">{booking.host?.email || 'Contact via platform'}</p>
        </div>
        <div className="flex items-center space-x-2">
          {booking.host?.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{booking.host.rating}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/client/messages')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Access Information */}
      {booking.status === 'active' && booking.accessDetails && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-900">Access Information</span>
          </div>
          <div className="text-sm text-green-800">
            <p><strong>Access Code:</strong> {booking.accessDetails.code || '****'}</p>
            <p><strong>Gate Code:</strong> {booking.accessDetails.gateCode || '****'}</p>
            <p><strong>Unit Number:</strong> {booking.accessDetails.unitNumber || booking.listing?.unitNumber || 'N/A'}</p>
            {booking.accessDetails.instructions && (
              <p className="mt-2"><strong>Instructions:</strong> {booking.accessDetails.instructions}</p>
            )}
          </div>
        </div>
      )}

      {/* Booking Timeline */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Booking Timeline</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Created: {formatDateTime(booking.createdAt)}</p>
          {booking.confirmedAt && (
            <p>Confirmed: {formatDateTime(booking.confirmedAt)}</p>
          )}
          {booking.activatedAt && (
            <p>Started: {formatDateTime(booking.activatedAt)}</p>
          )}
          {booking.completedAt && (
            <p>Completed: {formatDateTime(booking.completedAt)}</p>
          )}
          {booking.cancelledAt && (
            <p>Cancelled: {formatDateTime(booking.cancelledAt)}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/client/listing/${booking.listingId}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Listing
          </button>
          
          {booking.receiptUrl && (
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm">
              <Download className="w-4 h-4" />
              <span>Receipt</span>
            </button>
          )}

          {booking.status === 'completed' && (
            <button
              onClick={() => navigate('/client/reviews')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Write Review
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canModifyBooking(booking) && (
            <button
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Modify</span>
            </button>
          )}

          {canCancelBooking(booking) && (
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setShowCancelModal(true);
              }}
              className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Cancel
            </button>
          )}

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const BookingStats = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.activeCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.completedCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.upcomingCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">₱{(stats?.totalSpent || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Cancel Modal
  const CancelModal = () => (
    showCancelModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cancel Booking
          </h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel your booking for "{selectedBooking?.listing?.title}"?
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for cancellation..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason('');
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={!cancelReason.trim() || isUpdating}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
        </div>
      </div>
    )
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <span>My Bookings</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your storage space bookings and view history
              </p>
            </div>
            
            <button
              onClick={refresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <BookingStats />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings by listing or host..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="storage">Storage</option>
              <option value="parking">Parking</option>
              <option value="warehouse">Warehouse</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="start-date">By Start Date</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Error loading bookings
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : bookings?.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Book your first storage space to see your bookings here.
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
                No bookings found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelModal />
    </div>
  );
};

export default ModernBookings;