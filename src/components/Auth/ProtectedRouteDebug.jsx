import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRouteDebug = ({ children, allowedRoles = ['admin'], requireAdmin = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect based on the route being accessed
    const redirectTo = requireAdmin ? "/admin" : "/signin";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Debug information
  const debugInfo = {
    user: user,
    isAdmin: user.isAdmin,
    userType: user.userType,
    profile: user.profile,
    requireAdmin: requireAdmin,
    allowedRoles: allowedRoles
  };

  // For admin routes, check if user has admin privileges
  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-4xl w-full p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied - DEBUG MODE</h1>
              <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Debug Information:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User Logged In:</strong> {user ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>User Type:</strong> {user?.userType || 'Not Set'}
                </div>
                <div>
                  <strong>Email:</strong> {user?.user?.email || 'N/A'}
                </div>
                <div>
                  <strong>Require Admin:</strong> {requireAdmin ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Profile Loaded:</strong> {user?.profile ? 'Yes' : 'No'}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Full User Object:</h3>
                <pre className="bg-gray-200 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>

              <div className="mt-6 text-center">
                <div className="space-y-2">
                  <a 
                    href="/debug" 
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                  >
                    Go to Debug Page
                  </a>
                  <a 
                    href="/admin" 
                    className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Back to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteDebug;