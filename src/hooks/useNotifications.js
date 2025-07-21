// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sample notifications for testing
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: 'New file uploaded',
        message: 'document.pdf has been uploaded successfully',
        type: 'Package',
        icon: 'Package',
        priority: 'normal',
        read: false,
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        actionUrl: '/files'
      },
      {
        id: 2,
        title: 'Storage quota warning',
        message: 'You are using 85% of your storage space',
        type: 'AlertCircle',
        icon: 'AlertCircle',
        priority: 'high',
        read: false,
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
        actionUrl: '/storage'
      },
      {
        id: 3,
        title: 'New user registered',
        message: 'John Doe has joined your organization',
        type: 'Users',
        icon: 'Users',
        priority: 'low',
        read: true,
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        actionUrl: '/users'
      }
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const deleteAllRead = async () => {
    setNotifications(prev => prev.filter(notification => !notification.read));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      priority: 'normal',
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Play sound if enabled
    if (soundEnabled) {
      // You can add sound logic here
      console.log('Notification sound would play');
    }
  };

  return {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    addNotification
  };
};