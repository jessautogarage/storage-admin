// src/services/notificationService.js
import { realtimeDb, db } from './firebase';
import { ref, push, serverTimestamp, update, remove } from 'firebase/database';
import { collection, addDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';

export const notificationService = {
  // Create notification in both Realtime DB and Firestore
  async createNotification(data) {
    try {
      // Add to Realtime Database for real-time updates
      const realtimeRef = ref(realtimeDb, 'adminNotifications');
      const realtimeNotification = await push(realtimeRef, {
        ...data,
        timestamp: serverTimestamp(),
        read: false
      });

      // Also add to Firestore for better querying
      await addDoc(collection(db, 'notifications'), {
        ...data,
        realtimeId: realtimeNotification.key,
        timestamp: firestoreTimestamp(),
        read: false
      });

      return { success: true, id: realtimeNotification.key };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Notification templates
  async notifyNewBooking(booking) {
    return this.createNotification({
      type: 'booking',
      title: 'New Booking Received',
      message: `${booking.clientName} booked ${booking.listingTitle} for ${booking.duration} days`,
      data: { 
        bookingId: booking.id,
        amount: booking.amount,
        startDate: booking.startDate
      },
      priority: 'normal',
      icon: 'Calendar',
      actionUrl: '/bookings'
    });
  },

  async notifyNewPayment(payment) {
    return this.createNotification({
      type: 'payment',
      title: 'New Payment Received',
      message: `Payment of ₱${payment.amount.toLocaleString()} from ${payment.userName} via ${payment.method}`,
      data: { 
        paymentId: payment.id,
        referenceNumber: payment.referenceNumber,
        method: payment.method
      },
      priority: 'high',
      icon: 'DollarSign',
      actionUrl: '/payments'
    });
  },

  async notifyPaymentVerified(payment) {
    return this.createNotification({
      type: 'payment',
      title: 'Payment Verified',
      message: `Payment #${payment.id.slice(-6)} has been verified successfully`,
      data: { paymentId: payment.id },
      priority: 'normal',
      icon: 'CheckCircle',
      actionUrl: '/payments'
    });
  },

  async notifyNewUser(user) {
    return this.createNotification({
      type: 'user',
      title: 'New User Registration',
      message: `${user.name} (${user.type}) registered on the platform`,
      data: { 
        userId: user.id,
        userType: user.type,
        requiresVerification: user.status === 'pending'
      },
      priority: user.type === 'host' ? 'high' : 'normal',
      icon: 'Users',
      actionUrl: '/users'
    });
  },

  async notifyUserVerified(user) {
    return this.createNotification({
      type: 'user',
      title: 'User Verified',
      message: `${user.name} has been verified as a ${user.type}`,
      data: { userId: user.id },
      priority: 'low',
      icon: 'CheckCircle',
      actionUrl: '/users'
    });
  },

  async notifyNewChat(chat) {
    return this.createNotification({
      type: 'chat',
      title: 'New Message',
      message: `${chat.userName}: ${chat.lastMessage.substring(0, 50)}${chat.lastMessage.length > 50 ? '...' : ''}`,
      data: { 
        chatId: chat.id,
        userId: chat.userId,
        userName: chat.userName
      },
      priority: 'normal',
      icon: 'MessageSquare',
      actionUrl: '/chat'
    });
  },

  async notifyNewListing(listing) {
    return this.createNotification({
      type: 'listing',
      title: 'New Listing Created',
      message: `${listing.hostName} listed "${listing.title}" for ₱${listing.pricePerMonth}/month`,
      data: { 
        listingId: listing.id,
        hostId: listing.hostId
      },
      priority: 'normal',
      icon: 'Package',
      actionUrl: '/listings'
    });
  },

  async notifyLowInventory(listing) {
    return this.createNotification({
      type: 'system',
      title: 'Low Availability Alert',
      message: `${listing.title} has limited availability for the next 30 days`,
      data: { listingId: listing.id },
      priority: 'high',
      icon: 'AlertCircle',
      actionUrl: `/listings/${listing.id}`
    });
  },

  async notifySystemAlert(alert) {
    return this.createNotification({
      type: 'system',
      title: alert.title,
      message: alert.message,
      data: alert.data || {},
      priority: alert.priority || 'high',
      icon: 'AlertTriangle',
      actionUrl: alert.actionUrl || '/settings'
    });
  },

  async notifyPayoutProcessed(payout) {
    return this.createNotification({
      type: 'payout',
      title: 'Payout Processed',
      message: `Payout of ₱${payout.amount.toLocaleString()} sent to ${payout.hostName}`,
      data: { 
        payoutId: payout.id,
        hostId: payout.hostId
      },
      priority: 'normal',
      icon: 'Send',
      actionUrl: '/payments/payouts'
    });
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = ref(realtimeDb, `adminNotifications/${notificationId}`);
      await update(notificationRef, { read: true });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const notificationsRef = ref(realtimeDb, 'adminNotifications');
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const updates = {};
        Object.keys(snapshot.val()).forEach(key => {
          updates[`adminNotifications/${key}/read`] = true;
        });
        
        await update(ref(realtimeDb), updates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const notificationRef = ref(realtimeDb, `adminNotifications/${notificationId}`);
      await remove(notificationRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }
};