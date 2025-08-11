import { db } from '../firebaseConfig';
import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Default settings structure
const DEFAULT_SETTINGS = {
  general: {
    platformName: 'LockifyHub',
    platformDescription: 'Secure storage rental marketplace',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    contactEmail: 'support@lockifyhub.com',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    supportUrl: '',
    version: '1.0.0'
  },
  financial: {
    platformFeePercentage: 9.0,
    hostPayoutDelay: 7, // days
    refundPolicy: 'flexible', // flexible, moderate, strict
    taxCalculationEnabled: false,
    taxRate: 0.0,
    minimumPayout: 50.0,
    paymentGateway: 'stripe', // stripe, paypal, etc.
    autoPayouts: true,
    cancellationFeePercentage: 5.0
  },
  security: {
    requireIdVerification: true,
    autoVerifyHosts: false,
    backgroundCheckRequired: false,
    twoFactorAuthRequired: false,
    sessionTimeoutMinutes: 480, // 8 hours
    maxLoginAttempts: 5,
    accountLockoutMinutes: 30,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    phoneVerificationRequired: true,
    emailVerificationRequired: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    bookingConfirmations: true,
    paymentNotifications: true,
    reviewNotifications: true,
    systemAlerts: true,
    maintenanceNotifications: true,
    reportInterval: 'weekly', // daily, weekly, monthly
    notificationRetentionDays: 30
  },
  api: {
    rateLimitPerMinute: 100,
    rateLimitPerHour: 1000,
    rateLimitPerDay: 10000,
    allowCors: true,
    corsOrigins: ['http://localhost:3000', 'https://lockifyhub.com'],
    webhookTimeout: 30000, // milliseconds
    enableApiLogs: true,
    apiVersion: 'v1'
  },
  storage: {
    maxFileSize: 10485760, // 10MB in bytes
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
    allowedDocumentTypes: ['pdf', 'doc', 'docx'],
    imageQuality: 85,
    generateThumbnails: true,
    thumbnailSize: 300,
    cloudStorageProvider: 'firebase' // firebase, aws, gcp
  }
};

class SettingsService {
  constructor() {
    this.SETTINGS_DOC_ID = 'platform';
    this.listeners = new Set();
  }

  /**
   * Get current settings with defaults fallback
   */
  async getSettings() {
    try {
      const settingsRef = doc(db, 'settings', this.SETTINGS_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const currentSettings = settingsSnap.data();
        // Merge with defaults to ensure all keys exist
        return this._mergeWithDefaults(currentSettings);
      } else {
        // Initialize with defaults if document doesn't exist
        await this.initializeDefaultSettings();
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      throw new Error(`Failed to load settings: ${error.message}`);
    }
  }

  /**
   * Get specific settings category
   */
  async getCategorySettings(category) {
    const allSettings = await this.getSettings();
    return allSettings[category] || {};
  }

  /**
   * Update specific settings category or individual setting
   */
  async updateSettings(updates, category = null, userId = null) {
    try {
      const settingsRef = doc(db, 'settings', this.SETTINGS_DOC_ID);
      
      // If category is specified, update only that category
      if (category) {
        const currentSettings = await this.getSettings();
        const updatedCategorySettings = {
          ...currentSettings[category],
          ...updates
        };
        
        const updateData = {
          [category]: updatedCategorySettings,
          updatedAt: serverTimestamp(),
          lastUpdatedBy: userId || 'system'
        };
        
        await updateDoc(settingsRef, updateData);
        
        // Log the change
        await this._logSettingsChange(category, updates, userId);
        
        return { success: true, category, updates: updatedCategorySettings };
      } else {
        // Update multiple categories or root-level settings
        const updateData = {
          ...updates,
          updatedAt: serverTimestamp(),
          lastUpdatedBy: userId || 'system'
        };
        
        await updateDoc(settingsRef, updateData);
        
        // Log the change
        await this._logSettingsChange('multiple', updates, userId);
        
        return { success: true, updates };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Initialize default settings
   */
  async initializeDefaultSettings() {
    try {
      const settingsRef = doc(db, 'settings', this.SETTINGS_DOC_ID);
      const initData = {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUpdatedBy: 'system',
        version: '1.0.0'
      };
      
      await setDoc(settingsRef, initData);
      
      // Log initialization
      await this._logSettingsChange('initialization', DEFAULT_SETTINGS, 'system');
      
      return initData;
    } catch (error) {
      console.error('Error initializing settings:', error);
      throw new Error(`Failed to initialize settings: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time settings updates
   */
  subscribeToSettings(callback, errorCallback) {
    try {
      const settingsRef = doc(db, 'settings', this.SETTINGS_DOC_ID);
      
      const unsubscribe = onSnapshot(
        settingsRef,
        (doc) => {
          if (doc.exists()) {
            const settings = this._mergeWithDefaults(doc.data());
            callback(settings);
          } else {
            // Initialize if document doesn't exist
            this.initializeDefaultSettings().then(() => {
              callback(DEFAULT_SETTINGS);
            });
          }
        },
        (error) => {
          console.error('Settings subscription error:', error);
          if (errorCallback) {
            errorCallback(error);
          }
        }
      );
      
      this.listeners.add(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to settings:', error);
      if (errorCallback) {
        errorCallback(error);
      }
      return () => {};
    }
  }

  /**
   * Get settings change history
   */
  async getSettingsHistory(limitCount = 50) {
    try {
      const historyQuery = query(
        collection(db, 'settingsHistory'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      return new Promise((resolve, reject) => {
        onSnapshot(historyQuery, 
          (snapshot) => {
            const history = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            resolve(history);
          },
          reject
        );
      });
    } catch (error) {
      console.error('Error getting settings history:', error);
      throw new Error(`Failed to load settings history: ${error.message}`);
    }
  }

  /**
   * Export settings as JSON
   */
  async exportSettings() {
    try {
      const settings = await this.getSettings();
      const exportData = {
        settings,
        exportedAt: new Date().toISOString(),
        version: settings.general?.version || '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error(`Failed to export settings: ${error.message}`);
    }
  }

  /**
   * Import settings from JSON
   */
  async importSettings(jsonData, userId = null) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.settings) {
        throw new Error('Invalid import format: missing settings object');
      }
      
      // Validate and merge with current settings
      const currentSettings = await this.getSettings();
      const mergedSettings = this._mergeWithDefaults(importData.settings);
      
      // Update settings
      const settingsRef = doc(db, 'settings', this.SETTINGS_DOC_ID);
      await setDoc(settingsRef, {
        ...mergedSettings,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId || 'system',
        importedAt: serverTimestamp()
      });
      
      // Log the import
      await this._logSettingsChange('import', importData.settings, userId);
      
      return { success: true, importedSettings: mergedSettings };
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error(`Failed to import settings: ${error.message}`);
    }
  }

  /**
   * Validate settings values
   */
  validateSettings(settings, category = null) {
    const errors = [];
    
    if (category === 'financial' || !category) {
      const financial = settings.financial || settings;
      if (financial.platformFeePercentage < 0 || financial.platformFeePercentage > 50) {
        errors.push('Platform fee must be between 0% and 50%');
      }
      if (financial.minimumPayout < 0) {
        errors.push('Minimum payout cannot be negative');
      }
    }
    
    if (category === 'security' || !category) {
      const security = settings.security || settings;
      if (security.passwordMinLength < 6 || security.passwordMinLength > 128) {
        errors.push('Password minimum length must be between 6 and 128 characters');
      }
      if (security.maxLoginAttempts < 1 || security.maxLoginAttempts > 20) {
        errors.push('Max login attempts must be between 1 and 20');
      }
    }
    
    if (category === 'api' || !category) {
      const api = settings.api || settings;
      if (api.rateLimitPerMinute < 1 || api.rateLimitPerMinute > 10000) {
        errors.push('Rate limit per minute must be between 1 and 10,000');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId = null) {
    try {
      await this.initializeDefaultSettings();
      await this._logSettingsChange('reset', DEFAULT_SETTINGS, userId);
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error(`Failed to reset settings: ${error.message}`);
    }
  }

  /**
   * Cleanup method to unsubscribe from all listeners
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from settings listener:', error);
      }
    });
    this.listeners.clear();
  }

  // Private methods

  /**
   * Merge current settings with defaults to ensure all keys exist
   */
  _mergeWithDefaults(currentSettings) {
    const merged = { ...DEFAULT_SETTINGS };
    
    Object.keys(DEFAULT_SETTINGS).forEach(category => {
      if (currentSettings[category]) {
        merged[category] = {
          ...DEFAULT_SETTINGS[category],
          ...currentSettings[category]
        };
      }
    });
    
    // Preserve metadata
    if (currentSettings.createdAt) merged.createdAt = currentSettings.createdAt;
    if (currentSettings.updatedAt) merged.updatedAt = currentSettings.updatedAt;
    if (currentSettings.lastUpdatedBy) merged.lastUpdatedBy = currentSettings.lastUpdatedBy;
    if (currentSettings.version) merged.version = currentSettings.version;
    
    return merged;
  }

  /**
   * Log settings changes for audit trail
   */
  async _logSettingsChange(category, changes, userId) {
    try {
      const historyRef = collection(db, 'settingsHistory');
      await addDoc(historyRef, {
        category,
        changes,
        userId: userId || 'system',
        timestamp: serverTimestamp(),
        changeType: typeof changes === 'object' ? 'update' : 'action'
      });
    } catch (error) {
      console.error('Failed to log settings change:', error);
      // Don't throw error for logging failures
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

// Export DEFAULT_SETTINGS for reference
export { DEFAULT_SETTINGS };