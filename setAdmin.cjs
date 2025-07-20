// setAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with actual UID from Firebase Auth > Users
const uid = 'wHI9M2ucPUPhsrzCceluLNMMUP13';

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin role set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to set custom claims:', error);
    process.exit(1);
  });
