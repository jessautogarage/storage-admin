import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Heart, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../Layout/ClientLayout';

const Browse = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    storageType: 'all',
    features: []
  });

  // Mock data - replace with actual data from Firebase
  const [listings] = useState([
    {
      id: '1',
      title: 'Spacious Garage Storage',
      hostName: 'John Doe',
      location: 'Los Angeles, CA',
      distance: '2.5 miles',
      pricePerMonth: 150,
      size: 100,
      storageType: 'garage',
      rating: 4.8,
      reviews: 12,
      available: true,
      features: ['24/7 Access', 'Security Cameras', 'Ground Level'],
      images: []
    },
    {
      id: '2',
      title: 'Climate Controlled Unit',
      hostName: 'Sarah Johnson',
      location: 'Beverly Hills, CA',
      distance: '3.8 miles',
      pricePerMonth: 200,
      size: 80,
      storageType: 'indoor',
      rating: 4.9,
      reviews: 8,
      available: true,
      features: ['Climate Controlled', 'Electronic Gate', 'Lighting'],
      images: []
    },
    {
      id: '3',
      title: 'Secure Basement Storage',
      hostName: 'Mike Wilson',
      location: 'Santa Monica, CA',
      distance: '5.2 miles',
      pricePerMonth: 125,
      size: 60,
      storageType: 'basement',
      rating: 4.5,
      reviews: 6,
      available: true,
      features: ['Secure Access', 'Dry Environment', 'Easy Loading'],
      images: []
    },
    {
      id: '4',
      title: 'Outdoor Storage Shed',
      hostName: 'Emma Davis',
      location: 'Venice, CA',
      distance: '4.1 miles',
      pricePerMonth: 75,
      size: 50,
      storageType: 'outdoor',
      rating: 4.2,
      reviews: 3,
      available: false,
      features: ['Drive-up Access', 'Ground Level'],
      images: []
    }
  ]);

  const storageTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'indoor', label: 'Indoor Storage' },
    { value: 'outdoor', label: 'Outdoor Storage' },
    { value: 'garage', label: 'Garage' },
    { value: 'basement', label: 'Basement' },
    { value: 'attic', label: 'Attic' },
    { value: 'shed', label: 'Shed' }
  ];

  const features = [
    'Climate Controlled',
    '24/7 Access',
    'Security Cameras',
    'Lighting',
    'Easy Loading',
    'Ground Level',
    'Drive-up Access',
    'Electronic Gate'
  ];

  const handleViewDetails = (listingId) => {
    navigate(`/client/listing/${listingId}`);
  };

  const handleToggleFavorite = (listingId) => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite:', listingId);
  };

  const filteredListings = listings.filter(listing => {
    if (filters.storageType !== 'all' && listing.storageType !== filters.storageType) {
      return false;
    }
    if (filters.minPrice && listing.pricePerMonth < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && listing.pricePerMonth > parseInt(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Storage Spaces</h1>
          <p className="text-gray-600 mt-1">Find the perfect storage solution near you</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">Clear all</button>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="City or ZIP code"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per month)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Storage Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.storageType}
                    onChange={(e) => setFilters(prev => ({ ...prev, storageType: e.target.value }))}
                  >
                    {storageTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Size (sq ft)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.size}
                    onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {features.map(feature => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={filters.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, features: [...prev.features, feature] }));
                            } else {
                              setFilters(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="lg:col-span-3">
            {/* Search Bar and View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title, location..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredListings.length}</span> storage spaces
              </p>
            </div>

            {/* Listings Grid/List */}
            {filteredListings.length === 0 ? (
              <div className="card p-12 text-center">
                <Search className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`card overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    {/* Image */}
                    <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'h-48'} bg-gray-200 relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(listing.id)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Heart size={16} className="text-gray-600" />
                      </button>
                      {!listing.available && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Not Available</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <p className="text-sm text-gray-600">by {listing.hostName}</p>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin size={14} className="mr-1" />
                        <span>{listing.location}</span>
                        <span className="mx-2">•</span>
                        <span>{listing.distance}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${listing.pricePerMonth}
                            <span className="text-sm font-normal text-gray-600">/month</span>
                          </div>
                          <div className="text-sm text-gray-600">{listing.size} sq ft • {listing.storageType}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="text-yellow-500 fill-current" size={14} />
                            <span className="font-medium">{listing.rating}</span>
                            <span className="text-gray-400">({listing.reviews})</span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.features.slice(0, 3).map(feature => (
                          <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                        {listing.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{listing.features.length - 3} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(listing.id)}
                        disabled={!listing.available}
                        className={`w-full py-2 rounded-lg transition-colors ${
                          listing.available
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {listing.available ? 'View Details' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Browse;