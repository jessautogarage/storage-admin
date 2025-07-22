// src/services/chat.js
import { realtimeDb, db } from './firebase';
import { 
  ref, 
  push, 
  onValue, 
  serverTimestamp, 
  update,
  child,
  get,
  set 
} from 'firebase/database';
import { doc, setDoc, updateDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';

export const chatService = {
  // Create or get chat between admin and user
  async createOrGetChat(userId, userInfo) {
    const chatId = `chat_${userId}`;
    const chatRef = ref(realtimeDb, `chats/${chatId}`);
    
    // Check if chat exists
    const snapshot = await get(chatRef);
    
    if (!snapshot.exists()) {
      // Create new chat
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
      
      // Also create/update in Firestore for better querying
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
    }
    
    return chatId;
  },

  // Send a message
  async sendMessage(chatId, message, sender = 'admin') {
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

    // Also update Firestore for better querying
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: message,
      lastMessageTime: firestoreTimestamp(),
      unreadCount: sender === 'user' ? 1 : 0
    });

    return newMessage;
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
        callback(messages.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        callback([]);
      }
    });
  },

  // Get all chats with Firestore for better performance
  subscribeToChats(callback) {
    const chatsRef = ref(realtimeDb, 'chats');
    return onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chats = Object.entries(data)
          .filter(([key, value]) => !key.includes('/messages'))
          .map(([key, value]) => ({
            id: key,
            chatId: key,
            ...value,
            lastMessage: value.lastMessage || '',
            unreadCount: this.getUnreadCount(value.messages)
          }))
          .filter(chat => chat.lastMessage) // Only show chats with messages
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        callback(chats);
      } else {
        callback([]);
      }
    });
  },

  getUnreadCount(messages) {
    if (!messages) return 0;
    return Object.values(messages).filter(m => !m.read && m.sender !== 'admin').length;
  },

  // Mark messages as read
  async markAsRead(chatId) {
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const updates = {};
      Object.keys(snapshot.val()).forEach(key => {
        updates[`${key}/read`] = true;
      });
      await update(messagesRef, updates);
    }

    // Reset unread count in Firestore
    await updateDoc(doc(db, 'chats', chatId), {
      unreadCount: 0
    });
  }
};