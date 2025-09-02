import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import ModernHeader from '../Layout/ModernHeader';
import { 
  Shield, 
  Bell, 
  CreditCard, 
  Key, 
  Globe, 
  Trash2, 
  Download, 
  MapPin,
  Check,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Loader
} from 'lucide-react';

const ModernSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: {
        bookingConfirmations: true,
        hostMessages: true,
        paymentReminders: true,
        bookingReminders: true,
        priceAlerts: false,
        newListings: false
      },
      pushNotifications: {
        urgentMessages: true,
        bookingUpdates: false,
        paymentAlerts: false
      },
      locationBased: true
    },
    privacy: {
      showProfile: true,
      showContact: true,
      showBookingHistory: true,
      showLocation: true,
      usageAnalytics: true,
      personalizedRecommendations: true,
      marketingCommunications: false,
      thirdPartyIntegrations: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 480,
      autoLogout: true
    },
    payments: {
      autoPayEnabled: true,
      paymentReminders: true,
      defaultPaymentMethod: null,
      billingAddress: null
    }
  });

  const userId = user?.user?.uid || user?.uid;

  // Load user settings from Firestore
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userSettingsRef = doc(db, 'userSettings', userId);
        const settingsDoc = await getDoc(userSettingsRef);

        if (settingsDoc.exists()) {
          const userData = settingsDoc.data();
          setSettings(prevSettings => ({
            ...prevSettings,
            ...userData
          }));
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [userId]);

  // Update settings in Firebase
  const updateSettings = async (category, key, value) => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);

      // Update local state first for immediate UI feedback
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [key]: value
        }
      };
      setSettings(newSettings);

      // Update in Firestore
      const userSettingsRef = doc(db, 'userSettings', userId);
      await setDoc(userSettingsRef, {
        ...newSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      // Revert local state on error
      // Could implement rollback logic here
    } finally {
      setSaving(false);
    }
  };

  // Update nested settings (like emailNotifications.bookingConfirmations)
  const updateNestedSettings = async (category, subCategory, key, value) => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);

      // Update local state first
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [subCategory]: {
            ...settings[category][subCategory],
            [key]: value
          }
        }
      };
      setSettings(newSettings);

      // Update in Firestore
      const userSettingsRef = doc(db, 'userSettings', userId);
      await setDoc(userSettingsRef, {
        ...newSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error('Error updating nested settings:', err);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-blue-500 to-cyan-500' },
    { id: 'privacy', label: 'Privacy', icon: Globe, color: 'from-emerald-500 to-teal-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'from-red-500 to-pink-500' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-violet-500 to-purple-500' },
    { id: 'account', label: 'Account', icon: Key, color: 'from-amber-500 to-orange-500' }
  ];

  const handlePasswordChange = () => {
    console.log('Password change requested');
  };

  const handleTwoFactorToggle = () => {
    updateSettings('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
    }
  };

  const handleExportData = () => {
    console.log('Data export requested');
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled || saving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked 
          ? 'bg-gradient-to-r from-blue-500 to-violet-500' 
          : 'bg-gray-200'
      } ${disabled || saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h3>
              <p className="text-gray-600">Manage how and when you receive notifications</p>
            </div>
            
            {/* Email Notifications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Email Notifications</h4>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'bookingConfirmations', title: 'Booking Confirmations', description: 'When your booking request is approved' },
                  { key: 'hostMessages', title: 'Host Messages', description: 'When you receive messages from hosts' },
                  { key: 'paymentReminders', title: 'Payment Reminders', description: 'Upcoming payment due dates' },
                  { key: 'bookingReminders', title: 'Booking Reminders', description: 'Check-in and check-out reminders' },
                  { key: 'priceAlerts', title: 'Price Alerts', description: 'When prices drop on your favorite listings' },
                  { key: 'newListings', title: 'New Listings', description: 'New storage spaces in your preferred areas' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.notifications.emailNotifications[item.key]} 
                      onChange={() => updateNestedSettings('notifications', 'emailNotifications', item.key, !settings.notifications.emailNotifications[item.key])} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Push Notifications</h4>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'urgentMessages', title: 'Urgent Messages', description: 'High priority messages from hosts' },
                  { key: 'bookingUpdates', title: 'Booking Updates', description: 'Real-time booking status changes' },
                  { key: 'paymentAlerts', title: 'Payment Alerts', description: 'Payment confirmations and failures' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.notifications.pushNotifications[item.key]} 
                      onChange={() => updateNestedSettings('notifications', 'pushNotifications', item.key, !settings.notifications.pushNotifications[item.key])} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Location-based Notifications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Location-based Notifications</h4>
                    <p className="text-sm text-gray-600">Get notifications about storage spaces near you</p>
                  </div>
                </div>
                <ToggleSwitch 
                  checked={settings.notifications.locationBased} 
                  onChange={() => updateSettings('notifications', 'locationBased', !settings.notifications.locationBased)} 
                />
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-violet-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Notifications within 10 miles of Beverly Hills, CA</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h3>
              <p className="text-gray-600">Control what information you share</p>
            </div>
            
            {/* Profile Visibility */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Profile Visibility</h4>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'showProfile', title: 'Show Profile to Hosts', description: 'Allow hosts to see your profile information' },
                  { key: 'showContact', title: 'Show Contact Information', description: 'Display your phone and email to hosts' },
                  { key: 'showBookingHistory', title: 'Show Booking History', description: 'Let hosts see your past bookings and reviews' },
                  { key: 'showLocation', title: 'Show Location', description: 'Display your general location to hosts' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.privacy[item.key]} 
                      onChange={() => updateSettings('privacy', item.key, !settings.privacy[item.key])} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Data Usage */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Data Usage & Analytics</h4>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Usage Analytics', description: 'Help improve the platform with anonymous usage data', defaultChecked: true },
                  { title: 'Personalized Recommendations', description: 'Get personalized storage recommendations', defaultChecked: true },
                  { title: 'Marketing Communications', description: 'Receive promotional emails and special offers', defaultChecked: false },
                  { title: 'Third-party Integrations', description: 'Allow data sharing with verified partners', defaultChecked: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <ToggleSwitch checked={item.defaultChecked} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h3>
              <p className="text-gray-600">Keep your account safe and secure</p>
            </div>
            
            {/* Password */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Last changed 2 months ago</p>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                  </div>
                </div>
                <ToggleSwitch checked={settings.security.twoFactorEnabled} onChange={handleTwoFactorToggle} />
              </div>
              {settings.security.twoFactorEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Two-factor authentication is enabled</span>
                  </div>
                  <p className="text-sm text-green-600">Your account is protected with an additional layer of security.</p>
                </div>
              )}
            </div>

            {/* Login Sessions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Active Sessions</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Current Session</p>
                    <p className="text-sm text-gray-600">Chrome on Windows • Beverly Hills, CA</p>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full">Active now</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Mobile App</p>
                    <p className="text-sm text-gray-600">iOS App • Last seen 3 hours ago</p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-medium">
                    End session
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Settings</h3>
              <p className="text-gray-600">Manage your payment methods and billing</p>
            </div>
            
            {/* Default Payment Method */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Default Payment Method</h4>
                    <p className="text-sm text-gray-600">Visa •••• 1234 • Expires 12/2026</p>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-200 font-medium">
                  Update
                </button>
              </div>
            </div>

            {/* Auto-Pay Settings */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Automatic Payments</h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                  <div>
                    <p className="font-medium text-gray-900">Enable Auto-Pay</p>
                    <p className="text-sm text-gray-600 mt-1">Automatically pay monthly storage fees</p>
                  </div>
                  <ToggleSwitch checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-200">
                  <div>
                    <p className="font-medium text-gray-900">Payment Reminders</p>
                    <p className="text-sm text-gray-600 mt-1">Send reminders 3 days before payment due</p>
                  </div>
                  <ToggleSwitch checked={true} onChange={() => {}} />
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Billing Address</h4>
                    <p className="text-sm text-gray-600">456 Oak Avenue, Beverly Hills, CA 90210</p>
                  </div>
                </div>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  Update
                </button>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Management</h3>
              <p className="text-gray-600">Manage your account data and preferences</p>
            </div>
            
            {/* Data Export */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Export Your Data</h4>
                    <p className="text-sm text-gray-600">Download a copy of your account data and booking history</p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Account Status</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">Active</div>
                  <div className="text-sm text-emerald-700">Account Status</div>
                </div>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">Verified</div>
                  <div className="text-sm text-blue-700">Verification Level</div>
                </div>
                <div className="text-center p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="text-2xl font-bold text-violet-600 mb-1">Aug 2023</div>
                  <div className="text-sm text-violet-700">Member Since</div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Account Actions</h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 border border-yellow-300 text-yellow-700 px-6 py-3 rounded-xl hover:bg-yellow-50 transition-colors font-medium">
                  Deactivate Account
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Account deletion is permanent and cannot be undone. All your bookings, reviews, and personal data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ModernHeader 
          variant="client" 
          user={user} 
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ModernHeader 
          variant="client" 
          user={user} 
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <X className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ModernHeader 
        variant="client" 
        user={user} 
        onLogout={() => {
          logout();
          navigate('/');
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 p-8 mb-8">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80 text-lg">Manage your account preferences and privacy settings</p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettings;