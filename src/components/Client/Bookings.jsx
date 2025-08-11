import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, MessageSquare, Phone, CheckCircle, Clock, XCircle, Star, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../Layout/ClientLayout';
import { bookingService } from '../../services/bookingService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

const ClientBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's bookings
  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const result = await bookingService.getUserBookings(user.uid, 'client');
      if (result.success) {
        setBookings(result.bookings);
      } else {
        console.error('Error loading bookings:', result.error);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - kept for fallback/reference
  const [bookingsMock] = useState([
    {
      id: '1',
      listingTitle: 'Spacious Garage Storage',
      hostName: 'John Doe',
      hostPhone: '+1 (555) 123-4567',
      location: 'Los Angeles, CA',
      startDate: '2025-02-01',
      endDate: '2025-05-01',
      pricePerMonth: 150,
      totalAmount: 450,
      status: 'active',
      accessCode: '1234',
      accessInstructions: 'Enter through the side gate, storage unit is on the left.',
      images: []
    },
    {
      id: '2',
      listingTitle: 'Climate Controlled Unit',
      hostName: 'Sarah Johnson',
      hostPhone: '+1 (555) 234-5678',
      location: 'Beverly Hills, CA',
      startDate: '2025-03-01',
      endDate: '2025-06-01',
      pricePerMonth: 200,
      totalAmount: 600,
      status: 'upcoming',
      accessCode: null,
      accessInstructions: 'Access code will be provided 24 hours before start date.',
      images: []
    },
    {
      id: '3',
      listingTitle: 'Outdoor Storage Shed',
      hostName: 'Mike Davis',
      hostPhone: '+1 (555) 345-6789',
      location: 'Venice, CA',
      startDate: '2024-10-01',
      endDate: '2025-01-01',
      pricePerMonth: 75,
      totalAmount: 225,
      status: 'completed',
      rating: 5,
      review: 'Great storage space, very convenient location!',
      images: []
    },
    {
      id: '4',
      listingTitle: 'Basement Storage',
      hostName: 'Emma Wilson',
      hostPhone: '+1 (555) 456-7890',
      location: 'Santa Monica, CA',
      startDate: '2025-02-15',
      endDate: '2025-03-15',
      pricePerMonth: 125,
      totalAmount: 125,
      status: 'cancelled',
      cancellationReason: 'Found alternative storage',
      images: []
    }
  ]);

  const tabs = [
    { id: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => ['confirmed', 'paid'].includes(b.status)).length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'active':
        return bookings.filter(b => b.status === 'active');
      case 'upcoming':
        return bookings.filter(b => ['confirmed', 'paid'].includes(b.status));
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return [];
    }
  };

  const filteredBookings = getFilteredBookings();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'upcoming':
        return <Clock className="text-blue-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-gray-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Enhanced: Message Host using booking-specific conversations
  const handleContactHost = async (booking) => {
    try {
      // Create booking-specific conversation
      const conversationId = `booking_${booking.id}`;
      
      // Send initial message to create conversation
      await messageService.sendMessage({
        conversationId,
        senderId: user.uid,
        receiverId: booking.hostId,
        content: `Hi! I have a question about my booking for "${booking.listingTitle}".`,
        senderName: user.displayName || user.email || 'Client'
      });

      // Navigate to messages page
      navigate('/client/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleViewListing = (booking) => {
    // Navigate to listing details
    navigate(`/client/browse/${booking.listingId}`);
  };

  const handleExtendBooking = (bookingId) => {
    // TODO: Implement booking extension
    console.log('Extend booking:', bookingId);
    alert('Booking extension feature coming soon!');
  };

  const handleCancelBooking = async (booking) => {
    if (!bookingService.canCancelBooking(booking)) {
      alert(bookingService.getCancellationMessage(booking));
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const result = await bookingService.cancelBooking(booking.id, reason);
        if (result.success) {
          alert('Booking cancelled successfully');
          loadBookings(); // Refresh bookings
        } else {
          alert(`Failed to cancel booking: ${result.error}`);
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleLeaveReview = (bookingId) => {
    // TODO: Navigate to review form
    console.log('Leave review for booking:', bookingId);
    alert('Review feature coming soon!');
  };

  // ✅ NEW: Open address in Google Maps
  const handleViewInMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  // ✅ NEW: Make phone call
  const handleCallHost = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Phone number not available');
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your storage space bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'active').length}</div>
            <div className="text-sm text-gray-600">Active Bookings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-blue-600">{bookings.filter(b => ['confirmed', 'paid'].includes(b.status)).length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-600">
              ${bookings.filter(b => b.status === 'active').reduce((sum, b) => sum + (b.storageFee || b.totalAmount || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Active Cost</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">Past Bookings</div>
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

          {/* Bookings List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} bookings</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' && 'Your active bookings will appear here'}
                  {activeTab === 'upcoming' && 'Your upcoming bookings will appear here'}
                  {activeTab === 'completed' && 'Your past bookings will appear here'}
                  {activeTab === 'cancelled' && 'Your cancelled bookings will appear here'}
                </p>
                {(activeTab === 'active' || activeTab === 'upcoming') && (
                  <button
                    onClick={() => navigate('/client/browse')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Browse Storage Spaces
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const displayStatus = booking.status === 'confirmed' || booking.status === 'paid' ? 'upcoming' : booking.status;
                  return (
                  <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-48 h-48 bg-gray-200 flex-shrink-0">
                        {booking.listingImages && booking.listingImages.length > 0 ? (
                          <img 
                            src={booking.listingImages[0]} 
                            alt={booking.listingTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{booking.listingTitle}</h3>
                              {getStatusIcon(displayStatus)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin size={14} className="mr-1" />
                              <span>{booking.listingAddress}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Host: {booking.hostName}</span>
                              {booking.hostPhone && (
                                <button
                                  onClick={() => handleCallHost(booking.hostPhone)}
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <Phone size={12} />
                                  Call
                                </button>
                              )}
                              {booking.listingAddress && (
                                <button
                                  onClick={() => handleViewInMaps(booking.listingAddress)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <ExternalLink size={12} />
                                  Maps
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">${(booking.storageFee || booking.totalAmount || 0).toFixed(2)}</div>
                            <div className="text-sm text-gray-600">total amount</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Booking Period</p>
                            <p className="font-medium">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price Breakdown</p>
                            <div className="text-sm">
                              <div>Storage: ${(booking.storageFee || 0).toFixed(2)}</div>
                              {booking.platformFee && <div>Platform: ${booking.platformFee.toFixed(2)}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Status-specific content */}
                        {displayStatus === 'active' && booking.accessCode && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-green-800 mb-1">Access Information</p>
                            <p className="text-green-700">Access Code: <span className="font-mono font-bold">{booking.accessCode}</span></p>
                            {booking.accessInstructions && (
                              <p className="text-sm text-green-600 mt-1">{booking.accessInstructions}</p>
                            )}
                          </div>
                        )}

                        {displayStatus === 'upcoming' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-blue-800 mb-1">Booking Status</p>
                            <p className="text-sm text-blue-700">
                              {booking.status === 'confirmed' ? 'Confirmed - Access details will be provided before start date.' : 'Payment processed - Waiting for host confirmation.'}
                            </p>
                          </div>
                        )}

                        {displayStatus === 'completed' && booking.rating && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={i < booking.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">Your rating</span>
                            </div>
                            <p className="text-sm text-gray-700">{booking.review}</p>
                          </div>
                        )}

                        {displayStatus === 'cancelled' && booking.cancellationReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-700">Cancellation reason: {booking.cancellationReason}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          {displayStatus === 'active' && (
                            <>
                              <button
                                onClick={() => handleContactHost(booking)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <MessageSquare size={16} />
                                Message Host
                              </button>
                              <button
                                onClick={() => handleExtendBooking(booking.id)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Extend Booking
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Cancel Booking
                              </button>
                            </>
                          )}
                          
                          {displayStatus === 'upcoming' && (
                            <>
                              <button
                                onClick={() => handleContactHost(booking)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <MessageSquare size={16} />
                                Message Host
                              </button>
                              <button
                                onClick={() => handleViewListing(booking)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                View Listing
                              </button>
                              {bookingService.canCancelBooking(booking) && (
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </>
                          )}
                          
                          {displayStatus === 'completed' && !booking.rating && (
                            <button
                              onClick={() => handleLeaveReview(booking.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Star size={16} />
                              Leave Review
                            </button>
                          )}

                          {displayStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleViewListing(booking)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View Listing
                            </button>
                          )}
                        </div>
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
    </ClientLayout>
  );
};

export default ClientBookings;