import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import listingService from '../services/listingService';

export const useListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const userId = user?.user?.uid || user?.uid;

  // Fetch listings for current host
  const fetchHostListings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await listingService.getListingsByHost(userId);
      
      if (result.success) {
        setListings(result.data);
      } else {
        throw new Error('Failed to fetch listings');
      }
    } catch (err) {
      console.error('Error fetching host listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch host statistics
  const fetchHostStats = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await listingService.getHostStats(userId);
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.warn('Failed to fetch host stats');
      }
    } catch (err) {
      console.error('Error fetching host stats:', err);
    }
  }, [userId]);

  // Create a new listing
  const createListing = useCallback(async (listingData) => {
    if (!userId) {
      throw new Error('User must be logged in to create listing');
    }

    try {
      const result = await listingService.createListing(listingData, userId);
      
      if (result.success) {
        // Refresh listings
        await fetchHostListings();
        await fetchHostStats();
      }
      
      return result;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  }, [userId, fetchHostListings, fetchHostStats]);

  // Update listing
  const updateListing = useCallback(async (listingId, updateData) => {
    if (!userId) {
      throw new Error('User must be logged in to update listing');
    }

    try {
      const result = await listingService.updateListing(listingId, updateData, userId);
      
      if (result.success) {
        // Update local listings
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, ...updateData }
            : listing
        ));
      }
      
      return result;
    } catch (err) {
      console.error('Error updating listing:', err);
      throw err;
    }
  }, [userId]);

  // Toggle listing status
  const toggleListingStatus = useCallback(async (listingId) => {
    if (!userId) {
      throw new Error('User must be logged in to toggle listing status');
    }

    try {
      const result = await listingService.toggleListingStatus(listingId, userId);
      
      if (result.success) {
        // Update local listings
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: result.newStatus }
            : listing
        ));
        
        // Refresh stats
        await fetchHostStats();
      }
      
      return result;
    } catch (err) {
      console.error('Error toggling listing status:', err);
      throw err;
    }
  }, [userId, fetchHostStats]);

  // Delete listing
  const deleteListing = useCallback(async (listingId) => {
    if (!userId) {
      throw new Error('User must be logged in to delete listing');
    }

    try {
      const result = await listingService.deleteListing(listingId, userId);
      
      if (result.success) {
        // Remove from local listings
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        
        // Refresh stats
        await fetchHostStats();
      }
      
      return result;
    } catch (err) {
      console.error('Error deleting listing:', err);
      throw err;
    }
  }, [userId, fetchHostStats]);

  // Get single listing
  const getListing = useCallback(async (listingId) => {
    try {
      const result = await listingService.getListing(listingId);
      return result;
    } catch (err) {
      console.error('Error fetching listing:', err);
      throw err;
    }
  }, []);

  // Increment views
  const incrementViews = useCallback(async (listingId) => {
    try {
      await listingService.incrementViews(listingId);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  }, []);

  // Initial fetch on mount or user change
  useEffect(() => {
    if (userId) {
      fetchHostListings();
      fetchHostStats();
    } else {
      setListings([]);
      setStats(null);
    }
  }, [userId, fetchHostListings, fetchHostStats]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchHostListings(),
      fetchHostStats()
    ]);
  }, [fetchHostListings, fetchHostStats]);

  return {
    // Data
    listings,
    stats,
    loading,
    error,
    
    // Actions
    createListing,
    updateListing,
    deleteListing,
    toggleListingStatus,
    getListing,
    incrementViews,
    refresh,
    
    // Manual fetch functions
    fetchHostListings,
    fetchHostStats
  };
};

export const usePublicListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Search listings
  const searchListings = useCallback(async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      setFilters(searchFilters);
      
      const result = await listingService.searchListings(searchFilters);
      
      if (result.success) {
        setListings(result.data);
      } else {
        throw new Error('Failed to search listings');
      }
    } catch (err) {
      console.error('Error searching listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all active listings
  const fetchActiveListings = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await listingService.getActiveListings(limit);
      
      if (result.success) {
        setListings(result.data);
      } else {
        throw new Error('Failed to fetch listings');
      }
    } catch (err) {
      console.error('Error fetching active listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single listing
  const getListing = useCallback(async (listingId) => {
    try {
      const result = await listingService.getListing(listingId);
      
      // Increment view count
      if (result.success) {
        await listingService.incrementViews(listingId);
      }
      
      return result;
    } catch (err) {
      console.error('Error fetching listing:', err);
      throw err;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchActiveListings();
  }, [fetchActiveListings]);

  return {
    // Data
    listings,
    loading,
    error,
    filters,
    
    // Actions
    searchListings,
    fetchActiveListings,
    getListing,
    
    // Utilities
    clearFilters: () => {
      setFilters({});
      fetchActiveListings();
    }
  };
};