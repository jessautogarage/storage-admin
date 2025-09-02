import { db, auth } from './firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';

const cleanupListingsOwned = async () => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No user logged in');
    return { success: false, error: 'You must be logged in to delete listings' };
  }

  console.log(`🧹 Starting cleanup for user: ${currentUser.email} (${currentUser.uid})`);
  console.log('📋 Keeping only "dfgbnchnfbfgnfgnfgnfgbn"...');
  
  try {
    // Get all listings owned by current user
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('hostId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} listings owned by you`);
    
    let toDelete = [];
    let toKeep = [];
    
    // First, categorize all listings
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Check if this is the listing to keep
      if (data.title === 'dfgbnchnfbfgnfgnfgnfgbn') {
        console.log(`✅ Will keep listing: ${data.title} (ID: ${docSnapshot.id})`);
        toKeep.push({ id: docSnapshot.id, title: data.title });
      } else {
        console.log(`📋 Will delete listing: ${data.title || 'Untitled'} (ID: ${docSnapshot.id})`);
        toDelete.push({ id: docSnapshot.id, title: data.title || 'Untitled' });
      }
    }
    
    // Also check for listings without hostId but created by this user
    const allListingsSnapshot = await getDocs(listingsRef);
    for (const docSnapshot of allListingsSnapshot.docs) {
      const data = docSnapshot.data();
      
      // Skip if already processed
      if (toDelete.find(l => l.id === docSnapshot.id) || toKeep.find(l => l.id === docSnapshot.id)) {
        continue;
      }
      
      // Check if user created this listing (might not have hostId)
      if (data.userId === currentUser.uid || data.createdBy === currentUser.uid) {
        if (data.title === 'dfgbnchnfbfgnfgnfgnfgbn') {
          console.log(`✅ Will keep listing (no hostId): ${data.title} (ID: ${docSnapshot.id})`);
          toKeep.push({ id: docSnapshot.id, title: data.title });
        } else {
          console.log(`📋 Will delete listing (no hostId): ${data.title || 'Untitled'} (ID: ${docSnapshot.id})`);
          toDelete.push({ id: docSnapshot.id, title: data.title || 'Untitled' });
        }
      }
    }
    
    console.log(`\n📊 Cleanup Plan:`);
    console.log(`   To delete: ${toDelete.length} listings`);
    console.log(`   To keep: ${toKeep.length} listings`);
    
    // Delete listings one by one
    if (toDelete.length > 0) {
      console.log('\n🗑️  Starting delete...');
      let deleted = 0;
      let failed = 0;
      
      for (const listing of toDelete) {
        try {
          await deleteDoc(doc(db, 'listings', listing.id));
          deleted++;
          console.log(`   ✅ Deleted: ${listing.title} (${deleted}/${toDelete.length})`);
        } catch (deleteError) {
          failed++;
          console.error(`   ❌ Failed to delete ${listing.title}:`, deleteError.message);
        }
      }
      
      console.log(`\n✅ Cleanup Complete:`);
      console.log(`   Deleted: ${deleted} listings`);
      console.log(`   Failed: ${failed} listings`);
      console.log(`   Kept: ${toKeep.length} listings`);
      
      return { 
        success: true, 
        deleted, 
        failed,
        kept: toKeep.length, 
        total: toDelete.length + toKeep.length,
        keptListings: toKeep 
      };
    } else {
      console.log('\n✅ No listings to delete');
      return { 
        success: true, 
        deleted: 0, 
        failed: 0,
        kept: toKeep.length, 
        total: toKeep.length,
        keptListings: toKeep 
      };
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return { success: false, error: error.message };
  }
};

export default cleanupListingsOwned;