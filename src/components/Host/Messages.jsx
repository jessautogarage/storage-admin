import React, { useState } from 'react';
import { MessageSquare, Send, Search, User, Clock, CheckCircle } from 'lucide-react';
import HostLayout from '../Layout/HostLayout';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock conversation data - replace with actual data from Firebase
  const [conversations] = useState([
    {
      id: '1',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      listingTitle: 'Spacious Garage Storage',
      lastMessage: 'What are the access hours for the storage?',
      lastMessageTime: '2025-01-30T14:30:00Z',
      unreadCount: 2,
      status: 'active',
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Hi! I\'m interested in your garage storage. Is it available?',
          timestamp: '2025-01-30T10:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'Hello John! Yes, the garage storage is available. When do you need it?',
          timestamp: '2025-01-30T10:15:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'I need it starting February 1st for about 3 months. What are the access hours for the storage?',
          timestamp: '2025-01-30T14:30:00Z',
          read: false
        }
      ]
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.j@email.com',
      listingTitle: 'Climate Controlled Unit',
      lastMessage: 'Perfect! I\'ll book it right now.',
      lastMessageTime: '2025-01-29T16:45:00Z',
      unreadCount: 0,
      status: 'completed',
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Is the climate controlled unit suitable for storing documents and electronics?',
          timestamp: '2025-01-29T15:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'Absolutely! It maintains consistent temperature and humidity levels, perfect for sensitive items.',
          timestamp: '2025-01-29T15:30:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'Perfect! I\'ll book it right now.',
          timestamp: '2025-01-29T16:45:00Z',
          read: true
        }
      ]
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      clientEmail: 'mike.davis@email.com',
      listingTitle: 'Outdoor Storage Shed',
      lastMessage: 'Thanks for accommodating the early drop-off!',
      lastMessageTime: '2025-01-28T09:20:00Z',
      unreadCount: 0,
      status: 'active',
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Can I drop off my items early in the morning around 7 AM?',
          timestamp: '2025-01-28T08:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'Sure! I can arrange early access for you. Just let me know which day.',
          timestamp: '2025-01-28T09:00:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'Thanks for accommodating the early drop-off!',
          timestamp: '2025-01-28T09:20:00Z',
          read: true
        }
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listingTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // TODO: Implement message sending
    console.log('Sending message:', newMessage, 'to conversation:', selectedConversation.id);
    setNewMessage('');
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <HostLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with your clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="card flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Messages from clients will appear here</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{conversation.clientName}</h3>
                            <p className="text-sm text-gray-600 truncate">{conversation.listingTitle}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(conversation.lastMessageTime)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 card flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{selectedConversation.clientName}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.listingTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedConversation.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedConversation.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'host' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'host'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          message.sender === 'host' ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === 'host' && (
                            <CheckCircle size={12} className={message.read ? 'text-blue-200' : 'text-blue-300'} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default Messages;