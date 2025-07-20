// src/components/Notifications/NotificationDropdown.jsx
import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  DollarSign, 
  Users, 
  Calendar,
  Package,
  AlertCircle,
  Send,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    soundEnabled,
    setSoundEnabled,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getIcon = (type, iconName) => {
    const icons = {
      MessageSquare: <MessageSquare size={16} className="text-blue-600" />,
      DollarSign: <DollarSign size={16} className="text-green-600" />,
      Users: <Users size={16} className="text-purple-600" />,
      Calendar: <Calendar size={16} className="text-orange-600" />,
      Package: <Package size={16} className="text-indigo-600" />,
      AlertCircle: <AlertCircle size={16} className="text-red-600" />,
      CheckCircle: <Check size={16} className="text-green-600" />,
      Send: <Send size={16} className="text-blue-600" />
    };
    
    return icons[iconName] || <Bell size={16} className="text-gray-600" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'normal':
        return 'border-l-4 border-blue-500';
      case 'low':
        return 'border-l-4 border-gray-300';
      default:
        return '';
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setShowDropdown(false);
    }
  };

  const groupNotificationsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.timestamp || Date.now());
      
      if (notificationDate >= today) {
        groups.today.push(notification);
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-20 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title={soundEnabled ? 'Mute notifications' : 'Enable sound'}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm mt-1">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div>
                  {/* Today */}
                  {groupedNotifications.today.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        Today
                      </div>
                      {groupedNotifications.today.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => handleNotificationClick(notification)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* Yesterday */}
                  {groupedNotifications.yesterday.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        Yesterday
                      </div>
                      {groupedNotifications.yesterday.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => handleNotificationClick(notification)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* This Week */}
                  {groupedNotifications.thisWeek.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        This Week
                      </div>
                      {groupedNotifications.thisWeek.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => handleNotificationClick(notification)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* Older */}
                  {groupedNotifications.older.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        Older
                      </div>
                      {groupedNotifications.older.slice(0, 5).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => handleNotificationClick(notification)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t flex justify-between items-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all notifications
              </button>
              <button
                onClick={() => {
                  navigate('/settings/notifications');
                  setShowDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onRead, onDelete, getIcon, getPriorityColor }) => {
  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      } ${getPriorityColor(notification.priority)}`}
      onClick={onRead}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type, notification.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.timestamp || Date.now()), { 
              addSuffix: true 
            })}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;