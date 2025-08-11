import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    const initializeSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load existing settings
        let currentSettings = await settingsService.getSettings();
        
        // If no settings exist, initialize with defaults
        if (!currentSettings || Object.keys(currentSettings).length === 0) {
          console.log('No settings found, initializing defaults...');
          currentSettings = await settingsService.initializeDefaultSettings();
        }

        setSettings(currentSettings);

        // Subscribe to real-time updates
        unsubscribe = settingsService.subscribeToSettings(
          (updatedSettings) => {
            console.log('Settings updated via subscription:', updatedSettings);
            setSettings(updatedSettings);
          },
          (error) => {
            console.error('Settings subscription error:', error);
            setError(error.message);
          }
        );

        setLoading(false);
      } catch (err) {
        console.error('Error initializing settings:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeSettings();

    return () => {
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