import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase only if not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

// Firestore connection management
let isOnline = true;

export const goOffline = async () => {
  if (isOnline) {
    await disableNetwork(db);
    isOnline = false;
    console.log('Firestore offline mode enabled');
  }
};

export const goOnline = async () => {
  if (!isOnline) {
    await enableNetwork(db);
    isOnline = true;
    console.log('Firestore online mode enabled');
  }
};

export const isFirestoreOnline = () => isOnline;

// Configure emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  console.log('Using Firebase emulators in development');
  
  // Only connect to emulators if not already connected
  if (!auth._delegate._config?.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  
  if (!db._delegate._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (!storage._delegate._location?.host?.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
  
  if (!realtimeDb._delegate._repoManager?.repos_?.has('http://localhost:9000')) {
    connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
  }
}

// Connection status monitoring
let connectionStatusListeners = new Set();

export const onConnectionStatusChange = (callback) => {
  connectionStatusListeners.add(callback);
  // Return unsubscribe function
  return () => connectionStatusListeners.delete(callback);
};

// Monitor online/offline status
window.addEventListener('online', () => {
  console.log('Network connection restored');
  connectionStatusListeners.forEach(callback => callback(true));
  goOnline().catch(console.error);
});

window.addEventListener('offline', () => {
  console.log('Network connection lost');
  connectionStatusListeners.forEach(callback => callback(false));
  goOffline().catch(console.error);
});

export default app;