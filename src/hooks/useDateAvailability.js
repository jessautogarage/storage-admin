import { useState, useCallback, useEffect } from 'react';
import listingService from '../services/listingService';

const useDateAvailability = (listingId, userId) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load availability data
  const loadAvailability = useCallback(async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await listingService.getListingAvailability(listingId);
      if (result.success) {
        setAvailability(result.availability);
      } else {
        throw new Error('Failed to load availability');
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  // Update availability
  const updateAvailability = useCallback(async (newAvailability) => {
    if (!listingId || !userId) {
      throw new Error('Missing required parameters');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await listingService.updateListingAvailability(
        listingId,
        newAvailability,
        userId
      );

      if (result.success) {
        setAvailability(prev => ({
          ...prev,
          ...newAvailability
        }));
        return { success: true };
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [listingId, userId]);

  // Check if dates are available for booking
  const checkDatesAvailable = useCallback(async (startDate, endDate) => {
    if (!listingId) {
      throw new Error('Listing ID required');
    }

    try {
      const result = await listingService.checkDateAvailability(listingId, startDate, endDate);
      return result;
    } catch (err) {
      console.error('Error checking availability:', err);
      return { success: false, error: err.message };
    }
  }, [listingId]);

  // Utility functions
  const isDateAvailable = useCallback((date) => {
    if (!availability) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const { availableDates = [], blackoutDates = [], bookedDates = [] } = availability;
    
    return availableDates.includes(dateStr) && 
           !blackoutDates.includes(dateStr) && 
           !bookedDates.includes(dateStr);
  }, [availability]);

  const isDateBooked = useCallback((date) => {
    if (!availability) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.bookedDates?.includes(dateStr) || false;
  }, [availability]);

  const isDateBlackedOut = useCallback((date) => {
    if (!availability) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return availability.blackoutDates?.includes(dateStr) || false;
  }, [availability]);

  const getAvailableCount = useCallback(() => {
    if (!availability) return 0;
    return availability.availableDates?.length || 0;
  }, [availability]);

  const getBookedCount = useCallback(() => {
    if (!availability) return 0;
    return availability.bookedDates?.length || 0;
  }, [availability]);

  const getBlackoutCount = useCallback(() => {
    if (!availability) return 0;
    return availability.blackoutDates?.length || 0;
  }, [availability]);

  // Add dates to available list
  const addAvailableDates = useCallback((dates) => {
    if (!availability) return;

    const dateStrings = dates.map(date => 
      typeof date === 'string' ? date : date.toISOString().split('T')[0]
    );

    const updatedAvailability = {
      ...availability,
      availableDates: [...new Set([...availability.availableDates, ...dateStrings])].sort(),
      blackoutDates: availability.blackoutDates?.filter(date => !dateStrings.includes(date)) || []
    };

    setAvailability(updatedAvailability);
    return updatedAvailability;
  }, [availability]);

  // Add dates to blackout list
  const addBlackoutDates = useCallback((dates) => {
    if (!availability) return;

    const dateStrings = dates.map(date => 
      typeof date === 'string' ? date : date.toISOString().split('T')[0]
    );

    const updatedAvailability = {
      ...availability,
      blackoutDates: [...new Set([...availability.blackoutDates || [], ...dateStrings])].sort(),
      availableDates: availability.availableDates?.filter(date => !dateStrings.includes(date)) || []
    };

    setAvailability(updatedAvailability);
    return updatedAvailability;
  }, [availability]);

  // Remove dates from available list
  const removeAvailableDates = useCallback((dates) => {
    if (!availability) return;

    const dateStrings = dates.map(date => 
      typeof date === 'string' ? date : date.toISOString().split('T')[0]
    );

    const updatedAvailability = {
      ...availability,
      availableDates: availability.availableDates?.filter(date => !dateStrings.includes(date)) || []
    };

    setAvailability(updatedAvailability);
    return updatedAvailability;
  }, [availability]);

  // Remove dates from blackout list
  const removeBlackoutDates = useCallback((dates) => {
    if (!availability) return;

    const dateStrings = dates.map(date => 
      typeof date === 'string' ? date : date.toISOString().split('T')[0]
    );

    const updatedAvailability = {
      ...availability,
      blackoutDates: availability.blackoutDates?.filter(date => !dateStrings.includes(date)) || []
    };

    setAvailability(updatedAvailability);
    return updatedAvailability;
  }, [availability]);

  // Auto-load on mount
  useEffect(() => {
    if (listingId) {
      loadAvailability();
    }
  }, [listingId, loadAvailability]);

  return {
    // State
    availability,
    loading,
    error,
    
    // Actions
    loadAvailability,
    updateAvailability,
    checkDatesAvailable,
    
    // Utility functions
    isDateAvailable,
    isDateBooked,
    isDateBlackedOut,
    getAvailableCount,
    getBookedCount,
    getBlackoutCount,
    
    // Date management
    addAvailableDates,
    addBlackoutDates,
    removeAvailableDates,
    removeBlackoutDates
  };
};

export default useDateAvailability;