// Simple Node.js script to delete listings using regular Firebase SDK
// Run this with: node deleteListings.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc,
  doc,
  getAuth,
  signInWithEmailAndPassword 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQ3xuSl58z4Zbl9eSMKjmZFqppVMcmFgk",
  authDomain: "storagemarket-1ba43.firebaseapp.com",
  projectId: "storagemarket-1ba43",
  storageBucket: "storagemarket-1ba43.firebasestorage.app",
  messagingSenderId: "912467989346",
  appId: "1:912467989346:web:ed1a2af479bc1f0fb2e55b",
  measurementId: "G-3PS9BH0VPX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function deleteAllExceptOne() {
  // First, sign in as admin or host
  // Replace with your admin credentials
  const email = prompt('Enter your email:');
  const password = prompt('Enter your password:');
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in successfully');
    
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
    console.log(`Found ${snapshot.size} listings`);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      if (data.title !== 'dfgbnchnfbfgnfgnfgnfgbn') {
        try {
          await deleteDoc(doc(db, 'listings', docSnap.id));
          console.log(`Deleted: ${data.title || 'Untitled'}`);
        } catch (err) {
          console.error(`Failed to delete ${docSnap.id}:`, err.message);
        }
      } else {
        console.log(`Kept: ${data.title}`);
      }
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteAllExceptOne();