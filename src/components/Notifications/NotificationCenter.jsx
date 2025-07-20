// src/components/Notifications/NotificationCenter.jsx
import React, { useState } from 'react';
import { 
  Bell, 
  Filter, 
  Search, 
  Trash2, 
  Check,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { format, formatDistanceToNow, startOfWeek, endOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllRead 
  } = useNotifications();

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesRead = filterRead === 'all' || 
      (filterRead === 'read' && notification.read) ||
      (filterRead === 'unread' && !notification.read);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesPriority && matchesRead && matchesSearch;
  });

  // Group notifications by time period
  const groupNotifications = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const groups = {
      today: [],
      thisWeek: [],
      older: []
    };

    filteredNotifications.forEach(notification => {
      const notificationDate = new Date(notification.timestamp || Date.now());
      
      if (notificationDate >= todayStart) {
        groups.today.push(notification);
      } else if (notificationDate >= weekStart && notificationDate <= weekEnd) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`Delete ${selectedNotifications.length} notifications?`)) {
      for (const id of selectedNotifications) {
        await deleteNotification(id);
      }
      setSelectedNotifications([]);
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const groupedNotifications = groupNotifications();

  // Statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    high: notifications.filter(n => n.priority === 'high').length,
    types: {
      payment: notifications.filter(n => n.type === 'payment').length,
      booking: notifications.filter(n => n.type === 'booking').length,
      user: notifications.filter(n => n.type === 'user').length,
      chat: notifications.filter(n => n.type === 'chat').length,
      system: notifications.filter(n => n.type === 'system').length
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-gray-600 mt-1">Manage all your notifications in one place</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Unread</p>
          <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">High Priority</p>
          <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Payments</p>
          <p className="text-2xl font-bold">{stats.types.payment}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Bookings</p>
          <p className="text-2xl font-bold">{stats.types.booking}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Messages</p>
          <p className="text-2xl font-bold">{stats.types.chat}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notifications..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input w-full md:w-48"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="booking">Bookings</option>
            <option value="user">Users</option>
            <option value="chat">Messages</option>
            <option value="system">System</option>
          </select>
          
          <select
            className="input w-full md:w-48"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          
          <select
            className="input w-full md:w-48"
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        
        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleBulkMarkAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <Check size={16} />
              Mark as Read ({selectedNotifications.length})
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete ({selectedNotifications.length})
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={markAllAsRead}
          className="btn-secondary"
          disabled={stats.unread === 0}
        >
          Mark All as Read
        </button>
        <button
          onClick={deleteAllRead}
          className="btn-secondary text-red-600 hover:bg-red-50"
          disabled={notifications.filter(n => n.read).length === 0}
        >
          Delete All Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {/* Today */}
        {groupedNotifications.today.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Today</h3>
            <div className="space-y-2">
              {groupedNotifications.today.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  selected={selectedNotifications.includes(notification.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedNotifications([...selectedNotifications, notification.id]);
                    } else {
                      setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                    }
                  }}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* This Week */}
        {groupedNotifications.thisWeek.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">This Week</h3>
            <div className="space-y-2">
              {groupedNotifications.thisWeek.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  selected={selectedNotifications.includes(notification.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedNotifications([...selectedNotifications, notification.id]);
                    } else {
                      setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                    }
                  }}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Older */}
        {groupedNotifications.older.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Older</h3>
            <div className="space-y-2">
              {groupedNotifications.older.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  selected={selectedNotifications.includes(notification.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedNotifications([...selectedNotifications, notification.id]);
                    } else {
                      setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                    }
                  }}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, selected, onSelect, onRead, onDelete, onClick }) => {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">High</span>;
      case 'normal':
        return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Normal</span>;
      case 'low':
        return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      payment: <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Payment</span>,
      booking: <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">Booking</span>,
      user: <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">User</span>,
      chat: <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Message</span>,
      system: <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">System</span>
    };
    
    return badges[type] || null;
  };

  return (
    <div 
      className={`card p-4 hover:shadow-md transition-all cursor-pointer ${
        !notification.read ? 'border-l-4 border-primary-500 bg-blue-50' : ''
      } ${selected ? 'ring-2 ring-primary-500' : ''}`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        
        <div className="flex-1" onClick={onClick}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {getTypeBadge(notification.type)}
                {getPriorityBadge(notification.priority)}
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRead();
                    }}
                    className="text-primary-600 hover:text-primary-800"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{format(new Date(notification.timestamp || Date.now()), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{format(new Date(notification.timestamp || Date.now()), 'p')}</span>
            </div>
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{Object.keys(notification.data).length} data points</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;