import React from 'react';
import { DollarSign } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  Calendar,
  MessageSquare, 
  Bell, 
  Settings as SettingsIcon,
  LogOut,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/listings', icon: Package, label: 'Listings' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/chat', icon: MessageSquare, label: 'Chat Support' },
    { path: '/payments', icon: DollarSign, label: 'Payments' },
    { path: '/announcements', icon: Bell, label: 'Announcements' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Package size={24} />
          </div>
          <h2 className="text-xl font-bold">Storage Admin</h2>
        </div>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'hover:bg-gray-800 text-gray-300'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors w-full text-gray-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;