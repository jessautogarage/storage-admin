import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Shield, Star, ChevronRight, Users, Building, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('storage');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const storageTypes = [
    { id: 'storage', label: 'Storage Space', icon: Building, color: 'blue' },
    { id: 'parking', label: 'Parking', icon: Car, color: 'green' },
    { id: 'warehouse', label: 'Warehouse', icon: Building, color: 'purple' }
  ];

  const popularSearches = [
    'Manila storage units',
    'Makati parking',
    'Quezon City warehouse',
    'BGC self storage',
    'Ortigas parking space'
  ];

  const heroImages = [
    '/api/placeholder/800/500?text=Modern+Storage+Facility',
    '/api/placeholder/800/500?text=Secure+Parking+Space',
    '/api/placeholder/800/500?text=Clean+Warehouse'
  ];

  const stats = [
    { number: '50,000+', label: 'Happy Customers' },
    { number: '10,000+', label: 'Storage Spaces' },
    { number: '95%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Security Monitoring' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/browse?q=${encodeURIComponent(searchQuery)}&type=${selectedType}`);
    }
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    navigate(`/client/browse?q=${encodeURIComponent(query)}&type=${selectedType}`);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchQuery(`${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSearchQuery('Metro Manila, Philippines');
        }
      );
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Storage & parking
                <span className="block text-blue-600">made simple</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Find secure, affordable storage spaces and parking spots in your neighborhood. 
                Book instantly with trusted hosts across the Philippines.
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border">
              {/* Storage Type Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {storageTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedType === type.id
                          ? `bg-${type.color}-100 text-${type.color}-700 border-${type.color}-200 border`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city, neighborhood, or address"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleLocationDetect}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Use my location
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Find {selectedType === 'storage' ? 'Storage' : selectedType === 'parking' ? 'Parking' : 'Warehouse'}</span>
                </button>
              </form>

              {/* Popular Searches */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(search)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Verified hosts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Instant booking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>4.8/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    currentSlide === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Storage facility ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">50,000+</p>
                  <p className="text-sm text-gray-600">Happy customers</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-600">Security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action for Hosts */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Got extra space? Turn it into income
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              List your unused garage, storage room, or parking space and start earning money from day one.
            </p>
            <button
              onClick={() => navigate('/signup?type=host')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center space-x-2"
            >
              <span>Become a Host</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;