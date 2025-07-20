// src/services/paymentService.js
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { notificationService } from './notificationService';

export const paymentService = {
  // Create a new payment record
  async createPayment(paymentData) {
    try {
      const payment = {
        ...paymentData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payments'), payment);
      
      // Create notification
      await notificationService.notifyNewPayment({
        id: docRef.id,
        ...payment
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify a payment
  async verifyPayment(paymentId, verificationData) {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: 'verified',
        ...verificationData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject a payment
  async rejectPayment(paymentId, reason) {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: 'failed',
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Update booking payment status
  async updateBookingPaymentStatus(bookingId, status) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: status,
        status: status === 'paid' ? 'confirmed' : 'pending',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating booking payment status:', error);
      return { success: false, error: error.message };
    }
  },

  // Get payment statistics
  async getPaymentStats(startDate, endDate) {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        where('status', '==', 'verified')
      );

      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const stats = {
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalPayments: payments.length,
        platformFees: payments.reduce((sum, p) => sum + (p.amount || 0) * 0.09, 0),
        methodBreakdown: {
          gcash: payments.filter(p => p.method === 'gcash').length,
          bank: payments.filter(p => p.method === 'bank').length
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk verify payments
  async bulkVerifyPayments(paymentIds) {
    try {
      const batch = writeBatch(db);
      
      paymentIds.forEach(id => {
        const paymentRef = doc(db, 'payments', id);
        batch.update(paymentRef, {
          status: 'verified',
          verifiedAt: serverTimestamp(),
          verifiedBy: 'admin',
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      return { success: true, count: paymentIds.length };
    } catch (error) {
      console.error('Error bulk verifying payments:', error);
      return { success: false, error: error.message };
    }
  }
};