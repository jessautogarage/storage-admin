import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdTokenResult 
} from 'firebase/auth';

export const authService = {
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔁 Force token refresh to get latest custom claims
      const tokenResult = await getIdTokenResult(user, true);

      return {
        success: true,
        user,
        claims: tokenResult.claims,
        isAdmin: tokenResult.claims.admin === true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: async () => {
    const user = auth.currentUser;
    if (user) {
      const tokenResult = await getIdTokenResult(user);
      return {
        user,
        claims: tokenResult.claims,
        isAdmin: tokenResult.claims.admin === true
      };
    }
    return null;
  },

  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user, true);
        callback({
          user,
          claims: tokenResult.claims,
          isAdmin: tokenResult.claims.admin === true
        });
      } else {
        callback(null);
      }
    });
  }
};
