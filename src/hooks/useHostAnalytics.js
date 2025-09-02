import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { analyticsService } from '../services/analyticsService';
import { startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';

export const useHostAnalytics = (period = '30d') => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert period to date ranges
  const getDateRange = useCallback((periodValue) => {
    const now = new Date();
    const end = endOfDay(now);
    let start;

    switch (periodValue) {
      case '7d':
        start = startOfDay(subDays(now, 7));
        break;
      case '30d':
        start = startOfDay(subDays(now, 30));
        break;
      case '90d':
        start = startOfDay(subDays(now, 90));
        break;
      case '1y':
        start = startOfDay(subYears(now, 1));
        break;
      default:
        start = startOfDay(subDays(now, 30));
    }

    return { start, end };
  }, []);

  const getCompareRange = useCallback((periodValue) => {
    const now = new Date();
    let start, end;

    switch (periodValue) {
      case '7d':
        end = startOfDay(subDays(now, 7));
        start = startOfDay(subDays(now, 14));
        break;
      case '30d':
        end = startOfDay(subDays(now, 30));
        start = startOfDay(subDays(now, 60));
        break;
      case '90d':
        end = startOfDay(subDays(now, 90));
        start = startOfDay(subDays(now, 180));
        break;
      case '1y':
        end = startOfDay(subYears(now, 1));
        start = startOfDay(subYears(now, 2));
        break;
      default:
        end = startOfDay(subDays(now, 30));
        start = startOfDay(subDays(now, 60));
    }

    return { start, end };
  }, []);

  const loadHostAnalytics = useCallback(async () => {
    if (!user || user.type !== 'host') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRange(period);
      const compareRange = getCompareRange(period);

      // Get analytics data filtered for this host
      const data = await analyticsService.getOverviewAnalytics(dateRange, compareRange);
      
      // Transform data for host-specific view
      const hostAnalytics = {
        overview: {
          totalRevenue: data.revenue?.total || 0,
          totalViews: data.listings?.totalViews || 0,
          totalBookings: data.bookings?.total || 0,
          occupancyRate: data.bookings?.occupancyRate || 0,
          averageBookingValue: data.bookings?.avgValue || 0,
          repeatCustomers: data.users?.returning || 0,
          // Add growth percentages
          revenueChange: data.revenue?.growth?.total || 0,
          viewsChange: data.listings?.viewsGrowth || 0,
          bookingsChange: data.bookings?.summary?.change || 0,
          occupancyChange: data.bookings?.occupancyGrowth || 0,
          avgBookingChange: data.bookings?.avgValueGrowth || 0,
          repeatCustomersChange: data.users?.returningGrowth || 0
        },
        revenueData: data.revenue?.trend || [],
        listingPerformance: data.overview?.topListings?.map(listing => ({
          name: listing.title || listing.name || 'Unnamed Listing',
          views: listing.views || 0,
          bookings: listing.bookings || 0,
          revenue: listing.revenue || 0,
          rating: listing.averageRating || 0
        })) || [],
        topLocations: data.overview?.topLocations?.map(location => ({
          city: location.name || location.city || 'Unknown',
          bookings: location.bookings || 0,
          revenue: location.revenue || 0
        })) || []
      };

      setAnalytics(hostAnalytics);
    } catch (err) {
      console.error('Error loading host analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user, period, getDateRange, getCompareRange]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadHostAnalytics();
  }, [loadHostAnalytics]);

  const refresh = useCallback(() => {
    loadHostAnalytics();
  }, [loadHostAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh
  };
};