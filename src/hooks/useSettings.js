import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing platform settings with real-time updates
 */
export const useSettings = (category = null) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  // Load settings on mount
  useEffect(() => {
    let unsubscribe = null;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        if (category) {
          // Load specific category
          const categorySettings = await settingsService.getCategorySettings(category);
          setSettings(categorySettings);
          setLoading(false);

          // Subscribe to real-time updates for the full settings
          // then extract the category
          unsubscribe = settingsService.subscribeToSettings(
            (fullSettings) => {
              setSettings(fullSettings[category] || {});
            },
            (error) => {
              console.error('Settings subscription error:', error);
              setError(error.message);
            }
          );
        } else {
          // Load all settings
          const allSettings = await settingsService.getSettings();
          setSettings(allSettings);
          setLoading(false);

          // Subscribe to real-time updates
          unsubscribe = settingsService.subscribeToSettings(
            (updatedSettings) => {
              setSettings(updatedSettings);
            },
            (error) => {
              console.error('Settings subscription error:', error);
              setError(error.message);
            }
          );
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadSettings();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [category]);

  // Update settings function
  const updateSettings = useCallback(async (updates) => {
    if (!isAdmin) {
      throw new Error('Only administrators can update settings');
    }

    try {
      setSaving(true);
      setError(null);

      // Validate settings before updating
      const validation = settingsService.validateSettings(updates, category);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await settingsService.updateSettings(
        updates, 
        category, 
        currentUser?.uid
      );

      return result;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [category, currentUser?.uid, isAdmin]);

  // Get specific setting value with fallback
  const getSetting = useCallback((path, defaultValue = null) => {
    if (!settings) return defaultValue;

    const keys = path.split('.');
    let value = settings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }, [settings]);

  // Update a single setting
  const updateSetting = useCallback(async (path, value) => {
    const keys = path.split('.');
    const updates = {};
    
    // Build nested update object
    let current = updates;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    return await updateSettings(updates);
  }, [updateSettings]);

  // Export settings
  const exportSettings = useCallback(async () => {
    try {
      const exportData = await settingsService.exportSettings();
      
      // Create and download file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lockifyhub-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Import settings
  const importSettings = useCallback(async (file) => {
    if (!isAdmin) {
      throw new Error('Only administrators can import settings');
    }

    try {
      setSaving(true);
      setError(null);

      const text = await file.text();
      const result = await settingsService.importSettings(text, currentUser?.uid);

      return result;
    } catch (err) {
      console.error('Error importing settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentUser?.uid, isAdmin]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!isAdmin) {
      throw new Error('Only administrators can reset settings');
    }

    try {
      setSaving(true);
      setError(null);

      const result = await settingsService.resetToDefaults(currentUser?.uid);
      return result;
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentUser?.uid, isAdmin]);

  return {
    settings,
    loading,
    error,
    saving,
    updateSettings,
    getSetting,
    updateSetting,
    exportSettings,
    importSettings,
    resetToDefaults,
    canModify: isAdmin
  };
};

/**
 * Hook for getting settings history/audit trail
 */
export const useSettingsHistory = (limit = 50) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const historyData = await settingsService.getSettingsHistory(limit);
        setHistory(historyData);
      } catch (err) {
        console.error('Error loading settings history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [limit]);

  return {
    history,
    loading,
    error
  };
};