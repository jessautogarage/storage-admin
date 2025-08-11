import React, { useState } from 'react';
import { Heart, MapPin, Star, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../Layout/ClientLayout';

const Favorites = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual data from Firebase
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      listingId: 'L001',
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
      savedDate: '2025-01-20',
      images: []
    },
    {
      id: '2',
      listingId: 'L002',
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
      savedDate: '2025-01-18',
      images: []
    },
    {
      id: '3',
      listingId: 'L003',
      title: 'Secure Basement Storage',
      hostName: 'Mike Wilson',
      location: 'Santa Monica, CA',
      distance: '5.2 miles',
      pricePerMonth: 125,
      size: 60,
      storageType: 'basement',
      rating: 4.5,
      reviews: 6,
      available: false,
      features: ['Secure Access', 'Dry Environment', 'Easy Loading'],
      savedDate: '2025-01-15',
      priceChange: { previous: 140, current: 125, type: 'decrease' },
      images: []
    },
    {
      id: '4',
      listingId: 'L004',
      title: 'Large Attic Space',
      hostName: 'Emma Davis',
      location: 'Venice, CA',
      distance: '4.1 miles',
      pricePerMonth: 90,
      size: 120,
      storageType: 'attic',
      rating: 4.3,
      reviews: 4,
      available: true,
      features: ['Spacious', 'Dry', 'Private Access'],
      savedDate: '2025-01-10',
      images: []
    }
  ]);

  const handleRemoveFavorite = (favoriteId) => {
    setFavorites(favorites.filter(fav => fav.id !== favoriteId));
  };

  const handleViewDetails = (listingId) => {
    navigate(`/client/listing/${listingId}`);
  };

  const handleBookNow = (listingId) => {
    navigate(`/client/listing/${listingId}/book`);
  };

  const formatSavedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Saved yesterday';
    } else if (diffDays <= 7) {
      return `Saved ${diffDays} days ago`;
    } else if (diffDays <= 30) {
      return `Saved ${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `Saved on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">Storage spaces you've saved for later</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-900">{favorites.length}</div>
            <div className="text-sm text-gray-600">Saved Listings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600">
              {favorites.filter(f => f.available).length}
            </div>
            <div className="text-sm text-gray-600">Available Now</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-blue-600">
              ${Math.min(...favorites.map(f => f.pricePerMonth))}
            </div>
            <div className="text-sm text-gray-600">Lowest Price</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-purple-600">
              {favorites.filter(f => f.priceChange).length}
            </div>
            <div className="text-sm text-gray-600">Price Changes</div>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <Heart className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start browsing and save storage spaces you like</p>
            <button
              onClick={() => navigate('/client/browse')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Storage Spaces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="card overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                  
                  {/* Price Change Badge */}
                  {favorite.priceChange && (
                    <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-semibold ${
                      favorite.priceChange.type === 'decrease' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {favorite.priceChange.type === 'decrease' ? '↓' : '↑'} Price changed
                    </div>
                  )}
                  
                  {/* Remove Favorite Button */}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart size={16} className="text-red-500 fill-current" />
                  </button>
                  
                  {/* Availability Badge */}
                  {!favorite.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Not Available</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{favorite.title}</h3>
                    <p className="text-sm text-gray-600">by {favorite.hostName}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{favorite.location}</span>
                    <span className="mx-2">•</span>
                    <span>{favorite.distance}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {favorite.priceChange ? (
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${favorite.priceChange.current}
                            <span className="text-sm font-normal text-gray-600">/month</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-400 line-through">${favorite.priceChange.previous}</span>
                            <span className={`ml-2 font-medium ${
                              favorite.priceChange.type === 'decrease' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {favorite.priceChange.type === 'decrease' ? '↓' : '↑'}
                              ${Math.abs(favorite.priceChange.current - favorite.priceChange.previous)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          ${favorite.pricePerMonth}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">{favorite.size} sq ft • {favorite.storageType}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="text-yellow-500 fill-current" size={14} />
                        <span className="font-medium">{favorite.rating}</span>
                        <span className="text-gray-400">({favorite.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.features.slice(0, 2).map(feature => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {favorite.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{favorite.features.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Saved Date */}
                  <p className="text-xs text-gray-500 mb-4">
                    <Calendar size={12} className="inline mr-1" />
                    {formatSavedDate(favorite.savedDate)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(favorite.listingId)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleBookNow(favorite.listingId)}
                      disabled={!favorite.available}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        favorite.available
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {favorite.available ? 'Book Now' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helpful Tips */}
        {favorites.length > 0 && (
          <div className="mt-8 card p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• We'll notify you when prices drop on your favorite listings</li>
              <li>• Book quickly when a favorite becomes available - they go fast!</li>
              <li>• Contact hosts directly to negotiate longer-term rates</li>
            </ul>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default Favorites;