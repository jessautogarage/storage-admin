import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';

const EnhancedSearch = ({ 
  listings = [], 
  onResultsChange,
  onFilterChange,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    spaceType: '',
    minSize: '',
    maxSize: '',
    availability: 'all',
    rating: '',
    verified: false
  });

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let results = [...listings];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(listing => 
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query) ||
        listing.address?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.location) {
      const location = filters.location.toLowerCase();
      results = results.filter(listing => 
        listing.location?.toLowerCase().includes(location) ||
        listing.address?.toLowerCase().includes(location)
      );
    }

    if (filters.minPrice) {
      results = results.filter(listing => 
        parseFloat(listing.price || 0) >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      results = results.filter(listing => 
        parseFloat(listing.price || 0) <= parseFloat(filters.maxPrice)
      );
    }

    if (filters.spaceType) {
      results = results.filter(listing => 
        listing.spaceType === filters.spaceType
      );
    }

    if (filters.minSize) {
      results = results.filter(listing => 
        parseFloat(listing.size || 0) >= parseFloat(filters.minSize)
      );
    }

    if (filters.maxSize) {
      results = results.filter(listing => 
        parseFloat(listing.size || 0) <= parseFloat(filters.maxSize)
      );
    }

    if (filters.availability !== 'all') {
      results = results.filter(listing => 
        listing.availability === filters.availability
      );
    }

    if (filters.rating) {
      results = results.filter(listing => 
        parseFloat(listing.rating || 0) >= parseFloat(filters.rating)
      );
    }

    if (filters.verified) {
      results = results.filter(listing => listing.verified === true);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case 'price_high':
        results.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case 'rating':
        results.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        break;
      case 'size_large':
        results.sort((a, b) => parseFloat(b.size || 0) - parseFloat(a.size || 0));
        break;
      case 'size_small':
        results.sort((a, b) => parseFloat(a.size || 0) - parseFloat(b.size || 0));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        // relevance - maintain original order or sort by match score
        break;
    }

    return results;
  }, [listings, searchQuery, filters, sortBy]);

  // Update results when filters change
  React.useEffect(() => {
    onResultsChange?.(filteredAndSortedListings);
    onFilterChange?.({ searchQuery, filters, sortBy, viewMode });
  }, [filteredAndSortedListings, searchQuery, filters, sortBy, viewMode]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      spaceType: '',
      minSize: '',
      maxSize: '',
      availability: 'all',
      rating: '',
      verified: false
    });
    setSearchQuery('');
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'availability' && value !== 'all') count++;
      else if (key === 'verified' && value === true) count++;
      else if (value && value !== '') count++;
    });
    return count;
  }, [searchQuery, filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary relative ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <SlidersHorizontal size={20} />
            <span className="hidden sm:inline ml-2">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filter Results</h3>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin size={16} className="inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="City, barangay, or address"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="input text-sm"
              />
            </div>

            {/* Price Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Price Range (₱ per month)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input text-sm"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Space Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Space Type</label>
              <select
                value={filters.spaceType}
                onChange={(e) => handleFilterChange('spaceType', e.target.value)}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="garage">Garage</option>
                <option value="basement">Basement</option>
                <option value="attic">Attic</option>
                <option value="shed">Shed</option>
                <option value="room">Room</option>
                <option value="warehouse">Warehouse</option>
                <option value="container">Container</option>
              </select>
            </div>

            {/* Size Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Size (sq ft)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minSize}
                  onChange={(e) => handleFilterChange('minSize', e.target.value)}
                  className="input text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxSize}
                  onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Listings</option>
                <option value="available">Available Now</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div className="md:col-span-3 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="input text-sm w-32"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                  <option value="3.0">3.0+ stars</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">Verified hosts only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {filteredAndSortedListings.length} listing{filteredAndSortedListings.length !== 1 ? 's' : ''} found
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="size_large">Size: Large to Small</option>
              <option value="size_small">Size: Small to Large</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearch;