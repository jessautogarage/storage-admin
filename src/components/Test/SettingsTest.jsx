import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useGlobalSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';

const SettingsTest = () => {
  const { settings, loading, error, updateSettings } = useSettings();
  const globalSettings = useGlobalSettings();

  useEffect(() => {
    console.log('Settings Test Component Loaded');
    console.log('Settings:', settings);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [settings, loading, error]);

  const testSettingsUpdate = async () => {
    try {
      const testUpdate = {
        general: {
          platformName: 'LockifyHub Test ' + Date.now()
        }
      };
      
      const result = await updateSettings(testUpdate);
      console.log('Settings update result:', result);
    } catch (err) {
      console.error('Settings update error:', err);
    }
  };

  const testValidation = async () => {
    try {
      const invalidUpdate = {
        financial: {
          platformFeePercentage: 60 // Invalid - should be max 50%
        }
      };
      
      const result = await updateSettings(invalidUpdate);
      console.log('Validation test result:', result);
    } catch (err) {
      console.error('Validation test error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Settings Test</h2>
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Settings Test</h2>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Settings Test Component</h2>
      
      <div className="space-y-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Settings Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Hook Settings (useSettings)</h4>
              <p>Loaded: {settings ? '✅ Yes' : '❌ No'}</p>
              <p>Platform Name: {settings?.general?.platformName || 'Not loaded'}</p>
              <p>Platform Fee: {settings?.financial?.platformFeePercentage || 'Not loaded'}%</p>
              <p>Currency: {settings?.general?.currency || 'Not loaded'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Global Settings (Context)</h4>
              <p>Loaded: {globalSettings.settings ? '✅ Yes' : '❌ No'}</p>
              <p>Platform Name: {globalSettings.getPlatformName()}</p>
              <p>Platform Fee: {globalSettings.getPlatformFee()}%</p>
              <p>Currency: {globalSettings.getCurrency()}</p>
              <p>Timezone: {globalSettings.getTimezone()}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Test Actions</h3>
          <div className="space-x-2">
            <button
              onClick={testSettingsUpdate}
              className="btn btn-primary"
            >
              Test Settings Update
            </button>
            <button
              onClick={testValidation}
              className="btn btn-secondary"
            >
              Test Validation
            </button>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Settings Data (JSON)</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SettingsTest;