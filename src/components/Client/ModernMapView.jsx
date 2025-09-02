import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStorageListings from '../../hooks/useStorageListings';
import ModernHeader from '../Layout/ModernHeader';
import {
  Map,
  MapPin,
  Search,
  Filter,
  List,
  Navigation,
  Star,
  Heart,
  DollarSign,
  Package,
  Car,
  Building,
  Wifi,
  Shield,
  Clock,
  Phone,
  MessageCircle,
  Zap,
  Target,
  Layers,
  Plus,
  Minus,
  Locate,
  Settings
} from 'lucide-react';

const ModernMapView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState([500, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingSidebar, setShowListingSidebar] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 }); // Manila center
  const [mapZoom, setMapZoom] = useState(11);
  const [favoriteListings, setFavoriteListings] = useState([]);

  // Mock map data - in real app, this would come from Firebase with coordinates
  const mockListingsWithCoords = [
    {
      id: 'listing_1',
      title: 'Secure Storage Unit in Makati CBD',
      location: 'Makati City, Metro Manila',
      coordinates: { lat: 14.5547, lng: 121.0244 },
      type: 'storage',
      size: '10 sqm',
      price: 2500,
      rating: 4.9,
      reviewCount: 127,
      image: '/api/placeholder/300/200?text=Makati+Storage',
      features: ['24/7 Access', 'CCTV', 'Climate Control', 'WiFi'],
      host: {
        name: 'Maria Santos',
        avatar: '/api/placeholder/40/40?text=MS',
        verified: true,
        phone: '+639171234567',
        responseRate: 98
      },
      availability: 'Available Now',
      distance: '0.8 km away'
    },
    {
      id: 'listing_2',
      title: 'Climate-Controlled Warehouse Space',
      location: 'Pasig City, Metro Manila',
      coordinates: { lat: 14.5764, lng: 121.0851 },
      type: 'warehouse',
      size: '50 sqm',
      price: 8000,
      rating: 4.7,
      reviewCount: 45,
      image: '/api/placeholder/300/200?text=Pasig+Warehouse',
      features: ['Climate Control', 'Loading Dock', 'WiFi', 'Security'],
      host: {
        name: 'Anna Reyes',
        avatar: '/api/placeholder/40/40?text=AR',
        verified: true,
        phone: '+639172345678',
        responseRate: 95
      },
      availability: 'Available Now',
      distance: '2.1 km away'
    },
    {
      id: 'listing_3',
      title: 'Premium Parking Space - BGC',
      location: 'Bonifacio Global City, Taguig',
      coordinates: { lat: 14.5176, lng: 121.0509 },
      type: 'parking',
      size: '1 car slot',
      price: 3500,
      rating: 4.8,
      reviewCount: 89,
      image: '/api/placeholder/300/200?text=BGC+Parking',
      features: ['Covered', '24/7 Security', 'CCTV', 'Electric Charging'],
      host: {
        name: 'Juan Dela Cruz',
        avatar: '/api/placeholder/40/40?text=JD',
        verified: true,
        phone: '+639173456789',
        responseRate: 100
      },
      availability: 'Available from Dec 1',
      distance: '1.2 km away'
    },
    {
      id: 'listing_4',
      title: 'Budget Storage Room - Quezon City',
      location: 'Quezon City, Metro Manila',
      coordinates: { lat: 14.6760, lng: 121.0437 },
      type: 'storage',
      size: '5 sqm',
      price: 1200,
      rating: 4.6,
      reviewCount: 234,
      image: '/api/placeholder/300/200?text=QC+Storage',
      features: ['Basic Security', 'Day Access', 'Affordable'],
      host: {
        name: 'Carlos Mendoza',
        avatar: '/api/placeholder/40/40?text=CM',
        verified: true,
        phone: '+639174567890',
        responseRate: 92
      },
      availability: 'Available Now',
      distance: '3.5 km away'
    },
    {
      id: 'listing_5',
      title: 'Motorcycle Parking - Ortigas',
      location: 'Ortigas Center, Pasig City',
      coordinates: { lat: 14.5865, lng: 121.0614 },
      type: 'parking',
      size: 'Motorcycle slot',
      price: 800,
      rating: 4.5,
      reviewCount: 156,
      image: '/api/placeholder/300/200?text=Ortigas+Motorcycle',
      features: ['Covered', 'Security Guard', 'CCTV'],
      host: {
        name: 'Mike Santos',
        avatar: '/api/placeholder/40/40?text=MS2',
        verified: true,
        phone: '+639175678901',
        responseRate: 88
      },
      availability: 'Available Now',
      distance: '4.2 km away'
    },
    {
      id: 'listing_6',
      title: 'Premium Garage - Mandaluyong',
      location: 'Mandaluyong City, Metro Manila',
      coordinates: { lat: 14.5794, lng: 121.0359 },
      type: 'storage',
      size: '15 sqm',
      price: 3200,
      rating: 4.9,
      reviewCount: 78,
      image: '/api/placeholder/300/200?text=Mandaluyong+Garage',
      features: ['24/7 Access', 'Premium Security', 'CCTV', 'WiFi'],
      host: {
        name: 'Lisa Torres',
        avatar: '/api/placeholder/40/40?text=LT',
        verified: true,
        phone: '+639176789012',
        responseRate: 96
      },
      availability: 'Available from Dec 15',
      distance: '1.8 km away'
    }
  ];

  const [listings, setListings] = useState(mockListingsWithCoords);

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || listing.type === filterType;
    
    const matchesPrice = 
      listing.price >= priceRange[0] && listing.price <= priceRange[1];
    
    return matchesSearch && matchesType && matchesPrice;
  });

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(13);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default Manila coordinates
        }
      );
    }
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      setMap(googleMap);

      // Add user location marker if available
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: googleMap,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(20, 20)
          }
        });
      }
    }
  }, [mapCenter, mapZoom, userLocation, map]);

  // Update markers when filtered listings change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = filteredListings.map(listing => {
      const marker = new window.google.maps.Marker({
        position: listing.coordinates,
        map: map,
        title: listing.title,
        icon: {
          url: getMarkerIcon(listing.type, listing.price),
          scaledSize: new window.google.maps.Size(40, 50)
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(listing)
      });

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => m.infoWindow && m.infoWindow.close());
        
        infoWindow.open(map, marker);
        setSelectedListing(listing);
        setShowListingSidebar(true);
      });

      marker.infoWindow = infoWindow;
      return marker;
    });

    setMarkers(newMarkers);
  }, [filteredListings, map]);

  const getMarkerIcon = (type, price) => {
    const getColor = () => {
      if (price < 2000) return '#10B981'; // Green
      if (price < 5000) return '#3B82F6'; // Blue
      return '#F59E0B'; // Orange
    };

    const getIcon = () => {
      switch (type) {
        case 'parking': return '🚗';
        case 'warehouse': return '🏢';
        default: return '📦';
      }
    };

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="${getColor()}"/>
        <circle cx="20" cy="20" r="12" fill="white"/>
        <text x="20" y="26" text-anchor="middle" font-size="16">${getIcon()}</text>
      </svg>
    `)}`;
  };

  const createInfoWindowContent = (listing) => {
    return `
      <div style="width: 250px; padding: 12px;">
        <img src="${listing.image}" alt="${listing.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"/>
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">${listing.title}</h3>
        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">${listing.location}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 18px; font-weight: bold; color: #111827;">₱${listing.price.toLocaleString()}</span>
          <div style="display: flex; align-items: center;">
            <span style="color: #F59E0B; margin-right: 2px;">★</span>
            <span style="font-size: 14px;">${listing.rating} (${listing.reviewCount})</span>
          </div>
        </div>
        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
          ${listing.features.slice(0, 2).map(feature => 
            `<span style="background: #EFF6FF; color: #1D4ED8; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${feature}</span>`
          ).join('')}
        </div>
        <button onclick="window.viewListing('${listing.id}')" style="width: 100%; background: #3B82F6; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: 500; cursor: pointer;">
          View Details
        </button>
      </div>
    `;
  };

  // Make viewListing function globally available for info windows
  useEffect(() => {
    window.viewListing = (listingId) => {
      navigate(`/client/listing/${listingId}`);
    };

    return () => {
      delete window.viewListing;
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const toggleFavorite = (listingId) => {
    setFavoriteListings(prev => 
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const centerOnLocation = (coordinates) => {
    if (map) {
      map.setCenter(coordinates);
      map.setZoom(15);
    }
  };

  const centerOnUser = () => {
    if (userLocation && map) {
      map.setCenter(userLocation);
      map.setZoom(15);
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

  const ListingSidebar = () => (
    showListingSidebar && selectedListing && (
      <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl border-l overflow-y-auto z-10">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setShowListingSidebar(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>

          {/* Listing image */}
          <div className="relative mb-4">
            <img
              src={selectedListing.image}
              alt={selectedListing.title}
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              onClick={() => toggleFavorite(selectedListing.id)}
              className={`absolute top-3 right-3 p-2 rounded-full ${
                favoriteListings.includes(selectedListing.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-4 h-4 ${favoriteListings.includes(selectedListing.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Listing details */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedListing.title}
          </h2>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{selectedListing.location}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{selectedListing.rating}</span>
              <span className="text-gray-500 text-sm">({selectedListing.reviewCount})</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₱{selectedListing.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>

          {/* Type and size */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              {getTypeIcon(selectedListing.type)}
              <span className="capitalize">{selectedListing.type}</span>
            </div>
            <span>•</span>
            <span>{selectedListing.size}</span>
            <span>•</span>
            <span>{selectedListing.distance}</span>
          </div>

          {/* Features */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Features</h3>
            <div className="flex flex-wrap gap-2">
              {selectedListing.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Host information */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Host</h3>
            <div className="flex items-center space-x-3">
              <img
                src={selectedListing.host.avatar}
                alt={selectedListing.host.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedListing.host.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedListing.host.responseRate}% response rate
                </p>
              </div>
              {selectedListing.host.verified && (
                <Shield className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Availability</span>
            </div>
            <p className="text-sm text-gray-600">{selectedListing.availability}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/client/listing/${selectedListing.id}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Full Details
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button className="flex items-center justify-center space-x-2 border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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

      <div className="relative h-[calc(100vh-80px)]">
        {/* Search and Filters Bar */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="bg-white rounded-xl shadow-lg border p-4">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location or storage name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type filter */}
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

              {/* Price range */}
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 min-w-[80px]">
                  ₱{priceRange[1].toLocaleString()}
                </span>
              </div>

              {/* Toggle list view */}
              <button
                onClick={() => navigate('/client/browse')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-20 right-4 z-20 space-y-2">
          {/* Locate user */}
          {userLocation && (
            <button
              onClick={centerOnUser}
              className="bg-white border p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Locate className="w-5 h-5 text-blue-600" />
            </button>
          )}

          {/* Zoom controls */}
          <div className="bg-white border rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => map && map.setZoom(map.getZoom() + 1)}
              className="block p-3 hover:bg-gray-50 transition-colors border-b"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => map && map.setZoom(map.getZoom() - 1)}
              className="block p-3 hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Layers */}
          <button className="bg-white border p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Results count */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-white rounded-lg shadow-lg border p-3">
            <p className="text-sm font-medium text-gray-900">
              {filteredListings.length} storage {filteredListings.length === 1 ? 'space' : 'spaces'} found
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ 
            filter: showListingSidebar ? 'brightness(0.95)' : 'none',
            transition: 'filter 0.3s ease'
          }}
        />

        {/* No Google Maps fallback */}
        {!window.google && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Map Loading...
              </h3>
              <p className="text-gray-600">
                Please ensure you have an internet connection
              </p>
            </div>
          </div>
        )}

        {/* Listing Sidebar */}
        <ListingSidebar />

        {/* Empty state overlay */}
        {filteredListings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 z-30">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">
                No storage spaces found
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Try adjusting your search criteria or expanding your search area.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setPriceRange([500, 10000]);
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Load Google Maps API */}
      {!window.google && (
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`}
        />
      )}
    </div>
  );
};

export default ModernMapView;