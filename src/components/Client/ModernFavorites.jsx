import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserFavorites from '../../hooks/useUserFavorites';
import ModernHeader from '../Layout/ModernHeader';
import {
  Heart,
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Star,
  Calendar,
  Share2,
  Trash2,
  Car,
  Package,
  Building,
  Wifi,
  Shield,
  Clock,
  DollarSign,
  SortAsc,
  AlertCircle
} from 'lucide-react';

const ModernFavorites = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.user?.uid || user?.uid;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFavorites, setSelectedFavorites] = useState([]);

  // Use real favorites from Firebase
  const { 
    favorites: firebaseFavorites, 
    loading, 
    removeFavorite,
    removeFavorites 
  } = useUserFavorites(userId);

  // Process favorites for display
  const mockFavorites = firebaseFavorites?.map(fav => ({
    id: fav.id,
    listingId: fav.listingId,
    title: fav.listing?.title || 'Storage Space',
    location: `${fav.listing?.location?.city || 'Metro Manila'}, ${fav.listing?.location?.district || ''}`,
    type: fav.listing?.type || 'storage',
    size: `${fav.listing?.size?.value || 10} ${fav.listing?.size?.unit || 'sqm'}`,
    price: fav.listing?.pricing?.monthly || 0,
    rating: fav.listing?.rating || 4.5,
    reviewCount: fav.listing?.reviewCount || 0,
    image: fav.listing?.images?.[0] || '/api/placeholder/400/300',
    images: fav.listing?.images || ['/api/placeholder/400/300'],
    features: fav.listing?.features || [],
    host: {
      name: fav.listing?.hostName || 'Host',
      avatar: '/api/placeholder/40/40'
    },
    available: fav.listing?.status === 'available',
    favoriteDate: fav.createdAt
  })) || [
    {
      id: 'listing_1',
      title: 'Secure Storage Unit in Makati CBD',
      location: 'Makati City, Metro Manila',
      type: 'storage',
      size: '10 sqm',
      price: 2500,
      rating: 4.9,
      reviewCount: 127,
      image: '/api/placeholder/400/300?text=Makati+Storage',
      images: [
        '/api/placeholder/400/300?text=Makati+Storage',
        '/api/placeholder/400/300?text=Interior+View',
        '/api/placeholder/400/300?text=Security+System'
      ],
      features: ['24/7 Access', 'CCTV', 'Climate Control', 'WiFi'],
      host: {
        name: 'Maria Santos',
        avatar: '/api/placeholder/40/40?text=MS',
        verified: true,
        responseRate: 98,
        rating: 4.9
      },
      distance: '0.8 km away',
      availability: 'Available Now',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      priceHistory: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), price: 2800 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), price: 2500 }
      ],
      isAvailable: true,
      tags: ['Popular', 'Recently Viewed']
    },
    {
      id: 'listing_2',
      title: 'Climate-Controlled Warehouse Space',
      location: 'Pasig City, Metro Manila',
      type: 'warehouse',
      size: '50 sqm',
      price: 8000,
      rating: 4.7,
      reviewCount: 45,
      image: '/api/placeholder/400/300?text=Pasig+Warehouse',
      images: [
        '/api/placeholder/400/300?text=Pasig+Warehouse',
        '/api/placeholder/400/300?text=Climate+Control'
      ],
      features: ['Climate Control', 'Loading Dock', 'WiFi', 'Security'],
      host: {
        name: 'Anna Reyes',
        avatar: '/api/placeholder/40/40?text=AR',
        verified: true,
        responseRate: 95,
        rating: 4.8
      },
      distance: '2.1 km away',
      availability: 'Available Now',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      priceHistory: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), price: 8500 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), price: 8000 }
      ],
      isAvailable: true,
      tags: ['Price Drop']
    },
    {
      id: 'listing_3',
      title: 'Premium Parking Space - BGC',
      location: 'Bonifacio Global City, Taguig',
      type: 'parking',
      size: '1 car slot',
      price: 3500,
      rating: 4.8,
      reviewCount: 89,
      image: '/api/placeholder/400/300?text=BGC+Parking',
      images: [
        '/api/placeholder/400/300?text=BGC+Parking',
        '/api/placeholder/400/300?text=Covered+Space'
      ],
      features: ['Covered', '24/7 Security', 'CCTV', 'Electric Charging'],
      host: {
        name: 'Juan Dela Cruz',
        avatar: '/api/placeholder/40/40?text=JD',
        verified: true,
        responseRate: 100,
        rating: 4.9
      },
      distance: '1.2 km away',
      availability: 'Available from Dec 1',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      priceHistory: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), price: 3500 }
      ],
      isAvailable: false,
      tags: ['Coming Soon']
    },
    {
      id: 'listing_4',
      title: 'Motorcycle Parking - Ortigas',
      location: 'Ortigas Center, Pasig City',
      type: 'parking',
      size: 'Motorcycle slot',
      price: 800,
      rating: 4.5,
      reviewCount: 156,
      image: '/api/placeholder/400/300?text=Ortigas+Motorcycle',
      images: ['/api/placeholder/400/300?text=Ortigas+Motorcycle'],
      features: ['Covered', 'Security Guard', 'CCTV'],
      host: {
        name: 'Mike Santos',
        avatar: '/api/placeholder/40/40?text=MS2',
        verified: true,
        responseRate: 92,
        rating: 4.6
      },
      distance: '4.2 km away',
      availability: 'Available Now',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), // 21 days ago
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      priceHistory: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), price: 800 }
      ],
      isAvailable: true,
      tags: ['Budget Friendly']
    }
  ];

  const favorites = mockFavorites;

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(favorite => {
      const matchesSearch = 
        favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.host.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || favorite.type === filterType;
      
      const matchesPrice = 
        filterPrice === 'all' ||
        (filterPrice === 'under-2000' && favorite.price < 2000) ||
        (filterPrice === '2000-5000' && favorite.price >= 2000 && favorite.price <= 5000) ||
        (filterPrice === 'over-5000' && favorite.price > 5000);
      
      return matchesSearch && matchesType && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'oldest':
          return new Date(a.addedAt) - new Date(b.addedAt);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        default:
          return 0;
      }
    });

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const toggleFavorite = async (favoriteId) => {
    // Use Firebase function to remove favorite
    await removeFavorite(favoriteId);
  };

  const toggleSelectFavorite = (listingId) => {
    setSelectedFavorites(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const removeSelectedFavorites = async () => {
    // Use Firebase function to remove multiple favorites
    await removeFavorites(selectedFavorites);
    setSelectedFavorites([]);
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
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

  const FavoriteCard = ({ favorite, isGridView = true }) => (
    <div className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 ${
      isGridView ? '' : 'flex'
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={selectedFavorites.includes(favorite.id)}
          onChange={() => toggleSelectFavorite(favorite.id)}
          className="w-4 h-4 text-blue-600 border-2 border-white rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image */}
      <div className={`relative ${isGridView ? '' : 'w-48 flex-shrink-0'}`}>
        <img
          src={favorite.image}
          alt={favorite.title}
          className={`object-cover ${
            isGridView ? 'w-full h-48 rounded-t-xl' : 'w-full h-full rounded-l-xl'
          }`}
        />
        
        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(favorite.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Tags */}
        {favorite.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {favorite.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Availability indicator */}
        <div className={`absolute top-3 left-8 px-2 py-1 rounded-lg text-xs font-medium ${
          favorite.isAvailable 
            ? 'bg-green-500 text-white' 
            : 'bg-orange-500 text-white'
        }`}>
          {favorite.isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {favorite.title}
          </h3>
          <div className="flex items-center space-x-1 text-sm ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-gray-900">{favorite.rating}</span>
            <span className="text-gray-500">({favorite.reviewCount})</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{favorite.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            {getTypeIcon(favorite.type)}
            <span className="capitalize">{favorite.type}</span>
          </div>
          <span>•</span>
          <span>{favorite.size}</span>
          <span>•</span>
          <span>{favorite.distance}</span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {favorite.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {feature}
            </span>
          ))}
          {favorite.features.length > 3 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
              +{favorite.features.length - 3} more
            </span>
          )}
        </div>

        {/* Host info */}
        <div className="flex items-center space-x-2 mb-3">
          <img
            src={favorite.host.avatar}
            alt={favorite.host.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">{favorite.host.name}</span>
          {favorite.host.verified && (
            <Shield className="w-4 h-4 text-green-500" />
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 mb-3">
          <p>Added {formatDate(favorite.addedAt)} • Last viewed {formatDate(favorite.lastViewed)}</p>
        </div>

        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-xl text-gray-900">
              ₱{favorite.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Share functionality */}}
              className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigate(`/client/listing/${favorite.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Price history indicator */}
        {favorite.priceHistory.length > 1 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center space-x-2">
              {favorite.priceHistory[0].price > favorite.price ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Price dropped from ₱{favorite.priceHistory[0].price.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-xs text-orange-600 font-medium">
                    Price increased from ₱{favorite.priceHistory[0].price.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const FavoriteSummary = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <Heart className="w-6 h-6 text-red-500" />
        <span>Favorites Summary</span>
      </h2>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {favorites.length}
          </div>
          <p className="text-sm text-gray-600">Total Favorites</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {favorites.filter(f => f.isAvailable).length}
          </div>
          <p className="text-sm text-gray-600">Available Now</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ₱{Math.round(favorites.reduce((sum, f) => sum + f.price, 0) / favorites.length || 0).toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Average Price</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {(favorites.reduce((sum, f) => sum + f.rating, 0) / favorites.length || 0).toFixed(1)}
          </div>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <span>My Favorites</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Keep track of storage spaces you love and never miss a great deal
          </p>
        </div>

        {/* Summary */}
        {favorites.length > 0 && <FavoriteSummary />}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search favorites..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
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
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="under-2000">Under ₱2,000</option>
              <option value="2000-5000">₱2,000 - ₱5,000</option>
              <option value="over-5000">Over ₱5,000</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Closest</option>
            </select>

            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedFavorites.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedFavorites.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedFavorites([])}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear Selection
                </button>
                <button
                  onClick={removeSelectedFavorites}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredFavorites.length} {filteredFavorites.length === 1 ? 'favorite' : 'favorites'}
            </h2>
          </div>
        </div>

        {/* Favorites Grid/List */}
        {filteredFavorites.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {filteredFavorites.map((favorite) => (
              <FavoriteCard 
                key={favorite.id} 
                favorite={favorite} 
                isGridView={viewMode === 'grid'}
              />
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Loading your favorites...
            </h3>
            <p className="text-gray-600">
              We're fetching your saved storage spaces.
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing storage spaces and click the heart icon to save your favorites for easy access later.
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
              No favorites found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterPrice('all');
                setSortBy('newest');
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernFavorites;