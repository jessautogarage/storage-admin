// src/components/Chat/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';
import { format } from 'date-fns';

const ChatWindow = ({ chat }) => {
  const [message, setMessage] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, sendMessage, createChatIfNeeded, loading, error } = useRealtimeChat(chat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Create chat session if it doesn't exist (for new conversations)
    if (chat && chat.id && !chat.chatId) {
      createChatIfNeeded();
    }
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const getUserInfo = () => {
    if (!chat) {
      return {
        name: 'Unknown User',
        email: 'No email',
        type: 'unknown',
        phone: null,
        address: null
      };
    }

    // If it's an existing chat object
    if (chat.userName || chat.userEmail) {
      return {
        name: chat.userName || 'Unknown User',
        email: chat.userEmail || 'No email',
        type: chat.userType || 'client',
        phone: chat.userPhone || null,
        address: chat.userAddress || null
      };
    }
    
    // If it's a user object (new chat)
    return {
      name: chat.name || 'Unknown User',
      email: chat.email || 'No email',
      type: chat.type || 'client',
      phone: chat.phone || null,
      address: chat.address || null
    };
  };

  const userInfo = getUserInfo();

  if (error) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">Error loading chat</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold">{userInfo.name}</h3>
              <p className="text-sm text-gray-500">{userInfo.email} • {userInfo.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="User info"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        {/* User Info Dropdown */}
        {showUserInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">User Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} />
                <span>{userInfo.email}</span>
              </div>
              {userInfo.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>{userInfo.phone}</span>
                </div>
              )}
              {userInfo.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} />
                  <span>{userInfo.address}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  userInfo.type === 'host' 
                    ? 'bg-blue-100 text-blue-800' 
                    : userInfo.type === 'client'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userInfo.type}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                msg.sender === 'admin' 
                  ? 'bg-primary-600 text-white rounded-l-lg rounded-br-lg' 
                  : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-bl-lg'
              } px-4 py-2`}>
                <p className="text-sm">{msg.text}</p>
                <span className={`text-xs mt-1 block ${
                  msg.sender === 'admin' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {format(new Date(msg.timestamp || Date.now()), 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            disabled={loading || !!error}
          />
          <button
            type="submit"
            disabled={loading || !!error || !message.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;