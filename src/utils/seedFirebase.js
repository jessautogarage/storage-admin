import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// Philippine cities and districts
const philippineLocations = [
  { city: 'Manila', districts: ['Ermita', 'Malate', 'Binondo', 'Quiapo', 'Sampaloc'] },
  { city: 'Makati', districts: ['Poblacion', 'Bel-Air', 'San Antonio', 'Legazpi Village', 'Salcedo Village'] },
  { city: 'Quezon City', districts: ['Diliman', 'Cubao', 'Commonwealth', 'Eastwood', 'Katipunan'] },
  { city: 'BGC', districts: ['Fort Bonifacio', 'Uptown', 'Forbes Town', 'Burgos Circle', 'High Street'] },
  { city: 'Pasig', districts: ['Ortigas', 'Kapitolyo', 'Ugong', 'San Antonio', 'Rosario'] },
  { city: 'Mandaluyong', districts: ['Wack-Wack', 'Greenfield', 'Shaw Boulevard', 'Pioneer', 'Boni Avenue'] },
  { city: 'Pasay', districts: ['Mall of Asia', 'Newport City', 'Villamor', 'Bay City', 'NAIA'] },
  { city: 'Parañaque', districts: ['BF Homes', 'Sucat', 'Bicutan', 'Don Bosco', 'Moonwalk'] }
];

// Storage types
const storageTypes = [
  { type: 'storage-unit', name: 'Storage Unit', minSize: 5, maxSize: 50 },
  { type: 'garage', name: 'Garage Space', minSize: 15, maxSize: 30 },
  { type: 'warehouse', name: 'Warehouse Space', minSize: 50, maxSize: 500 },
  { type: 'parking', name: 'Parking Space', minSize: 12, maxSize: 18 },
  { type: 'room', name: 'Spare Room', minSize: 10, maxSize: 25 },
  { type: 'basement', name: 'Basement Storage', minSize: 20, maxSize: 100 },
  { type: 'attic', name: 'Attic Space', minSize: 15, maxSize: 40 },
  { type: 'shed', name: 'Storage Shed', minSize: 8, maxSize: 20 }
];

// Features
const features = [
  '24/7 Access',
  'Climate Controlled',
  'Security Camera',
  'Gated Entry',
  'Loading Dock',
  'Electricity Available',
  'Shelving Included',
  'Ground Floor',
  'Drive-up Access',
  'Keypad Entry',
  'On-site Manager',
  'Fire Sprinklers',
  'Pest Control',
  'WiFi Available',
  'Forklift Access',
  'Motion Sensors',
  'Individual Alarm',
  'Covered/Indoor'
];

// Filipino names
const filipinoNames = {
  first: ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Isabel',
          'Ricardo', 'Carmen', 'Antonio', 'Lucia', 'Manuel', 'Sofia', 'Diego', 'Patricia', 'Rafael', 'Gloria'],
  last: ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Rivera', 'Gonzales', 'Lopez',
         'Martinez', 'Rodriguez', 'Hernandez', 'Diaz', 'Morales', 'Castillo', 'Romero', 'Aguilar', 'Navarro', 'Ramos']
};

// Generate random Filipino name
const getRandomName = () => {
  const first = filipinoNames.first[Math.floor(Math.random() * filipinoNames.first.length)];
  const last = filipinoNames.last[Math.floor(Math.random() * filipinoNames.last.length)];
  return `${first} ${last}`;
};

// Generate random phone number (Philippine format)
const getRandomPhone = () => {
  const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0925', '0926', '0927'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${number}`;
};

// Generate random location
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

