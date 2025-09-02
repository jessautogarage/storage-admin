import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const fixListingPricing = async () => {
  console.log('🔧 Fixing listing pricing structure...');
  
  try {
    // Get all listings
    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);
    
    let updated = 0;
    let skipped = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Check if pricing structure exists and is correct
      if (!data.pricing || !data.pricing.daily) {
        console.log(`📝 Updating listing: ${data.title || docSnapshot.id}`);
        
        // Calculate pricing based on any existing price field or use defaults
        const basePrice = 
          data.pricePerDay || 
          data.price || 
          data.pricing?.monthly / 30 || 
          100; // Default to 100 if no price found
        
        const updatedData = {
          pricing: {
            daily: basePrice,
            weekly: basePrice * 7 * 0.85, // 15% discount
            monthly: basePrice * 30 * 0.75 // 25% discount
          }
        };
        
        // Update the document
        await updateDoc(doc(db, 'listings', docSnapshot.id), updatedData);
        updated++;
        console.log(`✅ Updated pricing for ${data.title}: ₱${basePrice}/day`);
      } else {
        skipped++;
        console.log(`⏭️  Skipped ${data.title} - already has pricing structure`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} listings`);
    console.log(`   Skipped: ${skipped} listings`);
    console.log(`   Total: ${snapshot.size} listings`);
    
    return { success: true, updated, skipped, total: snapshot.size };
  } catch (error) {
    console.error('❌ Error fixing listings:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in other files
export default fixListingPricing;