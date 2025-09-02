import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

class ListingService {
  constructor() {
    this.collection = collection(db, 'listings');
  }

  // Create a new listing
  async createListing(listingData, userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to create a listing');
      }

      // Validate required fields
      this.validateListingData(listingData);

      const newListing = {
        ...listingData,
        hostId: userId,
        status: listingData.status || 'active',
        visibility: listingData.visibility !== undefined ? listingData.visibility : 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        reviewCount: 0,
        totalBookings: 0,
        featured: false,
        verified: false,
        views: 0,
        bookings: [],
        // Ensure pricing is properly structured
        pricing: {
          daily: parseFloat(listingData.pricing?.daily || listingData.pricePerDay || 100),
          weekly: parseFloat(listingData.pricing?.daily || listingData.pricePerDay || 100) * 7 * 0.85, // 15% discount
          monthly: parseFloat(listingData.pricing?.daily || listingData.pricePerDay || 100) * 30 * 0.75, // 25% discount
        },
        // Ensure location is properly structured
        location: {
          address: listingData.location?.address || listingData.address,
          city: listingData.location?.city || listingData.city,
          state: listingData.location?.state || listingData.state,
          zipCode: listingData.location?.zipCode || listingData.zipCode,
          coordinates: listingData.location?.coordinates || null,
        },
        // Ensure images are properly formatted
        images: Array.isArray(listingData.images) ? listingData.images : [],
        // Ensure features are properly formatted
        features: Array.isArray(listingData.features) ? listingData.features : [],
        // Storage specific fields - handle both object and number formats
        size: listingData.size?.value ? listingData.size : (
          typeof listingData.size === 'number' ? {
            value: listingData.size,
            unit: 'sqm'
          } : {
            value: parseFloat(listingData.size) || 0,
            unit: 'sqm'
          }
        ),
        type: listingData.type || listingData.storageType,
        // Date availability system - merge with provided availability
        availability: {
          isEnabled: true,
          availableDates: listingData.availability?.availableDates || [],
          blackoutDates: listingData.availability?.blackoutDates || [],
          minBookingDays: listingData.availability?.minBookingDays || 1,
          maxBookingDays: listingData.availability?.maxBookingDays || 30,
          advanceBookingDays: listingData.availability?.advanceBookingDays || 365,
          instantBook: listingData.availability?.instantBook || false,
          requireApproval: listingData.availability?.requireApproval !== false
        },
        bookedDates: [],
        
        // Additional metadata
        metadata: {
          createdBy: userId,
          version: 1,
          lastUpdated: serverTimestamp()
        }
      };

      const docRef = await addDoc(this.collection, newListing);
      
