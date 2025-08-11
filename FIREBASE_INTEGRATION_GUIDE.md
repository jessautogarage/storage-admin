# Firebase Integration Guide for StorageMarket Admin

## Prerequisites

Before starting, ensure you have:
- A Google account
- Access to Firebase Console
- Node.js 18+ installed
- Basic knowledge of Firebase services

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `storagemarket` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Required Services

Navigate to your Firebase project and enable:

#### Authentication
1. Go to "Authentication" → "Get started"
2. Enable "Email/Password" provider
3. (Optional) Enable other providers like Google, Facebook

#### Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose production mode
3. Select your region (e.g., `asia-southeast1` for Southeast Asia)
4. Click "Enable"

#### Realtime Database
1. Go to "Realtime Database" → "Create Database"
2. Choose your location
3. Start in "locked mode" (we'll configure rules later)

#### Storage
1. Go to "Storage" → "Get started"
2. Keep default security rules for now
3. Choose your storage location

## Step 2: Web App Configuration

### 2.1 Register Web App

1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. App nickname: "StorageMarket Admin"
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"

### 2.2 Get Configuration Keys

Firebase will show your configuration. Copy these values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2.3 Update Environment Variables

Create/update `.env` file in your project root:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=your-database-url
```

## Step 3: Database Structure Setup

### 3.1 Firestore Collections

Create the following collections in Firestore:

1. **users**
   ```
   Fields:
   - email (string)
   - name (string)
   - type (string): 'host' | 'client' | 'admin'
   - role (string): 'admin' | 'moderator' | 'support'
   - verified (boolean)
   - createdAt (timestamp)
   - status (string): 'active' | 'suspended'
   ```

2. **listings**
   ```
   Fields:
   - hostId (string)
   - title (string)
   - description (string)
   - location (geopoint)
   - price (number)
   - capacity (string)
   - status (string): 'pending' | 'approved' | 'rejected'
   - images (array)
   - createdAt (timestamp)
   ```

3. **bookings**
   ```
   Fields:
   - listingId (string)
   - clientId (string)
   - hostId (string)
   - startDate (timestamp)
   - endDate (timestamp)
   - amount (number)
   - status (string)
   - paymentStatus (string)
   - createdAt (timestamp)
   ```

4. **payments**
   ```
   Fields:
   - bookingId (string)
   - amount (number)
   - method (string)
   - status (string)
   - transactionId (string)
   - createdAt (timestamp)
   ```

5. **payouts**
   ```
   Fields:
   - hostId (string)
   - period (map): {start: timestamp, end: timestamp}
   - totalAmount (number)
   - platformFees (number)
   - netAmount (number)
   - status (string)
   - bookingIds (array)
   - createdAt (timestamp)
   ```

6. **disputes**
   ```
   Fields:
   - bookingId (string)
   - raisedBy (string)
   - type (string)
   - description (string)
   - status (string)
   - resolution (string)
   - createdAt (timestamp)
   ```

7. **reviews**
   ```
   Fields:
   - bookingId (string)
   - reviewerId (string)
   - rating (number)
   - comment (string)
   - status (string)
   - createdAt (timestamp)
   ```

8. **notifications**
   ```
   Fields:
   - userId (string)
   - title (string)
   - message (string)
   - type (string)
   - read (boolean)
   - createdAt (timestamp)
   ```

### 3.2 Realtime Database Structure

Set up the following structure in Realtime Database:

```json
{
  "chats": {
    "conversationId": {
      "participants": ["userId1", "userId2"],
      "lastMessage": "Hello",
      "lastMessageTime": 1234567890,
      "messages": {
        "messageId": {
          "senderId": "userId1",
          "text": "Hello",
          "timestamp": 1234567890,
          "read": false
        }
      }
    }
  },
  "userStatus": {
    "userId": {
      "online": true,
      "lastSeen": 1234567890
    }
  }
}
```

## Step 4: Security Rules Configuration

### 4.1 Firestore Security Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin can read/write everything
    function isAdmin() {
      return request.auth != null && 
        request.auth.token.role == 'admin';
    }
    
    // Moderator permissions
    function isModerator() {
      return request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'moderator');
    }
    
    // Authenticated user
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || 
        (isAuthenticated() && request.auth.uid == userId);
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if true; // Public read
      allow create: if isAuthenticated();
      allow update: if isModerator() || 
        (isAuthenticated() && resource.data.hostId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.hostId || 
         request.auth.uid == resource.data.clientId ||
         isModerator());
      allow create: if isAuthenticated();
      allow update: if isModerator() || 
        (isAuthenticated() && 
         (request.auth.uid == resource.data.hostId || 
          request.auth.uid == resource.data.clientId));
      allow delete: if isAdmin();
    }
    
    // Admin-only collections
    match /payouts/{document=**} {
      allow read, write: if isAdmin();
    }
    
    match /disputes/{document=**} {
      allow read: if isModerator();
      allow write: if isAuthenticated();
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true; // Public read
      allow create: if isAuthenticated();
      allow update: if isModerator() || 
        (isAuthenticated() && resource.data.reviewerId == request.auth.uid);
      allow delete: if isAdmin();
    }
  }
}
```

### 4.2 Realtime Database Rules

Go to Realtime Database → Rules:

```json
{
  "rules": {
    "chats": {
      "$conversationId": {
        ".read": "auth != null && (root.child('chats').child($conversationId).child('participants').child('0').val() === auth.uid || root.child('chats').child($conversationId).child('participants').child('1').val() === auth.uid || auth.token.role === 'admin' || auth.token.role === 'support')",
        ".write": "auth != null && (root.child('chats').child($conversationId).child('participants').child('0').val() === auth.uid || root.child('chats').child($conversationId).child('participants').child('1').val() === auth.uid || auth.token.role === 'admin' || auth.token.role === 'support')"
      }
    },
    "userStatus": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

### 4.3 Storage Rules

Go to Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images
    match /users/{userId}/profile/{filename} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.role == 'admin');
    }
    
    // Listing images
    match /listings/{listingId}/{filename} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Verification documents
    match /verification/{userId}/{filename} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin' ||
         request.auth.token.role == 'moderator');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 5: Admin User Setup

### 5.1 Create Admin Account

1. Run the provided script to set admin claims:

```bash
node setAdmin.cjs
```

The script content:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "your-database-url"
});

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`Admin claim set for ${email}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
}

