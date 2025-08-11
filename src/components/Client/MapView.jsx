import React, { useState } from 'react';
import { MapPin, Search, Filter, Navigation, Layers, ZoomIn, ZoomOut, Star } from 'lucide-react';
import ClientLayout from '../Layout/ClientLayout';

const MapView = () => {
  const [selectedListing, setSelectedListing] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual map implementation
  const [listings] = useState([
    {
      id: '1',
      title: 'Spacious Garage Storage',
      hostName: 'John Doe',
      location: 'Los Angeles, CA',
      lat: 34.0522,
      lng: -118.2437,
      pricePerMonth: 150,
      size: 100,
      rating: 4.8,
      available: true
    },
    {
      id: '2',
      title: 'Climate Controlled Unit',
      hostName: 'Sarah Johnson',
      location: 'Beverly Hills, CA',
      lat: 34.0736,
      lng: -118.4004,
      pricePerMonth: 200,
      size: 80,
      rating: 4.9,
      available: true
    },
    {
      id: '3',
      title: 'Secure Basement Storage',
      hostName: 'Mike Wilson',
      location: 'Santa Monica, CA',
      lat: 34.0195,
      lng: -118.4912,
      pricePerMonth: 125,
      size: 60,
      rating: 4.5,
      available: true
    }
  ]);

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
  };

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-64px)] relative">
        {/* Map Controls */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* Map Type Controls */}
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="My Location">
              <Navigation size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Map Layers">
              <Layers size={20} className="text-gray-600" />
            </button>
            <div className="border-t my-1"></div>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Zoom In">
              <ZoomIn size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Zoom Out">
              <ZoomOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute top-32 left-6 z-10 bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="font-semibold text-gray-900 mb-4">Filter Results</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per month)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>All Types</option>
                  <option>Indoor Storage</option>
                  <option>Outdoor Storage</option>
                  <option>Garage</option>
                  <option>Basement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Within 5 miles</option>
                  <option>Within 10 miles</option>
                  <option>Within 25 miles</option>
                  <option>Within 50 miles</option>
                </select>
              </div>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Map Placeholder */}
        <div className="h-full bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map View</h3>
              <p className="text-gray-600">Google Maps or similar integration would go here</p>
            </div>
          </div>

          {/* Mock Markers */}
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="absolute cursor-pointer"
              style={{
                top: `${20 + index * 15}%`,
                left: `${30 + index * 10}%`
              }}
              onClick={() => handleListingClick(listing)}
            >
              <div className="relative">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg hover:bg-green-700 transition-colors">
                  ${listing.pricePerMonth}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Listing Card */}
        {selectedListing && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-10">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedListing.title}</h3>
                <p className="text-sm text-gray-600">by {selectedListing.hostName}</p>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin size={14} className="mr-1" />
                <span>{selectedListing.location}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${selectedListing.pricePerMonth}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <div className="text-sm text-gray-600">{selectedListing.size} sq ft</div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="text-yellow-500 fill-current" size={14} />
                  <span className="font-medium">{selectedListing.rating}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-white rounded-lg shadow-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Available Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Your Location</span>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default MapView;