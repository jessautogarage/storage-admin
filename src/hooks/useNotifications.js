import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch notifications for user
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'notifications'),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      // If no notifications, create mock ones for demo
      if (notificationsData.length === 0) {
        const mockNotifications = [
          {
            id: 'welcome-' + Date.now(),
            title: 'Welcome to LockifyHub!',
            body: 'Your client dashboard is ready. Start exploring storage spaces near you.',
            type: 'welcome',
            isRead: false,
            createdAt: new Date(),
            data: {}
          },
          {
            id: 'tip-' + Date.now(),
            title: 'Storage Tip',
            body: 'Book early for better rates and guaranteed availability in your preferred locations.',
            type: 'tip',
            isRead: false,
            createdAt: new Date(Date.now() - 300000), // 5 minutes ago
            data: {}
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
      } else {
        setNotifications(notificationsData);
        const unread = notificationsData.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      
      // Fallback to mock notifications on error
      const mockNotifications = [
        {
          id: 'welcome-fallback',
          title: 'Welcome to LockifyHub!',
          body: 'Your client dashboard is ready.',
          type: 'welcome',
          isRead: false,
          createdAt: new Date(),
          data: {}
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Only try to update Firebase for real notifications
      if (!notificationId.includes('welcome-') && !notificationId.includes('tip-') && !notificationId.includes('fallback')) {
        await updateDoc(doc(db, 'notifications', notificationId), {
          isRead: true
        });
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      
      // Still update local state even if Firebase fails
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: false, error: err.message };
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Only update real Firebase notifications
      const realNotifications = unreadNotifications.filter(n => 
        !n.id.includes('welcome-') && !n.id.includes('tip-') && !n.id.includes('fallback')
      );
      
      if (realNotifications.length > 0) {
        const promises = realNotifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), {
            isRead: true
          })
        );
        
        await Promise.all(promises);
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      return { success: true };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      
      // Still update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      return { success: false, error: err.message };
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Only try to delete real Firebase notifications
      if (!notificationId.includes('welcome-') && !notificationId.includes('tip-') && !notificationId.includes('fallback')) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      
      // Still update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: false, error: err.message };
    }
  }, [notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      const readNotifications = notifications.filter(n => n.isRead);
      const realNotifications = readNotifications.filter(n => 
        !n.id.includes('welcome-') && !n.id.includes('tip-') && !n.id.includes('fallback')
      );
      
      if (realNotifications.length > 0) {
        const promises = realNotifications.map(notification =>
          deleteDoc(doc(db, 'notifications', notification.id))
        );
        
        await Promise.all(promises);
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => !n.isRead));
      
      return { success: true, count: readNotifications.length };
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      
      // Still update local state
      setNotifications(prev => prev.filter(n => !n.isRead));
      
      return { success: false, error: err.message };
    }
  }, [notifications]);

  // Get recent notifications (last 5)
  const getRecentNotifications = useCallback(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time listener for production notifications
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Only set up listener after initial fetch
    let timeoutId = setTimeout(() => {
      const q = query(
        collection(db, 'notifications'),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          }));
          
          if (notificationsData.length > 0) {
            setNotifications(notificationsData);
            const unread = notificationsData.filter(n => !n.isRead).length;
            setUnreadCount(unread);
          }
        },
        (err) => {
          console.error('Real-time listener error:', err);
          // Don't set error here as we have fallback data
        }
      );

      return () => unsubscribe();
    }, 1000); // Delay to allow initial fetch

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getRecentNotifications,
    refresh: fetchNotifications
  };
};

export default useNotifications;