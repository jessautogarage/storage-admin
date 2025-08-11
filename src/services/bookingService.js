// src/services/bookingService.js
// ✅ Enhanced booking service with booking-specific conversations

import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { priceBreakdownService } from './priceBreakdownService';
import { messageService } from './messageService';

export class BookingService {
  constructor() {
    this.collectionName = 'bookings';
  }

  /**
   * Create a new booking with proper price calculation
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} Booking result
   */
  async createBooking(bookingData) {
    try {
      const {
        listingId,
        clientId,
        hostId,
        startDate,
        endDate,
        listingPrice,
        paymentMethod = 'wallet',
        deliveryInstructions = '',
        clientName,
        clientEmail,
        hostName,
        hostEmail,
        listingTitle,
        listingAddress
      } = bookingData;

      // ✅ Calculate price breakdown using the corrected service
      const numberOfDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const priceBreakdown = priceBreakdownService.calculatePriceBreakdown(listingPrice, numberOfDays);

      // Create booking document
      const booking = {
        listingId,
        clientId,
        hostId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        
        // ✅ FIXED: Use corrected price calculation
        totalAmount: priceBreakdown.totalAmount,
        storageFee: priceBreakdown.storageFee,
        platformFee: priceBreakdown.platformFee,
        
        paymentMethod,
        deliveryInstructions,
        status: 'pending',
        
        // Denormalized fields for easy access
        clientName,
        clientEmail,
        hostName,
        hostEmail,
        listingTitle,
        listingAddress,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create the booking
      const docRef = await addDoc(collection(db, this.collectionName), booking);
      const bookingId = docRef.id;

      // ✅ Send booking confirmation message using booking-specific conversation
      await messageService.sendBookingUpdate({
        bookingId,
        receiverId: hostId,
        status: 'pending',
        listingTitle,
        customMessage: `New booking request for "${listingTitle}". Please review and confirm.`
      });

      // Update listing availability (remove booked dates)
      await this.updateListingAvailability(listingId, startDate, endDate);

      return {
        success: true,
        bookingId,
        totalAmount: priceBreakdown.totalAmount,
        priceBreakdown
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's bookings (client or host)
   * @param {string} userId - User ID
   * @param {string} userType - 'client' or 'host'
   * @returns {Promise<Object>} Bookings data
   */
  async getUserBookings(userId, userType) {
    try {
      const field = userType === 'client' ? 'clientId' : 'hostId';
      const q = query(
        collection(db, this.collectionName),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Group by status for easy access
      const groupedBookings = {
        active: bookings.filter(b => b.status === 'active'),
        upcoming: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid'),
        completed: bookings.filter(b => b.status === 'completed'),
        cancelled: bookings.filter(b => b.status === 'cancelled'),
        pending: bookings.filter(b => b.status === 'pending')
      };

      return {
        success: true,
        bookings,
        groupedBookings
      };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm a booking (host action)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Update result
   */
  async confirmBooking(bookingId) {
    try {
      const bookingRef = doc(db, this.collectionName, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      await updateDoc(bookingRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // ✅ Send confirmation message using booking-specific conversation
      await messageService.sendBookingUpdate({
        bookingId,
        receiverId: booking.clientId,
        status: 'confirmed',
        listingTitle: booking.listingTitle,
        customMessage: `Your booking for "${booking.listingTitle}" has been confirmed! 🎉`
      });

      return { success: true };
    } catch (error) {
      console.error('Error confirming booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} cancellationReason - Reason for cancellation
   * @returns {Promise<Object>} Update result
   */
  async cancelBooking(bookingId, cancellationReason = '') {
    try {
      const bookingRef = doc(db, this.collectionName, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      // Check if cancellation is allowed (12+ hours before start)
      const startDate = booking.startDate.toDate();
      const now = new Date();
      const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

      if (hoursUntilStart < 12) {
        throw new Error('Cannot cancel booking less than 12 hours before start date');
      }

      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancellationReason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Restore listing availability
      await this.restoreListingAvailability(booking.listingId, booking.startDate, booking.endDate);

      // ✅ Send cancellation message using booking-specific conversation
      const receiverId = booking.clientId; // Assume host is cancelling, send to client
      await messageService.sendBookingUpdate({
        bookingId,
        receiverId,
        status: 'cancelled',
        listingTitle: booking.listingTitle,
        customMessage: `Booking for "${booking.listingTitle}" has been cancelled. ${cancellationReason}`
      });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update listing availability after booking
   * @param {string} listingId - Listing ID
   * @param {Date} startDate - Booking start date
   * @param {Date} endDate - Booking end date
   */
  async updateListingAvailability(listingId, startDate, endDate) {
    try {
      return await runTransaction(db, async (transaction) => {
        const listingRef = doc(db, 'listings', listingId);
        const listingDoc = await transaction.get(listingRef);

        if (!listingDoc.exists()) {
          throw new Error('Listing not found');
        }

        const listingData = listingDoc.data();
        const availableDates = listingData.availableDates || [];

        // Remove booked dates from available dates
        const bookedDates = this.getDateRange(startDate, endDate);
        const updatedAvailableDates = availableDates.filter(dateStr => 
          !bookedDates.includes(dateStr)
        );

        // ✅ Auto-disable listing if no dates remaining
        const shouldDisable = updatedAvailableDates.length === 0;

        transaction.update(listingRef, {
          availableDates: updatedAvailableDates,
          isAvailable: !shouldDisable,
          ...(shouldDisable && { 
            status: 'fully_booked',
            updatedAt: serverTimestamp()
          })
        });
      });
    } catch (error) {
      console.error('Error updating listing availability:', error);
    }
  }

  /**
   * Restore listing availability after cancellation
   * @param {string} listingId - Listing ID
   * @param {Date} startDate - Booking start date
   * @param {Date} endDate - Booking end date
   */
  async restoreListingAvailability(listingId, startDate, endDate) {
    try {
      return await runTransaction(db, async (transaction) => {
        const listingRef = doc(db, 'listings', listingId);
        const listingDoc = await transaction.get(listingRef);

        if (!listingDoc.exists()) {
          throw new Error('Listing not found');
        }

        const listingData = listingDoc.data();
        const availableDates = listingData.availableDates || [];

        // Add cancelled dates back to available dates
        const restoredDates = this.getDateRange(startDate, endDate);
        const updatedAvailableDates = [...new Set([...availableDates, ...restoredDates])].sort();

        transaction.update(listingRef, {
          availableDates: updatedAvailableDates,
          isAvailable: true,
          status: 'active',
          updatedAt: serverTimestamp()
        });
      });
    } catch (error) {
      console.error('Error restoring listing availability:', error);
    }
  }

  /**
   * Get date range as array of date strings
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array<string>} Array of date strings
   */
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

  /**
   * Check if booking cancellation is allowed
   * @param {Object} booking - Booking object
   * @returns {boolean} Whether cancellation is allowed
   */
  canCancelBooking(booking) {
    if (!booking || booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    const startDate = booking.startDate instanceof Date ? booking.startDate : booking.startDate.toDate();
    const now = new Date();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

    return hoursUntilStart >= 12;
  }

  /**
   * Get cancellation message for booking
   * @param {Object} booking - Booking object
   * @returns {string} Cancellation message
   */
  getCancellationMessage(booking) {
    if (!booking) return 'Invalid booking';
    
    if (booking.status === 'cancelled') return 'Booking already cancelled';
    if (booking.status === 'completed') return 'Booking already completed';

    const startDate = booking.startDate instanceof Date ? booking.startDate : booking.startDate.toDate();
    const now = new Date();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

    if (hoursUntilStart < 12) {
      return 'Cannot cancel less than 12 hours before start date';
    }

    return 'Cancellation allowed';
  }
}

// Export singleton instance
export const bookingService = new BookingService();