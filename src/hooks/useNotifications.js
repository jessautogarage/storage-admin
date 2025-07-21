// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { realtimeDb } from '../services/firebase';
import { ref, onValue, push, update, remove, get } from 'firebase/database';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = ref(realtimeDb, 'adminNotifications');
    let previousCount = 0;

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value
          }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setNotifications(notificationsList);
        const newUnreadCount = notificationsList.filter(n => !n.read).length;
        
        // Play sound for new notifications
        if (soundEnabled && newUnreadCount > previousCount && previousCount !== 0) {
          playNotificationSound();
        }
        
        previousCount = newUnreadCount;
        setUnreadCount(newUnreadCount);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, soundEnabled]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    const notificationRef = ref(realtimeDb, `adminNotifications/${notificationId}`);
    await update(notificationRef, { read: true });
  };

  const markAllAsRead = async () => {
    const updates = {};
    notifications.forEach(notification => {
      if (!notification.read) {
        updates[`adminNotifications/${notification.id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(realtimeDb), updates);
    }
  };

  const deleteNotification = async (notificationId) => {
    const notificationRef = ref(realtimeDb, `adminNotifications/${notificationId}`);
    await remove(notificationRef);
  };

  const deleteAllRead = async () => {
    const updates = {};
    notifications.forEach(notification => {
      if (notification.read) {
        updates[`adminNotifications/${notification.id}`] = null;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(realtimeDb), updates);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  };
};