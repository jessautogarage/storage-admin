import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const RoleProtectedRoute = ({ children, allowedUserTypes = [], requireVerification = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        // First check if userType is already in the user object
        if (user.userType || user.type) {
          const role = user.userType || user.type;
          setUserRole(role);
          setRoleLoading(false);
          return;
        }

        // Check if user has nested structure from AuthContextSafe
        const userId = user.user?.uid || user.uid;
        
        if (!userId) {
          setUserRole('client');
          setRoleLoading(false);
          return;
        }

        // If not, fetch from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.userType || userData.type || 'client';
          setUserRole(role);
        } else {
          // Default to client if no user document exists
          setUserRole('client');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('client'); // Default to client on error
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user has the correct role
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userRole)) {
    // Show access denied with proper redirect options
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This area is restricted to {allowedUserTypes.join(' and ')} accounts only.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Your account type: <span className="font-semibold capitalize">{userRole || 'Unknown'}</span>
            </p>
          </div>
          <div className="mt-6 space-y-2">
            {userRole === 'client' && (
              <button
                onClick={() => window.location.href = '/client-dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Client Dashboard
              </button>
            )}
            {userRole === 'host' && (
              <button
                onClick={() => window.location.href = '/host-dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Host Dashboard
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check verification status if required
  if (requireVerification && !user.verified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-yellow-50 rounded-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Account Verification Required</h2>
          <p className="text-yellow-600">Please verify your account to access this feature.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;