import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Calendar, 
  Heart, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  MapPin,
  CreditCard,
  Star
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LockifyHubLogo from '../Logo/LockifyHubLogo';

const ClientLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/client-dashboard',
      icon: Home,
      current: location.pathname === '/client-dashboard'
    },
    {
      name: 'Browse Storage',
      href: '/client/browse',
      icon: Search,
      current: location.pathname === '/client/browse'
    },
    {
      name: 'Map View',
      href: '/client/map',
      icon: MapPin,
      current: location.pathname === '/client/map'
    },
    {
      name: 'My Bookings',
      href: '/client/bookings',
      icon: Calendar,
      current: location.pathname === '/client/bookings'
    },
    {
      name: 'Favorites',
      href: '/client/favorites',
      icon: Heart,
      current: location.pathname === '/client/favorites'
    },
    {
      name: 'Payment History',
      href: '/client/payments',
      icon: CreditCard,
      current: location.pathname === '/client/payments'
    },
    {
      name: 'My Reviews',
      href: '/client/reviews',
      icon: Star,
      current: location.pathname === '/client/reviews'
    },
    {
      name: 'Messages',
      href: '/client/messages',
      icon: MessageSquare,
      current: location.pathname === '/client/messages'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent menuItems={menuItems} user={user} onLogout={handleLogout} navigate={navigate} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent menuItems={menuItems} user={user} onLogout={handleLogout} navigate={navigate} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => item.current)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.user?.displayName || user?.user?.email || 'Client'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ menuItems, user, onLogout, navigate }) => {
  return (
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4">
        <LockifyHubLogo size="medium" />
        <span className="ml-2 text-xl font-bold text-gray-900">LockifyHub</span>
      </div>

      {/* Client Badge */}
      <div className="mt-5 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-green-600" />
            <span className="ml-2 text-sm font-medium text-green-800">Client Dashboard</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-green-100 text-green-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  item.current ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Profile section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/client/profile')}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <User className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Profile Settings
          </button>
          <button
            onClick={() => navigate('/client/settings')}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Account Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;