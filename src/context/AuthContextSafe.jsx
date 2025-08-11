import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          console.log('Firebase user detected:', firebaseUser.email);
          
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('User data from Firestore:', userData);
              
              // Create complete user object
              const userObj = {
                user: firebaseUser,
                profile: userData,
                isAdmin: userData.userType === 'admin' || userData.isAdmin === true || userData.type === 'admin',
                userType: userData.userType || userData.type,
                role: userData.role,
                permissions: userData.permissions || [],
                verified: userData.verified || false
              };
              
              console.log('Setting user object:', userObj);
              setUser(userObj);
            } else {
              console.log('No Firestore document found for user');
              // User document doesn't exist yet - might be during registration
              setUser({
                user: firebaseUser,
                profile: null,
                isAdmin: false,
                userType: null,
                role: null,
                permissions: [],
                verified: false
              });
            }
          } catch (firestoreError) {
            console.error('Error fetching user data from Firestore:', firestoreError);
            // Fallback to basic user info if Firestore fails
            setUser({
              user: firebaseUser,
              profile: null,
              isAdmin: false,
              userType: null,
              role: null,
              permissions: [],
              verified: false,
              error: 'Failed to load user profile'
            });
          }
        } else {
          console.log('No Firebase user');
          setUser(null);
        }
      } catch (authError) {
        console.error('Auth state change error:', authError);
        setError(authError.message);
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful, user:', userCredential.user.email);
      
      // The onAuthStateChanged listener will handle updating the user state
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(prev => ({
            ...prev,
            profile: userData,
            isAdmin: userData.userType === 'admin' || userData.isAdmin === true || userData.type === 'admin',
            userType: userData.userType || userData.type,
            role: userData.role,
            permissions: userData.permissions || [],
            verified: userData.verified || false
          }));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  // Debug info for development
  console.log('AuthProvider state:', { user: user?.user?.email, isAdmin: user?.isAdmin, loading, error });

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};