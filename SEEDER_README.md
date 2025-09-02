# Firebase Database Seeder

A comprehensive data seeding solution for the LockifyHub storage platform that creates realistic test data for development and testing purposes.

## Overview

The seeder creates a complete dataset including:
- **Users**: Admin account, hosts, and clients with Filipino names
- **Storage Listings**: Various types across Metro Manila locations  
- **Bookings**: Different statuses and realistic pricing
- **Conversations**: Chat messages between users
- **Reviews**: Detailed ratings and comments

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup

Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Optional: Firebase Admin SDK credentials (for bypassing auth rules)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789123456789"
FIREBASE_PRIVATE_KEY_ID="abcdef123456..."
```

### 3. Firebase Admin SDK (Optional but Recommended)

For the best experience, set up Firebase Admin SDK to bypass Firestore security rules:

**Option A: Service Account JSON File**
1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate new private key and download JSON file
3. Save as `serviceAccountKey.json` in project root

**Option B: Environment Variables** 
Add the service account credentials to your `.env` file as shown above.

## Usage

### Command Line Interface

```bash
# Quick seed (5 hosts, 10 clients, 15 listings)
npm run seed:quick

# Full seed (15 hosts, 30 clients, 60 listings) 
npm run seed:full

# Test seed (3 hosts, 5 clients, 6 listings)
npm run seed:test

# Clear all data
npm run seed:clear

# Custom seed with parameters
node seedFirebase.js --hosts 20 --clients 50 --listings 3

# Help
node seedFirebase.js --help
```

### Web Interface

1. Start the development server: `npm run dev`
2. Navigate to the test page in your app
3. Use the DatabaseSeeder component for visual seeding

### Programmatic Usage

```javascript
import { seedDatabase, quickSeed, clearDatabase } from './src/utils/seedFirebase.js';

// Quick seed
const stats = await quickSeed();
console.log(`Created ${stats.hosts} hosts and ${stats.listings} listings`);

// Custom seed
const customStats = await seedDatabase({
  clearFirst: true,
  hostCount: 10,
  clientCount: 25,
  listingsPerHost: 4,
  bookingsPerListing: 2,
  messagesPerConversation: 5,
  includeAdmin: true
});

