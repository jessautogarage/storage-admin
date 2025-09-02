import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';

/**
 * Force cleanup utility that aggressively deletes ALL listings except one specified title
 * This bypasses user permissions and deletes everything in the listings collection
 */
const forceCleanupListings = async (options = {}) => {
  const { keepTitle = 'dfgbnchnfbfgnfgnfgnfgbn', dryRun = false } = options;
  
  console.log('🚨 FORCE CLEANUP INITIATED 🚨');
  console.log(`   Target: Keep only "${keepTitle}"`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no actual deletion)' : 'LIVE DELETION'}`);
  console.log('   Scope: ALL listings in database');
  
  try {
    // Ensure we're online and connected
    await enableNetwork(db);
    console.log('✅ Firebase connection enabled');
    
    // Get ALL listings from the database
    console.log('\n📋 Fetching all listings from database...');
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
    if (snapshot.empty) {
      console.log('📭 No listings found in database');
      return {
        success: true,
        found: 0,
        toDelete: 0,
        toKeep: 0,
        deleted: 0,
        failed: 0,
        keptListings: [],
        deletedListings: [],
        failedListings: []
      };
    }
    
    console.log(`📊 Found ${snapshot.size} total listings in database`);
    
    let toDelete = [];
    let toKeep = [];
    
    // Categorize all listings
    console.log('\n🔍 Analyzing all listings...');
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const listingInfo = {
        id: docSnapshot.id,
        title: data.title || 'Untitled',
        hostId: data.hostId || 'No hostId',
        status: data.status || 'No status',
        price: data.pricing?.daily || data.pricing?.monthly || 0,
        location: data.location?.city || 'Unknown location'
      };
      
      // Check if this is the listing to keep
      if (data.title === keepTitle) {
        console.log(`✅ KEEPING: "${listingInfo.title}" (ID: ${listingInfo.id})`);
        console.log(`   Host: ${listingInfo.hostId}`);
        console.log(`   Status: ${listingInfo.status}`);
        console.log(`   Location: ${listingInfo.location}`);
        toKeep.push(listingInfo);
      } else {
        console.log(`🗑️  DELETING: "${listingInfo.title}" (ID: ${listingInfo.id})`);
        console.log(`   Host: ${listingInfo.hostId}`);
        console.log(`   Status: ${listingInfo.status}`);
        console.log(`   Price: ₱${listingInfo.price}`);
        console.log(`   Location: ${listingInfo.location}`);
        toDelete.push(listingInfo);
      }
    }
    
    console.log(`\n📊 CLEANUP PLAN:`);
    console.log(`   Total listings found: ${snapshot.size}`);
    console.log(`   Listings to delete: ${toDelete.length}`);
    console.log(`   Listings to keep: ${toKeep.length}`);
    
    // If dry run, just return the analysis
    if (dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No actual deletion performed');
      return {
        success: true,
        found: snapshot.size,
        toDelete: toDelete.length,
        toKeep: toKeep.length,
        deleted: 0,
        failed: 0,
        keptListings: toKeep,
        deletedListings: [],
        failedListings: []
      };
    }
    
    // Proceed with actual deletion
    if (toDelete.length === 0) {
      console.log('\n✅ No listings to delete');
      return {
        success: true,
        found: snapshot.size,
        toDelete: 0,
        toKeep: toKeep.length,
        deleted: 0,
        failed: 0,
        keptListings: toKeep,
        deletedListings: [],
        failedListings: []
      };
    }
    
    console.log(`\n🚨 BEGINNING FORCE DELETION OF ${toDelete.length} LISTINGS...`);
    
    let deleted = 0;
    let failed = 0;
    let deletedListings = [];
    let failedListings = [];
    
    // Try batch deletion first for performance
    try {
      console.log('\n🔄 Attempting batch deletion...');
      const batchSize = 500; // Firebase batch limit
      
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = writeBatch(db);
        const currentBatch = toDelete.slice(i, i + batchSize);
        
        console.log(`   📦 Preparing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(toDelete.length/batchSize)} (${currentBatch.length} items)`);
        
        currentBatch.forEach(listing => {
          const docRef = doc(db, 'listings', listing.id);
          batch.delete(docRef);
        });
        
        try {
          await batch.commit();
          deleted += currentBatch.length;
          deletedListings.push(...currentBatch);
          console.log(`   ✅ Batch deleted: ${deleted}/${toDelete.length} listings`);
        } catch (batchError) {
          console.error(`   ❌ Batch failed:`, batchError.message);
          console.log('   🔄 Falling back to individual deletion...');
          
          // If batch fails, try individual deletions
          for (const listing of currentBatch) {
            try {
              await deleteDoc(doc(db, 'listings', listing.id));
              deleted++;
              deletedListings.push(listing);
              console.log(`   ✅ Individual delete: ${listing.title} (${deleted}/${toDelete.length})`);
            } catch (individualError) {
              failed++;
              failedListings.push({
                ...listing,
                error: individualError.message
              });
              console.error(`   ❌ Failed: ${listing.title} - ${individualError.message}`);
            }
          }
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < toDelete.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (overallError) {
      console.error('❌ Batch deletion failed entirely:', overallError.message);
      console.log('🔄 Falling back to individual deletions...');
      
      // If all batch operations fail, do individual deletions
      for (const listing of toDelete) {
        try {
          await deleteDoc(doc(db, 'listings', listing.id));
          deleted++;
          deletedListings.push(listing);
          console.log(`   ✅ Individual delete: ${listing.title} (${deleted}/${toDelete.length})`);
        } catch (individualError) {
          failed++;
          failedListings.push({
            ...listing,
            error: individualError.message
          });
          console.error(`   ❌ Failed: ${listing.title} - ${individualError.message}`);
        }
      }
    }
    
    // Final verification - check what's left in the database
    console.log('\n🔍 Verification: Checking remaining listings...');
    const verificationSnapshot = await getDocs(listingsRef);
    console.log(`📊 Listings remaining in database: ${verificationSnapshot.size}`);
    
    verificationSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      console.log(`   📋 Remaining: "${data.title}" (ID: ${docSnapshot.id})`);
    });
    
    console.log('\n✅ FORCE CLEANUP COMPLETE!');
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   Total found: ${snapshot.size}`);
    console.log(`   Successfully deleted: ${deleted}`);
    console.log(`   Failed to delete: ${failed}`);
    console.log(`   Kept: ${toKeep.length}`);
    console.log(`   Remaining in database: ${verificationSnapshot.size}`);
    
    if (failedListings.length > 0) {
      console.log('\n❌ FAILED DELETIONS:');
      failedListings.forEach(listing => {
        console.log(`   - ${listing.title}: ${listing.error}`);
      });
    }
    
    return {
      success: true,
      found: snapshot.size,
      toDelete: toDelete.length,
      toKeep: toKeep.length,
      deleted,
      failed,
      remaining: verificationSnapshot.size,
      keptListings: toKeep,
      deletedListings,
      failedListings
    };
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR during force cleanup:', error);
    return {
      success: false,
      error: error.message,
      found: 0,
      toDelete: 0,
      toKeep: 0,
      deleted: 0,
      failed: 0,
      keptListings: [],
      deletedListings: [],
      failedListings: []
    };
  }
};

export default forceCleanupListings;