import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Warehouse,
  Package,
  Wallet,
  Building
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LockifyHubLogo from '../Logo/LockifyHubLogo';

const HostLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/host-dashboard',
      icon: Home,
      current: location.pathname === '/host-dashboard',
      description: 'Overview and quick actions'
    },
    {
      name: 'Add Listing',
      href: '/host/listings/new',
      icon: Plus,
      current: location.pathname === '/host/listings/new',
      description: 'Create new listing'
    },
    {
      name: 'My Listings',
      href: '/host/listings',
      icon: Building,
      current: location.pathname === '/host/listings',
      description: 'Manage your spaces'
    },
    {
      name: 'Bookings',
      href: '/host/bookings',
      icon: Calendar,
      current: location.pathname === '/host/bookings',
      description: 'Manage reservations'
    },
    {
      name: 'Analytics',
      href: '/host/analytics',
      icon: BarChart3,
      current: location.pathname === '/host/analytics',
      description: 'Performance insights'
    },
    {
      name: 'Messages',
      href: '/host/messages',
      icon: MessageSquare,
      current: location.pathname === '/host/messages',
      description: 'Guest communications'
    },
    {
      name: 'Wallet',
      href: '/host/wallet',
      icon: Wallet,
      current: location.pathname === '/host/wallet',
      description: 'Earnings and payouts'
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
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
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
        <div className="flex flex-col w-72">
          <SidebarContent menuItems={menuItems} user={user} onLogout={handleLogout} navigate={navigate} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {menuItems.find(item => item.current)?.name || 'Dashboard'}
          </h1>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ menuItems, user, onLogout, navigate }) => {
  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6 py-5">
        <LockifyHubLogo size="small" />
      </div>

      {/* User Profile Section */}
      <div className="px-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.profile?.name || user?.user?.email?.split('@')[0] || 'Host'}
            </p>
            <p className="text-xs text-gray-500">Host Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`w-full group flex items-center px-3 py-3 text-left rounded-xl transition-all duration-200 ${
                item.current
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                  item.current 
                    ? 'text-blue-600' 
                    : 'text-gray-400 group-hover:text-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  item.current ? 'text-blue-900' : ''
                }`}>
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 hidden lg:block">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Profile section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/host/profile')}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <User className="mr-3 flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            Profile
          </button>
          <button
            onClick={() => navigate('/host/settings')}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="mr-3 flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-4 w-4 text-red-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostLayout;