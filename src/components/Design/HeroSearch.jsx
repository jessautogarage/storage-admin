import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Filter, Calendar, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSearch = ({ 
  onSearch,
  className = "",
  showQuickFilters = true,
  placeholder = "Enter your location or zip code"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    priceRange: 'any',
    spaceType: 'any',
    duration: 'any'
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock location suggestions - replace with actual API
  const locationSuggestions = [
    { id: 1, name: 'Makati City, Metro Manila', type: 'city' },
    { id: 2, name: 'Bonifacio Global City, Taguig', type: 'district' },
    { id: 3, name: 'Ortigas Center, Pasig', type: 'district' },
    { id: 4, name: 'Quezon City, Metro Manila', type: 'city' },
    { id: 5, name: 'Alabang, Muntinlupa', type: 'district' },
  ];

  const filteredSuggestions = searchQuery.trim() 
    ? locationSuggestions.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locationSuggestions.slice(0, 3);

  const handleSearch = (location = null) => {
    const searchLocation = location || searchQuery;
    if (searchLocation.trim()) {
      onSearch?.(searchLocation, quickFilters);
      // Navigate to browse page with search parameters
      navigate(`/client/browse?location=${encodeURIComponent(searchLocation)}&priceRange=${quickFilters.priceRange}&spaceType=${quickFilters.spaceType}&duration=${quickFilters.duration}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const priceRanges = [
    { value: 'any', label: 'Any Price' },
    { value: '0-2000', label: '₱0 - ₱2,000' },
    { value: '2000-5000', label: '₱2,000 - ₱5,000' },
    { value: '5000-10000', label: '₱5,000 - ₱10,000' },
    { value: '10000+', label: '₱10,000+' }
  ];

  const spaceTypes = [
    { value: 'any', label: 'Any Space', icon: <Zap className="w-4 h-4" /> },
    { value: 'garage', label: 'Garage', icon: <Users className="w-4 h-4" /> },
    { value: 'basement', label: 'Basement', icon: <Users className="w-4 h-4" /> },
    { value: 'attic', label: 'Attic', icon: <Users className="w-4 h-4" /> },
    { value: 'warehouse', label: 'Warehouse', icon: <Users className="w-4 h-4" /> }
  ];

  const durations = [
    { value: 'any', label: 'Any Duration' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'long-term', label: 'Long Term' }
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="search-bar bg-white shadow-large">
          {/* Location Input */}
          <div className="flex-1 relative" ref={inputRef}>
            <div className="flex items-center px-6">
              <MapPin className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-base font-medium text-neutral-900 placeholder-neutral-400 bg-transparent border-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Filters - Desktop */}
          {showQuickFilters && (
            <>
              <div className="hidden md:flex items-center px-4 py-4 border-l border-neutral-200">
                <Filter className="w-4 h-4 text-neutral-400 mr-2" />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">
                    Price Range
                  </label>
                  <select
                    value={quickFilters.priceRange}
                    onChange={(e) => setQuickFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="text-sm font-medium text-neutral-900 bg-transparent border-none outline-none cursor-pointer"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden lg:flex items-center px-4 py-4 border-l border-neutral-200">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">
                    Space Type
                  </label>
                  <select
                    value={quickFilters.spaceType}
                    onChange={(e) => setQuickFilters(prev => ({ ...prev, spaceType: e.target.value }))}
                    className="text-sm font-medium text-neutral-900 bg-transparent border-none outline-none cursor-pointer"
                  >
                    {spaceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            className="search-button font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Location Suggestions Dropdown */}
        {showSuggestions && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-large border border-neutral-200 z-50 overflow-hidden animate-slide-down">
            <div className="p-2">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      setSearchQuery(suggestion.name);
                      setShowSuggestions(false);
                      handleSearch(suggestion.name);
                    }}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-neutral-500 capitalize">
                        {suggestion.type}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-neutral-500 text-center">
                  No locations found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Quick Filters */}
      {showQuickFilters && (
        <div className="mt-4 md:hidden">
          <div className="flex flex-wrap gap-2">
            <select
              value={quickFilters.priceRange}
              onChange={(e) => setQuickFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={quickFilters.spaceType}
              onChange={(e) => setQuickFilters(prev => ({ ...prev, spaceType: e.target.value }))}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium"
            >
              {spaceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 mb-3">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Makati Storage', 'BGC Garage', 'Ortigas Space', 'Quezon City Storage', 'Alabang Warehouse'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                handleSearch(term);
              }}
              className="px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full hover:bg-white/30 transition-colors border border-white/20"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;