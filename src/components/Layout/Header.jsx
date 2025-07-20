import React, { useState } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Simple temporary notification component
const SimpleNotificationDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          3
        </span>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 hover:bg-gray-50 cursor-pointer border-b">
                <p className="text-sm font-medium">New user registration</p>
                <p className="text-xs text-gray-500 mt-1">John Doe just signed up</p>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer border-b">
                <p className="text-sm font-medium">New booking received</p>
                <p className="text-xs text-gray-500 mt-1">Downtown Storage Unit</p>
              </div>
              <div className="p-4 hover:bg-gray-50 cursor-pointer">
                <p className="text-sm font-medium">Storage quota warning</p>
                <p className="text-xs text-gray-500 mt-1">85% of storage space used</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Header = () => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden">
            <Menu size={24} />
          </button>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <SimpleNotificationDropdown />
          
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.email || 'Admin'}
              </span>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                <div className="p-4">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Administrator</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;