// Clear database
await clearDatabase();
```

## Generated Data Structure

### Users Collection
```javascript
{
  id: "auto-generated",
  name: "Juan Santos",
  email: "juan.santos@example.com", 
  phone: "+639171234567",
  userType: "host|client|admin",
  profileImageUrl: "/api/placeholder/200/200",
  verified: true,
  status: "active",
  // ... additional fields based on user type
}
```

### Listings Collection  
```javascript
{
  id: "auto-generated",
  hostId: "user-id",
  hostName: "Juan Santos",
  title: "15sqm Storage Unit in Makati",
  description: "Clean and secure storage...",
  type: "storage-unit|garage|warehouse|parking|room|basement|attic|shed",
  location: {
    city: "Makati",
    district: "Poblacion", 
    address: "123 Poblacion Street, Makati",
    latitude: 14.5547,
    longitude: 121.0244,
    postalCode: "1210"
  },
  size: { value: 15, unit: "sqm" },
  pricing: {
    monthly: 3500.00,
    weekly: 1050.00,
    daily: 175.00
  },
  features: ["24/7 Access", "Security Camera", "Climate Controlled"],
  status: "available|occupied",
  featured: false,
  verified: true,
  rating: 4.5,
  reviewCount: 23
}
```

### Bookings Collection
```javascript
{
  id: "auto-generated",
  clientId: "user-id",
  clientName: "Maria Cruz",
  hostId: "user-id", 
  listingId: "listing-id",
  listingTitle: "Storage Unit...",
  startDate: "2024-02-01",
  endDate: "2024-05-01",
  duration: 90,
  status: "pending|confirmed|active|completed|cancelled",
  pricing: {
    monthlyRate: 3500.00,
    months: 3,
    subtotal: 10500.00,
    serviceFee: 1050.00,
    deposit: 3500.00,
    totalAmount: 15050.00
  },
  paymentStatus: "paid|pending",
  paymentMethod: "GCash|PayMaya|Bank Transfer|Credit Card"
}
```

### Conversations Collection
```javascript
{
  id: "auto-generated",
  participants: ["client-id", "host-id"],
  bookingId: "booking-id",
  lastMessage: "Thank you for the quick response.",
  lastMessageAt: "2024-01-15T10:30:00Z",
  unreadCount: {
    "client-id": 0,
    "host-id": 2
  }
}
```

### Messages Collection
```javascript
{
  id: "auto-generated",
  conversationId: "conversation-id",
  senderId: "user-id",
  senderName: "Juan Santos",
  text: "Hi! Is your storage unit still available?",
  attachments: [],
  status: "sent|delivered|read",
  readBy: ["sender-id"],
  createdAt: "2024-01-15T09:15:00Z"
}
```

### Reviews Collection
```javascript
{
  id: "auto-generated",
  reviewerId: "user-id",
  reviewerName: "Maria Cruz",
  targetId: "listing-id|user-id",
  targetType: "listing|user",
  bookingId: "booking-id",
  rating: 4.8,
  aspects: {
    cleanliness: 5.0,
    communication: 4.5,
    location: 4.8,
    value: 4.2,
    accuracy: 5.0
  },
  comment: "Excellent storage space! Very clean and secure...",
  helpful: 5,
  photos: ["/api/placeholder/400/300"]
}
```

## Features

### Realistic Data
- Filipino names and Philippine phone numbers
- Metro Manila locations (Makati, BGC, Quezon City, Pasig, etc.)
- Dynamic pricing based on location and size
- Proper booking status progression
- Realistic conversation flows

### Multiple User Types
- **Admin**: System administrator with full permissions
- **Hosts**: Property owners with detailed profiles and ratings
- **Clients**: Renters with booking history and preferences

### Storage Variety
- Storage Units (5-50 sqm)
- Garage Spaces (15-30 sqm)  
- Warehouse Spaces (50-500 sqm)
- Parking Spaces (12-18 sqm)
- Spare Rooms (10-25 sqm)
- Basement Storage (20-100 sqm)
- Attic Spaces (15-40 sqm)
- Storage Sheds (8-20 sqm)

### Smart Relationships
- Bookings link clients to listings
- Conversations connect booking participants
- Reviews reference completed bookings
- Messages maintain realistic conversation flow

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `clearFirst` | `false` | Clear existing data before seeding |
| `hostCount` | `10` | Number of host users to create |
| `clientCount` | `20` | Number of client users to create |
| `listingsPerHost` | `3` | Listings created per host |
| `bookingsPerListing` | `2` | Bookings created per listing |
| `messagesPerConversation` | `5` | Messages per conversation |
| `includeAdmin` | `true` | Create admin user account |

## Default Presets

| Preset | Hosts | Clients | Listings | Total Records |
|--------|-------|---------|----------|---------------|
| Test | 3 | 5 | 6 | ~50 |
| Quick | 5 | 10 | 15 | ~150 |
| Full | 15 | 30 | 60 | ~500 |

## Test Account

The seeder creates a default admin account:
- **Email**: admin@lockifyhub.com
- **Password**: Set up authentication separately
- **Permissions**: Full system access

## Troubleshooting

### Permission Errors
- Ensure Firestore rules allow write access or use Firebase Admin SDK
- Check that service account has proper permissions

### Import Errors  
- Verify all dependencies are installed: `npm install`
- Ensure Node.js version supports ES modules

### Seeding Failures
- Check Firebase quotas and limits
- Verify network connectivity
- Review console errors for specific issues

### Performance
- Large datasets may take several minutes
- Consider using Firebase Admin SDK for better performance
- Monitor Firebase usage to avoid quota limits

## Best Practices

1. **Use Admin SDK**: Set up Firebase Admin SDK for production-like seeding
2. **Test with Small Data**: Start with test seed to verify functionality
3. **Clear Before Seeding**: Use `clearFirst: true` to avoid duplicates
4. **Monitor Quotas**: Check Firebase usage limits
5. **Backup Data**: Export existing data before clearing
6. **Environment Variables**: Keep credentials secure in `.env` file

## Security Notes

- All test emails use `@example.com` domain
- Phone numbers are realistic but not functional
- Admin credentials should be changed in production
- Service account keys should be kept secure
- Consider using Firebase App Check in production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Verify environment configuration
4. Test with minimal dataset first

## License

This seeder is part of the LockifyHub project and follows the same license terms.