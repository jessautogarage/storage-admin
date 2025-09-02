// ADMIN CLEANUP SCRIPT - RUN THIS DIRECTLY WITH NODE
// This uses Firebase Admin SDK to bypass ALL security rules

const admin = require('firebase-admin');

// Initialize admin with your service account
// You need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://storagemarket-1ba43.firebaseio.com"
});

const db = admin.firestore();

async function adminCleanup() {
  console.log('🔥 ADMIN CLEANUP - BYPASSING ALL SECURITY RULES 🔥');
  
  try {
    // Get ALL listings
    const listingsRef = db.collection('listings');
    const snapshot = await listingsRef.get();
    
    console.log(`Found ${snapshot.size} listings total`);
    
    let toKeep = null;
    let deleteCount = 0;
    
    // Process each listing
    const deletePromises = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.title === 'dfgbnchnfbfgnfgnfgnfgbn') {
        console.log(`✅ Keeping: ${data.title} (ID: ${doc.id})`);
        toKeep = { id: doc.id, data: data };
      } else {
        console.log(`🗑️ Deleting: ${data.title || 'Untitled'} (ID: ${doc.id})`);
        deletePromises.push(doc.ref.delete());
        deleteCount++;
      }
    });
    
    // Delete all at once
    if (deletePromises.length > 0) {
      console.log(`\n⏳ Deleting ${deleteCount} listings...`);
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${deleteCount} listings`);
    }
    
    // Verify final state
    const finalSnapshot = await listingsRef.get();
    console.log(`\n📊 Final state: ${finalSnapshot.size} listings remaining`);
    
    if (finalSnapshot.size === 1) {
      console.log('✅ SUCCESS: Only one listing remains');
    } else if (finalSnapshot.size === 0) {
      console.log('⚠️ No listings remain (keeper not found)');
    } else {
      console.log('⚠️ Multiple listings still exist:');
      finalSnapshot.forEach(doc => {
        console.log(`   - ${doc.data().title} (ID: ${doc.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Admin cleanup failed:', error);
  }
  
  process.exit();
}

// Run the cleanup
adminCleanup();