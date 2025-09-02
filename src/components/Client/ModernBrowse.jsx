import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStorageListings from '../../hooks/useStorageListingsFixed';
import useUserFavorites from '../../hooks/useUserFavorites';
import ModernHeader from '../Layout/ModernHeader';
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Heart, 
  Car,
  Building,
  Package,
  Wifi,
  Shield,
  Clock,
  ChevronDown,
  Sliders,
  Map,
  SortAsc,
  X,
  Eye,
  Calendar,
  Ruler,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Thermometer,
  Camera,
  MapPin as LocationIcon,
  RefreshCw
} from 'lucide-react';

const ModernBrowse = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [storageType, setStorageType] = useState(searchParams.get('type') || 'all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [size, setSize] = useState('all');
  const [features, setFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [location, setLocation] = useState('');

  // Get user ID for favorites
  const userId = user?.user?.uid || user?.uid;

  // Helper function to convert sort option to Firestore field
  function getSortField(sortOption) {
    switch (sortOption) {
      case 'price-low':
      case 'price-high':
        return 'pricing.daily';
      case 'rating':
        return 'rating';
      case 'distance':
        return 'createdAt'; // Fallback since distance calculation needs geolocation
      default:
        return 'createdAt';
    }
  }

  function getSortOrder(sortOption) {
    switch (sortOption) {
      case 'price-low':
        return 'asc';
      case 'price-high':
      case 'rating':
        return 'desc';
      default:
        return 'desc';
    }
  }

  // Memoize filters and sort options to prevent infinite loops
  const storageFilters = useMemo(() => ({
    available: true,
    type: storageType !== 'all' ? storageType : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1]
  }), [storageType, priceRange]);

  const storageSortBy = useMemo(() => getSortField(sortBy), [sortBy]);
  const storageSortOrder = useMemo(() => getSortOrder(sortBy), [sortBy]);

  // Firebase hooks - disable realtime for debugging
  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
    hasMore,
    loadMore,
    refresh,
    searchListings
  } = useStorageListings({
    filters: storageFilters,
    sortBy: storageSortBy,
    sortOrder: storageSortOrder,
    pageSize: 6,
    realtime: false  // Temporarily disable realtime to debug infinite loop
  });

  const {
    favorites,
    loading: favoritesLoading,
    isFavorited,
    toggleFavorite
  } = useUserFavorites(userId);

  // Filter listings based on search query and features (client-side)
  const storageTypes = [
    { id: 'all', label: 'All Types', icon: Building },
    { id: 'storage', label: 'Storage Space', icon: Package },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'warehouse', label: 'Warehouse', icon: Building }
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Best Match' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'distance', label: 'Closest to You' }
  ];

  const popularLocations = [
    'Makati City',
    'BGC, Taguig',
    'Ortigas Center',
    'Quezon City',
    'Mandaluyong City',
    'Pasig City'
  ];

  // Use useMemo to avoid infinite loops
  const filteredListings = useMemo(() => {
    console.log('📊 Browse page - Raw listings from Firebase:', listings.length, listings);
    let filtered = [...listings];

    // Filter by search query (client-side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.location?.address?.toLowerCase().includes(query) ||
        listing.location?.city?.toLowerCase().includes(query) ||
        listing.location?.district?.toLowerCase().includes(query)
      );
    }

    // Filter by features (client-side)
    if (features.length > 0) {
      filtered = filtered.filter(listing => 
        features.every(feature => 
          listing.features && listing.features.includes(feature)
        )
      );
    }

    return filtered;
  }, [listings, searchQuery, features]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const handleToggleFavorite = async (listingId) => {
    if (!userId) {
      navigate('/signin');
      return;
    }
    
    try {
      await toggleFavorite(listingId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-xl"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  const ListingCard = ({ listing, isFavorite, onToggleFavorite, viewMode = 'grid' }) => {
    // Debug log to see what data we're receiving
    if (listing.title && listing.title.includes('Test')) {
      console.log('Listing data received in browse:', listing);
      console.log('Size field:', listing.size);
      console.log('Images field:', listing.images);
    }
    
    // Handle both string URLs and image objects with url property
    // Use actual uploaded images only
    let displayImage = null;
    if (listing.images && listing.images.length > 0) {
      const firstImage = listing.images[0];
      if (typeof firstImage === 'string') {
        displayImage = firstImage;
      } else if (firstImage?.url) {
        displayImage = firstImage.url;
      } else if (firstImage?.src) {
        displayImage = firstImage.src;
      }
    }
    
    const displayLocation = listing.location 
      ? `${listing.location.district || ''}, ${listing.location.city || ''}`.replace(/^,\s*/, '')
      : 'Location not specified';
    
    const displayPrice = listing.pricing?.daily || 0;
    
    // Handle multiple size data structures: object with value, plain number, or plain string
    const displaySize = listing.size?.value 
      ? `${listing.size.value} ${listing.size.unit || 'sqft'}`
      : (listing.size && typeof listing.size === 'number')
        ? `${listing.size} sqft`
        : (listing.size && typeof listing.size === 'string')
          ? `${listing.size} sqft`
          : 'Size not specified';
    
    // Calculate availability info
    const availableDates = listing.availability?.availableDates || [];
    const bookedDates = listing.bookedDates || [];
    const availableCount = availableDates.length - bookedDates.filter(d => availableDates.includes(d)).length;
    
    // Get next available date
    const today = new Date().toISOString().split('T')[0];
    const nextAvailable = availableDates
      .filter(date => date >= today && !bookedDates.includes(date))
      .sort()[0];

    const getFeatureIcon = (feature) => {
      const lowerFeature = feature.toLowerCase();
      if (lowerFeature.includes('climate') || lowerFeature.includes('air con')) return Thermometer;
      if (lowerFeature.includes('cctv') || lowerFeature.includes('security')) return Shield;
      if (lowerFeature.includes('wifi')) return Wifi;
      if (lowerFeature.includes('24') || lowerFeature.includes('access')) return Clock;
      return Zap;
    };

    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="flex">
            <div className="relative w-80 flex-shrink-0">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                style={{ display: displayImage ? 'none' : 'flex' }}
              >
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 text-sm">No image available</span>
                </div>
              </div>
              <button
                onClick={() => onToggleFavorite(listing.id)}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                  isFavorite ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              {listing.viewCount && (
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.viewCount}
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                      {listing.title}
                    </h3>
                    <div className="text-right ml-4">
                      <div className="font-bold text-2xl text-blue-600">
                        ₱{displayPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per day</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <LocationIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{displayLocation}</span>
                    {listing.rating && (
                      <div className="flex items-center space-x-1 text-sm ml-6">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900">{listing.rating}</span>
                        <span className="text-gray-500">({listing.reviewCount || 0})</span>
                      </div>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Ruler className="w-4 h-4" />
                        <span>{displaySize}</span>
                      </div>
                      {availableCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">{availableCount} days available</span>
                          {nextAvailable && (
                            <span className="text-gray-500">
                              (Next: {new Date(nextAvailable).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{listing.hostName || 'Host'}</span>
                        {listing.verified && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/client/listing/${listing.id}`)}
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {listing.features && listing.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {listing.features.slice(0, 4).map((feature, index) => {
                    const Icon = getFeatureIcon(feature);
                    return (
                      <div
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        <Icon className="w-3 h-3" />
                        {feature}
                      </div>
                    );
                  })}
                  {listing.features.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                      +{listing.features.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
        <div className="relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={listing.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ display: displayImage ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <button
            onClick={() => onToggleFavorite(listing.id)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium">
            {displayLocation}
          </div>

          {listing.viewCount && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.viewCount}
            </div>
          )}

          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {listing.images.length}
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1">
              {listing.title}
            </h3>
            {listing.rating && (
              <div className="flex items-center space-x-1 text-sm ml-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">{listing.rating}</span>
                <span className="text-gray-500">({listing.reviewCount || 0})</span>
              </div>
            )}
          </div>
          
          {listing.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {listing.description}
            </p>
          )}

          {listing.features && listing.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {listing.features.slice(0, 3).map((feature, index) => {
                const Icon = getFeatureIcon(feature);
                return (
                  <div
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    {feature}
                  </div>
                );
              })}
              {listing.features.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                  +{listing.features.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img
                src={listing.hostProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.hostName || 'Host')}&background=e5e7eb&color=374151`}
                alt={listing.hostName || 'Host'}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">{listing.hostName || 'Host'}</span>
              {listing.verified && (
                <Shield className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-blue-600">
                ₱{displayPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">per day</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>{displaySize}</span>
              </div>
              {availableCount > 0 ? (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-medium">{availableCount} days</span>
                </div>
              ) : (
                <span className={`font-medium px-2 py-1 rounded-full ${
                  (listing.status === 'available' || listing.status === 'active') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {(listing.status === 'available' || listing.status === 'active') ? 'Available' : 'Occupied'}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/client/listing/${listing.id}`)}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Calculate active filters count - moved outside FilterPanel for broader scope
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (storageType !== 'all') count++;
    if (priceRange[1] !== 5000 || priceRange[0] !== 500) count++;
    if (features.length > 0) count++;
    if (searchQuery) count++;
    return count;
  }, [storageType, priceRange, features, searchQuery]);

  const FilterPanel = () => {
    const clearAllFilters = useCallback(() => {
      setSearchQuery('');
      setStorageType('all');
      setPriceRange([500, 5000]);
      setFeatures([]);
      setLocation('');
      refresh();
    }, [refresh]);

    return (
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-xl shadow-sm border overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Storage Type */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Storage Type
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {storageTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = storageType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setStorageType(type.id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 text-blue-900' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="font-medium">{type.label}</span>
                      {isSelected && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </h4>
              <div className="space-y-4">
                <div className="px-3">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="bg-gray-50 border rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-900">₱{priceRange[0].toLocaleString()}</span>
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="bg-gray-50 border rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-900">₱{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[1000, 2500, 5000].map(price => (
                    <button
                      key={price}
                      onClick={() => setPriceRange([500, price])}
                      className="text-xs py-1 px-2 rounded-md border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      ₱{price.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Locations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LocationIcon className="w-4 h-4" />
                Popular Locations
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {popularLocations.map((loc, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(loc)}
                    className="flex items-center justify-between p-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    <span>{loc}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Features
              </h4>
              <div className="space-y-3">
                {[
                  { name: '24/7 Access', icon: Clock },
                  { name: 'CCTV', icon: Shield },
                  { name: 'Climate Control', icon: Thermometer },
                  { name: 'WiFi', icon: Wifi },
                  { name: 'Security Guard', icon: Shield }
                ].map((feature) => {
                  const isSelected = features.includes(feature.name);
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.name}
                      onClick={() => {
                        if (isSelected) {
                          setFeatures(features.filter(f => f !== feature.name));
                        } else {
                          setFeatures([...features, feature.name]);
                        }
                      }}
                      className={`flex items-center space-x-3 w-full p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="font-medium flex-1 text-left">{feature.name}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <button
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters ({activeFiltersCount})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
        {/* Enhanced Search Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Storage Space</h2>
            <p className="text-gray-600">Browse thousands of secure storage spaces from verified hosts</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location, city, or storage name..."
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="w-full py-3.5 px-4 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
                >
                  {storageTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                type="submit"
                disabled={listingsLoading}
                className="bg-blue-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {listingsLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{listingsLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
              {['Under ₱1,000', 'Climate Control', 'CCTV', '24/7 Access'].map((filter, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (filter === 'Under ₱1,000') {
                      setPriceRange([500, 1000]);
                    } else {
                      if (features.includes(filter)) {
                        setFeatures(features.filter(f => f !== filter));
                      } else {
                        setFeatures([...features, filter]);
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    (filter === 'Under ₱1,000' && priceRange[1] <= 1000) || features.includes(filter)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/70 text-gray-600 hover:bg-white hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </form>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Stats Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-xl font-bold text-gray-900">
                        {searchQuery ? `Storage in "${searchQuery}"` : 'All Storage Spaces'}
                      </h1>
                      <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
                        {filteredListings.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredListings.length} {filteredListings.length === 1 ? 'space' : 'spaces'} available
                      {activeFiltersCount > 0 && ` • ${activeFiltersCount} filters applied`}
                    </p>
                  </div>
                  
                  {/* Price Range Display */}
                  {filteredListings.length > 0 && (
                    <div className="hidden sm:block text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          ₱{Math.min(...filteredListings.map(l => l.pricing?.daily || 0)).toLocaleString()} - 
                          ₱{Math.max(...filteredListings.map(l => l.pricing?.daily || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                    <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-md transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      title="Grid view"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-md transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden bg-blue-100 text-blue-600 p-2.5 rounded-lg hover:bg-blue-200 transition-colors relative"
                  >
                    <Sliders className="w-4 h-4" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {listingsError && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Error Loading Listings
                </h3>
                <p className="text-gray-600 mb-6">
                  {listingsError}
                </p>
                <button
                  onClick={refresh}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State with Skeletons */}
            {listingsLoading && filteredListings.length === 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'
              }`}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : (
              <>
                {/* Results Grid */}
                {filteredListings.length > 0 ? (
                  <>
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'
                    }`}>
                      {filteredListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isFavorite={isFavorited(listing.id)}
                          onToggleFavorite={handleToggleFavorite}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                    
                    {/* Loading more indicator */}
                    {listingsLoading && (
                      <div className={`grid gap-6 mt-6 ${
                        viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'
                      }`}>
                        {Array.from({ length: 2 }).map((_, index) => (
                          <SkeletonCard key={`loading-${index}`} />
                        ))}
                      </div>
                    )}
                  </>
                ) : !listingsLoading && !listingsError && (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No storage spaces found
                      </h3>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        We couldn't find any storage spaces matching your criteria. 
                        Try adjusting your filters or search in a different area.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStorageType('all');
                            setPriceRange([0, 5000]);
                            setFeatures([]);
                            refresh();
                          }}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Clear All Filters
                        </button>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Browse All Listings
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Load More Button */}
            {hasMore && filteredListings.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={listingsLoading}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {listingsLoading ? 'Loading...' : 'Load More Spaces'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernBrowse;