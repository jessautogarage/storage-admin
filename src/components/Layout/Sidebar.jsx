import React from 'react';
import { DollarSign, Warehouse } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import LockifyHubLogo from '../Logo/LockifyHubLogo';
import { 
  Home, 
  Users, 
  Package, 
  Calendar,
  MessageSquare, 
  Bell, 
  Settings as SettingsIcon,
  LogOut,
  BarChart3,
  Shield,
  AlertCircle,
  CreditCard,
  Star,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/listings', icon: Package, label: 'Listings' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/chat', icon: MessageSquare, label: 'Chat Support' },
    { path: '/payments', icon: DollarSign, label: 'Payments' },
    { path: '/payouts', icon: CreditCard, label: 'Payouts' },
    { path: '/disputes', icon: AlertCircle, label: 'Disputes' },
    { path: '/reviews', icon: Star, label: 'Reviews' },
    { path: '/verification', icon: CheckCircle, label: 'Verification' },
    { path: '/audit', icon: Shield, label: 'Audit Log' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/announcements', icon: FileText, label: 'Announcements' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col">
      <div className="p-6">
        <LockifyHubLogo size="medium" variant="dark" />
        <p className="text-xs text-gray-400 mt-2">Admin Portal</p>
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