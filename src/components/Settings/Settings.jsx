import React, { useState, useCallback } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  DollarSign, 
  Mail, 
  Download, 
  Upload, 
  RotateCcw,
  History,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings as SettingsIcon,
  Server,
  Database,
  Lock,
  X,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSettings, useSettingsHistory } from '../../hooks/useSettings';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../hooks/useAuth';

// Toast notification component (simple version)
const Toast = ({ message, type = 'info', onClose }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`}>
    {type === 'success' && <CheckCircle2 size={16} />}
    {type === 'error' && <AlertCircle size={16} />}
    {type === 'warning' && <AlertCircle size={16} />}
    {type === 'info' && <Info size={16} />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70">
      <X size={16} />
    </button>
  </div>
);

// Connection status indicator
const ConnectionStatus = ({ connected, syncing }) => (
  <div className="flex items-center gap-2 text-xs">
    {syncing ? (
      <>
        <Loader2 size={12} className="animate-spin text-blue-500" />
        <span className="text-blue-600">Syncing...</span>
      </>
    ) : connected ? (
      <>
        <Wifi size={12} className="text-green-500" />
        <span className="text-green-600">Connected</span>
      </>
    ) : (
      <>
        <WifiOff size={12} className="text-red-500" />
        <span className="text-red-600">Offline</span>
      </>
    )}
  </div>
);

// Enhanced Input Field with Validation
const ValidatedInput = ({ 
  label, 
  type = 'text', 
  category, 
  field, 
  getCurrentValue, 
  handleInputChange, 
  canModify, 
  validationErrors, 
  helpText,
  required = false,
  ...props 
}) => {
  const value = getCurrentValue(category, field) || '';
  const errorKey = `${category}.${field}`;
  const hasError = validationErrors[errorKey];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        className={`input ${hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={(e) => {
          const rawValue = e.target.value;
          let newValue = rawValue;
          
          if (type === 'number' && rawValue !== '') {
            const numValue = parseFloat(rawValue);
            if (!isNaN(numValue)) {
              newValue = numValue;
            }
          }
          
          handleInputChange(category, field, newValue);
        }}
        disabled={!canModify}
        {...props}
      />
      {hasError && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle size={12} />
          {hasError}
        </p>
      )}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

// Settings Tab Components
const GeneralSettings = ({ settings, getCurrentValue, handleInputChange, canModify, validationErrors }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <Globe className="text-primary-600" size={24} />
      <h2 className="text-lg font-semibold">General Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <ValidatedInput
          label="Platform Name"
          category="general"
          field="platformName"
          getCurrentValue={getCurrentValue}
          handleInputChange={handleInputChange}
          canModify={canModify}
          validationErrors={validationErrors}
          helpText="The name displayed across your platform"
          required={true}
        />
        
        <ValidatedInput
          label="Platform Description"
          category="general"
          field="platformDescription"
          getCurrentValue={getCurrentValue}
          handleInputChange={handleInputChange}
          canModify={canModify}
          validationErrors={validationErrors}
          helpText="Brief description of your platform"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            className="input"
            value={getCurrentValue('general', 'currency') || 'USD'}
            onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
            disabled={!canModify}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="PHP">PHP (₱)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            className="input"
            value={getCurrentValue('general', 'timezone') || 'UTC'}
            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
            disabled={!canModify}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Asia/Manila">Philippine Time</option>
            <option value="Europe/London">London Time</option>
            <option value="Asia/Tokyo">Tokyo Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Date Format</label>
          <select
            className="input"
            value={getCurrentValue('general', 'dateFormat') || 'MM/DD/YYYY'}
            onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
            disabled={!canModify}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('general', 'maintenanceMode') || false}
            onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium text-red-600">Enable maintenance mode</span>
            <p className="text-xs text-gray-500">Temporarily disable access to the platform</p>
          </div>
        </label>
        
        {getCurrentValue('general', 'maintenanceMode') && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-2">Maintenance Message</label>
            <textarea
              className="input"
              rows={2}
              value={getCurrentValue('general', 'maintenanceMessage') || ''}
              onChange={(e) => handleInputChange('general', 'maintenanceMessage', e.target.value)}
              disabled={!canModify}
              placeholder="Message to show users during maintenance"
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

const FinancialSettings = ({ settings, getCurrentValue, handleInputChange, canModify, validationErrors }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <DollarSign className="text-green-600" size={24} />
      <h2 className="text-lg font-semibold">Financial Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <ValidatedInput
          label="Platform Fee (%)"
          type="number"
          category="financial"
          field="platformFeePercentage"
          getCurrentValue={getCurrentValue}
          handleInputChange={handleInputChange}
          canModify={canModify}
          validationErrors={validationErrors}
          helpText="Percentage fee charged on all bookings (0-50%)"
          required={true}
          min="0"
          max="50"
          step="0.1"
        />
        
        <ValidatedInput
          label="Minimum Payout Amount"
          type="number"
          category="financial"
          field="minimumPayout"
          getCurrentValue={getCurrentValue}
          handleInputChange={handleInputChange}
          canModify={canModify}
          validationErrors={validationErrors}
          helpText="Minimum amount before issuing payouts"
          required={true}
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Host Payout Delay (days)</label>
          <input
            type="number"
            className="input"
            min="1"
            max="30"
            value={getCurrentValue('financial', 'hostPayoutDelay') || 7}
            onChange={(e) => handleInputChange('financial', 'hostPayoutDelay', parseInt(e.target.value))}
            disabled={!canModify}
          />
          <p className="text-xs text-gray-500 mt-1">Days to wait before releasing payment to host</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Cancellation Fee (%)</label>
          <input
            type="number"
            className="input"
            min="0"
            max="100"
            step="0.1"
            value={getCurrentValue('financial', 'cancellationFeePercentage') || 0}
            onChange={(e) => handleInputChange('financial', 'cancellationFeePercentage', parseFloat(e.target.value))}
            disabled={!canModify}
          />
          <p className="text-xs text-gray-500 mt-1">Fee charged on booking cancellations</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Refund Policy</label>
          <select
            className="input w-64"
            value={getCurrentValue('financial', 'refundPolicy') || 'flexible'}
            onChange={(e) => handleInputChange('financial', 'refundPolicy', e.target.value)}
            disabled={!canModify}
          >
            <option value="flexible">Flexible - Full refund up to 24h before</option>
            <option value="moderate">Moderate - Full refund up to 5 days before</option>
            <option value="strict">Strict - 50% refund up to 7 days before</option>
          </select>
        </div>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('financial', 'autoPayouts') || false}
            onChange={(e) => handleInputChange('financial', 'autoPayouts', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Automatic payouts</span>
            <p className="text-xs text-gray-500">Automatically process host payouts when eligible</p>
          </div>
        </label>
      </div>
    </div>
  </div>
);

const SecuritySettings = ({ settings, getCurrentValue, handleInputChange, canModify }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <Shield className="text-orange-600" size={24} />
      <h2 className="text-lg font-semibold">Security Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('security', 'requireIdVerification') || false}
            onChange={(e) => handleInputChange('security', 'requireIdVerification', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Require ID verification</span>
            <p className="text-xs text-gray-500">Users must verify their identity before booking</p>
          </div>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('security', 'autoVerifyHosts') || false}
            onChange={(e) => handleInputChange('security', 'autoVerifyHosts', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Auto-verify hosts</span>
            <p className="text-xs text-gray-500">Automatically approve new host registrations</p>
          </div>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('security', 'twoFactorAuthRequired') || false}
            onChange={(e) => handleInputChange('security', 'twoFactorAuthRequired', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Require two-factor authentication</span>
            <p className="text-xs text-gray-500">Force users to enable 2FA for enhanced security</p>
          </div>
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            className="input"
            min="30"
            max="1440"
            value={getCurrentValue('security', 'sessionTimeoutMinutes') || 480}
            onChange={(e) => handleInputChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
          <input
            type="number"
            className="input"
            min="3"
            max="20"
            value={getCurrentValue('security', 'maxLoginAttempts') || 5}
            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Password Requirements</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Length</label>
            <input
              type="number"
              className="input"
              min="6"
              max="128"
              value={getCurrentValue('security', 'passwordMinLength') || 8}
              onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
              disabled={!canModify}
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={getCurrentValue('security', 'passwordRequireUppercase') || false}
                onChange={(e) => handleInputChange('security', 'passwordRequireUppercase', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-xs">Require uppercase letters</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={getCurrentValue('security', 'passwordRequireNumbers') || false}
                onChange={(e) => handleInputChange('security', 'passwordRequireNumbers', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-xs">Require numbers</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={getCurrentValue('security', 'passwordRequireSpecialChar') || false}
                onChange={(e) => handleInputChange('security', 'passwordRequireSpecialChar', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-xs">Require special characters</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotificationSettings = ({ settings, getCurrentValue, handleInputChange, canModify }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <Bell className="text-blue-600" size={24} />
      <h2 className="text-lg font-semibold">Notification Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold mb-3">Delivery Methods</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'emailNotifications') || false}
                onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm font-medium">Email notifications</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'smsNotifications') || false}
                onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm font-medium">SMS notifications</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'pushNotifications') || false}
                onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm font-medium">Push notifications</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold mb-3">Notification Types</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'bookingConfirmations') || false}
                onChange={(e) => handleInputChange('notifications', 'bookingConfirmations', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm">Booking confirmations</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'paymentNotifications') || false}
                onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm">Payment notifications</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={getCurrentValue('notifications', 'systemAlerts') || false}
                onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={!canModify}
              />
              <span className="text-sm">System alerts</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const APISettings = ({ settings, getCurrentValue, handleInputChange, canModify }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <Server className="text-purple-600" size={24} />
      <h2 className="text-lg font-semibold">API & Integration Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Rate Limit (per minute)</label>
          <input
            type="number"
            className="input"
            min="1"
            max="10000"
            value={getCurrentValue('api', 'rateLimitPerMinute') || 100}
            onChange={(e) => handleInputChange('api', 'rateLimitPerMinute', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Rate Limit (per hour)</label>
          <input
            type="number"
            className="input"
            min="1"
            max="100000"
            value={getCurrentValue('api', 'rateLimitPerHour') || 1000}
            onChange={(e) => handleInputChange('api', 'rateLimitPerHour', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Webhook Timeout (ms)</label>
          <input
            type="number"
            className="input"
            min="1000"
            max="60000"
            value={getCurrentValue('api', 'webhookTimeout') || 30000}
            onChange={(e) => handleInputChange('api', 'webhookTimeout', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('api', 'allowCors') || false}
            onChange={(e) => handleInputChange('api', 'allowCors', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Allow CORS</span>
            <p className="text-xs text-gray-500">Enable cross-origin resource sharing</p>
          </div>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('api', 'enableApiLogs') || false}
            onChange={(e) => handleInputChange('api', 'enableApiLogs', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Enable API logs</span>
            <p className="text-xs text-gray-500">Log all API requests for debugging</p>
          </div>
        </label>
      </div>
    </div>
  </div>
);

const StorageSettings = ({ settings, getCurrentValue, handleInputChange, canModify }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <Database className="text-indigo-600" size={24} />
      <h2 className="text-lg font-semibold">Storage & Media Settings</h2>
    </div>
    
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
          <input
            type="number"
            className="input"
            min="1"
            max="100"
            value={(getCurrentValue('storage', 'maxFileSize') || 10485760) / 1048576}
            onChange={(e) => handleInputChange('storage', 'maxFileSize', parseInt(e.target.value) * 1048576)}
            disabled={!canModify}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Image Quality (%)</label>
          <input
            type="number"
            className="input"
            min="10"
            max="100"
            value={getCurrentValue('storage', 'imageQuality') || 85}
            onChange={(e) => handleInputChange('storage', 'imageQuality', parseInt(e.target.value))}
            disabled={!canModify}
          />
        </div>
      </div>
      
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={getCurrentValue('storage', 'generateThumbnails') || false}
            onChange={(e) => handleInputChange('storage', 'generateThumbnails', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={!canModify}
          />
          <div>
            <span className="text-sm font-medium">Generate thumbnails</span>
            <p className="text-xs text-gray-500">Automatically create thumbnails for images</p>
          </div>
        </label>
      </div>
    </div>
  </div>
);

const SettingsHistory = ({ onClose }) => {
  const { history, loading, error } = useSettingsHistory(20);
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-50">
      <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <History size={18} />
            Settings History
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">Error: {error}</div>
          ) : history.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">No changes recorded yet</div>
          ) : (
            <div className="space-y-3">
              {history.map((change) => (
                <div key={change.id} className="border-l-4 border-blue-200 pl-3 py-2">
                  <div className="text-sm font-medium capitalize">{change.category}</div>
                  <div className="text-xs text-gray-500">
                    by {change.userId} • {change.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { currentUser } = useAuth();
  const {
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
    canModify
  } = useSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [showHistory, setShowHistory] = useState(false);
  const [localChanges, setLocalChanges] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [connected, setConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Validation rules
  const validationRules = {
    'general.platformName': {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      message: 'Platform name must be 2-50 characters, letters, numbers, spaces, hyphens, or underscores only'
    },
    'financial.platformFeePercentage': {
      required: true,
      min: 0,
      max: 50,
      type: 'number',
      message: 'Platform fee must be between 0% and 50%'
    },
    'financial.minimumPayout': {
      required: true,
      min: 1,
      type: 'number',
      message: 'Minimum payout must be at least $1'
    },
    'security.sessionTimeoutMinutes': {
      required: true,
      min: 5,
      max: 1440,
      type: 'number',
      message: 'Session timeout must be between 5 minutes and 24 hours'
    },
    'general.contactEmail': {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  };

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Validate field
  const validateField = useCallback((category, field, value) => {
    const key = `${category}.${field}`;
    const rules = validationRules[key];
    
    if (!rules) return true;

    const errors = [];

    if (rules.required && (!value || String(value).trim() === '')) {
      errors.push('This field is required');
    }

    if (value && rules.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push('Must be a valid number');
      } else {
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`Must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`Must be no more than ${rules.max}`);
        }
      }
    }

    if (value && rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(rules.message || 'Invalid format');
    }

    if (value && rules.minLength && String(value).length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters`);
    }

    if (errors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [key]: errors[0] // Show first error only
      }));
      return false;
    }

    // Clear error if validation passes
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });

    return true;
  }, [validationRules]);

  // Handle input changes locally first
  const handleInputChange = useCallback((category, field, value) => {
    // Validate field in real-time
    validateField(category, field, value);
    
    setLocalChanges(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  }, [validateField]);

  // Get current value (local change or original)
  const getCurrentValue = useCallback((category, field) => {
    return localChanges[category]?.[field] ?? getSetting(`${category}.${field}`);
  }, [localChanges, getSetting]);

  // Save all pending changes
  const handleSave = async () => {
    if (!canModify) {
      showToast('You do not have permission to modify settings.', 'error');
      return;
    }

    // Validate all changed fields
    let hasErrors = false;
    Object.entries(localChanges).forEach(([category, fields]) => {
      Object.entries(fields).forEach(([field, value]) => {
        if (!validateField(category, field, value)) {
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      showToast('Please fix the validation errors before saving.', 'warning');
      return;
    }

    if (Object.keys(localChanges).length === 0) {
      showToast('No changes to save.', 'info');
      return;
    }

    try {
      setSyncing(true);
      console.log('Saving settings with localChanges:', localChanges);

      // If settings don't exist yet, initialize them first
      if (!settings) {
        console.log('Initializing default settings...');
        await settingsService.initializeDefaultSettings();
      }

      // Update each category separately for proper Firebase handling
      for (const [category, changes] of Object.entries(localChanges)) {
        console.log(`Updating ${category} category:`, changes);
        await settingsService.updateSettings(changes, category, currentUser?.uid);
      }

      setLocalChanges({});
      const categoryCount = Object.keys(localChanges).length;
      const changeCount = Object.values(localChanges).reduce((acc, changes) => acc + Object.keys(changes).length, 0);
      showToast(`Settings saved! Updated ${changeCount} settings across ${categoryCount} categories.`, 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Handle file import
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSyncing(true);
      await importSettings(file);
      setLocalChanges({});
      showToast('Settings imported successfully!', 'success');
    } catch (err) {
      console.error('Error importing settings:', err);
      showToast('Failed to import settings. Please check the file format.', 'error');
    } finally {
      setSyncing(false);
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Handle export
  const handleExport = async () => {
    try {
      setSyncing(true);
      await exportSettings();
      showToast('Settings exported successfully!', 'success');
    } catch (err) {
      console.error('Error exporting settings:', err);
      showToast('Failed to export settings. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Handle reset to defaults
  const handleReset = async () => {
    if (!window.confirm('⚠️ Are you sure you want to reset all settings to defaults?\n\nThis action cannot be undone and will override all current configurations.')) {
      return;
    }

    try {
      setSyncing(true);
      await resetToDefaults();
      setLocalChanges({});
      showToast('Settings reset to defaults successfully!', 'success');
    } catch (err) {
      console.error('Error resetting settings:', err);
      showToast('Failed to reset settings. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading settings: {error}</span>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div>
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <SettingsIcon className="mr-3 text-primary-600" />
              Platform Settings
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600">Configure platform settings and preferences</p>
              {hasChanges && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                  <AlertCircle size={12} />
                  <span>{Object.keys(localChanges).length} unsaved change{Object.keys(localChanges).length > 1 ? 's' : ''}</span>
                </div>
              )}
              <ConnectionStatus connected={connected} syncing={syncing} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canModify && (
              <>
                <button
                  onClick={() => document.getElementById('import-file').click()}
                  className="btn-secondary flex items-center gap-2"
                  disabled={saving}
                >
                  <Upload size={16} />
                  Import
                </button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                
                <button
                  onClick={handleExport}
                  className="btn-secondary flex items-center gap-2"
                  disabled={syncing}
                >
                  <Download size={16} />
                  Export
                </button>
                
                <button
                  onClick={handleReset}
                  className="btn-secondary text-red-600 hover:text-red-700 flex items-center gap-2"
                  disabled={saving}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary flex items-center gap-2"
            >
              <History size={16} />
              History
            </button>
          </div>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings History Sidebar */}
      {showHistory && <SettingsHistory onClose={() => setShowHistory(false)} />}

      {/* Settings Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General', icon: Globe },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'api', label: 'API & Integration', icon: Server },
              { id: 'storage', label: 'Storage & Media', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <GeneralSettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
            validationErrors={validationErrors}
          />
        )}

        {/* Financial Settings Tab */}
        {activeTab === 'financial' && (
          <FinancialSettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
            validationErrors={validationErrors}
          />
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <SecuritySettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
          />
        )}

        {/* Notifications Settings Tab */}
        {activeTab === 'notifications' && (
          <NotificationSettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
          />
        )}
        
        {/* API Settings Tab */}
        {activeTab === 'api' && (
          <APISettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
          />
        )}
        
        {/* Storage Settings Tab */}
        {activeTab === 'storage' && (
          <StorageSettings
            settings={settings}
            getCurrentValue={getCurrentValue}
            handleInputChange={handleInputChange}
            canModify={canModify}
          />
        )}

        {/* Save Button */}
        {canModify && hasChanges && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                You have unsaved changes
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLocalChanges({})}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                  disabled={saving || syncing}
                >
                  {(saving || syncing) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {(saving || syncing) ? 'Saving...' : hasChanges ? `Save ${Object.keys(localChanges).length} Changes` : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;