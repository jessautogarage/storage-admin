import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Heart, 
  Calendar, 
  Shield, 
  Camera,
  Users,
  Clock,
  ChevronRight,
  BadgeCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

const ListingCard = ({ 
  listing,
  variant = 'default', // 'default', 'featured', 'compact'
  onFavoriteToggle,
  onBookingClick,
  onViewDetails,
  className = ""
}) => {
  const [isFavorited, setIsFavorited] = useState(listing.isFavorited || false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const newState = !isFavorited;
    setIsFavorited(newState);
    onFavoriteToggle?.(listing.id, newState);
  };

  const handleCardClick = () => {
    onViewDetails?.(listing);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();
    onBookingClick?.(listing);
  };

  // Format price display
  const formatPrice = (price) => {
    if (price >= 1000) {
      return `₱${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
    }
    return `₱${price.toLocaleString()}`;
  };

  // Get space type icon
  const getSpaceTypeIcon = (type) => {
    const iconMap = {
      garage: <Users className="w-4 h-4" />,
      basement: <Shield className="w-4 h-4" />,
      attic: <Zap className="w-4 h-4" />,
      warehouse: <Users className="w-4 h-4" />,
      shed: <Users className="w-4 h-4" />,
      room: <Users className="w-4 h-4" />
    };
    return iconMap[type] || <Users className="w-4 h-4" />;
  };

  if (variant === 'compact') {
    return (
      <div 
        className={`listing-card cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex">
          {/* Image */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-200 rounded-l-xl overflow-hidden relative">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <Camera className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <Camera className="w-6 h-6 text-neutral-400" />
              </div>
            )}
            
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-neutral-900/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {listing.images.length}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="listing-title text-base">{listing.title}</h3>
                <p className="listing-subtitle text-xs">{listing.hostName}</p>
              </div>
              <button
                onClick={handleFavoriteClick}
                className="listing-favorite w-8 h-8 ml-2"
              >
                <Heart 
                  className={`w-4 h-4 transition-colors ${
                    isFavorited ? 'fill-error-500 text-error-500' : 'text-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center text-xs text-neutral-600 mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{listing.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="listing-price text-lg">{formatPrice(listing.pricePerMonth)}</span>
                <span className="listing-price-period">/mo</span>
              </div>
              
              {listing.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning-500 fill-current" />
                  <span className="text-xs font-medium">{listing.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div 
        className={`listing-card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        {/* Featured Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-warning-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Featured
          </div>
        </div>

        {/* Image */}
        <div className="listing-image h-56">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[0]}
                alt={listing.title}
                className={`transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="skeleton w-full h-full" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
              <Camera className="w-8 h-8 text-neutral-400" />
            </div>
          )}

          {/* Image overlay badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleFavoriteClick}
              className="listing-favorite"
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  isFavorited ? 'fill-error-500 text-error-500' : 'text-neutral-400'
                }`}
              />
            </button>
          </div>

          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-neutral-900/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {listing.images.length}
            </div>
          )}

          {!listing.available && (
            <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
              <span className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-semibold">
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="listing-content">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="listing-title">{listing.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="listing-subtitle">{listing.hostName}</p>
                {listing.verified && (
                  <BadgeCheck className="w-4 h-4 text-primary-500" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-neutral-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
            <span className="mx-2">•</span>
            <span>{listing.size} sq ft</span>
          </div>

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <div className="listing-features mb-4">
              {listing.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="listing-feature">
                  {feature}
                </span>
              ))}
              {listing.features.length > 3 && (
                <span className="listing-feature text-primary-600">
                  +{listing.features.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="listing-price">{formatPrice(listing.pricePerMonth)}</span>
              <span className="listing-price-period">/month</span>
            </div>
            
            {listing.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning-500 fill-current" />
                <span className="font-medium">{listing.rating}</span>
                <span className="text-neutral-400">({listing.reviews})</span>
              </div>
            )}
          </div>

          <button
            onClick={handleBookingClick}
            disabled={!listing.available}
            className={`w-full btn ${
              listing.available
                ? 'btn-primary-gradient'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {listing.available ? (
              <>
                Book Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Not Available'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={`listing-card cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="listing-image">
        {listing.images && listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[0]}
              alt={listing.title}
              className={`transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <div className="skeleton w-full h-full" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <Camera className="w-8 h-8 text-neutral-400" />
          </div>
        )}

        {/* Image overlay elements */}
        <div className="absolute top-3 left-3">
          {listing.spaceType && (
            <div className="listing-badge bg-white/90 backdrop-blur flex items-center gap-1">
              {getSpaceTypeIcon(listing.spaceType)}
              <span className="capitalize">{listing.spaceType}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleFavoriteClick}
          className="listing-favorite"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-error-500 text-error-500' : 'text-neutral-400'
            }`}
          />
        </button>

        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-neutral-900/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {listing.images.length}
          </div>
        )}

        {!listing.available && (
          <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
            <span className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-semibold">
              Not Available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="listing-content">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="listing-title">{listing.title}</h3>
            <div className="flex items-center gap-2">
              <p className="listing-subtitle">{listing.hostName}</p>
              {listing.verified && (
                <BadgeCheck className="w-3 h-3 text-primary-500" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-neutral-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
          {listing.distance && (
            <>
              <span className="mx-2">•</span>
              <span>{listing.distance}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className="listing-price">{formatPrice(listing.pricePerMonth)}</span>
            <span className="listing-price-period">/month</span>
          </div>
          
          {listing.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning-500 fill-current" />
              <span className="font-medium text-sm">{listing.rating}</span>
              <span className="text-neutral-400 text-sm">({listing.reviews})</span>
            </div>
          )}
        </div>

        <div className="text-sm text-neutral-600 mb-4">
          {listing.size} sq ft • {listing.spaceType}
        </div>

        {/* Features */}
        {listing.features && listing.features.length > 0 && (
          <div className="listing-features mb-4">
            {listing.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="listing-feature">
                {feature}
              </span>
            ))}
            {listing.features.length > 3 && (
              <span className="listing-feature text-primary-600">
                +{listing.features.length - 3} more
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleBookingClick}
          disabled={!listing.available}
          className={`w-full btn ${
            listing.available
              ? 'btn-primary'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {listing.available ? 'View Details' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default ListingCard;