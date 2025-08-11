# LockifyHub Admin Setup Guide

## 🚀 Quick Start - Create Your First Admin Account

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Navigate to Admin Setup
Open your browser and go to:
```
http://localhost:5173/admin-setup
```

### Step 3: Create Admin Account
Use the following credentials:

**Setup Key (REQUIRED):** `LOCKIFYHUB-ADMIN-2025-SETUP`

Fill in the form with:
- Full Name: Your name
- Email: admin@lockifyhub.com (or your email)
- Phone: Optional
- Password: At least 6 characters
- Confirm Password: Same as password

### Step 4: Login as Admin
After successful creation, you'll be redirected to the admin login page.
Login with your email and password.

## 📋 System Overview

### User Types in LockifyHub

1. **Admin** - Full system access
   - Manage all users, listings, bookings
   - View analytics and reports
   - Approve/reject listings
   - Handle disputes
   - Process payouts

2. **Host** - Storage space providers
   - Create and manage listings
   - View bookings for their spaces
   - Manage availability
   - Track earnings
   - Communicate with clients

3. **Client** - Storage space renters
   - Browse available spaces
   - Make bookings
   - Leave reviews
   - Manage payments
   - Message hosts

## 🔐 Security Features

### Authentication System
- Firebase Authentication with custom claims
- Role-based access control (RBAC)
- Protected routes for each user type
- Secure token management

### Firestore Security Rules
- Document-level security
- User type verification
- Admin-only collections
- Host/Client specific permissions

## 📱 Admin Dashboard Features

### 1. User Management
- View all users (hosts and clients)
- Verify user accounts
- Suspend/activate accounts
- View user activity

### 2. Listing Management
- Approve/reject new listings
- Feature listings
- Monitor listing quality
- Handle reported listings

### 3. Booking Management
- View all bookings
- Handle cancellations
- Process refunds
- Resolve booking disputes

### 4. Payment & Payouts
- Track all transactions
- Process host payouts
- Monitor platform fees (9%)
- Generate financial reports

### 5. Analytics Dashboard
- Revenue metrics
- User growth statistics
- Booking trends
- Geographic distribution
- Predictive analytics

### 6. Support System
- Live chat support
- Dispute resolution
- Review moderation
- System announcements

## 🛠️ Technical Implementation

### Frontend Stack
- React 18 with Vite
- Tailwind CSS for styling
- React Router v6 for navigation
- Recharts for analytics
- Lucide React for icons

### Backend Services
- Firebase Firestore for database
- Firebase Storage for images
- Firebase Auth for authentication
- Firebase Realtime DB for chat

### Key Files Modified
1. **Removed firebase-admin** - Security fix
2. **Created AdminSetup.jsx** - Client-side admin creation
3. **Updated firebaseConfig.js** - Added Firestore & Storage
4. **Fixed duplicate routes** - Cleaned up App.jsx
5. **Completed AddListing** - Full Firebase integration

## 📊 Database Structure

### Users Collection
```javascript
{
  email: string,
  name: string,
  phone: string,
  userType: 'admin' | 'host' | 'client',
  type: 'admin' | 'host' | 'client',
  role: 'admin' | 'moderator' | 'support',
  status: 'verified' | 'pending' | 'suspended',
  verified: boolean,
  createdAt: timestamp,
  permissions: array
}
```

### Listings Collection
```javascript
{
  hostId: string,
  title: string,
  description: string,
  location: object,
  pricePerMonth: number,
  size: number,
  storageType: string,
  features: array,
  images: array,
  status: 'pending' | 'approved' | 'rejected',
  available: boolean
}
```

### Bookings Collection
```javascript
{
  listingId: string,
  clientId: string,
  hostId: string,
  startDate: timestamp,
  endDate: timestamp,
  amount: number,
  status: string,
  paymentStatus: string
}
```

## 🚨 Important Security Notes

1. **Change the Setup Key** after creating the first admin
2. **Never commit .env files** with Firebase credentials
3. **Enable Firebase App Check** in production
4. **Set up Cloud Functions** for sensitive operations
5. **Configure Firebase Security Rules** properly

## 🔧 Troubleshooting

### Issue: Cannot create admin account
- Check Firebase project configuration
- Verify Firestore is enabled
- Check browser console for errors
- Ensure setup key is correct

### Issue: Login fails after creation
- Clear browser cache
- Check Firebase Auth settings
- Verify user document was created in Firestore
- Check custom claims in Firebase Console

### Issue: Missing permissions
- Verify userType is set to 'admin'
- Check Firestore security rules
- Ensure permissions array is populated
- Force token refresh after role change

## 📝 Next Steps

1. **Deploy Security Rules**
```bash
firebase deploy --only firestore:rules
```

2. **Set up Cloud Functions**
```bash
firebase init functions
```

3. **Configure Environment Variables**
Create `.env` file with your Firebase config

4. **Test All User Flows**
- Create test host and client accounts
- Test listing creation and booking
- Verify payment flows

5. **Production Deployment**
- Enable Firebase App Check
- Set up monitoring
- Configure backup strategies
- Implement rate limiting

## 📞 Support

For issues or questions:
1. Check Firebase Console logs
2. Review browser console errors
3. Verify Firestore data structure
4. Check security rules execution

---

**Created**: January 2025
**Version**: 2.0.0
**Status**: Production Ready (after security fixes)