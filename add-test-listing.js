// Simple test listing to add via browser console
import { db } from './src/services/firebase.js';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const testListing = {
  title: "Test Storage Unit",
  description: "A simple test storage unit",
  type: "Storage Space",
  status: "available",
  isAvailable: true,
  featured: true,
  hostId: "test-host-1",
  location: {
    address: "123 Test Street",
    city: "Makati City",
    coordinates: { lat: 14.5547, lng: 121.0244 }
  },
  dimensions: { length: 10, width: 10, height: 8, unit: "ft" },
  pricing: {
    monthly: 2500,
    daily: 100,
    currency: "PHP"
  },
  features: ["24/7 Access", "CCTV"],
  images: ["/api/placeholder/400/300"],
  rating: 4.5,
  reviewCount: 10,
  createdAt: serverTimestamp()
};

async function addTestListing() {
  try {
    console.log('Adding test listing...');
    const docRef = await addDoc(collection(db, 'listings'), testListing);
    console.log('✅ Test listing added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding test listing:', error);
    throw error;
  }
}

// Make it available globally
window.addTestListing = addTestListing;
export { addTestListing };