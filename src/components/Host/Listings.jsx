import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { Plus, Eye, Edit, Trash2, Star, MapPin, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';

const Listings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    listings, 
    stats, 
    loading, 
    error, 
    deleteListing, 
    toggleListingStatus, 
    refresh 
  } = useListings();
  
  const [actionLoading, setActionLoading] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLocationString = (location) => {
    if (!location) return 'Address not provided';
    
    if (typeof location === 'string') return location;
    
    const parts = [
      location.address,
      location.city,
      location.state,
      location.zipCode
    ].filter(Boolean);
    
    return parts.join(', ') || 'Address not provided';
  };

  const getListingPrice = (listing) => {
    // Debug log to see what we're working with
    console.log('Listing price data:', {
      id: listing.id,
      title: listing.title,
      pricing: listing.pricing,
      pricePerDay: listing.pricePerDay,
      price: listing.price
    });
    
    // Try multiple possible price fields
    if (listing.pricing?.daily) return listing.pricing.daily;
    if (listing.pricePerDay) return listing.pricePerDay;
    if (listing.price) return listing.price;
    if (listing.pricing?.pricePerDay) return listing.pricing.pricePerDay;
    if (listing.dailyPrice) return listing.dailyPrice;
    return 200; // Default fallback
  };

  const getFirstImageUrl = (images) => {
    console.log('Getting first image from:', images);
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('No images found or not an array');
      return null;
    }
    const firstImage = images[0];
    console.log('First image:', firstImage, 'Type:', typeof firstImage);
    // Handle both string URLs and object format
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
    return null;
  };

  const formatSize = (size) => {
    if (!size) return 'Size not specified';
    
    // Handle object format {value, unit}
    if (typeof size === 'object' && size.value !== undefined) {
      return `${size.value} ${size.unit || 'sqm'}`;
    }
    
    // Handle string or number format
    return `${size} sq ft`;
  };

  const handleEdit = (listingId) => {
    navigate(`/host/listings/${listingId}/edit`);
  };

  const handleDelete = async (listingId, listingTitle) => {
    if (window.confirm(`Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`)) {
      try {
        setActionLoading(prev => ({ ...prev, [`delete_${listingId}`]: true }));
        
        const result = await deleteListing(listingId);
        
        if (result.success) {
          // Success is handled by the hook updating the listings state
          console.log('Listing deleted successfully');
        } else {
          alert('Failed to delete listing. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('An error occurred while deleting the listing. Please try again.');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete_${listingId}`]: false }));
      }
    }
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [`toggle_${listingId}`]: true }));
      
      const result = await toggleListingStatus(listingId);
      
      if (result.success) {
        // Success is handled by the hook updating the listings state
        console.log(`Listing status changed to: ${result.newStatus}`);
      } else {
        alert('Failed to update listing status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling listing status:', error);
      alert('An error occurred while updating the listing status. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle_${listingId}`]: false }));
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your storage space listings</p>
        </div>
        <button
          onClick={() => navigate('/host/listings/new')}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">Error loading listings</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={refresh}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded w-12"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalListings || listings.length}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded w-8"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {stats?.activeListings || listings.filter(l => l.status === 'active').length}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalViews || listings.reduce((sum, l) => sum + (l.views || 0), 0)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded w-12"></div>
              ) : (
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-blue-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">Start earning by creating your first storage listing</p>
          <button
            onClick={() => navigate('/host/listings/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const imageUrl = getFirstImageUrl(listing.images);
            const price = getListingPrice(listing);
            const locationString = formatLocationString(listing.location);
            
            return (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center" style={{display: imageUrl ? 'none' : 'flex'}}>
                    <span className="text-gray-400">No images yet</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-yellow-600 flex-shrink-0">
                      <Star size={14} className="fill-current" />
                      <span>{listing.rating || 0}</span>
                      <span className="text-gray-400">({listing.reviewCount || 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{locationString}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{formatSize(listing.size)}</span>
                    <span className="capitalize">{listing.type || 'storage'}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ₱{price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-600">/day</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye size={14} className="mr-1" />
                      <span>{listing.views || 0} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                      disabled={actionLoading[`toggle_${listing.id}`]}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                        listing.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-50 disabled:text-red-400'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-green-50 disabled:text-green-400'
                      }`}
                    >
                      {actionLoading[`toggle_${listing.id}`] ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : null}
                      {listing.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={actionLoading[`delete_${listing.id}`]}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 flex items-center justify-center"
                    >
                      {actionLoading[`delete_${listing.id}`] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default Listings;