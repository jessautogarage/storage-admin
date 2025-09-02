import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';

const useMessages = (userId, userType) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user conversations
  const fetchConversations = useCallback(async () => {
    if (!userId || !userType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userConversations = await messageService.getUserConversations(userId, userType);
      setConversations(userConversations);
      
      // Calculate total unread count
      const totalUnread = userConversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Send a message
  const sendMessage = useCallback(async (messageData) => {
    try {
      const result = await messageService.sendMessage({
        ...messageData,
        senderId: userId,
        senderName: messageData.senderName || 'User'
      });
      
      if (result.success) {
        // Refresh conversations to update last message
        fetchConversations();
      }
      
      return result;
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false, error: err.message };
    }
  }, [userId, fetchConversations]);

  // Send booking update message
  const sendBookingUpdate = useCallback(async (updateData) => {
    try {
      const result = await messageService.sendBookingUpdate(updateData);
      
      if (result.success) {
        // Refresh conversations
        fetchConversations();
      }
      
      return result;
    } catch (err) {
      console.error('Error sending booking update:', err);
      return { success: false, error: err.message };
    }
  }, [fetchConversations]);

  // Subscribe to a specific conversation
  const subscribeToConversation = useCallback((conversationId, callback) => {
    return messageService.subscribeToConversation(conversationId, callback);
  }, []);

  // Mark conversation messages as read
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await messageService.markMessagesAsRead(conversationId, userId);
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
      // Update total unread count
      setUnreadCount(prev => {
        const conversation = conversations.find(c => c.id === conversationId);
        return Math.max(0, prev - (conversation?.unreadCount || 0));
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      return { success: false, error: err.message };
    }
  }, [userId, conversations]);

  // Get conversation by ID
  const getConversationById = useCallback((conversationId) => {
    return conversations.find(conv => conv.id === conversationId);
  }, [conversations]);

  // Get recent conversations (last 5)
  const getRecentConversations = useCallback(() => {
    return conversations.slice(0, 5);
  }, [conversations]);

  // Get conversations with unread messages
  const getUnreadConversations = useCallback(() => {
    return conversations.filter(conv => conv.unreadCount > 0);
  }, [conversations]);

  // Generate conversation ID from booking
  const generateBookingConversationId = useCallback((bookingId) => {
    return `booking_${bookingId}`;
  }, []);

  // Get conversation for specific booking
  const getBookingConversation = useCallback((bookingId) => {
    const conversationId = generateBookingConversationId(bookingId);
    return getConversationById(conversationId);
  }, [generateBookingConversationId, getConversationById]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh conversations periodically for demo purposes
  // In production, you'd want real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    unreadCount,
    sendMessage,
    sendBookingUpdate,
    subscribeToConversation,
    markConversationAsRead,
    getConversationById,
    getRecentConversations,
    getUnreadConversations,
    generateBookingConversationId,
    getBookingConversation,
    refresh: fetchConversations
  };
};

export default useMessages;