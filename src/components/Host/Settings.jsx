import React, { useState } from 'react';
import { Shield, Bell, CreditCard, Key, Globe, Trash2, Download, Upload } from 'lucide-react';
import HostLayout from '../Layout/HostLayout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('security');

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Globe },
    { id: 'account', label: 'Account', icon: Key }
  ];

  const handlePasswordChange = () => {
    // TODO: Implement password change
    console.log('Password change requested');
  };

  const handleTwoFactorToggle = () => {
    // TODO: Implement 2FA toggle
    console.log('2FA toggle requested');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Account deletion requested');
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Data export requested');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            
            {/* Password */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add extra security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={handleTwoFactorToggle}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Login Sessions */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Active Sessions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Current Session</p>
                    <p className="text-sm text-gray-600">Chrome on Windows • Los Angeles, CA</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active now</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mobile App</p>
                    <p className="text-sm text-gray-600">iOS App • Last seen 2 hours ago</p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-800">End session</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            
            {/* Email Notifications */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
              <div className="space-y-4">
                {[
                  { title: 'New Booking Requests', description: 'When someone requests to book your space' },
                  { title: 'Booking Confirmations', description: 'When a booking is confirmed' },
                  { title: 'Messages', description: 'When you receive new messages' },
                  { title: 'Payment Updates', description: 'When payments are processed' },
                  { title: 'Review Notifications', description: 'When you receive new reviews' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Push Notifications</h4>
              <div className="space-y-4">
                {[
                  { title: 'Urgent Messages', description: 'High priority messages from clients' },
                  { title: 'Booking Reminders', description: 'Upcoming check-ins and check-outs' },
                  { title: 'Payment Alerts', description: 'Payment failures or disputes' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index === 0} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
            
            {/* Bank Account */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Bank Account</h4>
                  <p className="text-sm text-gray-600">**** **** **** 1234 • Chase Bank</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Update
                </button>
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Payout Schedule</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="radio" name="payout" defaultChecked className="mr-3" />
                  <span>Weekly (Fridays)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payout" className="mr-3" />
                  <span>Monthly (1st of each month)</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payout" className="mr-3" />
                  <span>Manual (Request when needed)</span>
                </label>
              </div>
            </div>

            {/* Tax Information */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Tax Information</h4>
                  <p className="text-sm text-gray-600">W-9 form submitted</p>
                </div>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
            
            {/* Profile Visibility */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Profile Visibility</h4>
              <div className="space-y-4">
                {[
                  { title: 'Show Profile to Public', description: 'Your profile will be visible to all users' },
                  { title: 'Show Contact Information', description: 'Display your phone and email' },
                  { title: 'Show Response Stats', description: 'Display response time and rate' },
                  { title: 'Show Reviews', description: 'Allow others to see your reviews' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Data & Analytics */}
            <div className="card p-6">
              <h4 className="font-medium text-gray-900 mb-4">Data & Analytics</h4>
              <div className="space-y-4">
                {[
                  { title: 'Usage Analytics', description: 'Help improve the platform with usage data' },
                  { title: 'Marketing Communications', description: 'Receive promotional emails and offers' },
                  { title: 'Third-party Integrations', description: 'Allow data sharing with verified partners' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index === 0} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
            
            {/* Data Export */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Export Your Data</h4>
                  <p className="text-sm text-gray-600">Download a copy of your account data</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} />
                  Export Data
                </button>
              </div>
            </div>

            {/* Account Deactivation */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Deactivate Account</h4>
                  <p className="text-sm text-gray-600">Temporarily disable your account</p>
                </div>
                <button className="border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors">
                  Deactivate
                </button>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="card p-6 border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All your listings, bookings, and messages will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <HostLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default Settings;