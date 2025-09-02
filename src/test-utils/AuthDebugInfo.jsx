import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthDebugInfo = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Auth Debug Info</h3>
      <pre className="text-xs overflow-auto max-h-40">
        {JSON.stringify({
          isLoggedIn: !!user,
          userType: user?.userType,
          type: user?.type,
          isAdmin: user?.isAdmin,
          email: user?.user?.email || user?.email,
          uid: user?.user?.uid || user?.uid,
          hasProfile: !!user?.profile
        }, null, 2)}
      </pre>
    </div>
  );
};

export default AuthDebugInfo;