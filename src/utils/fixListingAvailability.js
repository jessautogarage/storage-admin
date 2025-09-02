import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const fixListingAvailability = async (listingId) => {
  try {
    // Generate available dates for the next 90 days
    const availableDates = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      availableDates.push(dateStr);
    }
    
    // Update the listing with availability data
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
      availability: {
        isEnabled: true,
        availableDates: availableDates,
        blackoutDates: [],
        instantBook: true,
        minStay: 1,
        maxStay: 30
      },
      bookedDates: [],
      updatedAt: new Date()
    });
    
    console.log(`✅ Fixed availability for listing ${listingId}`);
    console.log(`Added ${availableDates.length} available dates`);
    return { success: true, availableDates };
  } catch (error) {
    console.error('Error fixing listing availability:', error);
    return { success: false, error: error.message };
  }
};

// Auto-fix common test listing
if (typeof window !== 'undefined') {
  window.fixListingAvailability = fixListingAvailability;
}