// Replace with your admin email
setAdminClaim('admin@storagemarket.com')
  .then(() => process.exit(0));
```

### 5.2 Get Service Account Key

1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in project root
4. Add to `.gitignore` (IMPORTANT!)

## Step 6: Connect Flutter App

### 6.1 Update Flutter Firebase Configuration

In your Flutter app, update Firebase initialization:

```dart
// lib/firebase_options.dart
import 'package:firebase_core/firebase_core.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    return const FirebaseOptions(
      apiKey: 'your-api-key',
      appId: 'your-app-id',
      messagingSenderId: 'your-sender-id',
      projectId: 'your-project-id',
      authDomain: 'your-auth-domain',
      databaseURL: 'your-database-url',
      storageBucket: 'your-storage-bucket',
    );
  }
}
```

### 6.2 Ensure Consistent Data Models

Make sure your Flutter app uses the same data structures:

```dart
// Example User model
class User {
  final String id;
  final String email;
  final String name;
  final String type; // 'host' | 'client'
  final bool verified;
  final DateTime createdAt;
  
  // ... constructor and methods
}
```

## Step 7: Testing the Integration

### 7.1 Test Authentication

```javascript
// In browser console (admin panel)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './src/services/firebase';

signInWithEmailAndPassword(auth, 'test@example.com', 'password')
  .then(user => console.log('Logged in:', user))
  .catch(error => console.error('Auth error:', error));
```

### 7.2 Test Firestore Connection

```javascript
// Test read operation
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/services/firebase';

const querySnapshot = await getDocs(collection(db, 'users'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, ' => ', doc.data());
});
```

### 7.3 Test Realtime Database

```javascript
// Test real-time updates
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from './src/services/firebase';

const chatsRef = ref(realtimeDb, 'chats');
onValue(chatsRef, (snapshot) => {
  const data = snapshot.val();
  console.log('Chats updated:', data);
});
```

## Step 8: Production Checklist

Before going to production:

- [ ] Enable App Check for additional security
- [ ] Set up Firebase Analytics
- [ ] Configure Firebase Performance Monitoring
- [ ] Set up error reporting (Crashlytics)
- [ ] Enable backup for Firestore
- [ ] Set up monitoring alerts
- [ ] Review and tighten security rules
- [ ] Enable authentication rate limiting
- [ ] Set up custom domain (optional)
- [ ] Configure CORS for your domain

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check security rules
   - Verify user authentication
   - Check custom claims (roles)

2. **CORS Errors**
   - Add your domain to Firebase authorized domains
   - Check Storage CORS configuration

3. **Real-time Updates Not Working**
   - Check Realtime Database rules
   - Verify database URL in config
   - Check network connectivity

4. **Authentication Failures**
   - Verify API keys
   - Check authorized domains
   - Review auth provider settings

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Status](https://status.firebase.google.com)
- [Stack Overflow Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase YouTube Channel](https://www.youtube.com/firebase)

---

Last Updated: January 2025
Guide Version: 1.0.0