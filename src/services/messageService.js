// src/services/messageService.js
// ✅ Enhanced message service with booking-specific conversations

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
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';

export class MessageService {
  constructor() {
    this.messagesCollection = 'messages';
    this.notificationsCollection = 'notifications';
  }

  /**
   * Send a message in a conversation
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Send result
   */
  async sendMessage({
    conversationId,
    senderId,
    receiverId,
    content,
    type = 'text',
    metadata = {},
    senderName = 'User',
    senderProfileImage = null
  }) {
    try {
      const message = {
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        metadata,
        senderName,
        senderProfileImage,
        isRead: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.messagesCollection), message);

      // ✅ Create notification for receiver
      await this.createMessageNotification({
        receiverId,
        senderId,
        senderName,
        messageContent: content,
        conversationId
      });

      return {
        success: true,
        messageId: docRef.id
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send booking update message (matches Flutter implementation)
   * @param {Object} updateData - Booking update data
   * @returns {Promise<Object>} Send result
   */
  async sendBookingUpdate({
    bookingId,
    receiverId,
    status,
    listingTitle,
    customMessage = null
  }) {
    try {
      // ✅ Use booking ID as conversation ID (matches Flutter implementation)
      const conversationId = `booking_${bookingId}`;
      const content = customMessage || this.getBookingStatusMessage(status, listingTitle);
      
      const metadata = {
        bookingId,
        status,
        listingTitle,
        timestamp: new Date().toISOString(),
        type: 'booking_update'
      };

      return await this.sendMessage({
        conversationId,
        senderId: 'system', // System-generated message
        receiverId,
        content,
        type: 'booking_update',
        metadata,
        senderName: 'LockifyHub',
        senderProfileImage: null
      });
    } catch (error) {
      console.error('Error sending booking update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get messages for a conversation with real-time updates
   * @param {string} conversationId - Conversation ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToConversation(conversationId, callback) {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));

        callback(messages);

        // Mark messages as read for the receiver
        this.markMessagesAsRead(conversationId);
      }, (error) => {
        console.error('Error listening to messages:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Failed to subscribe to conversation:', error);
      return () => {}; // Return dummy unsubscribe function
    }
  }

  /**
   * Get conversations for a user (booking-based)
   * @param {string} userId - User ID
   * @param {string} userType - 'client' or 'host'
   * @returns {Promise<Array>} User's conversations
   */
  async getUserConversations(userId, userType) {
    try {
      // Get user's bookings to determine valid conversations
      const bookings = await this.getUserBookingsForConversations(userId, userType);
      const conversations = [];

      for (const booking of bookings) {
        const conversationId = `booking_${booking.id}`;
        const lastMessage = await this.getLastMessage(conversationId);

        // ✅ Only include conversations with actual messages (matches Flutter logic)
        if (lastMessage) {
          conversations.push({
            id: conversationId,
            bookingId: booking.id,
            booking,
            lastMessage,
            otherUserId: userType === 'client' ? booking.hostId : booking.clientId,
            otherUserName: userType === 'client' ? booking.hostName : booking.clientName,
            listingTitle: booking.listingTitle,
            unreadCount: await this.getUnreadCount(conversationId, userId)
          });
        }
      }

      // Sort by last message time
      conversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || new Date(0);
        const bTime = b.lastMessage?.createdAt || new Date(0);
        return bTime - aTime;
      });

      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Get user's bookings for conversation filtering
   * @param {string} userId - User ID
   * @param {string} userType - 'client' or 'host'
   * @returns {Promise<Array>} User's bookings
   */
  async getUserBookingsForConversations(userId, userType) {
    try {
      const field = userType === 'client' ? 'clientId' : 'hostId';
      const q = query(
        collection(db, 'bookings'),
        where(field, '==', userId),
        where('status', 'in', ['confirmed', 'active', 'paid']) // Chat-enabled statuses
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate()
      }));
    } catch (error) {
      console.error('Error getting user bookings for conversations:', error);
      return [];
    }
  }

  /**
   * Get last message for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object|null>} Last message or null
   */
  async getLastMessage(conversationId) {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting last message:', error);
      return null;
    }
  }

  /**
   * Get unread message count for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID (receiver)
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(conversationId, userId) {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark messages as read in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID (receiver)
   */
  async markMessagesAsRead(conversationId, userId = null) {
    try {
      // If no userId provided, we can't mark as read
      if (!userId) return;

      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      snapshot.docs.forEach(doc => {
        batch.push(updateDoc(doc.ref, { isRead: true }));
      });

      await Promise.all(batch);

      // Also mark related notifications as read
      await this.markNotificationsAsRead(conversationId, userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Create notification for message receiver
   * @param {Object} notificationData - Notification data
   */
  async createMessageNotification({
    receiverId,
    senderId,
    senderName,
    messageContent,
    conversationId
  }) {
    try {
      const notification = {
        type: 'message',
        title: `New message from ${senderName}`,
        body: messageContent.length > 50 
          ? `${messageContent.substring(0, 50)}...` 
          : messageContent,
        senderId,
        senderName,
        receiverId,
        conversationId,
        isRead: false,
        createdAt: serverTimestamp(),
        data: {
          type: 'message',
          conversationId,
          senderId
        }
      };

      await addDoc(collection(db, this.notificationsCollection), notification);
    } catch (error) {
      console.error('Error creating message notification:', error);
      // Don't throw - notification failure shouldn't fail message sending
    }
  }

  /**
   * Mark conversation notifications as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   */
  async markNotificationsAsRead(conversationId, userId) {
    try {
      const q = query(
        collection(db, this.notificationsCollection),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = [];

      snapshot.docs.forEach(doc => {
        batch.push(updateDoc(doc.ref, { isRead: true }));
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }

  /**
   * Generate conversation ID from user IDs (legacy format)
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Conversation ID
   */
  generateConversationId(userId1, userId2) {
    const userIds = [userId1, userId2].sort();
    return `${userIds[0]}_${userIds[1]}`;
  }

  /**
   * Get booking status message (matches Flutter implementation)
   * @param {string} status - Booking status
   * @param {string} listingTitle - Listing title
   * @returns {string} Status message
   */
  getBookingStatusMessage(status, listingTitle) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return `✅ Booking confirmed for "${listingTitle}"! You can now message each other until the booking is completed.`;
      case 'active':
        return `🎉 Your booking for "${listingTitle}" is now active! Enjoy your storage space.`;
      case 'completed':
        return `🏁 Booking for "${listingTitle}" has been completed. Thank you for using our service!`;
      case 'cancelled':
        return `❌ Booking for "${listingTitle}" has been cancelled.`;
      case 'paid':
        return `💰 Payment received for "${listingTitle}". Waiting for host confirmation.`;
      case 'pending':
        return `📋 New booking request for "${listingTitle}". Please review and confirm.`;
      default:
        return `📋 Booking status updated: ${status} for "${listingTitle}"`;
    }
  }
}

// Export singleton instance
export const messageService = new MessageService();