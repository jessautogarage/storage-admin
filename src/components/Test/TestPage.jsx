import React, { useState } from 'react';
import SettingsTest from './SettingsTest';
import SettingsSyncDemo from './SettingsSyncDemo';

const TestPage = () => {
  const [showSettingsTest, setShowSettingsTest] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Test Page Working!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-bold text-blue-900 mb-2">✅ Success!</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Route is accessible</li>
              <li>• No redirects happening</li>
              <li>• Component loads properly</li>
              <li>• No authentication required</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-bold text-yellow-900 mb-2">🔍 Debug Info</h2>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• URL: {window.location.href}</li>
              <li>• Path: {window.location.pathname}</li>
              <li>• Time: {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Test Navigation:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <a href="/" className="block bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-center text-sm">
              🏠 Home
            </a>
            <a href="/debug" className="block bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded text-center text-sm">
              🔍 Debug
            </a>
            <a href="/admin-setup" className="block bg-green-100 hover:bg-green-200 px-3 py-2 rounded text-center text-sm">
              ⚙️ Admin Setup
            </a>
            <a href="/admin" className="block bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded text-center text-sm">
              👨‍💼 Admin Login
            </a>
            <a href="/dashboard" className="block bg-red-100 hover:bg-red-200 px-3 py-2 rounded text-center text-sm">
              📊 Dashboard (Protected)
            </a>
            <a href="/admin-dashboard-bypass" className="block bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded text-center text-sm">
              🚪 Bypass (Should Work)
            </a>
            <button 
              onClick={() => setShowSettingsTest(!showSettingsTest)}
              className="block bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded text-center text-sm w-full"
            >
              {showSettingsTest ? '❌ Hide' : '⚙️ Test'} Settings
            </button>
          </div>
        </div>

        {showSettingsTest && (
          <div className="mt-6 space-y-6">
            <SettingsTest />
            <SettingsSyncDemo />
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Expected Behavior:</h3>
          <p className="text-gray-700 text-sm">
            This test page should be accessible without any authentication or redirects. 
            If you can see this page, it means the routing system is working properly 
            and the issue is likely in the Layout, Dashboard, or authentication components.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;