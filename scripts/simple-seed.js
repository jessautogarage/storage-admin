// Simple database seeder - just adds listings without auth
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBF5nSAbFGIWoIFR2lGjVP22ZakNQZ82xs",
  authDomain: "storagemarket-1ba43.firebaseapp.com",
  projectId: "storagemarket-1ba43",
  storageBucket: "storagemarket-1ba43.firebasestorage.app",
  messagingSenderId: "571923244797",
  appId: "1:571923244797:web:8a42737a281e25699a8094"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data templates
const cities = ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Parañaque', 'Las Piñas', 'Caloocan'];
const barangays = ['Poblacion', 'San Antonio', 'Santo Domingo', 'San Isidro', 'Bagong Silang'];
const storageTypes = ['warehouse', 'garage', 'storage-unit', 'parking', 'room', 'basement'];
const features = ['24/7 Access', 'Climate Control', 'Security Cameras', 'Insurance Available', 'Drive-up Access'];

// Storage images
const storageImages = {
  'warehouse': [
    'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'
  ],
  'garage': [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    'https://images.unsplash.com/photo-1569937755035-42dc7877faf7?w=800'
  ],
  'storage-unit': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
  ],
  'parking': [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    'https://images.unsplash.com/photo-1590674899484-13da0f629b40?w=800'
  ],
  'room': [
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
  ],
  'basement': [
    'https://images.unsplash.com/photo-1601066525716-3cca33c6d4c7?w=800',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800'
  ]
};

// Create test listings
async function createListings(count = 30) {
  console.log(`Creating ${count} test listings...`);
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 1; i <= count; i++) {
    const city = randomElement(cities);
    const type = randomElement(storageTypes);
    const priceBase = randomNumber(1000, 10000);
    
    const listing = {
      title: `${randomElement(['Modern', 'Spacious', 'Secure', 'Convenient', 'Premium', 'Affordable'])} ${
        type === 'warehouse' ? 'Warehouse' :
        type === 'garage' ? 'Garage' :
        type === 'storage-unit' ? 'Storage Unit' :
        type === 'parking' ? 'Parking Space' :
        type === 'room' ? 'Storage Room' :
        'Basement Storage'
      } in ${city}`,
      description: `Excellent ${type.replace('-', ' ')} available in ${city}. ${
        randomElement([
          'Perfect for personal or business storage needs.',
          'Secure and easily accessible location.',
          'Climate-controlled environment available.',
          '24/7 access with security monitoring.',
          'Ideal for short-term or long-term storage.'
        ])
      } Features include ${features.slice(0, randomNumber(2, 4)).join(', ')}.`,
      type: type,
      status: 'available',
      featured: Math.random() > 0.7,
      price: priceBase,
      priceType: type === 'parking' ? 'month' : randomElement(['month', 'week']),
      size: type === 'parking' ? randomNumber(12, 20) : randomNumber(5, 200),
      sizeUnit: 'sqm',
      location: {
        street: `${randomNumber(1, 999)} ${randomElement(['Rizal', 'Bonifacio', 'Mabini', 'Luna', 'Del Pilar'])} ${randomElement(['Street', 'Avenue', 'Road'])}`,
        barangay: randomElement(barangays),
        city: city,
        province: 'Metro Manila',
        zipCode: `${randomNumber(1000, 1999)}`,
        coordinates: {
          lat: 14.5995 + (Math.random() - 0.5) * 0.2,
          lng: 120.9842 + (Math.random() - 0.5) * 0.2
        }
      },
      // Keep address for backward compatibility
      address: {
        street: `${randomNumber(1, 999)} ${randomElement(['Rizal', 'Bonifacio', 'Mabini', 'Luna', 'Del Pilar'])} ${randomElement(['Street', 'Avenue', 'Road'])}`,
        barangay: randomElement(barangays),
        city: city,
        province: 'Metro Manila',
        zipCode: `${randomNumber(1000, 1999)}`,
        coordinates: {
          lat: 14.5995 + (Math.random() - 0.5) * 0.2,
          lng: 120.9842 + (Math.random() - 0.5) * 0.2
        }
      },
      features: features.slice(0, randomNumber(2, 5)),
      images: storageImages[type] || storageImages['warehouse'],
      available: true,
      availableFrom: Timestamp.now(),
      hostId: `host_${randomNumber(1, 5)}`,
      hostName: `${randomElement(['John', 'Maria', 'Jose', 'Ana', 'Carlos'])} ${randomElement(['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza'])}`,
      hostPhone: `+63917${randomNumber(1000000, 9999999)}`,
      hostEmail: `host${randomNumber(1, 5)}@example.com`,
      rating: randomNumber(35, 50) / 10,
      reviewCount: randomNumber(5, 50),
      viewCount: randomNumber(10, 500),
      minRentalPeriod: type === 'parking' ? 1 : randomNumber(1, 3),
      minRentalUnit: type === 'parking' ? 'month' : randomElement(['month', 'week']),
      securityDeposit: priceBase * randomElement([0.5, 1, 1.5, 2]),
      rules: [
        'No hazardous materials',
        'Access hours: 6 AM - 10 PM',
        'Security deposit required',
        'Monthly payment in advance'
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      successCount++;
      console.log(`  ✅ Created listing ${i}/${count}: ${listing.title}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Failed to create listing ${i}:`, error.message);
    }
  }
  
  return { successCount, errorCount };
}

// Main function
async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('⚠️  Note: Make sure Firestore rules allow writes temporarily!\n');
  
  try {
    const result = await createListings(30);
    
    console.log('\n✅ Database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Successful: ${result.successCount} listings`);
    console.log(`   - Failed: ${result.errorCount} listings`);
    
    if (result.successCount > 0) {
      console.log('\n🎉 You can now browse the listings in your app!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
main();