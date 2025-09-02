import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const SettingsAuthDebug = () => {
  const { currentUser, isAdmin, loading, error } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings Authentication Debug</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">Authentication Status:</h3>
          <div className="space-y-2 text-sm">
            <div>Loading: <span className={loading ? 'text-orange-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></div>
            <div>Current User: <span className={currentUser ? 'text-green-600' : 'text-red-600'}>{currentUser ? 'Logged In' : 'Not Logged In'}</span></div>
            <div>Is Admin: <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{isAdmin ? 'Yes' : 'No'}</span></div>
            <div>Can Edit Settings: <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{isAdmin ? 'Yes' : 'No'}</span></div>
            {error && <div className="text-red-600">Error: {error}</div>}
          </div>
        </div>

        {currentUser && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-2">User Details:</h3>
            <div className="space-y-1 text-sm">
              <div>Email: {currentUser.email}</div>
              <div>Name: {currentUser.name || 'Not set'}</div>
              <div>User Type: {currentUser.userType || 'Not set'}</div>
              <div>Verified: {currentUser.verified ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {!currentUser && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold mb-2">❌ You are not logged in</h3>
            <p className="text-sm mb-3">To edit settings, you need to:</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Create an admin account at <a href="/admin-setup" className="text-blue-600 underline">/admin-setup</a></li>
              <li>Login at <a href="/admin" className="text-blue-600 underline">/admin</a></li>
              <li>Then access Settings in the admin dashboard</li>
            </ol>
          </div>
        )}

        {currentUser && !isAdmin && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2">⚠️ You are logged in but not an admin</h3>
            <p className="text-sm">Only admin users can edit platform settings.</p>
          </div>
        )}

        {isAdmin && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-2">✅ You can edit settings!</h3>
            <p className="text-sm">You are logged in as an admin and can modify platform settings.</p>
            <a href="/dashboard" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Admin Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsAuthDebug;