import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2, X } from 'lucide-react';

const LocationPicker = ({ 
  value = {}, 
  onChange, 
  error, 
  showError,
  disabled = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(value);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Google Maps API Key - should be in environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && GOOGLE_MAPS_API_KEY) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded');
      };
      document.head.appendChild(script);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize map when modal opens
  useEffect(() => {
    if (showMap && mapContainerRef.current && window.google) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = () => {
    const defaultCenter = currentLocation.lat && currentLocation.lng
      ? { lat: currentLocation.lat, lng: currentLocation.lng }
      : { lat: 14.5995, lng: 120.9842 }; // Manila, Philippines

    const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: currentLocation.lat ? 15 : 10,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    const markerInstance = new window.google.maps.Marker({
      position: defaultCenter,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    // Initialize autocomplete
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'ph' }, // Restrict to Philippines
        fields: ['formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(17);
          markerInstance.setPosition({ lat, lng });
          
          updateLocation(lat, lng, place.formatted_address || '');
        }
      });

      autocompleteRef.current = autocomplete;
    }

    // Handle marker drag
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateLocation(lat, lng, results[0].formatted_address);
        } else {
          updateLocation(lat, lng, '');
        }
      });
    });

    // Handle map click
    mapInstance.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      markerInstance.setPosition(event.latLng);
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateLocation(lat, lng, results[0].formatted_address);
        } else {
          updateLocation(lat, lng, '');
        }
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const updateLocation = (lat, lng, address) => {
    const locationData = {
      lat,
      lng,
      address,
      formatted: `${address} (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    };
    
    setCurrentLocation(locationData);
    
    // Parse address components
    const addressComponents = parseAddress(address);
    
    onChange({
      ...locationData,
      ...addressComponents
    });
  };

  const parseAddress = (fullAddress) => {
    // Simple parsing - in production, use Google's address components
    const parts = fullAddress.split(',').map(p => p.trim());
    const result = {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Philippines'
    };

    if (parts.length > 0) result.address = parts[0];
    if (parts.length > 1) result.city = parts[1];
    if (parts.length > 2) result.state = parts[2];
    
    // Extract ZIP code if present
    const zipMatch = fullAddress.match(/\b\d{4}\b/);
    if (zipMatch) result.zipCode = zipMatch[0];

    return result;
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map && marker) {
            map.setCenter({ lat, lng });
            map.setZoom(17);
            marker.setPosition({ lat, lng });
            
            // Reverse geocode
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results[0]) {
                updateLocation(lat, lng, results[0].formatted_address);
              }
              setIsLoading(false);
            });
          } else {
            setCurrentLocation({ lat, lng });
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please search or click on the map.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowMap(false);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    // The location has already been updated via updateLocation
    // Just close the modal
    setShowMap(false);
    setSearchQuery('');
  };

  return (
    <div className="location-picker">
      {/* Display current location */}
      <div className={`border rounded-xl p-4 ${
        error && showError 
          ? 'border-red-300 bg-red-50' 
          : 'border-gray-300 bg-white'
      }`}>
        {currentLocation.address ? (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center text-gray-700 mb-1">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">Selected Location:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{currentLocation.address}</p>
              {currentLocation.lat && (
                <p className="text-xs text-gray-400 ml-6 mt-1">
                  Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              disabled={disabled}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <MapPin className="w-5 h-5" />
            <span>Click to Select Location on Map</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Location</h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  My Location
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tip: Click on the map or drag the marker to select a location
              </p>
            </div>

            {/* Map Container */}
            <div 
              ref={mapContainerRef}
              className="w-full h-[500px]"
              style={{ minHeight: '500px' }}
            />

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentLocation.address && (
                    <div>
                      <span className="font-medium">Selected: </span>
                      {currentLocation.address}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!currentLocation.address}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback if no API key */}
      {!GOOGLE_MAPS_API_KEY && showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Google Maps Not Configured</h3>
            <p className="text-gray-600 mb-4">
              To use the map location picker, please add your Google Maps API key to the environment variables:
            </p>
            <code className="block bg-gray-100 p-3 rounded text-sm mb-4">
              VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </code>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;