import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserBookings from '../../hooks/useUserBookings';
import { Calendar, User, DollarSign, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Loader } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';

const Bookings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // Use Firebase data
  const { 
    bookings, 
    loading, 
    error, 
    stats,
    confirmBooking,
    cancelBooking,
    refresh
  } = useUserBookings(user?.uid, 'host');

  const tabs = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
    { id: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length }
  ];

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  // Calculate daily revenue from active and confirmed bookings
  const calculateDailyRevenue = () => {
    const activeConfirmedBookings = bookings.filter(b => 
      b.status === 'active' || b.status === 'confirmed'
    );
    
    const totalRevenue = activeConfirmedBookings.reduce((sum, booking) => {
      const totalAmount = booking.totalAmount || 0;
      const duration = calculateDuration(booking.startDate, booking.endDate);
      const dailyRevenue = duration > 0 ? totalAmount / (duration * 30) : 0;
      return sum + dailyRevenue;
    }, 0);
    
    return Math.round(totalRevenue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
      case 'active':
        return <CheckCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [`approve-${bookingId}`]: true }));
    
    try {
      const result = await confirmBooking(bookingId);
      if (!result.success) {
        alert(`Failed to approve booking: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to approve booking. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`approve-${bookingId}`]: false }));
    }
  };

  const handleReject = async (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      setActionLoading(prev => ({ ...prev, [`reject-${bookingId}`]: true }));
      
      try {
        const result = await cancelBooking(bookingId, 'Rejected by host');
        if (!result.success) {
          alert(`Failed to reject booking: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to reject booking. Please try again.');
      } finally {
        setActionLoading(prev => ({ ...prev, [`reject-${bookingId}`]: false }));
      }
    }
  };

  const handleContact = (booking) => {
    const clientEmail = booking.client?.email || booking.clientEmail;
    const subject = `Regarding your booking - ${booking.listing?.title || 'Storage Booking'}`;
    const body = `Hi ${booking.client?.name || booking.clientName || 'there'},\n\nI wanted to reach out regarding your booking from ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}.\n\nBest regards,\n${user?.displayName || user?.email}`;
    
    const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your storage space bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeCount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Revenue</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  ₱{calculateDailyRevenue().toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading bookings</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={refresh}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {loading ? (
                    <div className="ml-2 w-5 h-4 bg-gray-200 rounded animate-pulse"></div>
                  ) : tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {loading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-6 bg-gray-200 rounded w-48"></div>
                          <div className="h-5 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? 'Your bookings will appear here once clients start booking your listings'
                    : `No ${activeTab} bookings at the moment`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const clientName = booking.client?.name || booking.clientName || 'Unknown Client';
                  const clientEmail = booking.client?.email || booking.clientEmail;
                  const listingTitle = booking.listing?.title || 'Storage Space';
                  const listingLocation = booking.listing?.location;
                  const totalAmount = booking.totalAmount || booking.amount || 0;
                  const createdAtDate = booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);

                  return (
                    <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{listingTitle}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </div>
                          {listingLocation && (
                            <p className="text-sm text-gray-500 mb-2">{listingLocation}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{clientName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                              <span className="text-gray-400">({calculateDuration(booking.startDate, booking.endDate)} months)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">₱{totalAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">total</div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Booked on {formatDate(createdAtDate)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContact(booking)}
                            disabled={!clientEmail}
                            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MessageSquare size={16} />
                            Contact
                          </button>
                          
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReject(booking.id)}
                                disabled={actionLoading[`reject-${booking.id}`]}
                                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[`reject-${booking.id}`] ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  'Reject'
                                )}
                              </button>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                disabled={actionLoading[`approve-${booking.id}`]}
                                className="px-3 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[`approve-${booking.id}`] ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  'Approve'
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;