import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      try {
        setError(null);
        
        if (firebaseUser) {
          
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
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
              
              setUser(userObj);
            } else {
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
          setUser(null);
        }
      } catch (authError) {
        console.error('Auth state change error:', authError);
        if (isMounted) {
          setError(authError.message);
          setUser(null);
        }
      }
      
      if (isMounted) {
        setLoading(false);
        setInitializing(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      try {
        const { updateDoc, doc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLoginAt: new Date().toISOString()
        });
      } catch (updateError) {
        console.warn('Failed to update last login timestamp:', updateError);
      }
      
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
        case 'auth/invalid-credential':
          errorMessage = 'Incorrect email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Contact support.';
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

  const resetPassword = async (email) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      initializing,
      login, 
      logout, 
      refreshUser,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};