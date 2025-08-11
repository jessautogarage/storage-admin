import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const DebugAuth = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Auth Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Loading:</span>
              <span className={`px-2 py-1 rounded ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {loading ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User:</span>
              <span className={`px-2 py-1 rounded ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user ? 'Logged In' : 'Not Logged In'}
              </span>
            </div>
            {user && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Is Admin:</span>
                  <span className={`px-2 py-1 rounded ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isAdmin ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="font-mono text-sm">{user.user?.uid || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Object Details</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:underline">Home / Landing Page</a>
            <a href="/admin-setup" className="block text-blue-600 hover:underline">Admin Setup (Should be accessible)</a>
            <a href="/admin" className="block text-blue-600 hover:underline">Admin Login</a>
            <a href="/signin" className="block text-blue-600 hover:underline">User Sign In</a>
            <a href="/signup" className="block text-blue-600 hover:underline">User Sign Up</a>
            <a href="/dashboard" className="block text-blue-600 hover:underline">Dashboard (Protected)</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;