import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';

const useRealtimeChat = (userId, userType = 'client') => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const unsubscribeRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
    } catch (authError) {
      console.error('Chat permission error:', authError);
      setError('Unable to load chat. Please ensure you are logged in.');
      setLoading(false);
      return;
    }
    
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query conversations where user is a participant
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const conversationsData = [];

      for (const convDoc of snapshot.docs) {
        const convData = {
          id: convDoc.id,
          ...convDoc.data()
        };

        // Get other participant's details
        const otherUserId = convData.participants.find(id => id !== userId);
        if (otherUserId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              convData.otherUser = {
                id: userDoc.id,
                ...userDoc.data()
              };
            }
          } catch (err) {
            console.error('Error fetching user:', err);
          }
        }

        // Get booking details if linked
        if (convData.bookingId) {
          try {
            const bookingDoc = await getDoc(doc(db, 'bookings', convData.bookingId));
            if (bookingDoc.exists()) {
              convData.booking = {
                id: bookingDoc.id,
                ...bookingDoc.data()
              };
            }
          } catch (err) {
            console.error('Error fetching booking:', err);
          }
        }

        conversationsData.push(convData);
      }

      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create or get conversation
  const createOrGetConversation = useCallback(async (otherUserId, bookingId = null) => {
    if (!userId || !otherUserId) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      // Check if conversation already exists
      const participants = [userId, otherUserId].sort();
      const q = query(
        collection(db, 'conversations'),
        where('participants', '==', participants)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Conversation exists
        const existingConv = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        
        setActiveConversation(existingConv);
        return { success: true, conversation: existingConv };
      }

      // Create new conversation
      const conversationData = {
        participants,
        createdBy: userId,
        bookingId,
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [userId]: 0,
          [otherUserId]: 0
        },
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const newConversation = {
        id: docRef.id,
        ...conversationData
      };

      setActiveConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);

      return { success: true, conversation: newConversation };
    } catch (err) {
      console.error('Error creating conversation:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  // Send a message
  const sendMessage = useCallback(async (conversationId, text, attachments = []) => {
    if (!userId || !conversationId || !text.trim()) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      const messageData = {
        conversationId,
        senderId: userId,
        text: text.trim(),
        attachments,
        status: 'sent',
        readBy: [userId],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      
      // Update conversation's last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${activeConversation?.participants.find(id => id !== userId)}`]: 
          (activeConversation?.unreadCount?.[activeConversation?.participants.find(id => id !== userId)] || 0) + 1
      });

      const newMessage = {
        id: docRef.id,
        ...messageData,
        createdAt: new Date()
      };

      setMessages(prev => [...prev, newMessage]);

      return { success: true, message: newMessage };
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false, error: err.message };
    }
  }, [userId, activeConversation]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId) => {
    if (!userId || !conversationId) return;

    try {
      // Reset unread count for current user
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });

      // Mark all messages as read
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId)
      );
      
      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          readBy: [...(doc.data().readBy || []), userId],
          status: 'read'
        })
      );
      
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [userId]);

  // Set typing status
  const setTyping = useCallback(async (conversationId, isTyping) => {
    if (!userId || !conversationId) return;

    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`typing.${userId}`]: isTyping ? serverTimestamp() : null
      });
    } catch (err) {
      console.error('Error setting typing status:', err);
    }
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setLoading(true);

    try {
      // Unsubscribe from previous listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Set up real-time listener for messages
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setMessages(messagesData);
          setLoading(false);
        },
        (err) => {
          console.error('Real-time listener error:', err);
          if (err.code === 'failed-precondition' && err.message.includes('index')) {
            setError('Chat is initializing, please wait a moment...');
            // Retry after 30 seconds if index is building
            setTimeout(() => {
              setError(null);
              loadMessages(conversationId);
            }, 30000);
          } else {
            setError(err.message);
          }
          setLoading(false);
        }
      );

      // Mark messages as read
      await markAsRead(conversationId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [markAsRead]);

  // Select a conversation
  const selectConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deleted: true }
          : msg
      ));

      return { success: true };
    } catch (err) {
      console.error('Error deleting message:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time listener for conversations
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const conversationsData = [];

        for (const convDoc of snapshot.docs) {
          const convData = {
            id: convDoc.id,
            ...convDoc.data()
          };

          // Get other participant's details
          const otherUserId = convData.participants.find(id => id !== userId);
          if (otherUserId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                convData.otherUser = {
                  id: userDoc.id,
                  ...userDoc.data()
                };
              }
            } catch (err) {
              console.error('Error fetching user:', err);
            }
          }

          conversationsData.push(convData);
        }

        setConversations(conversationsData);
        setLoading(false);
      },
      (err) => {
        console.error('Real-time listener error:', err);
        // Don't show permission errors to users - they're expected when not authenticated
        if (err.code === 'permission-denied') {
          console.log('Chat permissions require authentication');
          setError('Chat requires sign in');
        } else if (err.code === 'failed-precondition' && err.message.includes('index')) {
          console.log('Firestore index is building, this may take a few minutes...');
          setError('Chat is initializing, please wait a moment...');
          // Retry after 30 seconds if index is building
          setTimeout(() => {
            setError(null);
            fetchConversations();
          }, 30000);
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  // Monitor typing status
  useEffect(() => {
    if (!activeConversation || !userId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'conversations', activeConversation.id),
      (doc) => {
        if (doc.exists()) {
          const typing = doc.data().typing || {};
          const now = Date.now();
          const activeTyping = {};

          // Check for active typing (within last 3 seconds)
          Object.entries(typing).forEach(([uid, timestamp]) => {
            if (uid !== userId && timestamp && (now - timestamp.toMillis()) < 3000) {
              activeTyping[uid] = true;
            }
          });

          setTypingUsers(activeTyping);
        }
      }
    );

    return () => unsubscribe();
  }, [activeConversation, userId]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    typingUsers,
    createOrGetConversation,
    sendMessage,
    markAsRead,
    setTyping,
    selectConversation,
    deleteMessage,
    refresh: fetchConversations
  };
};

export default useRealtimeChat;