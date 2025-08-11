import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Create complete user object
            setUser({
              user: firebaseUser,
              profile: userData,
              isAdmin: userData.userType === 'admin' || userData.isAdmin === true,
              userType: userData.userType,
              role: userData.role,
              permissions: userData.permissions || [],
              verified: userData.verified || false
            });
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
        } catch (error) {
          console.error('Error fetching user data:', error);
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
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    // This will be handled by the onAuthStateChanged listener above
    return { success: true };
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(prev => ({
          ...prev,
          profile: userData,
          isAdmin: userData.userType === 'admin' || userData.isAdmin === true,
          userType: userData.userType,
          role: userData.role,
          permissions: userData.permissions || [],
          verified: userData.verified || false
        }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};