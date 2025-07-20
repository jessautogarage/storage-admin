// src/components/Chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Search, Clock, CheckCheck } from 'lucide-react';
import { chatService } from '../../services/chat';
import { format, formatDistanceToNow } from 'date-fns';

const ChatList = ({ selectedChat, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToChats((chatData) => {
      setChats(chatData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const getUserBadgeColor = (type) => {
    switch (type) {
      case 'host':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No chats found' : 'No active chats yet'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Go to "All Users" tab to start a conversation
            </p>
          </div>
        )}
        
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChat?.id === chat.id ? 'bg-primary-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">
                      {chat.userName || 'Unknown User'}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getUserBadgeColor(chat.userType)}`}>
                      {chat.userType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{chat.userEmail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;