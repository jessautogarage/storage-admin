import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = (dateRange, compareRange) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, compareRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getOverviewAnalytics(dateRange, compareRange);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format) => {
    try {
      await analyticsService.exportAnalyticsData(analytics, format);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
    exportData
  };
};
