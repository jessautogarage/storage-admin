import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthNavigationHandler = () => {
  const { user, loading, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't navigate while still loading or initializing
    if (loading || initializing) return;

    if (user) {
      // User is authenticated, determine where to navigate
      const userType = user.userType || user.profile?.userType || user.profile?.type;
      
      if (user.isAdmin) {
        // Admin users go to admin dashboard
        navigate('/dashboard', { replace: true });
      } else if (userType === 'host') {
        // Host users go to host dashboard
        navigate('/host-dashboard', { replace: true });
      } else if (userType === 'client') {
        // Client users go to client dashboard
        navigate('/client-dashboard', { replace: true });
      } else {
        // If user type is not determined, go to onboarding
        console.warn('User type not determined, redirecting to onboarding');
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, loading, initializing, navigate]);

  // This component doesn't render anything
  return null;
};

export default AuthNavigationHandler;