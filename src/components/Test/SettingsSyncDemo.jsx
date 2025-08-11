import React from 'react';
import { useGlobalSettings } from '../../context/SettingsContext';

const SettingsSyncDemo = () => {
  const { 
    getCurrency, 
    getTimezone, 
    getPlatformFee, 
    getPlatformName,
    getMinimumPayout 
  } = useGlobalSettings();

  // Example pricing calculation using platform fee
  const bookingAmount = 100;
  const platformFee = getPlatformFee();
  const feeAmount = (bookingAmount * platformFee / 100).toFixed(2);
  const hostPayout = (bookingAmount - feeAmount).toFixed(2);

  // Currency formatting
  const formatCurrency = (amount) => {
    const currency = getCurrency();
    const symbols = { USD: '$', EUR: '€', GBP: '£', PHP: '₱' };
    return `${symbols[currency] || '$'}${amount}`;
  };

  // Timezone formatting  
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: getTimezone(),
    hour12: true,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">🔄 Settings Sync Demo</h2>
      <p className="text-sm text-gray-600 mb-4">
        This component automatically updates when settings change, demonstrating real-time sync across the platform.
      </p>
      
      <div className="space-y-6">
        {/* Platform Branding */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-2">Platform Branding</h3>
          <p className="text-2xl font-bold text-blue-700">{getPlatformName()}</p>
          <p className="text-sm text-blue-600">Updates instantly when platform name changes</p>
        </div>

        {/* Pricing Example */}
        <div className="border rounded-lg p-4 bg-green-50">
          <h3 className="font-medium text-green-900 mb-2">Dynamic Pricing</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Booking Amount</p>
              <p className="font-bold text-green-700">{formatCurrency(bookingAmount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Platform Fee ({platformFee}%)</p>
              <p className="font-bold text-green-700">{formatCurrency(feeAmount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Host Payout</p>
              <p className="font-bold text-green-700">{formatCurrency(hostPayout)}</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Calculations update automatically when platform fee or currency changes
          </p>
        </div>

        {/* Time Zone Example */}
        <div className="border rounded-lg p-4 bg-amber-50">
          <h3 className="font-medium text-amber-900 mb-2">Timezone Display</h3>
          <p className="text-lg font-mono text-amber-800">{currentTime}</p>
          <p className="text-xs text-amber-600 mt-1">
            Current time in {getTimezone()} timezone
          </p>
        </div>

        {/* Payout Settings */}
        <div className="border rounded-lg p-4 bg-purple-50">
          <h3 className="font-medium text-purple-900 mb-2">Payout Settings</h3>
          <p className="text-sm text-purple-700">
            Minimum payout threshold: <span className="font-bold">{formatCurrency(getMinimumPayout())}</span>
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Hosts must reach this amount before requesting payout
          </p>
        </div>

        {/* Status Indicator */}
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            ✅ All values above sync in real-time with settings changes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSyncDemo;