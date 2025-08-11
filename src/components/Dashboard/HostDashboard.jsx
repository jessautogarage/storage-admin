import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Home, 
  Calendar, 
  DollarSign, 
  Users, 
  Star,
  TrendingUp,
  Package,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { databaseService } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';
import HostLayout from '../Layout/HostLayout';

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Temporarily disable data fetching until security rules are deployed
  const shouldFetchData = false; // Change to true after deploying Firebase rules
  
  const { data: listings, loading: listingsLoading, error: listingsError } = useFirestore(
    shouldFetchData ? 'listings' : null,
    shouldFetchData ? [['hostId', '==', user.user.uid]] : []
  );
  const { data: bookings, loading: bookingsLoading, error: bookingsError } = useFirestore(
    shouldFetchData ? 'bookings' : null,
    shouldFetchData ? [['hostId', '==', user.user.uid]] : []
  );

  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    if (listings && bookings) {
      calculateStats();
    }
  }, [listings, bookings]);

  const calculateStats = () => {
    const activeListings = listings.filter(l => l.status === 'active');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    // Calculate average rating
    const ratingsSum = listings.reduce((sum, l) => sum + (l.rating || 0), 0);
    const averageRating = listings.length > 0 ? ratingsSum / listings.length : 0;
    
    // Calculate occupancy rate (simplified)
    const occupancyRate = activeListings.length > 0 ? 
      (bookings.filter(b => b.status === 'active').length / activeListings.length) * 100 : 0;

    setStats({
      totalListings: listings.length,
      activeListings: activeListings.length,
      totalBookings: bookings.length,
      totalRevenue,
      averageRating,
      occupancyRate
    });
  };

  const recentBookings = bookings
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    ?.slice(0, 5) || [];

  const topListings = listings
    ?.sort((a, b) => (b.views || 0) - (a.views || 0))
    ?.slice(0, 3) || [];

  if (listingsLoading || bookingsLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Handle errors gracefully
  const hasPermissionError = listingsError?.code === 'permission-denied' || bookingsError?.code === 'permission-denied';
  
  if (listingsError || bookingsError) {
    console.warn('Dashboard errors:', { listingsError, bookingsError });
    // Continue with empty data - don't block the UI
  }

  // Show helpful message for permission errors
  if (hasPermissionError) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to LockifyHub!</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your dashboard is being set up. This may take a moment for new accounts.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary mx-2"
            >
              Refresh Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/listings'}
              className="btn-secondary mx-2"
            >
              Create Your First Listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HostLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your storage spaces</p>
          </div>
          <button 
            onClick={() => navigate('/host/listings/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Listing
          </button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeListings} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-blue-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">+12% this month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <div className="flex items-center mt-1">
                <Star className="text-yellow-500 fill-current" size={16} />
                <span className="text-sm text-gray-600 ml-1">Excellent</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <button 
                  onClick={() => navigate('/host/bookings')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No bookings yet</p>
                  <p className="text-sm text-gray-400">Once you create listings, bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.clientName}</p>
                          <p className="text-sm text-gray-600">{booking.listingTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${booking.amount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Listings */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Listings</h3>
            </div>
            <div className="p-6">
              {topListings.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Welcome to LockifyHub!</p>
                  <p className="text-sm text-gray-400 mb-4">Start earning by listing your storage space</p>
                  <button 
                    onClick={() => navigate('/host/listings/new')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    Create your first listing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topListings.map((listing, index) => (
                    <div key={listing.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye size={14} />
                          <span>{listing.views || 0} views</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${listing.pricePerMonth}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => navigate('/host/listings/new')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Plus className="text-blue-600" size={20} />
                <span className="font-medium text-gray-900">Add New Listing</span>
              </button>
              <button 
                onClick={() => navigate('/host/bookings')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="text-green-600" size={20} />
                <span className="font-medium text-gray-900">Manage Bookings</span>
              </button>
              <button 
                onClick={() => navigate('/host/analytics')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <TrendingUp className="text-purple-600" size={20} />
                <span className="font-medium text-gray-900">View Analytics</span>
              </button>
              <button 
                onClick={() => navigate('/host/messages')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageSquare className="text-orange-600" size={20} />
                <span className="font-medium text-gray-900">Messages</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;