import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    const initializeSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load existing settings - this will fall back to defaults if Firebase fails
        const currentSettings = await settingsService.getSettings();
        setSettings(currentSettings);

        // Subscribe to real-time updates - this will handle errors gracefully
        unsubscribe = settingsService.subscribeToSettings(
          (updatedSettings) => {
            if (isMounted) {
              setSettings(updatedSettings);
              // Clear any previous errors if settings load successfully
              setError(null);
            }
          },
          (subscriptionError) => {
            console.warn('Settings subscription error, continuing with current settings:', subscriptionError);
            // Don't set error for subscription failures - app should still work with defaults
          }
        );

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing settings:', err);
        console.warn('Continuing with default settings due to initialization error');
        
        // Even if initialization fails, provide defaults and mark as loaded
        if (isMounted) {
          const { DEFAULT_SETTINGS } = await import('../services/settingsService');
          setSettings(DEFAULT_SETTINGS);
          setError(null); // Don't show error to user - app works with defaults
          setLoading(false);
        }
      }
    };

    initializeSettings();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Helper functions to get specific settings
  const getSetting = (path, defaultValue = null) => {
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
  };

  const getCurrency = () => getSetting('general.currency', 'USD');
  const getTimezone = () => getSetting('general.timezone', 'UTC');
  const getPlatformFee = () => getSetting('financial.platformFeePercentage', 9);
  const getPlatformName = () => getSetting('general.platformName', 'LockifyHub');
  const getMinimumPayout = () => getSetting('financial.minimumPayout', 50);

  const contextValue = {
    settings,
    loading,
    error,
    getSetting,
    getCurrency,
    getTimezone,
    getPlatformFee,
    getPlatformName,
    getMinimumPayout,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useGlobalSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useGlobalSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;