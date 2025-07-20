// src/components/Chat/UsersList.jsx
import React, { useState } from 'react';
import { User, Search, MessageSquare, Phone, Mail, MapPin, Badge } from 'lucide-react';
import { format } from 'date-fns';

const UsersList = ({ users, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getUserBadgeColor = (type) => {
    switch (type) {
      case 'host':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="client">Clients</option>
          <option value="host">Hosts</option>
        </select>
        
        <div className="text-xs text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
      
      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-4 border-b hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {user.name || 'No name'}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getUserBadgeColor(user.type)}`}>
                      {user.type}
                    </span>
                    {user.status === 'verified' && (
                      <Badge size={14} className="text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={12} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.address && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="truncate">{user.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {format(user.createdAt?.toDate?.() || new Date(user.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onStartChat(user)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors ml-2"
                title="Start chat"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;