// Generate random features
const getRandomFeatures = (count = 5) => {
  const shuffled = [...features].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate price based on location and size
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

// Generate storage listing
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
    'storage-unit': `Clean and secure ${size} square meter storage unit located in ${location.district}, ${location.city}. Perfect for household items, business inventory, or personal belongings.`,
    'garage': `Secure garage space available for storage or parking. Located in a safe neighborhood in ${location.district}. Easy access and well-maintained.`,
    'warehouse': `Large ${size} square meter warehouse space suitable for business storage, inventory, or equipment. Loading dock available.`,
    'parking': `Safe and covered parking space in ${location.city}. 24/7 access with security cameras. Perfect for cars or motorcycles.`,
    'room': `Extra room available for storage purposes. Clean, dry, and secure. Located in a residential area in ${location.district}.`,
    'basement': `Spacious basement area perfect for long-term storage. Climate-controlled and pest-free environment.`,
    'attic': `Clean attic space available for storage. Easily accessible and well-ventilated. Great for seasonal items.`,
    'shed': `Outdoor storage shed in good condition. Waterproof and secure. Ideal for garden equipment or outdoor items.`
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
      `/api/placeholder/800/600?text=${storageType.name}+${location.city}`,
      `/api/placeholder/800/600?text=${storageType.name}+Interior`,
      `/api/placeholder/800/600?text=${storageType.name}+Entrance`
    ],
    availability: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      minimumDuration: 30, // days
      maximumDuration: 365 // days
    },
    rules: [
      'No hazardous materials',
      'Access hours: 6 AM - 10 PM',
      'Insurance required for items over ₱50,000',
      'Monthly payment required',
      'One month deposit'
    ],
    // FIXED: Changed from 'available' to 'active' to match the hook's query
    status: Math.random() > 0.2 ? 'active' : 'occupied',
    featured: Math.random() > 0.8,
    verified: Math.random() > 0.3,
    instantBook: Math.random() > 0.5,
    rating,
    reviewCount,
    responseTime: Math.floor(Math.random() * 24) + 1, // hours
    responseRate: 80 + Math.floor(Math.random() * 20), // percentage
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Generate host user
const generateHost = () => {
  const name = getRandomName();
  const email = name.toLowerCase().replace(' ', '.') + '@example.com';
  
  return {
    name,
    email,
    phone: getRandomPhone(),
    userType: 'host',
    type: 'host',
    profileImageUrl: `/api/placeholder/200/200?text=${name.split(' ')[0]}`,
    bio: `Hi, I'm ${name}. I have been providing storage solutions in Metro Manila for ${Math.floor(Math.random() * 10) + 1} years. I ensure all my spaces are clean, secure, and well-maintained.`,
    verified: Math.random() > 0.3,
    rating: 4 + Math.random(),
    totalListings: Math.floor(Math.random() * 10) + 1,
    totalBookings: Math.floor(Math.random() * 100) + 10,
    memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Random date within last 3 years
    responseTime: Math.floor(Math.random() * 24) + 1,
    responseRate: 85 + Math.floor(Math.random() * 15),
    languages: ['English', 'Filipino'],
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Generate client user
const generateClient = () => {
  const name = getRandomName();
  const email = name.toLowerCase().replace(' ', '.') + '@example.com';
  
  return {
    name,
    email,
    phone: getRandomPhone(),
    userType: 'client',
    type: 'client',
    profileImageUrl: `/api/placeholder/200/200?text=${name.split(' ')[0]}`,
    verified: Math.random() > 0.5,
    memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2),
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Generate admin user
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

// Generate booking with enhanced structure
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
    totalAmount: Math.round(totalAmount * 100) / 100, // For compatibility with useUserBookings hook
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

// Generate conversation
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

// Generate message
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

// Generate review
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
    'Great storage space, very clean and secure.',
    'Excellent location and easy access.',
    'Host was very responsive and helpful.',
    'Perfect for my needs, highly recommended!',
    'Good value for money, will rent again.',
    'Very satisfied with the storage facility.',
    'Secure and well-maintained space.',
    'Convenient location and fair pricing.'
  ];

  const comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];

  return {
    reviewerId,
    reviewerName,
    targetId,
    targetType, // 'listing' or 'user'
    rating,
    aspects,
    comment,
    helpful: Math.floor(Math.random() * 20),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Clear all collections
export const clearDatabase = async () => {
  const collections = ['users', 'listings', 'bookings', 'reviews', 'conversations', 'messages'];
  
  console.log('🗑️  Clearing database...');
  for (const collectionName of collections) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`   ✅ Cleared ${collectionName} collection`);
  }
  
  console.log('✅ Database cleared successfully');
};

