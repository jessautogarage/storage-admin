// src/components/Chat/ChatSupport.jsx
import React, { useState } from 'react';
import { Users, MessageSquare, Plus } from 'lucide-react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import UsersList from './UsersList';
import { useFirestore } from '../../hooks/useFirestore';

const ChatSupport = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
  const { data: users } = useFirestore('users');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chat Support</h1>
        <p className="text-gray-600 mt-1">Support clients and hosts through real-time chat</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            {/* Tab Switcher */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chats'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  <span>Active Chats</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={18} />
                  <span>All Users</span>
                </div>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chats' ? (
                <ChatList 
                  selectedChat={selectedChat} 
                  onSelectChat={setSelectedChat} 
                />
              ) : (
                <UsersList 
                  users={users}
                  onStartChat={(user) => {
                    setSelectedChat(user);
                    setActiveTab('chats');
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Select a chat to start messaging</p>
                <p className="text-sm text-gray-400 mt-2">
                  Or browse users to initiate a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;