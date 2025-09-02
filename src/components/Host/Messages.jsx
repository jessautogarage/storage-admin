import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useHostMessages from '../../hooks/useHostMessages';
import { MessageSquare, Send, Search, User, Clock, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';

const Messages = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Use the host messages hook
  const {
    conversations,
    selectedConversation,
    loading,
    error,
    unreadCount,
    searchTerm,
    sendMessage,
    markAsRead,
    searchConversations,
    selectConversation,
    refresh
  } = useHostMessages();

  // Auto-mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation, markAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    
    try {
      const result = await sendMessage(selectedConversation.id, newMessage);
      
      if (result.success) {
        setNewMessage('');
      } else {
        console.error('Failed to send message:', result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRetry = () => {
    refresh();
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

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Skeleton loader for conversations
  const ConversationSkeleton = () => (
    <div className="space-y-1 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for messages
  const MessageSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'
          } animate-pulse`}>
            <div className="h-4 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="p-6 text-center">
      <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load messages</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={16} className="mr-2" />
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="host"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">Communicate with your clients</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-sm border flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => searchConversations(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {error ? (
                <ErrorDisplay error={error} onRetry={handleRetry} />
              ) : loading ? (
                <ConversationSkeleton />
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Messages from clients will appear here</p>
                  {searchTerm && (
                    <button
                      onClick={() => searchConversations('')}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border flex flex-col">
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
                  {loading ? (
                    <MessageSkeleton />
                  ) : selectedConversation?.messages?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-600">No messages in this conversation yet</p>
                      </div>
                    </div>
                  ) : (
                    selectedConversation?.messages?.map((message) => (
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
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
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
    </div>
  );
};

export default Messages;