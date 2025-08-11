import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleProtectedRoute = ({ children, allowedUserTypes = [], requireVerification = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check user type
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType)) {
    // Redirect based on user type
    switch (user.userType) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'host':
        return <Navigate to="/host-dashboard" replace />;
      case 'client':
        return <Navigate to="/client-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check verification status if required
  if (requireVerification && !user.verified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Account Verification Required</h2>
          <p className="text-yellow-600">Please verify your account to access this feature.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;