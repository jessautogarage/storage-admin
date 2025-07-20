// src/services/chat.js
import { realtimeDb, db } from './firebase';
import { 
  ref, 
  push, 
  onValue, 
  serverTimestamp, 
  update,
  get,
  set 
} from 'firebase/database';
import { doc, setDoc, updateDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';

export const chatService = {
  // Create or get chat between admin and user
  async createOrGetChat(userId, userInfo) {
    const chatId = `chat_${userId}`;
    const chatRef = ref(realtimeDb, `chats/${chatId}`);
    
    try {
      // Check if chat exists in Realtime Database
      const snapshot = await get(chatRef);
      
      if (!snapshot.exists()) {
        // Create new chat in Realtime Database
        await set(chatRef, {
          userId: userId,
          userName: userInfo.name || 'User',
          userEmail: userInfo.email,
          userType: userInfo.type,
          userPhone: userInfo.phone || null,
          userAddress: userInfo.address || null,
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          status: 'active'
        });
        
        // Also create in Firestore for better querying
        try {
          await setDoc(doc(db, 'chats', chatId), {
            userId: userId,
            userName: userInfo.name || 'User',
            userEmail: userInfo.email,
            userType: userInfo.type,
            createdAt: firestoreTimestamp(),
            lastMessage: '',
            lastMessageTime: firestoreTimestamp(),
            unreadCount: 0,
            status: 'active'
          });
        } catch (firestoreError) {
          console.error('Error creating chat in Firestore:', firestoreError);
          // Continue even if Firestore fails
        }
      }
      
      return chatId;
    } catch (error) {
      console.error('Error in createOrGetChat:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(chatId, message, sender = 'admin') {
    try {
      const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
      const newMessage = await push(messagesRef, {
        text: message,
        sender,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update last message in chat metadata
      const chatRef = ref(realtimeDb, `chats/${chatId}`);
      await update(chatRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp()
      });

      // Also update Firestore for better querying (optional)
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
          lastMessage: message,
          lastMessageTime: firestoreTimestamp(),
          unreadCount: sender === 'user' ? 1 : 0
        });
      } catch (firestoreError) {
        console.error('Error updating Firestore:', firestoreError);
        // Continue even if Firestore update fails
      }

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat messages
  subscribeToMessages(chatId, callback) {
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        callback(messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to messages:', error);
      callback([]);
    });
  },

  // Get all chats
  subscribeToChats(callback) {
    const chatsRef = ref(realtimeDb, 'chats');
    return onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chats = [];
        
        // Process each chat
        Object.entries(data).forEach(([chatId, chatData]) => {
          // Skip if this is a nested path
          if (typeof chatData !== 'object' || !chatData.userId) {
            return;
          }
          
          chats.push({
            id: chatId,
            chatId: chatId,
            ...chatData,
            lastMessage: chatData.lastMessage || '',
            unreadCount: this.getUnreadCount(chatData.messages)
          });
        });
        
        // Filter and sort chats
        const sortedChats = chats
          .filter(chat => chat.lastMessage) // Only show chats with messages
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
          
        callback(sortedChats);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to chats:', error);
      callback([]);
    });
  },

  getUnreadCount(messages) {
    if (!messages) return 0;
    return Object.values(messages).filter(m => !m.read && m.sender !== 'admin').length;
  },

  // Mark messages as read
  async markAsRead(chatId) {
    try {
      const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
        const updates = {};
        Object.keys(snapshot.val()).forEach(key => {
          updates[`${key}/read`] = true;
        });
        
        if (Object.keys(updates).length > 0) {
          const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
          await update(messagesRef, updates);
        }
      }

      // Reset unread count in Firestore (optional)
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
          unreadCount: 0
        });
      } catch (firestoreError) {
        console.error('Error updating Firestore unread count:', firestoreError);
        // Continue even if Firestore update fails
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
};