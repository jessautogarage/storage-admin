import { db, auth } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

/**
 * NUCLEAR OPTION: Complete collection reset
 * This will:
 * 1. Get ALL documents in the listings collection
 * 2. Delete EVERYTHING
 * 3. Re-create only the one listing we want to keep
 */
const nuclearCleanup = async () => {
  console.log('☢️ NUCLEAR CLEANUP INITIATED ☢️');
  console.log('This will COMPLETELY RESET the listings collection');
  
  try {
    // Step 1: Get ALL listings
    console.log('\n📋 Getting ALL listings...');
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
    console.log(`Found ${snapshot.size} listings total`);
    
    // Step 2: Find the listing to keep
    let keepListing = null;
    const allListings = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const listing = { id: docSnap.id, ...data };
      allListings.push(listing);
      
      if (data.title === 'dfgbnchnfbfgnfgnfgnfgbn') {
        keepListing = listing;
        console.log(`✅ Found listing to keep: ${data.title} (ID: ${docSnap.id})`);
      }
    });
    
    // Step 3: Delete EVERYTHING using batches
    console.log('\n🗑️ Deleting ALL listings...');
    const batchSize = 500;
    let totalDeleted = 0;
    
    for (let i = 0; i < allListings.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchItems = allListings.slice(i, Math.min(i + batchSize, allListings.length));
      
      batchItems.forEach(listing => {
        const docRef = doc(db, 'listings', listing.id);
        batch.delete(docRef);
      });
      
      try {
        await batch.commit();
        totalDeleted += batchItems.length;
        console.log(`   Deleted batch: ${totalDeleted}/${allListings.length}`);
      } catch (error) {
        console.error('Batch delete failed, trying individual deletes...');
        
        // Fallback to individual deletes
        for (const listing of batchItems) {
          try {
            await deleteDoc(doc(db, 'listings', listing.id));
            totalDeleted++;
            console.log(`   Deleted: ${listing.title || 'Untitled'} (${listing.id})`);
          } catch (err) {
            console.error(`   Failed to delete ${listing.id}:`, err.message);
          }
        }
      }
    }
    
    console.log(`\n✅ Deleted ${totalDeleted} listings`);
    
    // Step 4: Re-create the keeper listing if it existed
    if (keepListing) {
      console.log('\n📝 Re-creating the keeper listing...');
      
      // Remove the id from the data before setting
      const { id, ...listingData } = keepListing;
      
      // Ensure it has all required fields
      const finalData = {
        ...listingData,
        title: 'dfgbnchnfbfgnfgnfgnfgbn',
        status: 'available',
        hostId: auth.currentUser?.uid || listingData.hostId,
        createdAt: listingData.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'listings', id), finalData);
      console.log(`✅ Re-created listing: ${finalData.title} (ID: ${id})`);
    }
    
    // Step 5: Verify the final state
    console.log('\n🔍 Verifying final state...');
    const finalSnapshot = await getDocs(listingsRef);
    console.log(`📊 Final listing count: ${finalSnapshot.size}`);
    
    if (finalSnapshot.size === 1) {
      console.log('✅ SUCCESS: Only one listing remains');
    } else if (finalSnapshot.size === 0) {
      console.log('⚠️ WARNING: No listings remain (keeper not found)');
    } else {
      console.log('⚠️ WARNING: Multiple listings still exist');
      finalSnapshot.forEach(doc => {
        console.log(`   - ${doc.data().title} (ID: ${doc.id})`);
      });
    }
    
    return {
      success: true,
      deleted: totalDeleted,
      kept: keepListing ? 1 : 0,
      finalCount: finalSnapshot.size
    };
    
  } catch (error) {
    console.error('☠️ NUCLEAR CLEANUP FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default nuclearCleanup;