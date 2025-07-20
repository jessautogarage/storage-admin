import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, DollarSign, Mail } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    platformName: 'Storage Marketplace',
    platformFee: 9,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    autoVerifyHosts: false,
    requireIdVerification: true,
    maintenanceMode: false
  });

  const handleSave = async () => {
    // Save settings to Firebase
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* General Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-primary-600" size={24} />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform Name</label>
              <input
                type="text"
                className="input"
                value={settings.platformName}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  className="input"
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PHP">PHP (₱)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  className="input"
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="PHT">Philippine Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-green-600" size={24} />
            <h2 className="text-lg font-semibold">Revenue Settings</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Platform Fee (%)</label>
            <input
              type="number"
              className="input w-32"
              min="0"
              max="50"
              value={settings.platformFee}
              onChange={(e) => setSettings({...settings, platformFee: parseInt(e.target.value)})}
            />
            <p className="text-sm text-gray-500 mt-1">
              This fee will be charged on all bookings
            </p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-orange-600" size={24} />
            <h2 className="text-lg font-semibold">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoVerifyHosts}
                onChange={(e) => setSettings({...settings, autoVerifyHosts: e.target.checked})}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium">Auto-verify hosts</span>
                <p className="text-xs text-gray-500">Automatically approve new host registrations</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.requireIdVerification}
                onChange={(e) => setSettings({...settings, requireIdVerification: e.target.checked})}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium">Require ID verification</span>
                <p className="text-xs text-gray-500">Users must verify their identity before booking</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium">Email notifications</span>
              <p className="text-xs text-gray-500">Receive email alerts for important events</p>
            </div>
          </label>
        </div>

        {/* Maintenance Mode */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-red-600" size={24} />
            <h2 className="text-lg font-semibold">Maintenance Mode</h2>
          </div>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            <div>
              <span className="text-sm font-medium">Enable maintenance mode</span>
              <p className="text-xs text-gray-500">Temporarily disable access to the platform</p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;