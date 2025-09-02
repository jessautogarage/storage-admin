// Simple script to add test listings
import { db } from './src/services/firebase.js';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const testListings = [
  {
    title: "Secure Storage Unit in Makati CBD",
    description: "Climate-controlled storage unit perfect for documents and electronics. Located in the heart of Makati's business district.",
    type: "Storage Space",
    status: "available",
    isAvailable: true,
    featured: true,
    hostId: "test-host-1", 
    location: {
      address: "123 Ayala Avenue, Makati City",
      city: "Makati City", 
      coordinates: { lat: 14.5547, lng: 121.0244 }
    },
    dimensions: { length: 10, width: 10, height: 8, unit: "ft" },
    pricing: {
      monthly: 2500,
      daily: 100,
      currency: "PHP"
    },
    features: ["24/7 Access", "CCTV", "Climate Control", "Security Guard"],
    images: ["/api/placeholder/400/300"],
    rating: 4.8,
    reviewCount: 24,
    createdAt: serverTimestamp()
  },
  {
    title: "Covered Parking Space - BGC",
    description: "Secure covered parking in BGC area. Perfect for daily commuters.",
    type: "Parking",
    status: "available",
    isAvailable: true,
    featured: false,
    hostId: "test-host-2",
    location: {
      address: "5th Avenue, Bonifacio Global City",
      city: "Taguig City",
      coordinates: { lat: 14.5513, lng: 121.0486 }
    },
    dimensions: { length: 16, width: 8, height: 7, unit: "ft" },
    pricing: {
      monthly: 3500,
      daily: 150,
      currency: "PHP" 
    },
    features: ["CCTV", "24/7 Access", "Security Guard"],
    images: ["/api/placeholder/400/300"],
    rating: 4.5,
    reviewCount: 18,
    createdAt: serverTimestamp()
  }
];

async function addTestData() {
  try {
    console.log('Adding test listings...');
    
    for (const listing of testListings) {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      console.log('Added listing:', docRef.id);
    }
    
    console.log('✅ Test data added successfully!');
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Export for use in browser console
window.addTestData = addTestData;

export { addTestData };