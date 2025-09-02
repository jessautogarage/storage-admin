import { db } from './firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';

const cleanupListings = async () => {
  console.log('🧹 Starting cleanup - keeping only "dfgbnchnfbfgnfgnfgnfgbn"...');
  
  try {
    // Get all listings
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
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
    
    console.log(`\n📊 Cleanup Plan:`);
    console.log(`   To delete: ${toDelete.length} listings`);
    console.log(`   To keep: ${toKeep.length} listings`);
    
    // Use batch delete for better performance and error handling
    if (toDelete.length > 0) {
      console.log('\n🗑️  Starting batch delete...');
      
      // Firebase batch has a limit of 500 operations
      const batchSize = 500;
      let deleted = 0;
      
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = writeBatch(db);
        const currentBatch = toDelete.slice(i, i + batchSize);
        
        currentBatch.forEach(listing => {
          const docRef = doc(db, 'listings', listing.id);
          batch.delete(docRef);
        });
        
        try {
          await batch.commit();
          deleted += currentBatch.length;
          console.log(`   Deleted batch: ${deleted}/${toDelete.length} listings`);
        } catch (batchError) {
          console.error(`   ❌ Batch delete failed:`, batchError.message);
          
          // Try deleting individually if batch fails
          console.log('   Attempting individual deletes...');
          for (const listing of currentBatch) {
            try {
              await deleteDoc(doc(db, 'listings', listing.id));
              deleted++;
              console.log(`   ✅ Deleted: ${listing.title}`);
            } catch (individualError) {
              console.error(`   ❌ Failed to delete ${listing.title}:`, individualError.message);
            }
          }
        }
      }
      
      console.log(`\n✅ Cleanup Complete:`);
      console.log(`   Deleted: ${deleted} listings`);
      console.log(`   Kept: ${toKeep.length} listings`);
      console.log(`   Total processed: ${snapshot.size} listings`);
      
      return { 
        success: true, 
        deleted, 
        kept: toKeep.length, 
        total: snapshot.size,
        keptListings: toKeep 
      };
    } else {
      console.log('\n✅ No listings to delete');
      return { 
        success: true, 
        deleted: 0, 
        kept: toKeep.length, 
        total: snapshot.size,
        keptListings: toKeep 
      };
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return { success: false, error: error.message };
  }
};

export default cleanupListings;