      return {
        success: true,
        id: docRef.id,
        data: { ...newListing, id: docRef.id }
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error(error.message || 'Failed to create listing');
    }
  }

  // Get listings by host ID
  async getListingsByHost(hostId) {
    try {
      const q = query(
        this.collection,
        where('hostId', '==', hostId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const listings = [];
      
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: listings
      };
    } catch (error) {
      console.error('Error fetching host listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }

  // Get all active and visible listings
  async getActiveListings(limitCount = 50) {
    try {
      const q = query(
        this.collection,
        where('status', '==', 'active'),
        where('visibility', '==', 1),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const listings = [];
      
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: listings
      };
    } catch (error) {
      console.error('Error fetching active listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }

  // Get single listing by ID
  async getListing(listingId) {
    try {
      const docRef = doc(db, 'listings', listingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        throw new Error('Listing not found');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new Error('Failed to fetch listing');
    }
  }

  // Update listing
  async updateListing(listingId, updateData, userId) {
    try {
      const docRef = doc(db, 'listings', listingId);
      
      // Verify ownership
      const listing = await this.getListing(listingId);
      if (!listing.success || listing.data.hostId !== userId) {
        throw new Error('You can only update your own listings');
      }

      // If pricePerDay is provided, update the pricing structure
      const finalUpdateData = { ...updateData };
      if (updateData.pricePerDay !== undefined) {
        const dailyPrice = parseFloat(updateData.pricePerDay);
        finalUpdateData.pricing = {
          daily: dailyPrice,
          weekly: dailyPrice * 7 * 0.85,  // 15% discount
          monthly: dailyPrice * 30 * 0.75  // 25% discount
        };
        // Keep pricePerDay for backward compatibility
        finalUpdateData.pricePerDay = dailyPrice;
      }
      
      const updatedData = {
        ...finalUpdateData,
        updatedAt: serverTimestamp(),
        'metadata.lastUpdated': serverTimestamp(),
        'metadata.version': (listing.data.metadata?.version || 1) + 1
      };

      await updateDoc(docRef, updatedData);
      
      return {
        success: true,
        data: { id: listingId, ...updatedData }
      };
    } catch (error) {
      console.error('Error updating listing:', error);
      throw new Error('Failed to update listing');
    }
  }

  // Delete listing
  async deleteListing(listingId, userId) {
    try {
      const docRef = doc(db, 'listings', listingId);
      
      // Verify ownership
      const listing = await this.getListing(listingId);
      if (!listing.success || listing.data.hostId !== userId) {
        throw new Error('You can only delete your own listings');
      }

      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Listing deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw new Error('Failed to delete listing');
    }
  }

  // Toggle listing status (active/paused)
  async toggleListingStatus(listingId, userId) {
    try {
      const listing = await this.getListing(listingId);
      if (!listing.success) throw new Error('Listing not found');
      
      if (listing.data.hostId !== userId) {
        throw new Error('You can only modify your own listings');
      }

      const newStatus = listing.data.status === 'available' ? 'unavailable' : 'available';
      
      await this.updateListing(listingId, { status: newStatus }, userId);
      
      return {
        success: true,
        newStatus,
        message: `Listing ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      };
    } catch (error) {
      console.error('Error toggling listing status:', error);
      throw new Error('Failed to update listing status');
    }
  }

  // Increment view count
  async incrementViews(listingId) {
    try {
      const docRef = doc(db, 'listings', listingId);
      const listing = await this.getListing(listingId);
      
      if (listing.success) {
        await updateDoc(docRef, {
          views: (listing.data.views || 0) + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view tracking
    }
  }

  // Search listings
  async searchListings(filters = {}) {
    try {
      let q = query(this.collection, where('status', '==', 'active'));

      // Add city filter
      if (filters.city) {
        q = query(q, where('location.city', '==', filters.city));
      }

      // Add type filter
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let listings = [];
      
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Client-side filtering for more complex criteria
      if (filters.minPrice || filters.maxPrice) {
        listings = listings.filter(listing => {
          const price = listing.pricing?.daily || 0;
          if (filters.minPrice && price < filters.minPrice) return false;
          if (filters.maxPrice && price > filters.maxPrice) return false;
          return true;
        });
      }

      if (filters.features && filters.features.length > 0) {
        listings = listings.filter(listing => {
          return filters.features.every(feature => 
            listing.features && listing.features.includes(feature)
          );
        });
      }

      // Sort by relevance or price if specified
      if (filters.sortBy) {
        listings.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price_low':
              return (a.pricing?.daily || 0) - (b.pricing?.daily || 0);
            case 'price_high':
              return (b.pricing?.daily || 0) - (a.pricing?.daily || 0);
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            default:
              return 0;
          }
        });
      }

      return {
        success: true,
        data: listings,
        total: listings.length
      };
    } catch (error) {
      console.error('Error searching listings:', error);
      throw new Error('Failed to search listings');
    }
  }

  // Validate listing data
  validateListingData(data) {
    const required = ['title', 'description', 'address', 'city', 'state', 'pricePerDay', 'size'];
    const missing = required.filter(field => {
      const value = data[field] || data.location?.[field] || data.pricing?.[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Temporarily disabled for testing
    // if (data.images && data.images.length === 0) {
    //   throw new Error('At least one image is required');
    // }

    const price = parseFloat(data.pricePerDay || data.pricing?.daily);
    if (isNaN(price) || price <= 0) {
      throw new Error('Price must be a valid number greater than 0');
    }

    // Handle both object {value, unit} and plain number formats
    const sizeValue = data.size?.value !== undefined 
      ? parseFloat(data.size.value)
      : parseFloat(data.size);
    
    if (isNaN(sizeValue) || sizeValue <= 0) {
      throw new Error('Size must be a valid number greater than 0');
    }
  }

  // Update listing availability
  async updateListingAvailability(listingId, availabilityData, userId) {
    try {
      const docRef = doc(db, 'listings', listingId);
      
      // Verify ownership
      const listing = await this.getListing(listingId);
      if (!listing.success || listing.data.hostId !== userId) {
        throw new Error('You can only update your own listings');
      }

      const updatedData = {
        availability: {
          ...listing.data.availability,
          ...availabilityData,
          lastUpdated: serverTimestamp()
        },
        updatedAt: serverTimestamp(),
        'metadata.lastUpdated': serverTimestamp(),
        'metadata.version': (listing.data.metadata?.version || 1) + 1
      };

      await updateDoc(docRef, updatedData);
      
      return {
        success: true,
        data: { id: listingId, ...updatedData }
      };
    } catch (error) {
      console.error('Error updating listing availability:', error);
      throw new Error('Failed to update availability');
    }
  }

  // Check date availability for booking
  async checkDateAvailability(listingId, startDate, endDate) {
    try {
      const listing = await this.getListing(listingId);
      if (!listing.success) {
        throw new Error('Listing not found');
      }

      const listingData = listing.data;
      const availability = listingData.availability || {};
      const availableDates = availability.availableDates || [];
      const blackoutDates = availability.blackoutDates || [];
      const bookedDates = listingData.bookedDates || [];

      // Generate date range
      const dateRange = this.getDateRange(new Date(startDate), new Date(endDate));
      
      // Check each date in range
      const unavailableDates = [];
      const conflictReasons = [];

      dateRange.forEach(dateStr => {
        if (bookedDates.includes(dateStr)) {
          unavailableDates.push(dateStr);
          conflictReasons.push({ date: dateStr, reason: 'already_booked' });
        } else if (blackoutDates.includes(dateStr)) {
          unavailableDates.push(dateStr);
          conflictReasons.push({ date: dateStr, reason: 'blackout_date' });
        } else if (!availableDates.includes(dateStr)) {
          unavailableDates.push(dateStr);
          conflictReasons.push({ date: dateStr, reason: 'not_available' });
        }
      });

      const isAvailable = unavailableDates.length === 0;
      const totalDays = dateRange.length;
      
      // Check booking duration limits
      const minDays = availability.minBookingDays || 1;
      const maxDays = availability.maxBookingDays || 30;
      
      let durationValid = true;
      let durationError = null;
      
      if (totalDays < minDays) {
        durationValid = false;
        durationError = `Minimum booking duration is ${minDays} day(s)`;
      }
      
      if (totalDays > maxDays) {
        durationValid = false;
        durationError = `Maximum booking duration is ${maxDays} days`;
      }

      return {
        success: true,
        isAvailable: isAvailable && durationValid,
        availableDatesCount: dateRange.length - unavailableDates.length,
        totalDays,
        unavailableDates,
        conflictReasons,
        durationValid,
        durationError,
        pricing: {
          dailyRate: listingData.pricing?.daily || 0,
          totalAmount: (listingData.pricing?.daily || 0) * totalDays,
          serviceFee: Math.round((listingData.pricing?.daily || 0) * totalDays * 0.05),
          totalWithFees: Math.round((listingData.pricing?.daily || 0) * totalDays * 1.05)
        }
      };
    } catch (error) {
      console.error('Error checking date availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  // Get available dates for a listing
  async getListingAvailability(listingId, monthsAhead = 3) {
    try {
      const listing = await this.getListing(listingId);
      if (!listing.success) {
        throw new Error('Listing not found');
      }

      const listingData = listing.data;
      const availability = listingData.availability || {};
      
      // If no available dates are set, generate default available dates for the next 3 months
      let availableDates = availability.availableDates || [];
      
      if (availableDates.length === 0) {
        // Generate dates for the next 3 months as available by default
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + monthsAhead);
        
        availableDates = [];
        const currentDate = new Date(today);
        
        while (currentDate <= endDate) {
          // Format date as YYYY-MM-DD
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          availableDates.push(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      // Get booked dates from bookings collection if not stored in listing
      let bookedDates = listingData.bookedDates || [];
      
      // Filter out past dates and booked dates from available dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      availableDates = availableDates.filter(dateStr => {
        return dateStr >= todayStr && !bookedDates.includes(dateStr);
      });
      
      return {
        success: true,
        availability: {
          ...availability,
          availableDates: availableDates,
          blackoutDates: availability.blackoutDates || [],
          bookedDates: bookedDates
        }
      };
    } catch (error) {
      console.error('Error getting listing availability:', error);
      throw new Error('Failed to get availability');
    }
  }

  // Utility method to generate date range
  getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  // Get host statistics
  async getHostStats(hostId) {
    try {
      const listings = await this.getListingsByHost(hostId);
      
      if (!listings.success) {
        throw new Error('Failed to fetch host listings');
      }

      const stats = {
        totalListings: listings.data.length,
        activeListings: listings.data.filter(l => l.status === 'active').length,
        pausedListings: listings.data.filter(l => l.status === 'paused').length,
        totalViews: listings.data.reduce((sum, l) => sum + (l.views || 0), 0),
        averageRating: listings.data.reduce((sum, l) => sum + (l.rating || 0), 0) / listings.data.length || 0,
        totalBookings: listings.data.reduce((sum, l) => sum + (l.totalBookings || 0), 0),
        totalEarnings: listings.data.reduce((sum, l) => sum + ((l.totalBookings || 0) * (l.pricing?.daily || 0)), 0)
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting host stats:', error);
      throw new Error('Failed to get host statistics');
    }
  }
}

// Export singleton instance
export default new ListingService();