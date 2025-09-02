// Standalone database seeder script
// Run with: node scripts/seed-database.js

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';

// Firebase configuration - hardcoded for standalone script
const firebaseConfig = {
  apiKey: "AIzaSyBF5nSAbFGIWoIFR2lGjVP22ZakNQZ82xs",
  authDomain: "storagemarket-1ba43.firebaseapp.com",
  projectId: "storagemarket-1ba43",
  storageBucket: "storagemarket-1ba43.firebasestorage.app",
  messagingSenderId: "571923244797",
  appId: "1:571923244797:web:8a42737a281e25699a8094",
  databaseURL: "https://storagemarket-1ba43-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helper function to generate random data
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data templates
const cities = ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Parañaque', 'Las Piñas', 'Caloocan'];
const barangays = ['Poblacion', 'San Antonio', 'Santo Domingo', 'San Isidro', 'Bagong Silang'];
const storageTypes = ['warehouse', 'garage', 'storage-unit', 'parking', 'room', 'basement'];
const features = ['24/7 Access', 'Climate Control', 'Security Cameras', 'Insurance Available', 'Drive-up Access'];

// Create admin user
async function createAdminUser() {
  try {
    const email = 'admin@lockifyhub.com';
    const password = 'Admin123!';
    
    console.log('Creating admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Add admin document
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email: email,
      name: 'Admin User',
      role: 'admin',
      phone: '+639171234567',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Admin user created:', email);
    return userCredential.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
      // Sign in instead
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@lockifyhub.com', 'Admin123!');
      return userCredential.user.uid;
    }
    throw error;
  }
}

// Create test listings
async function createListings(count = 20) {
  console.log(`Creating ${count} test listings...`);
  const listings = [];
  
  for (let i = 1; i <= count; i++) {
    const city = randomElement(cities);
    const priceBase = randomNumber(1000, 10000);
    
    const listing = {
      title: `${randomElement(['Modern', 'Spacious', 'Secure', 'Convenient'])} ${randomElement(['Storage', 'Warehouse', 'Space'])} in ${city}`,
      description: `Great storage space available in ${city}. Perfect for your storage needs with excellent security and easy access.`,
      type: randomElement(storageTypes),
      status: 'active',
      featured: Math.random() > 0.7,
      price: priceBase,
      priceType: randomElement(['month', 'day', 'week']),
      size: randomNumber(5, 200),
      sizeUnit: 'sqm',
      address: {
        street: `${randomNumber(1, 999)} ${randomElement(['Main', 'First', 'Second', 'Third'])} Street`,
        barangay: randomElement(barangays),
        city: city,
        province: 'Metro Manila',
        zipCode: `${randomNumber(1000, 1999)}`,
        coordinates: {
          lat: 14.5995 + (Math.random() - 0.5) * 0.1,
          lng: 120.9842 + (Math.random() - 0.5) * 0.1
        }
      },
      features: features.slice(0, randomNumber(2, 5)),
      images: [
        'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
      ],
      available: true,
      availableFrom: Timestamp.now(),
      hostId: `host_${randomNumber(1, 5)}`,
      hostName: `Host ${randomNumber(1, 5)}`,
      hostPhone: `+63917${randomNumber(1000000, 9999999)}`,
      rating: randomNumber(35, 50) / 10,
      reviewCount: randomNumber(5, 50),
      viewCount: randomNumber(10, 500),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      listings.push({ id: docRef.id, ...listing });
      console.log(`  ✅ Created listing ${i}/${count}: ${listing.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to create listing ${i}:`, error.message);
    }
  }
  
  return listings;
}

// Create test users
async function createTestUsers() {
  console.log('Creating test users...');
  
  const testUsers = [
    { email: 'client1@test.com', password: 'Test123!', role: 'client', name: 'Test Client 1' },
    { email: 'client2@test.com', password: 'Test123!', role: 'client', name: 'Test Client 2' },
    { email: 'host1@test.com', password: 'Test123!', role: 'host', name: 'Test Host 1' },
    { email: 'host2@test.com', password: 'Test123!', role: 'host', name: 'Test Host 2' }
  ];
  
  for (const userData of testUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: `+63917${randomNumber(1000000, 9999999)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`  ✅ Created ${userData.role}: ${userData.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`  ℹ️ User already exists: ${userData.email}`);
      } else {
        console.error(`  ❌ Failed to create user ${userData.email}:`, error.message);
      }
    }
  }
}

// Clear database
async function clearDatabase() {
  console.log('Clearing existing data...');
  
  const collections = ['listings', 'bookings', 'favorites', 'reviews', 'conversations', 'messages'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      let count = 0;
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        count++;
      }
      
      console.log(`  ✅ Cleared ${count} documents from ${collectionName}`);
    } catch (error) {
      console.error(`  ❌ Failed to clear ${collectionName}:`, error.message);
    }
  }
}

// Main seeder function
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // Clear existing data
    await clearDatabase();
    console.log();
    
    // Create admin user
    await createAdminUser();
    console.log();
    
    // Create test users
    await createTestUsers();
    console.log();
    
    // Create listings
    const listings = await createListings(30);
    console.log();
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Admin user: admin@lockifyhub.com / Admin123!
- Test users: 4 (2 clients, 2 hosts)
- Listings: ${listings.length}
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();