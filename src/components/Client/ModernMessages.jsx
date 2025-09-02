import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useRealtimeChat from '../../hooks/useRealtimeChat';
import ModernHeader from '../Layout/ModernHeader';
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info,
  Clock,
  Check,
  CheckCheck,
  User,
  Star,
  Image as ImageIcon,
  Paperclip,
  Smile
} from 'lucide-react';

const ModernMessages = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const messagesEndRef = useRef(null);
  
  // States
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);

  // Get user ID for Firebase queries
  const userId = user?.user?.uid || user?.uid;

  // Use realtime chat hook for conversations and messages
  const { 
    conversations, 
    activeConversation,
    messages, 
    sendMessage, 
    loading: chatLoading, 
    error: chatError,
    markAsRead,
    createOrGetConversation,
    selectConversation
  } = useRealtimeChat(userId, 'client');

  // Filter conversations based on search
  const filteredChats = (conversations || []).filter(conversation => {
    const participantName = conversation.participantName || '';
    const listingTitle = conversation.listingTitle || conversation.metadata?.listingTitle || '';
    const query = searchQuery.toLowerCase();
    
    return participantName.toLowerCase().includes(query) ||
           listingTitle.toLowerCase().includes(query);
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    try {
      await sendMessage(activeChatId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (conversation) => {
    setActiveChat(conversation);
    setActiveChatId(conversation.id);
    setShowChatList(false);
    
    // Select conversation to load its messages
    selectConversation(conversation.id);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const ChatListItem = ({ chat }) => {
    const participantName = chat.participantName || 'Unknown User';
    const participantAvatar = chat.participantProfileImage || '/api/placeholder/40/40?text=U';
    const lastMessage = chat.lastMessage || '';
    const lastMessageTime = chat.lastMessageAt?.toDate ? chat.lastMessageAt.toDate() : chat.lastMessageAt;
    const listingTitle = chat.listingTitle || chat.metadata?.listingTitle || '';
    const unreadCount = chat.unreadCount || 0;
    
    return (
      <div
        onClick={() => handleChatSelect(chat)}
        className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b"
      >
        <div className="relative">
          <img
            src={participantAvatar}
            alt={participantName}
            className="w-12 h-12 rounded-full object-cover"
          />
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {participantName}
            </h3>
            {lastMessageTime && (
              <span className="text-xs text-gray-500">
                {formatMessageTime(lastMessageTime)}
              </span>
            )}
          </div>
          
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate mb-1">
              {lastMessage}
            </p>
          )}
          
          {listingTitle && (
            <p className="text-xs text-blue-600 truncate">
              Re: {listingTitle}
            </p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </div>
    );
  };

  const MessageBubble = ({ message, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          isOwn ? 'text-blue-200' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {new Date(message.timestamp?.seconds * 1000 || message.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
          {isOwn && (
            <div className="flex">
              {message.isRead ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ChatListView = () => (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chatError ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <MessageCircle className="w-16 h-16 text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading conversations
            </h3>
            <p className="text-red-600 text-center max-w-sm">
              {chatError}
            </p>
          </div>
        ) : chatLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600 text-center max-w-sm">
              {searchQuery 
                ? 'Try searching for a different host or listing name.'
                : 'Start browsing storage spaces to connect with hosts.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/client/browse')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Storage Spaces
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChatList(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <img
              src={activeChat.participantProfileImage || '/api/placeholder/40/40?text=U'}
              alt={activeChat.participantName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {activeChat.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {activeChat.participantName || 'User'}
            </h3>
            <p className="text-sm text-gray-600">
              {activeChat.isOnline ? 'Online' : `Last seen ${formatMessageTime(activeChat.lastSeen)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Booking Context */}
      {activeChat.bookingId && (
        <div className="px-4 py-3 bg-blue-50 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              Booking {activeChat.bookingId}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {activeChat.listingTitle || activeChat.metadata?.listingTitle || 'Storage Space'}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatError ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-500">Error loading messages</p>
            <p className="text-sm text-red-400 mt-1">{chatError}</p>
          </div>
        ) : chatLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwn={message.senderId === userId}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start the conversation below
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );

  const EmptyChatView = () => (
    <div className="bg-white rounded-xl shadow-sm border h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Messages
        </h2>
        <p className="text-gray-600 mb-6">
          Connect with hosts to ask questions about their storage spaces, coordinate bookings, and get support.
        </p>
        <button
          onClick={() => navigate('/client/browse')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Find Storage Spaces
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="client"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <span>Messages</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Chat with hosts about your storage bookings
          </p>
        </div>

        {/* Messages Interface */}
        <div className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List - Desktop Always Visible, Mobile Conditional */}
          <div className={`${showChatList ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <ChatListView />
          </div>

          {/* Chat View */}
          <div className={`${showChatList ? 'hidden' : 'block'} lg:block lg:col-span-2`}>
            {activeChat ? <ChatView /> : <EmptyChatView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernMessages;