import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

async function updateAdminRole() {
  const adminEmail = 'admin@lockifyhub.com';
  const adminPassword = 'Admin123!';
  
  try {
    console.log('Signing in as admin...');
    
    // Sign in as admin
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const userId = userCredential.user.uid;
    console.log('Admin user ID:', userId);
    
    // Update user document with admin role
    const userRef = doc(db, 'users', userId);
    
    // First check if document exists
    const userDoc = await getDoc(userRef);
    
    const userData = {
      uid: userId,
      email: adminEmail,
      userType: 'admin',
      type: 'admin',
      isAdmin: true,
      role: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      displayName: 'System Admin',
      updatedAt: new Date().toISOString(),
      permissions: ['all'],
      verified: true
    };
    
    if (!userDoc.exists()) {
      // Create new document
      userData.createdAt = new Date().toISOString();
      await setDoc(userRef, userData);
      console.log('✅ Admin user document created');
    } else {
      // Update existing document
      await setDoc(userRef, userData, { merge: true });
      console.log('✅ Admin user document updated');
    }
    
    // Verify the update
    const updatedDoc = await getDoc(userRef);
    if (updatedDoc.exists()) {
      const data = updatedDoc.data();
      console.log('\n📊 Admin user data:');
      console.log('- Email:', data.email);
      console.log('- UserType:', data.userType);
      console.log('- IsAdmin:', data.isAdmin);
      console.log('- Role:', data.role);
    }
    
    return userId;
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
    throw error;
  }
}

// Run the script
updateAdminRole()
  .then(() => {
    console.log('\n✅ Admin account ready!');
    console.log('\n📊 Login Details:');
    console.log('Email: admin@lockifyhub.com');
    console.log('Password: Admin123!');
    console.log('URL: http://localhost:3000/admin');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error.message);
    process.exit(1);
  });