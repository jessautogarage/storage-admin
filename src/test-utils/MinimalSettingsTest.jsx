import React, { useState } from 'react';

const MinimalSettingsTest = () => {
  const [currency, setCurrency] = useState('USD');
  const [platformFee, setPlatformFee] = useState(9.0);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    alert(`Settings saved!
Currency: ${currency}
Platform Fee: ${platformFee}%
Email Notifications: ${emailNotifications}
Maintenance Mode: ${maintenanceMode}`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        🧪 <strong>MINIMAL SETTINGS TEST</strong> - All fields should be fully editable
      </div>

      <h1 className="text-3xl font-bold mb-8">Settings Test Page</h1>
      
      <div className="space-y-8">
        {/* Currency Setting */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Currency Setting</h2>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: 'white' }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="PHP">PHP (₱)</option>
          </select>
          <p className="text-sm text-gray-600 mt-1">Current: {currency}</p>
        </div>

        {/* Platform Fee */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Platform Fee</h2>
          <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
          <input
            type="number"
            value={platformFee}
            onChange={(e) => setPlatformFee(parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: 'white' }}
            min="0"
            max="50"
            step="0.1"
          />
          <p className="text-sm text-gray-600 mt-1">Current: {platformFee}%</p>
        </div>

        {/* Email Notifications */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Enable email notifications</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">Current: {emailNotifications ? 'Enabled' : 'Disabled'}</p>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Maintenance</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-red-600">Enable maintenance mode</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">Current: {maintenanceMode ? 'Enabled' : 'Disabled'}</p>
        </div>

        {/* Save Button */}
        <div className="bg-white p-6 rounded-lg border">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium"
          >
            💾 Test Save (Shows Alert)
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
        <div className="text-sm space-y-1">
          <div>Currency: <span className="font-mono bg-yellow-100 px-1">{currency}</span></div>
          <div>Platform Fee: <span className="font-mono bg-yellow-100 px-1">{platformFee}%</span></div>
          <div>Email Notifications: <span className="font-mono bg-yellow-100 px-1">{String(emailNotifications)}</span></div>
          <div>Maintenance Mode: <span className="font-mono bg-yellow-100 px-1">{String(maintenanceMode)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default MinimalSettingsTest;