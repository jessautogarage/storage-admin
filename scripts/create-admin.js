import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase client config
const firebaseConfig = {
  apiKey: "AIzaSyBF5nSAbFGIWoIFR2lGjVP22ZakNQZ82xs",
  authDomain: "storagemarket-1ba43.firebaseapp.com",
  projectId: "storagemarket-1ba43",
  storageBucket: "storagemarket-1ba43.firebasestorage.app",
  messagingSenderId: "571923244797",
  appId: "1:571923244797:web:8a42737a281e25699a8094",
  databaseURL: "https://storagemarket-1ba43-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase client
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const adminEmail = 'admin@lockifyhub.com';
  const adminPassword = 'Admin123!';
  
  try {
    console.log('Creating admin user...');
    
    // Try to sign in first to check if user exists
    try {
      const existingUser = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Admin user already exists:', existingUser.user.uid);
      
      // Update user document to ensure admin role
      const userRef = doc(db, 'users', existingUser.user.uid);
      await setDoc(userRef, {
        email: adminEmail,
        userType: 'admin',
        type: 'admin',
        isAdmin: true,
        role: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        displayName: 'System Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['all'],
        verified: true
      }, { merge: true });
      
      console.log('✅ Admin user updated successfully');
      return existingUser.user.uid;
      
    } catch (signInError) {
      // User doesn't exist, create new
      console.log('Creating new admin user...');
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const userId = userCredential.user.uid;
      
      // Create user document with admin role
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        email: adminEmail,
        userType: 'admin',
        type: 'admin',
        isAdmin: true,
        role: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        displayName: 'System Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['all'],
        verified: true
      });
      
      console.log('✅ Admin user created successfully');
      console.log('Admin ID:', userId);
      return userId;
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n📊 Admin Account Details:');
    console.log('Email: admin@lockifyhub.com');
    console.log('Password: Admin123!');
    console.log('\nYou can now login at: http://localhost:3000/admin');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create admin:', error);
    process.exit(1);
  });