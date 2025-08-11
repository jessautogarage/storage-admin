import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, User, Clock, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../Layout/ClientLayout';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

const ClientMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null);

  // ✅ Load conversations with actual messages only (matches Flutter implementation)
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // ✅ Subscribe to selected conversation messages
  useEffect(() => {
    if (selectedConversation) {
      // Unsubscribe from previous conversation
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }

      // Subscribe to new conversation
      const unsubscribe = messageService.subscribeToConversation(
        selectedConversation.id,
        (newMessages) => {
          setMessages(newMessages);
        }
      );
      
      setUnsubscribeMessages(() => unsubscribe);

      // Mark conversation as read
      messageService.markMessagesAsRead(selectedConversation.id, user.uid);
    }

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [selectedConversation, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // ✅ Only get conversations where client has actually initiated chat
      const userConversations = await messageService.getUserConversations(user.uid, 'client');
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock conversation data - replaced with real data above
  const [conversationsMock] = useState([
    {
      id: '1',
      hostName: 'John Doe',
      hostEmail: 'john.doe@email.com',
      listingTitle: 'Spacious Garage Storage',
      lastMessage: 'Perfect! I\'ll prepare the space for your arrival on February 1st.',
      lastMessageTime: '2025-01-30T15:45:00Z',
      unreadCount: 1,
      status: 'booking_confirmed',
      hostAvatar: null,
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Hi John! I\'m interested in booking your garage storage. Is it available starting February 1st?',
          timestamp: '2025-01-30T10:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'Hello! Yes, the garage is available from February 1st. How long do you need the space for?',
          timestamp: '2025-01-30T10:30:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'I need it for about 3 months. What are the access hours and do you have any special requirements?',
          timestamp: '2025-01-30T11:00:00Z',
          read: true
        },
        {
          id: '4',
          sender: 'host',
          content: 'Access is 24/7, and I just ask that you keep the space clean and organized. I\'ll send you the access code before your start date.',
          timestamp: '2025-01-30T14:00:00Z',
          read: true
        },
        {
          id: '5',
          sender: 'client',
          content: 'That sounds perfect! I\'d like to proceed with the booking.',
          timestamp: '2025-01-30T15:00:00Z',
          read: true
        },
        {
          id: '6',
          sender: 'host',
          content: 'Perfect! I\'ll prepare the space for your arrival on February 1st.',
          timestamp: '2025-01-30T15:45:00Z',
          read: false
        }
      ]
    },
    {
      id: '2',
      hostName: 'Sarah Johnson',
      hostEmail: 'sarah.j@email.com',
      listingTitle: 'Climate Controlled Unit',
      lastMessage: 'You can view the space anytime this week. Just let me know when!',
      lastMessageTime: '2025-01-29T18:20:00Z',
      unreadCount: 0,
      status: 'inquiry',
      hostAvatar: null,
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Hi Sarah! Is your climate controlled unit suitable for storing electronics and documents?',
          timestamp: '2025-01-29T16:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'Absolutely! The unit maintains consistent temperature and humidity levels year-round. It\'s perfect for sensitive items.',
          timestamp: '2025-01-29T17:00:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'Great! Would it be possible to view the space before booking?',
          timestamp: '2025-01-29T17:30:00Z',
          read: true
        },
        {
          id: '4',
          sender: 'host',
          content: 'You can view the space anytime this week. Just let me know when!',
          timestamp: '2025-01-29T18:20:00Z',
          read: true
        }
      ]
    },
    {
      id: '3',
      hostName: 'Mike Davis',
      hostEmail: 'mike.davis@email.com',
      listingTitle: 'Outdoor Storage Shed',
      lastMessage: 'Thanks for being such a great client! Feel free to extend if needed.',
      lastMessageTime: '2025-01-28T12:30:00Z',
      unreadCount: 0,
      status: 'active_booking',
      hostAvatar: null,
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'Hi Mike! Everything is going great with the storage. Thank you for the smooth process.',
          timestamp: '2025-01-28T10:00:00Z',
          read: true
        },
        {
          id: '2',
          sender: 'host',
          content: 'So glad to hear that! You\'ve been an excellent client. Let me know if you need anything.',
          timestamp: '2025-01-28T11:00:00Z',
          read: true
        },
        {
          id: '3',
          sender: 'client',
          content: 'I might need to extend for another month. Is that possible?',
          timestamp: '2025-01-28T12:00:00Z',
          read: true
        },
        {
          id: '4',
          sender: 'host',
          content: 'Thanks for being such a great client! Feel free to extend if needed.',
          timestamp: '2025-01-28T12:30:00Z',
          read: true
        }
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listingTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      // ✅ Send message using booking-specific conversation
      await messageService.sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.uid,
        receiverId: selectedConversation.otherUserId,
        content: messageContent,
        senderName: user.displayName || user.email || 'Client'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'inquiry':
        return 'bg-blue-100 text-blue-800';
      case 'booking_confirmed':
        return 'bg-green-100 text-green-800';
      case 'active_booking':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'inquiry':
        return 'Inquiry';
      case 'booking_confirmed':
        return 'Booking Confirmed';
      case 'active_booking':
        return 'Active Booking';
      default:
        return 'General';
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with your hosts</p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 mb-4">
                    Go to "My Bookings" and click "Message Host" to start chatting.
                  </p>
                  <button
                    onClick={() => navigate('/client/bookings')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go to My Bookings
                  </button>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-green-50 border border-green-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{conversation.otherUserName}</h3>
                            <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                              <MapPin size={12} />
                              {conversation.listingTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage ? formatMessageTime(conversation.lastMessage.createdAt) : ''}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                          {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation.booking?.status || 'general')}`}>
                          {getStatusLabel(conversation.booking?.status || 'general')}
                        </span>
                      </div>
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
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{selectedConversation.otherUserName}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={12} />
                        {selectedConversation.listingTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedConversation.booking?.status || 'general')}`}>
                        {getStatusLabel(selectedConversation.booking?.status || 'general')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Booking #{selectedConversation.bookingId?.substring(0, 8) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageSquare size={32} className="mx-auto mb-2 text-gray-400" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMyMessage = message.senderId === user?.uid;
                      const isSystemMessage = message.type === 'booking_update';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isSystemMessage
                              ? 'bg-blue-50 text-blue-900 border border-blue-200'
                              : isMyMessage
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {isSystemMessage && (
                              <div className="text-xs font-medium mb-1 text-blue-600">
                                📋 BOOKING UPDATE
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              isSystemMessage
                                ? 'text-blue-600'
                                : isMyMessage 
                                ? 'text-green-200' 
                                : 'text-gray-500'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isMyMessage && !isSystemMessage && (
                                <CheckCircle size={12} className={message.isRead ? 'text-green-200' : 'text-green-300'} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 border-green-200 bg-green-50">
            <h4 className="font-medium text-green-900 mb-2">💡 Message Tips</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Be clear about your storage needs</li>
              <li>• Ask about access hours and restrictions</li>
              <li>• Confirm booking details before finalizing</li>
            </ul>
          </div>
          
          <div className="card p-4 border-blue-200 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">📋 What to Ask</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• "What are the access hours?"</li>
              <li>• "Are there any restrictions?"</li>
              <li>• "Can I view the space first?"</li>
            </ul>
          </div>
          
          <div className="card p-4 border-purple-200 bg-purple-50">
            <h4 className="font-medium text-purple-900 mb-2">⚡ Quick Response</h4>
            <p className="text-sm text-purple-800">
              Hosts typically respond within 2-4 hours. For urgent matters, try calling if a phone number is provided.
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientMessages;