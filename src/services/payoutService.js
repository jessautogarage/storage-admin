// src/services/payoutService.js
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { notificationService } from './notificationService';

export const payoutService = {
  // Create a new payout
  async createPayout(payoutData) {
    try {
      const payout = {
        ...payoutData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payouts'), payout);
      
      // Notify admin about new payout
      await notificationService.createNotification({
        type: 'payout',
        title: 'New Payout Created',
        message: `Payout of ₱${payoutData.netAmount} created for ${payoutData.hostName}`,
        data: { payoutId: docRef.id },
        priority: 'normal',
        icon: 'Send',
        actionUrl: '/payments/payouts'
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating payout:', error);
      return { success: false, error: error.message };
    }
  },

  // Process payout
  async processPayout(payoutId, processData) {
    try {
      const payoutRef = doc(db, 'payouts', payoutId);
      await updateDoc(payoutRef, {
        status: 'processing',
        processedAt: serverTimestamp(),
        processedBy: processData.processedBy,
        transactionReference: processData.transactionReference,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error processing payout:', error);
      return { success: false, error: error.message };
    }
  },

  // Complete payout
  async completePayout(payoutId, completionData) {
    try {
      const payoutRef = doc(db, 'payouts', payoutId);
      await updateDoc(payoutRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionNotes: completionData.notes,
        updatedAt: serverTimestamp()
      });

      // Get payout details for notification
      const payoutDoc = await getDoc(payoutRef);
      const payoutData = payoutDoc.data();

      // Notify about completed payout
      await notificationService.notifyPayoutProcessed({
        id: payoutId,
        amount: payoutData.netAmount,
        hostName: payoutData.hostName,
        hostId: payoutData.hostId
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing payout:', error);
      return { success: false, error: error.message };
    }
  },

  // Get payouts with filters
  async getPayouts(filters = {}) {
    try {
      let q = collection(db, 'payouts');
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.hostId) {
        constraints.push(where('hostId', '==', filters.hostId));
      }

      if (filters.startDate) {
        constraints.push(where('createdAt', '>=', filters.startDate));
      }

      if (filters.endDate) {
        constraints.push(where('createdAt', '<=', filters.endDate));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting payouts:', error);
      throw error;
    }
  },

  // Calculate pending payouts for hosts
  async calculatePendingPayouts(period) {
    try {
      // Get completed bookings in the period
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('status', '==', 'completed'),
        where('paymentStatus', '==', 'paid'),
        where('completedAt', '>=', period.start),
        where('completedAt', '<=', period.end)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by host
      const hostPayouts = {};
      
      bookings.forEach(booking => {
        const hostId = booking.hostId;
        const amount = booking.amount || 0;
        const platformFee = amount * 0.09;
        const netAmount = amount - platformFee;

        if (!hostPayouts[hostId]) {
          hostPayouts[hostId] = {
            hostId,
            hostName: booking.hostName,
            totalAmount: 0,
            platformFees: 0,
            netAmount: 0,
            bookingCount: 0,
            bookingIds: []
          };
        }

        hostPayouts[hostId].totalAmount += amount;
        hostPayouts[hostId].platformFees += platformFee;
        hostPayouts[hostId].netAmount += netAmount;
        hostPayouts[hostId].bookingCount++;
        hostPayouts[hostId].bookingIds.push(booking.id);
      });

      return Object.values(hostPayouts);
    } catch (error) {
      console.error('Error calculating pending payouts:', error);
      throw error;
    }
  },

  // Get payout statistics
  async getPayoutStats(dateRange) {
    try {
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const snapshot = await getDocs(payoutsQuery);
      const payouts = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: payouts.length,
        pending: payouts.filter(p => p.status === 'pending').length,
        processing: payouts.filter(p => p.status === 'processing').length,
        completed: payouts.filter(p => p.status === 'completed').length,
        totalAmount: payouts.reduce((sum, p) => sum + (p.netAmount || 0), 0),
        avgPayoutAmount: payouts.length > 0 
          ? payouts.reduce((sum, p) => sum + (p.netAmount || 0), 0) / payouts.length 
          : 0,
        avgProcessingTime: this.calculateAvgProcessingTime(payouts)
      };

      return stats;
    } catch (error) {
      console.error('Error getting payout stats:', error);
      throw error;
    }
  },

  calculateAvgProcessingTime(payouts) {
    const completed = payouts.filter(p => 
      p.status === 'completed' && p.createdAt && p.completedAt
    );

    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, p) => {
      const created = p.createdAt?.toDate() || new Date();
      const completed = p.completedAt?.toDate() || new Date();
      return sum + (completed - created);
    }, 0);

    return totalTime / completed.length / (1000 * 60 * 60 * 24); // Convert to days
  }
};