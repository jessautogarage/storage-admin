# CRITICAL SECURITY FIX - Remove firebase-admin from Frontend

## Step 1: Remove firebase-admin package
```bash
npm uninstall firebase-admin
```

## Step 2: Initialize Cloud Functions
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Initialize functions
firebase init functions

# Choose JavaScript
# Install dependencies
```

## Step 3: Create Cloud Functions Directory Structure
```
lockifyhub/
├── functions/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── userManagement.js
│   │   │   ├── claims.js
│   │   │   └── index.js
│   │   ├── triggers/
│   │   │   ├── bookings.js
│   │   │   ├── payments.js
│   │   │   └── notifications.js
│   │   └── index.js
│   ├── package.json
│   └── .env
```

## Step 4: Implement Admin Functions
Create `functions/src/admin/userManagement.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Set admin claim
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can grant admin access.'
    );
  }

  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(data.uid, {
      admin: true,
      role: data.role || 'admin'
    });

    // Update user document
    await admin.firestore().collection('users').doc(data.uid).update({
      role: data.role || 'admin',
      userType: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    });

    return { success: true, message: 'Admin privileges granted successfully' };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Remove admin claim
exports.removeAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can revoke admin access.'
    );
  }

  try {
    await admin.auth().setCustomUserClaims(data.uid, {
      admin: false,
      role: 'user'
    });

    await admin.firestore().collection('users').doc(data.uid).update({
      role: 'user',
      userType: 'client',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    });

    return { success: true, message: 'Admin privileges revoked successfully' };
  } catch (error) {
    console.error('Error removing admin claim:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create initial admin user (one-time setup)
exports.createInitialAdmin = functions.https.onRequest(async (req, res) => {
  // This should be protected by a secret key
  const secretKey = req.headers['x-setup-key'];
  
  if (secretKey !== functions.config().setup.key) {
    return res.status(403).json({ error: 'Invalid setup key' });
  }

  const { email, password } = req.body;

  try {
    // Create user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });

    // Set admin claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'super_admin'
    });

    // Create user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      role: 'super_admin',
      userType: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name: 'Super Admin',
      verified: true
    });

    res.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating initial admin:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Step 5: Update Frontend to Use Cloud Functions

Create `src/services/adminService.js`:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebaseConfig';

const functions = getFunctions(app);

export const adminService = {
  // Set admin privileges
  async grantAdminAccess(userId, role = 'admin') {
    const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
    try {
      const result = await setAdminClaim({ uid: userId, role });
      return result.data;
    } catch (error) {
      console.error('Error granting admin access:', error);
      throw error;
    }
  },

  // Remove admin privileges
  async revokeAdminAccess(userId) {
    const removeAdminClaim = httpsCallable(functions, 'removeAdminClaim');
    try {
      const result = await removeAdminClaim({ uid: userId });
      return result.data;
    } catch (error) {
      console.error('Error revoking admin access:', error);
      throw error;
    }
  },

  // Verify admin status
  async verifyAdminStatus(user) {
    if (!user) return false;
    
    // Force token refresh to get latest claims
    const idTokenResult = await user.getIdTokenResult(true);
    return idTokenResult.claims.admin === true;
  }
};
```

## Step 6: Deploy Functions

```bash
# Set environment variables
firebase functions:config:set setup.key="your-secret-key-here"

# Deploy functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:setAdminClaim
```

## Step 7: Update Environment Variables

Remove any firebase-admin related environment variables from `.env`:

```env
# Remove these if present:
# FIREBASE_SERVICE_ACCOUNT_KEY=...
# FIREBASE_ADMIN_SDK=...
```

## Step 8: Test Admin Functions

```javascript
// In your React component
import { adminService } from '../services/adminService';

const handleGrantAdmin = async (userId) => {
  try {
    const result = await adminService.grantAdminAccess(userId, 'admin');
    console.log('Admin access granted:', result);
  } catch (error) {
    console.error('Failed to grant admin access:', error);
  }
};
```

## Security Checklist

- [ ] firebase-admin removed from package.json
- [ ] No service account keys in frontend code
- [ ] Cloud Functions deployed with proper authentication
- [ ] Admin operations only accessible via Cloud Functions
- [ ] Setup key configured for initial admin creation
- [ ] All admin checks use token claims, not database fields
- [ ] Frontend updated to use Cloud Functions for admin operations