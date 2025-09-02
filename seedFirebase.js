#!/usr/bin/env node

/**
 * Firebase Database Seeder Script
 * 
 * This script can be run standalone via Node.js or used within the React app.
 * It creates comprehensive test data for the LockifyHub storage platform.
 * 
 * Usage:
 *   node seedFirebase.js [--quick|--full|--clear]
 *   node seedFirebase.js --hosts 10 --clients 20 --listings 3
 * 
 * Features:
 *   - Creates realistic Filipino users (hosts, clients, admin)
 *   - Generates storage listings with Manila locations
 *   - Creates bookings with various statuses
 *   - Sets up conversations and messages for chat
 *   - Includes reviews and ratings
 *   - Uses Firebase Admin SDK for bypassing auth rules
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

// Check if running in Node.js environment
let isNode = typeof window === 'undefined';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db, serverTimestamp, FieldValue;
let admin = null;

// Initialize Firebase based on environment
if (isNode) {
  // Node.js environment - use Firebase Admin SDK
  try {
    const { initializeApp, cert } = await import('firebase-admin/app');
    const { getFirestore, FieldValue: AdminFieldValue } = await import('firebase-admin/firestore');
    const { config } = await import('dotenv');
    
    // Load environment variables
    config();
    
    // Initialize Firebase Admin
    let serviceAccountKey;
    const keyPath = join(__dirname, 'serviceAccountKey.json');
    
    if (existsSync(keyPath)) {
      serviceAccountKey = JSON.parse(readFileSync(keyPath, 'utf8'));
    } else if (process.env.FIREBASE_ADMIN_KEY) {
      serviceAccountKey = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    } else {
      // Fallback to individual environment variables
      serviceAccountKey = {
        type: 'service_account',
        project_id: process.env.VITE_FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };
    }
    
    admin = initializeApp({
      credential: cert(serviceAccountKey),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    
    db = getFirestore(admin);
    serverTimestamp = AdminFieldValue.serverTimestamp;
    FieldValue = AdminFieldValue;
    
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.log('Falling back to client SDK...');
    isNode = false;
  }
}

if (!isNode || !admin) {
  // Browser environment or Admin SDK fallback - use client SDK
  const { db: clientDb } = await import('./src/services/firebase.js');
  const { serverTimestamp: clientServerTimestamp, deleteDoc, getDocs, collection, addDoc } = await import('firebase/firestore');
  
  db = clientDb;
  serverTimestamp = clientServerTimestamp;
  
  // Define collection and document methods for client SDK
  global.collection = collection;
  global.addDoc = addDoc;
  global.getDocs = getDocs;
  global.deleteDoc = deleteDoc;
}

// Philippine cities and districts
const philippineLocations = [
  { city: 'Manila', districts: ['Ermita', 'Malate', 'Binondo', 'Quiapo', 'Sampaloc', 'Intramuros', 'Paco', 'Santa Cruz'] },
  { city: 'Makati', districts: ['Poblacion', 'Bel-Air', 'San Antonio', 'Legazpi Village', 'Salcedo Village', 'Rockwell', 'Ayala', 'Glorietta'] },
  { city: 'Quezon City', districts: ['Diliman', 'Cubao', 'Commonwealth', 'Eastwood', 'Katipunan', 'Novaliches', 'Project 6', 'Teacher\'s Village'] },
  { city: 'BGC', districts: ['Fort Bonifacio', 'Uptown', 'Forbes Town', 'Burgos Circle', 'High Street', 'The Fort', 'McKinley', 'Net Park'] },
  { city: 'Pasig', districts: ['Ortigas', 'Kapitolyo', 'Ugong', 'San Antonio', 'Rosario', 'Cainta', 'Santolan', 'Emerald'] },
  { city: 'Mandaluyong', districts: ['Wack-Wack', 'Greenfield', 'Shaw Boulevard', 'Pioneer', 'Boni Avenue', 'Edsa Central', 'Ortigas Ext', 'Marikina River'] },
  { city: 'Pasay', districts: ['Mall of Asia', 'Newport City', 'Villamor', 'Bay City', 'NAIA', 'Cultural Center', 'Roxas Boulevard', 'Seaside'] },
  { city: 'Parañaque', districts: ['BF Homes', 'Sucat', 'Bicutan', 'Don Bosco', 'Moonwalk', 'Southmall', 'Las Piñas Border', 'Airport Area'] }
];

// Storage types with enhanced details
const storageTypes = [
  { 
    type: 'storage-unit', 
    name: 'Storage Unit', 
    minSize: 5, 
    maxSize: 50,
    description: 'Clean and secure storage units perfect for household items and personal belongings'
  },
  { 
    type: 'garage', 
    name: 'Garage Space', 
    minSize: 15, 
    maxSize: 30,
    description: 'Secure garage space suitable for vehicles or large item storage'
  },
  { 
    type: 'warehouse', 
    name: 'Warehouse Space', 
    minSize: 50, 
    maxSize: 500,
    description: 'Large warehouse spaces ideal for business inventory and commercial storage'
  },
  { 
    type: 'parking', 
    name: 'Parking Space', 
    minSize: 12, 
    maxSize: 18,
    description: 'Covered parking spaces for cars, motorcycles, and vehicles'
  },
  { 
    type: 'room', 
    name: 'Spare Room', 
    minSize: 10, 
    maxSize: 25,
    description: 'Extra rooms in residential properties for storage purposes'
  },
  { 
    type: 'basement', 
    name: 'Basement Storage', 
    minSize: 20, 
    maxSize: 100,
    description: 'Climate-controlled basement storage areas'
  },
  { 
    type: 'attic', 
    name: 'Attic Space', 
    minSize: 15, 
    maxSize: 40,
    description: 'Clean attic spaces perfect for seasonal items and long-term storage'
  },
  { 
    type: 'shed', 
    name: 'Storage Shed', 
    minSize: 8, 
    maxSize: 20,
    description: 'Outdoor storage sheds for garden equipment and tools'
  }
];

// Enhanced features list
const features = [
  '24/7 Access', 'Climate Controlled', 'Security Camera', 'Gated Entry',
  'Loading Dock', 'Electricity Available', 'Shelving Included', 'Ground Floor',
  'Drive-up Access', 'Keypad Entry', 'On-site Manager', 'Fire Sprinklers',
  'Pest Control', 'WiFi Available', 'Forklift Access', 'Motion Sensors',
  'Individual Alarm', 'Covered/Indoor', 'CCTV Monitoring', 'Access Control',
  'LED Lighting', 'Vehicle Access', 'Loading Bay', 'Inventory Management',
  'Temperature Control', 'Humidity Control', 'Dust Protection', 'Backup Power'
];

// Enhanced Filipino names database
const filipinoNames = {
  first: [
    'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Isabel',
    'Ricardo', 'Carmen', 'Antonio', 'Lucia', 'Manuel', 'Sofia', 'Diego', 'Patricia', 'Rafael', 'Gloria',
    'Fernando', 'Victoria', 'Eduardo', 'Cristina', 'Roberto', 'Esperanza', 'Francisco', 'Teresa', 'Ramon', 'Pilar',
    'Alejandro', 'Dolores', 'Joaquin', 'Mercedes', 'Sergio', 'Remedios', 'Arturo', 'Milagros', 'Enrique', 'Concepcion'
  ],
  last: [
    'Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Rivera', 'Gonzales', 'Lopez',
    'Martinez', 'Rodriguez', 'Hernandez', 'Diaz', 'Morales', 'Castillo', 'Romero', 'Aguilar', 'Navarro', 'Ramos',
    'Villanueva', 'Aquino', 'Dela Cruz', 'Fernandez', 'Perez', 'Gutierrez', 'Jimenez', 'Vargas', 'Herrera', 'Medina'
  ]
};

// Utility functions
const getRandomName = () => {
  const first = filipinoNames.first[Math.floor(Math.random() * filipinoNames.first.length)];
  const last = filipinoNames.last[Math.floor(Math.random() * filipinoNames.last.length)];
  return `${first} ${last}`;
};

const getRandomPhone = () => {
  const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0925', '0926', '0927', '0928', '0929'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${number}`;
};

const getRandomLocation = () => {
  const location = philippineLocations[Math.floor(Math.random() * philippineLocations.length)];
  const district = location.districts[Math.floor(Math.random() * location.districts.length)];
  return {
    city: location.city,
    district: district,
    address: `${Math.floor(Math.random() * 999) + 1} ${district} Street, ${location.city}`,
    latitude: 14.5995 + (Math.random() - 0.5) * 0.2,
    longitude: 120.9842 + (Math.random() - 0.5) * 0.2,
    postalCode: (1000 + Math.floor(Math.random() * 800)).toString()
  };
};

const getRandomFeatures = (count = 5) => {
  const shuffled = [...features].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generatePrice = (location, size, type) => {
  const basePrices = {
    'storage-unit': 100,
    'garage': 150,
    'warehouse': 50,
    'parking': 80,
    'room': 120,
    'basement': 90,
    'attic': 70,
    'shed': 60
  };

  const locationMultipliers = {
    'BGC': 2.5,
    'Makati': 2.2,
    'Manila': 1.5,
    'Quezon City': 1.3,
    'Pasig': 1.6,
    'Mandaluyong': 1.4,
    'Pasay': 1.7,
    'Parañaque': 1.2
  };

  const basePrice = basePrices[type] || 100;
  const locationMultiplier = locationMultipliers[location.city] || 1.0;
  const sizeMultiplier = Math.sqrt(size);
  
  const monthlyPrice = Math.round(basePrice * locationMultiplier * sizeMultiplier * 100) / 100;
  
  return {
    monthly: monthlyPrice,
    weekly: Math.round(monthlyPrice * 0.3 * 100) / 100,
    daily: Math.round(monthlyPrice * 0.05 * 100) / 100
  };
};

// Data generation functions
const generateAdmin = () => {
  return {
    name: 'LockifyHub Admin',
    email: 'admin@lockifyhub.com',
    phone: '+639171234567',
    userType: 'admin',
    type: 'admin',
    profileImageUrl: '/api/placeholder/200/200?text=Admin',
    verified: true,
    status: 'active',
    permissions: ['manage_users', 'manage_listings', 'manage_bookings', 'view_analytics', 'system_admin'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateHost = () => {
  const name = getRandomName();
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
  
  return {
    name,
    email,
    phone: getRandomPhone(),
    userType: 'host',
    type: 'host',
    profileImageUrl: `/api/placeholder/200/200?text=${encodeURIComponent(name.split(' ')[0])}`,
    bio: `Hi, I'm ${name}. I have been providing storage solutions in Metro Manila for ${Math.floor(Math.random() * 10) + 1} years. I ensure all my spaces are clean, secure, and well-maintained.`,
    verified: Math.random() > 0.3,
    rating: 4 + Math.random(),
    totalListings: Math.floor(Math.random() * 10) + 1,
    totalBookings: Math.floor(Math.random() * 100) + 10,
    totalEarnings: Math.floor(Math.random() * 500000) + 50000,
    memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3),
    responseTime: Math.floor(Math.random() * 24) + 1,
    responseRate: 85 + Math.floor(Math.random() * 15),
    languages: ['English', 'Filipino'],
    paymentMethods: ['GCash', 'Bank Transfer'],
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateClient = () => {
  const name = getRandomName();
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
  
  return {
    name,
    email,
    phone: getRandomPhone(),
    userType: 'client',
    type: 'client',
    profileImageUrl: `/api/placeholder/200/200?text=${encodeURIComponent(name.split(' ')[0])}`,
    verified: Math.random() > 0.5,
    memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2),
    totalBookings: Math.floor(Math.random() * 20),
    totalSpent: Math.floor(Math.random() * 100000) + 5000,
    preferredPayment: ['GCash', 'PayMaya', 'Bank Transfer', 'Credit Card'][Math.floor(Math.random() * 4)],
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateListing = (hostId, hostName) => {
  const storageType = storageTypes[Math.floor(Math.random() * storageTypes.length)];
  const location = getRandomLocation();
  const size = Math.floor(Math.random() * (storageType.maxSize - storageType.minSize)) + storageType.minSize;
  const pricing = generatePrice(location, size, storageType.type);
  const rating = 3.5 + Math.random() * 1.5;
  const reviewCount = Math.floor(Math.random() * 200);

  const titles = {
    'storage-unit': `${size}sqm Storage Unit in ${location.district}`,
    'garage': `Secure Garage Space - ${location.district}`,
    'warehouse': `${size}sqm Warehouse Space Available`,
    'parking': `Covered Parking in ${location.city}`,
    'room': `Spare Room for Storage - ${location.district}`,
    'basement': `Spacious Basement Storage`,
    'attic': `Clean Attic Space for Rent`,
    'shed': `Outdoor Storage Shed Available`
  };

  const descriptions = {
    'storage-unit': `Clean and secure ${size} square meter storage unit located in ${location.district}, ${location.city}. Perfect for household items, business inventory, or personal belongings. Easy access with professional management.`,
    'garage': `Secure garage space available for storage or parking. Located in a safe neighborhood in ${location.district}. Easy access and well-maintained with security features.`,
    'warehouse': `Large ${size} square meter warehouse space suitable for business storage, inventory, or equipment. Loading dock available with professional logistics support.`,
    'parking': `Safe and covered parking space in ${location.city}. 24/7 access with security cameras. Perfect for cars, motorcycles, or commercial vehicles.`,
    'room': `Extra room available for storage purposes in a residential property. Clean, dry, and secure. Located in a peaceful area in ${location.district}.`,
    'basement': `Spacious basement area perfect for long-term storage. Climate-controlled and pest-free environment with excellent security measures.`,
    'attic': `Clean attic space available for storage. Easily accessible and well-ventilated. Great for seasonal items and personal belongings.`,
    'shed': `Outdoor storage shed in excellent condition. Waterproof and secure. Ideal for garden equipment, tools, or outdoor recreational items.`
  };

  return {
    hostId,
    hostName,
    title: titles[storageType.type],
    description: descriptions[storageType.type],
    type: storageType.type,
    location,
    size: {
      value: size,
      unit: 'sqm'
    },
    pricing,
    features: getRandomFeatures(3 + Math.floor(Math.random() * 5)),
    images: [
      `/api/placeholder/800/600?text=${encodeURIComponent(storageType.name + ' ' + location.city)}`,
      `/api/placeholder/800/600?text=${encodeURIComponent(storageType.name + ' Interior')}`,
      `/api/placeholder/800/600?text=${encodeURIComponent(storageType.name + ' Entrance')}`,
      `/api/placeholder/800/600?text=${encodeURIComponent('Security Features')}`
    ],
    availability: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      minimumDuration: 30,
      maximumDuration: 365
    },
    rules: [
      'No hazardous materials',
      'Access hours: 6 AM - 10 PM',
      'Insurance required for items over ₱50,000',
      'Monthly payment required',
      'One month deposit',
      'Valid ID required for access'
    ],
    status: Math.random() > 0.2 ? 'available' : 'occupied',
    featured: Math.random() > 0.8,
    verified: Math.random() > 0.3,
    instantBook: Math.random() > 0.5,
    rating,
    reviewCount,
    responseTime: Math.floor(Math.random() * 24) + 1,
    responseRate: 80 + Math.floor(Math.random() * 20),
    viewCount: Math.floor(Math.random() * 1000) + 50,
    favoriteCount: Math.floor(Math.random() * 100) + 5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateBooking = (clientId, clientName, hostId, listingId, listing) => {
  const statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
  const weights = [0.15, 0.25, 0.25, 0.25, 0.1]; // Probability weights for each status
  
  let cumulativeWeight = 0;
  const random = Math.random();
  let status = statuses[0];
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      status = statuses[i];
      break;
    }
  }
  
  const startDate = new Date(Date.now() + (Math.random() * 60 - 30) * 24 * 60 * 60 * 1000); // -30 to +30 days
  const duration = 30 + Math.floor(Math.random() * 90); // 30-120 days
  const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
  
  const monthlyRate = listing.pricing.monthly;
  const months = duration / 30;
  const subtotal = monthlyRate * months;
  const serviceFee = subtotal * 0.1;
  const deposit = monthlyRate;
  const totalAmount = subtotal + serviceFee + deposit;
  const hostEarnings = subtotal * 0.85; // 15% platform fee

  return {
    clientId,
    clientName,
    hostId,
    listingId,
    listingTitle: listing.title,
    listingLocation: listing.location,
    startDate,
    endDate,
    duration,
    status,
    pricing: {
      monthlyRate,
      months: Math.round(months * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      deposit: Math.round(deposit * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency: 'PHP'
    },
    hostEarnings: Math.round(hostEarnings * 100) / 100,
    paymentStatus: ['confirmed', 'active', 'completed'].includes(status) ? 'paid' : 'pending',
    paymentMethod: ['GCash', 'PayMaya', 'Bank Transfer', 'Credit Card'][Math.floor(Math.random() * 4)],
    message: `Hi, I'm interested in renting your ${listing.title}. Is it available from ${startDate.toDateString()}?`,
    specialRequests: Math.random() > 0.7 ? [
      'Need 24/7 access for business inventory',
      'Require temperature controlled environment',
      'Need loading dock access',
      'Planning to store vehicles',
      'Need shelving installation'
    ][Math.floor(Math.random() * 5)] : null,
    ...(status === 'confirmed' && { confirmedAt: serverTimestamp() }),
    ...(status === 'active' && { activatedAt: serverTimestamp() }),
    ...(status === 'completed' && { completedAt: serverTimestamp() }),
    ...(status === 'cancelled' && { 
      cancelledAt: serverTimestamp(),
      cancelReason: ['Found alternative storage', 'Changed plans', 'Budget constraints', 'Location not suitable'][Math.floor(Math.random() * 4)]
    }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateConversation = (participants, bookingId = null) => {
  return {
    participants: participants.sort(), // Ensure consistent ordering
    bookingId,
    lastMessage: null,
    lastMessageAt: serverTimestamp(),
    unreadCount: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

const generateMessage = (conversationId, senderId, senderName, text, recipientId) => {
  return {
    conversationId,
    senderId,
    senderName,
    text,
    attachments: [],
    status: 'sent',
    readBy: [senderId],
    createdAt: serverTimestamp()
  };
};

const generateReview = (reviewerId, reviewerName, targetId, targetType, bookingId = null) => {
  const rating = 3 + Math.random() * 2;
  const aspects = {
    cleanliness: 3 + Math.random() * 2,
    communication: 3 + Math.random() * 2,
    location: 3 + Math.random() * 2,
    value: 3 + Math.random() * 2,
    accuracy: 3 + Math.random() * 2
  };

  const positiveComments = [
    'Excellent storage space! Very clean and secure with great access.',
    'Outstanding host - very responsive and helpful throughout the rental.',
    'Perfect location and exactly as described. Highly recommended!',
    'Great value for money. The space exceeded my expectations.',
    'Professional service and well-maintained facility. Will rent again.',
    'Very satisfied with the storage quality and security measures.',
    'Convenient location with easy access. Host was very accommodating.',
    'Clean, secure, and affordable. Everything I needed for my storage.'
  ];

  const comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];

  return {
    reviewerId,
    reviewerName,
    targetId,
    targetType, // 'listing' or 'user'
    bookingId,
    rating: Math.round(rating * 10) / 10,
    aspects: Object.fromEntries(
      Object.entries(aspects).map(([key, value]) => [key, Math.round(value * 10) / 10])
    ),
    comment,
    helpful: Math.floor(Math.random() * 20),
    photos: Math.random() > 0.7 ? [
      `/api/placeholder/400/300?text=Review+Photo+1`,
      `/api/placeholder/400/300?text=Review+Photo+2`
    ] : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Database operations
const addDocument = async (collectionName, data) => {
  if (isNode && admin) {
    // Using Admin SDK
    const docRef = db.collection(collectionName).doc();
    await docRef.set(data);
    return { id: docRef.id, ...data };
  } else {
    // Using client SDK
    const docRef = await global.addDoc(global.collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  }
};

const clearCollection = async (collectionName) => {
  if (isNode && admin) {
    // Using Admin SDK
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  } else {
    // Using client SDK
    const querySnapshot = await global.getDocs(global.collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => global.deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// Main functions
export const clearDatabase = async () => {
  const collections = ['users', 'listings', 'bookings', 'reviews', 'conversations', 'messages'];
  
  console.log('🗑️  Clearing database...');
  for (const collectionName of collections) {
    await clearCollection(collectionName);
    console.log(`   ✅ Cleared ${collectionName} collection`);
  }
  console.log('✅ Database cleared successfully');
};

export const seedDatabase = async (options = {}) => {
  const {
    clearFirst = false,
    hostCount = 10,
    clientCount = 20,
    listingsPerHost = 3,
    bookingsPerListing = 2,
    messagesPerConversation = 5,
    includeAdmin = true
  } = options;

  try {
    if (clearFirst) {
      await clearDatabase();
    }

    console.log('🌱 Starting database seeding...');
    const stats = {
      admins: 0,
      hosts: 0,
      clients: 0,
      listings: 0,
      bookings: 0,
      conversations: 0,
      messages: 0,
      reviews: 0
    };

    // Generate admin user
    let adminUser = null;
    if (includeAdmin) {
      const admin = generateAdmin();
      adminUser = await addDocument('users', admin);
      stats.admins = 1;
      console.log(`👑 Created admin: ${admin.name}`);
    }

    // Generate hosts
    const hosts = [];
    for (let i = 0; i < hostCount; i++) {
      const host = generateHost();
      const hostDoc = await addDocument('users', host);
      hosts.push(hostDoc);
      console.log(`🏠 Created host: ${host.name}`);
    }
    stats.hosts = hosts.length;

    // Generate clients
    const clients = [];
    for (let i = 0; i < clientCount; i++) {
      const client = generateClient();
      const clientDoc = await addDocument('users', client);
      clients.push(clientDoc);
      console.log(`👤 Created client: ${client.name}`);
    }
    stats.clients = clients.length;

    // Generate listings for each host
    const listings = [];
    for (const host of hosts) {
      for (let i = 0; i < listingsPerHost; i++) {
        const listing = generateListing(host.id, host.name);
        const listingDoc = await addDocument('listings', listing);
        listings.push(listingDoc);
        console.log(`📦 Created listing: ${listing.title}`);
      }
    }
    stats.listings = listings.length;

    // Generate bookings and conversations
    const bookings = [];
    const conversations = [];
    for (const listing of listings) {
      if (listing.status === 'available') {
        const bookingCount = Math.min(bookingsPerListing, clients.length);
        const selectedClients = [...clients].sort(() => 0.5 - Math.random()).slice(0, bookingCount);
        
        for (const client of selectedClients) {
          const booking = generateBooking(client.id, client.name, listing.hostId, listing.id, listing);
          const bookingDoc = await addDocument('bookings', booking);
          bookings.push(bookingDoc);
          console.log(`📅 Created booking: ${client.name} -> ${listing.title}`);

          // Create conversation for this booking
          const conversation = generateConversation([client.id, listing.hostId], bookingDoc.id);
          const conversationDoc = await addDocument('conversations', conversation);
          conversations.push(conversationDoc);
          console.log(`💬 Created conversation between ${client.name} and ${listing.hostName}`);

          // Generate messages for the conversation
          const sampleMessages = [
            { sender: 'client', text: `Hi! I'm interested in your ${listing.title}. Is it still available?` },
            { sender: 'host', text: `Hello ${client.name}! Yes, it's available. When would you like to start?` },
            { sender: 'client', text: `Great! I'd like to start next week. What documents do I need?` },
            { sender: 'host', text: 'Just bring a valid ID and we can get started. I\'ll send you the access details.' },
            { sender: 'client', text: 'Perfect! Thank you for the quick response.' }
          ];

          for (let j = 0; j < Math.min(messagesPerConversation, sampleMessages.length); j++) {
            const msgData = sampleMessages[j];
            const senderId = msgData.sender === 'client' ? client.id : listing.hostId;
            const senderName = msgData.sender === 'client' ? client.name : listing.hostName;
            const recipientId = msgData.sender === 'client' ? listing.hostId : client.id;
            
            const message = generateMessage(conversationDoc.id, senderId, senderName, msgData.text, recipientId);
            await addDocument('messages', message);
            stats.messages++;
            
            // Small delay between messages to simulate realistic timing
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          console.log(`   💬 Added ${Math.min(messagesPerConversation, sampleMessages.length)} messages`);
        }
      }
    }
    stats.bookings = bookings.length;
    stats.conversations = conversations.length;

    // Generate reviews for completed bookings
    for (const booking of bookings) {
      if (booking.status === 'completed' && Math.random() > 0.3) {
        // Client reviews listing
        const listingReview = generateReview(
          booking.clientId, 
          booking.clientName, 
          booking.listingId, 
          'listing',
          booking.id
        );
        await addDocument('reviews', listingReview);
        stats.reviews++;
        console.log(`⭐ Created listing review by ${booking.clientName}`);

        // Host reviews client (sometimes)
        if (Math.random() > 0.5) {
          const host = hosts.find(h => h.id === booking.hostId);
          const clientReview = generateReview(
            booking.hostId, 
            host?.name || 'Host', 
            booking.clientId, 
            'user',
            booking.id
          );
          await addDocument('reviews', clientReview);
          stats.reviews++;
          console.log(`⭐ Created client review by ${host?.name || 'Host'}`);
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('📊 Final Statistics:');
    console.log(`   👑 Admins: ${stats.admins}`);
    console.log(`   🏠 Hosts: ${stats.hosts}`);
    console.log(`   👤 Clients: ${stats.clients}`);
    console.log(`   📦 Listings: ${stats.listings}`);
    console.log(`   📅 Bookings: ${stats.bookings}`);
    console.log(`   💬 Conversations: ${stats.conversations}`);
    console.log(`   📝 Messages: ${stats.messages}`);
    console.log(`   ⭐ Reviews: ${stats.reviews}`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Preset configurations
export const quickSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 5,
  clientCount: 10,
  listingsPerHost: 3,
  bookingsPerListing: 2,
  messagesPerConversation: 3,
  includeAdmin: true
});

export const fullSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 15,
  clientCount: 30,
  listingsPerHost: 4,
  bookingsPerListing: 3,
  messagesPerConversation: 5,
  includeAdmin: true
});

export const testSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 3,
  clientCount: 5,
  listingsPerHost: 2,
  bookingsPerListing: 1,
  messagesPerConversation: 2,
  includeAdmin: true
});

// CLI support for Node.js
if (isNode && process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  
  const parseArgs = () => {
    const options = {
      clearFirst: true,
      hostCount: 10,
      clientCount: 20,
      listingsPerHost: 3,
      bookingsPerListing: 2,
      messagesPerConversation: 5,
      includeAdmin: true
    };
    
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--quick':
          return quickSeed();
        case '--full':
          return fullSeed();
        case '--test':
          return testSeed();
        case '--clear':
          return clearDatabase();
        case '--hosts':
          options.hostCount = parseInt(args[++i]) || 10;
          break;
        case '--clients':
          options.clientCount = parseInt(args[++i]) || 20;
          break;
        case '--listings':
          options.listingsPerHost = parseInt(args[++i]) || 3;
          break;
        case '--bookings':
          options.bookingsPerListing = parseInt(args[++i]) || 2;
          break;
        case '--messages':
          options.messagesPerConversation = parseInt(args[++i]) || 5;
          break;
        case '--no-admin':
          options.includeAdmin = false;
          break;
        case '--no-clear':
          options.clearFirst = false;
          break;
        case '--help':
          console.log(`
Firebase Database Seeder

Usage:
  node seedFirebase.js [options]

Options:
  --quick                 Quick seed (5 hosts, 10 clients)
  --full                  Full seed (15 hosts, 30 clients)
  --test                  Test seed (3 hosts, 5 clients)
  --clear                 Clear database only
  --hosts <number>        Number of hosts to create
  --clients <number>      Number of clients to create
  --listings <number>     Number of listings per host
  --bookings <number>     Number of bookings per listing
  --messages <number>     Number of messages per conversation
  --no-admin              Don't create admin user
  --no-clear              Don't clear database first
  --help                  Show this help message

Examples:
  node seedFirebase.js --quick
  node seedFirebase.js --hosts 20 --clients 50
  node seedFirebase.js --test --no-clear
          `);
          process.exit(0);
      }
    }
    
    return seedDatabase(options);
  };

  parseArgs()
    .then((result) => {
      if (result) {
        console.log('\n🎉 Seeding completed successfully!');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error.message);
      process.exit(1);
    });
}

export default { seedDatabase, clearDatabase, quickSeed, fullSeed, testSeed };