// Main seeding function
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
      const docRef = await addDoc(collection(db, 'users'), admin);
      adminUser = { id: docRef.id, ...admin };
      stats.admins = 1;
      console.log(`👑 Created admin: ${admin.name}`);
    }

    // Generate hosts
    const hosts = [];
    for (let i = 0; i < hostCount; i++) {
      const host = generateHost();
      const docRef = await addDoc(collection(db, 'users'), host);
      hosts.push({ id: docRef.id, ...host });
      console.log(`🏠 Created host: ${host.name}`);
    }
    stats.hosts = hosts.length;

    // Generate clients
    const clients = [];
    for (let i = 0; i < clientCount; i++) {
      const client = generateClient();
      const docRef = await addDoc(collection(db, 'users'), client);
      clients.push({ id: docRef.id, ...client });
      console.log(`👤 Created client: ${client.name}`);
    }
    stats.clients = clients.length;

    // Generate listings for each host
    const listings = [];
    for (const host of hosts) {
      for (let i = 0; i < listingsPerHost; i++) {
        const listing = generateListing(host.id, host.name);
        const docRef = await addDoc(collection(db, 'listings'), listing);
        listings.push({ id: docRef.id, ...listing });
        console.log(`📦 Created listing: ${listing.title} (status: ${listing.status})`);
      }
    }
    stats.listings = listings.length;

    // Generate bookings and conversations
    const bookings = [];
    const conversations = [];
    for (const listing of listings) {
      if (listing.status === 'active') {
        const bookingCount = Math.min(bookingsPerListing, clients.length);
        const selectedClients = [...clients].sort(() => 0.5 - Math.random()).slice(0, bookingCount);
        
        for (const client of selectedClients) {
          const booking = generateBooking(client.id, client.name, listing.hostId, listing.id, listing);
          const docRef = await addDoc(collection(db, 'bookings'), booking);
          const bookingDoc = { id: docRef.id, ...booking };
          bookings.push(bookingDoc);
          console.log(`📅 Created booking: ${client.name} -> ${listing.title}`);

          // Create conversation for this booking
          const conversation = generateConversation([client.id, listing.hostId], bookingDoc.id);
          const conversationRef = await addDoc(collection(db, 'conversations'), conversation);
          const conversationDoc = { id: conversationRef.id, ...conversation };
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
            await addDoc(collection(db, 'messages'), message);
            stats.messages++;
            
            // Small delay between messages to simulate realistic timing
            await new Promise(resolve => setTimeout(resolve, 50));
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
        await addDoc(collection(db, 'reviews'), listingReview);
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
          await addDoc(collection(db, 'reviews'), clientReview);
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

// Quick seed (smaller dataset)
export const quickSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 5,
  clientCount: 10,
  listingsPerHost: 3,
  bookingsPerListing: 2,
  messagesPerConversation: 3,
  includeAdmin: true
});

// Full seed (larger dataset)
export const fullSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 15,
  clientCount: 30,
  listingsPerHost: 4,
  bookingsPerListing: 3,
  messagesPerConversation: 5,
  includeAdmin: true
});

// Test seed (minimal dataset for testing)
export const testSeed = () => seedDatabase({
  clearFirst: true,
  hostCount: 3,
  clientCount: 5,
  listingsPerHost: 2,
  bookingsPerListing: 1,
  messagesPerConversation: 2,
  includeAdmin: true
});

export default { seedDatabase, clearDatabase, quickSeed, fullSeed, testSeed };