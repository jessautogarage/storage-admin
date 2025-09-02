import { useState, useEffect, useCallback, useMemo } from 'react';
import useRealtimeChat from './useRealtimeChat';
import { useAuth } from './useAuth';

/**
 * Hook for host message management
 * Provides host-specific interface for messaging functionality
 */
const useHostMessages = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the base chat hook
  const {
    conversations: rawConversations,
    activeConversation,
    messages,
    loading,
    error,
    sendMessage: baseSendMessage,
    markAsRead: baseMarkAsRead,
    selectConversation,
    createOrGetConversation,
    refresh
  } = useRealtimeChat(user?.uid, 'host');

  // Transform conversations for host-specific format
  const conversations = useMemo(() => {
    if (!rawConversations || !user) return [];
    
    return rawConversations.map(conv => {
      // Find the client (other user)
      const clientUser = conv.otherUser;
      
      return {
        id: conv.id,
        clientName: clientUser?.displayName || clientUser?.name || clientUser?.email || 'Unknown Client',
        clientEmail: clientUser?.email || '',
        clientId: clientUser?.id || '',
        listingTitle: conv.booking?.listingTitle || conv.listingTitle || 'General Inquiry',
        lastMessage: conv.lastMessage || '',
        lastMessageTime: conv.lastMessageAt?.toDate?.() || conv.lastMessageAt || new Date(),
        unreadCount: conv.unreadCount?.[user.uid] || 0,
        status: conv.status || 'active',
        messages: [],
        bookingId: conv.bookingId,
        createdAt: conv.createdAt?.toDate?.() || conv.createdAt || new Date()
      };
    });
  }, [rawConversations, messages, user]);

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv =>
      conv.clientName.toLowerCase().includes(term) ||
      conv.clientEmail.toLowerCase().includes(term) ||
      conv.listingTitle.toLowerCase().includes(term) ||
      conv.lastMessage.toLowerCase().includes(term)
    );
  }, [conversations, searchTerm]);

  // Search conversations
  const searchConversations = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Send message with host-specific handling
  const sendMessage = useCallback(async (conversationId, messageText) => {
    if (!conversationId || !messageText.trim()) {
      return { success: false, error: 'Message text is required' };
    }

    const result = await baseSendMessage(conversationId, messageText);
    return result;
  }, [baseSendMessage]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return;
    await baseMarkAsRead(conversationId);
  }, [baseMarkAsRead]);

  // Get total unread count across all conversations
  const unreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }, [conversations]);

  // Get selected conversation with formatted messages
  const selectedConversation = useMemo(() => {
    if (!activeConversation || !user) return null;
    
    const baseConv = conversations.find(c => c.id === activeConversation.id);
    if (!baseConv) return null;
    
    // Format messages for the selected conversation
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderId === user.uid ? 'host' : 'client',
      content: msg.text,
      timestamp: msg.createdAt?.toDate?.() || msg.createdAt || new Date(),
      read: msg.readBy?.includes(user.uid) || msg.senderId === user.uid
    }));
    
    return {
      ...baseConv,
      messages: formattedMessages
    };
  }, [activeConversation, conversations, messages, user]);

  // Create new conversation with a client
  const createConversation = useCallback(async (clientId, bookingId = null) => {
    if (!clientId) {
      return { success: false, error: 'Client ID is required' };
    }

    return await createOrGetConversation(clientId, bookingId);
  }, [createOrGetConversation]);

  // Select conversation and load messages
  const selectConversationById = useCallback(async (conversationId) => {
    const conversation = rawConversations.find(c => c.id === conversationId);
    if (conversation) {
      await selectConversation(conversation);
      // Auto-mark as read when selecting
      await markAsRead(conversationId);
    }
  }, [rawConversations, selectConversation, markAsRead]);

  // Auto-refresh conversations periodically
  useEffect(() => {
    if (!user?.uid) return;

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.uid, refresh]);

  return {
    // Data
    conversations: filteredConversations,
    selectedConversation,
    loading,
    error,
    unreadCount,
    searchTerm,

    // Actions
    sendMessage,
    markAsRead,
    searchConversations,
    selectConversation: selectConversationById,
    createConversation,
    refresh
  };
};

export default useHostMessages;