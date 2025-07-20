// src/hooks/useRealtimeChat.js
import { useState, useEffect } from 'react';
import { chatService } from '../services/chat';
import { useAuth } from './useAuth';

export const useRealtimeChat = (chatOrUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState(null);
  const { user: adminUser } = useAuth();

  useEffect(() => {
    if (!chatOrUser) {
      setLoading(false);
      return;
    }

    const initializeChat = async () => {
      try {
        let finalChatId;
        
        // If it's an existing chat with chatId
        if (chatOrUser.chatId) {
          finalChatId = chatOrUser.chatId;
        } 
        // If it's an existing chat with id property
        else if (chatOrUser.id && chatOrUser.id.startsWith('chat_')) {
          finalChatId = chatOrUser.id;
        }
        // If it's a user object (new chat)
        else if (chatOrUser.id && chatOrUser.email) {
          // Create user info object with all available data
          const userInfo = {
            name: chatOrUser.name || 'Unknown User',
            email: chatOrUser.email,
            type: chatOrUser.type || 'client',
            phone: chatOrUser.phone || null,
            address: chatOrUser.address || null
          };
          
          finalChatId = await chatService.createOrGetChat(chatOrUser.id, userInfo);
        }
        // Handle case where chatOrUser might be incomplete
        else {
          console.error('Invalid chat or user object:', chatOrUser);
          setError('Invalid chat or user data');
          setLoading(false);
          return;
        }

        setChatId(finalChatId);
        
        if (finalChatId) {
          // Subscribe to messages
          const unsubscribe = chatService.subscribeToMessages(finalChatId, (messages) => {
            setMessages(messages);
            setLoading(false);
            setError(null);
          });

          // Mark messages as read
          try {
            await chatService.markAsRead(finalChatId);
          } catch (err) {
            console.error('Error marking messages as read:', err);
            // Don't fail the whole operation if marking as read fails
          }

          return () => {
            if (typeof unsubscribe === 'function') {
              unsubscribe();
            }
          };
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatOrUser]);

  const sendMessage = async (text) => {
    if (!chatId || !text.trim()) {
      console.warn('Cannot send message: no chatId or empty text');
      return;
    }
    
    try {
      await chatService.sendMessage(chatId, text, 'admin');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const createChatIfNeeded = async () => {
    if (!chatOrUser || chatId) return;
    
    try {
      const userInfo = {
        name: chatOrUser.name || 'Unknown User',
        email: chatOrUser.email,
        type: chatOrUser.type || 'client',
        phone: chatOrUser.phone || null,
        address: chatOrUser.address || null
      };
      
      const finalChatId = await chatService.createOrGetChat(chatOrUser.id, userInfo);
      setChatId(finalChatId);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.message);
    }
  };

  return { 
    messages, 
    loading, 
    error,
    sendMessage, 
    createChatIfNeeded,
    chatId 
  };
};