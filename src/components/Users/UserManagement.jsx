import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import UserList from './UserList';
import UserModal from './UserModal';

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage platform users and verify new registrations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <select
          className="input w-full md:w-48"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="client">Clients</option>
          <option value="host">Hosts</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified</option>
        </select>
        
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <UserList 
        searchTerm={searchTerm}
        filterType={filterType}
        onEdit={handleEdit}
      />
      
      {showModal && (
        <UserModal 
          user={editingUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserManagement;