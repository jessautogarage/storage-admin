// Firebase utility functions for secure operations
import { auth, db, isFirestoreOnline } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * Check if Firebase is properly initialized and connected
 */
export const isFirebaseReady = () => {
  return auth && db && isFirestoreOnline();
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = () => {
  return auth?.currentUser !== null;
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

/**
 * Safely perform Firestore operations with retry logic and fallback
 */
export const safeFirestoreOperation = async (operation, fallback = null, maxRetries = 2) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }
      
      // Try to enable network if offline
      if (!isFirestoreOnline()) {
        console.log('Attempting to reconnect to Firestore...');
        await enableNetwork(db);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }
      
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Firestore operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      if (isNetworkError(error) && attempt < maxRetries) {
        console.log(`Retrying operation in ${(attempt + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
        continue;
      }
      break;
    }
  }
  
  console.warn('All retry attempts failed, using fallback');
  return fallback;
};

/**
 * Safely get a document with fallback
 */
export const safeGetDoc = async (docRef, fallback = null) => {
  return safeFirestoreOperation(async () => {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : fallback;
  }, fallback);
};

/**
 * Safely set a document with error handling
 */
export const safeSetDoc = async (docRef, data) => {
  return safeFirestoreOperation(async () => {
    await setDoc(docRef, data);
    return { success: true };
  }, { success: false, error: 'Firebase not available' });
};

/**
 * Safely update a document with error handling
 */
export const safeUpdateDoc = async (docRef, data) => {
  return safeFirestoreOperation(async () => {
    await updateDoc(docRef, data);
    return { success: true };
  }, { success: false, error: 'Firebase not available' });
};

/**
 * Safely create a snapshot listener with fallback
 */
export const safeOnSnapshot = (docRef, callback, errorCallback, fallbackData = null) => {
  try {
    if (!isFirebaseReady()) {
      console.warn('Firebase not ready, providing fallback data');
      if (fallbackData) {
        callback(fallbackData);
      }
      return () => {}; // Return empty unsubscribe function
    }
    
    return onSnapshot(
      docRef,
      callback,
      (error) => {
        console.error('Snapshot listener error:', error);
        if (fallbackData) {
          callback(fallbackData);
        }
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  } catch (error) {
    console.error('Failed to create snapshot listener:', error);
    if (fallbackData) {
      callback(fallbackData);
    }
    if (errorCallback) {
      errorCallback(error);
    }
    return () => {};
  }
};

/**
 * Check if error is a permissions error
 */
export const isPermissionError = (error) => {
  return error?.code === 'permission-denied' || 
         error?.message?.includes('permission') ||
         error?.message?.includes('insufficient');
};

/**
 * Check if error is a network/connectivity error
 */
export const isNetworkError = (error) => {
  return error?.code === 'unavailable' ||
         error?.code === 'network-request-failed' ||
         error?.code === 'deadline-exceeded' ||
         error?.code === 'failed-precondition' ||
         error?.message?.includes('network') ||
         error?.message?.includes('offline') ||
         error?.message?.includes('backend') ||
         error?.message?.includes('connection');
};

/**
 * Get user-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (isPermissionError(error)) {
    return 'Access denied. Please check your permissions.';
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  
  return error?.message || 'An unexpected error occurred.';
};

export default {
  isFirebaseReady,
  isUserAuthenticated,
  getCurrentUser,
  safeFirestoreOperation,
  safeGetDoc,
  safeSetDoc,
  safeUpdateDoc,
  safeOnSnapshot,
  isPermissionError,
  isNetworkError,
  getFirebaseErrorMessage
};