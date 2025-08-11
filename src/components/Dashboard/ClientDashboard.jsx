import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Star,
  Clock,
  DollarSign,
  Heart,
  Filter,
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { databaseService } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';
import ClientLayout from '../Layout/ClientLayout';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, loading: bookingsLoading } = useFirestore('bookings', [
    ['clientId', '==', user?.user?.uid]
  ]);
  const { data: allListings, loading: listingsLoading } = useFirestore('listings', [
    ['status', '==', 'active']
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    savedListings: 0
  });

  useEffect(() => {
    if (bookings) {
      calculateStats();
    }
  }, [bookings]);

  const calculateStats = () => {
    const activeBookings = bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    setStats({
      activeBookings,
      completedBookings,
      totalSpent,
      savedListings: 0 // TODO: Implement saved listings feature
    });
  };

  const filteredListings = allListings
    ?.filter(listing => {
      const matchesSearch = !searchTerm || 
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filterLocation || 
        listing.city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        listing.address?.toLowerCase().includes(filterLocation.toLowerCase());
      
      return matchesSearch && matchesLocation;
    })
    ?.slice(0, 6) || [];

  const recentBookings = bookings
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    ?.slice(0, 3) || [];

  if (listingsLoading || bookingsLoading) {
    return (
      <ClientLayout>
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Storage Space</h1>
          <p className="text-gray-600 mt-1">Discover and book secure storage spaces near you</p>
        </div>
        <button 
          onClick={() => navigate('/client/browse')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Search size={20} />
          Browse All Listings
        </button>
      </div>

      {/* Search Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for storage spaces..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                className="input pl-10"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Filter size={20} />
            Search
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
              <p className="text-sm text-blue-600 mt-1">Currently renting</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
              <p className="text-sm text-green-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">Money saved: 25%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saved Listings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.savedListings}</p>
              <p className="text-sm text-purple-600 mt-1">Your favorites</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Available Storage Spaces</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all listings
            </button>
          </div>
          
          <div className="grid gap-6">
            {filteredListings.length === 0 ? (
              <div className="card p-8 text-center">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No storage spaces found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div key={listing.id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {listing.images?.[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin size={14} />
                            <span>{listing.city}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${listing.pricePerMonth}/mo</p>
                          <p className="text-sm text-gray-600">${listing.pricePerDay}/day</p>
                          {listing.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="text-yellow-500 fill-current" size={14} />
                              <span className="text-sm text-gray-600">{listing.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{listing.size}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{listing.hostName}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={18} />
                          </button>
                          <button className="btn-primary px-4 py-2 text-sm">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Bookings */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Recent Bookings</h3>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No bookings yet</p>
                  <p className="text-sm text-gray-400">Book your first storage space</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium text-gray-900">{booking.listingTitle}</p>
                      <p className="text-sm text-gray-600">{booking.hostName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">${booking.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => navigate('/client/browse')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Search className="text-blue-600" size={20} />
                <span className="font-medium text-gray-900">Browse All Listings</span>
              </button>
              <button 
                onClick={() => navigate('/client/bookings')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="text-green-600" size={20} />
                <span className="font-medium text-gray-900">My Bookings</span>
              </button>
              <button 
                onClick={() => navigate('/client/favorites')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Heart className="text-red-600" size={20} />
                <span className="font-medium text-gray-900">Saved Listings</span>
              </button>
              <button 
                onClick={() => navigate('/client/messages')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageSquare className="text-orange-600" size={20} />
                <span className="font-medium text-gray-900">Messages</span>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Storage Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Compare prices and locations before booking</li>
                <li>• Read reviews from other customers</li>
                <li>• Check security features and access hours</li>
                <li>• Book for longer periods to save money</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;