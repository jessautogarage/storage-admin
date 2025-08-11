# 🔧 Correct Firebase Setup: storagemarket-1ba43

## ✅ Project Configuration Corrected

Your admin panel is now configured to connect to the **correct Firebase project**: `storagemarket-1ba43`

### **Firebase Project Details:**
- **Project ID**: `storagemarket-1ba43`
- **Project Number**: `571923244797`
- **Storage Bucket**: `storagemarket-1ba43.firebasestorage.app`
- **Region**: `asia-southeast1`

## 🚀 Setup Steps

### Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **storagemarket-1ba43** project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. **Rename it to `serviceAccountKey.json`**
7. **Place it in `/mnt/c/laragon/www/lockifyhub/serviceAccountKey.json`**

**⚠️ Important**: Make sure the service account key is for `storagemarket-1ba43` project!

### Step 2: Verify Configuration

The `.env` file has been updated with the correct configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSyBF5nSAbFGIWoIFR2lGjVP22ZakNQZ82xs
VITE_FIREBASE_AUTH_DOMAIN=storagemarket-1ba43.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=storagemarket-1ba43
VITE_FIREBASE_STORAGE_BUCKET=storagemarket-1ba43.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=571923244797
VITE_FIREBASE_APP_ID=1:571923244797:web:8a42737a281e25699a8094
VITE_FIREBASE_DATABASE_URL=https://storagemarket-1ba43-default-rtdb.asia-southeast1.firebasedatabase.app
```

### Step 3: Create Admin User

```bash
# Navigate to admin panel directory
cd /mnt/c/laragon/www/lockifyhub

# Install required dependencies
npm install firebase-admin readline

# Create admin user
node setup-admin.js create
```

**Follow the prompts:**
- Enter admin email
- Enter password (min 6 characters)  
- Enter full name

### Step 4: Test Authentication

```bash
# Start admin panel
npm run dev

# Open browser and go to:
http://localhost:5173/admin

# Login with your admin credentials
```

## 🔍 Verification Checklist

After setup, verify these work:

### ✅ Authentication Test
- [ ] Admin can login at `/admin`
- [ ] Regular users see "Access Denied"
- [ ] Dashboard loads correctly

### ✅ Data Integration Test  
- [ ] Admin panel shows existing users from Flutter app
- [ ] Admin can view listings created in Flutter
- [ ] Admin can see bookings made in Flutter
- [ ] Changes made in admin sync to Flutter app

### ✅ Admin Functions Test
- [ ] User management works
- [ ] Listing management works  
- [ ] Booking management works
- [ ] All CRUD operations function properly

## 🚨 Troubleshooting

### Error: "Wrong project!"
**Solution**: Download service account key for `storagemarket-1ba43` project

### Error: "Permission denied"
**Solution**: User needs admin custom claims:
```bash
node setup-admin.js create
```

### Error: "Firebase: Error (auth/user-not-found)"
**Solution**: Create user in Firebase Auth first:
```bash
node setup-admin.js create
```

### Admin panel shows no data
**Cause**: No existing data in Firestore
**Solution**: 
1. Create test data in Flutter app first
2. OR run data migration if you have existing data

## 📊 Expected Data Structure

Your admin panel will now connect to the same Firestore database as your Flutter app:

```
storagemarket-1ba43 (Firebase Project)
├── Authentication
│   ├── Users (with custom claims for admin)
│   └── Admin users (admin: true)
├── Firestore Database
│   ├── users/ (from Flutter app + admin panel)
│   ├── listings/ (from Flutter app)  
│   ├── bookings/ (from Flutter app)
│   └── reviews/ (from Flutter app)
└── Storage
    ├── user-profiles/
    ├── listings/
    └── payment-proofs/
```

## 🎯 Next Steps

1. **Complete Setup** (follow steps above)
2. **Test Integration** (verify data sync)
3. **Create Backup Admin** (multiple admin users)
4. **Deploy Security Rules** (if needed)
5. **Monitor Usage** (check Firebase Console)

## 📞 Support Commands

```bash
# Create admin user
node setup-admin.js create

# List all admin users
node setup-admin.js list

# Remove admin privileges  
node setup-admin.js remove

# Start admin panel
npm run dev

# Check Firebase project
firebase projects:list
```

## 🔐 Security Notes

- **Service Account Key**: Keep `serviceAccountKey.json` secure and never commit to git
- **Admin Access**: Only trusted users should have admin privileges
- **Environment Variables**: `.env` file contains sensitive data
- **Production**: Use separate dev/prod Firebase projects

Your admin panel is now correctly configured to work with your Flutter app's Firebase project! 🎉

Both applications will share the same user base, listings, and bookings data in real-time.