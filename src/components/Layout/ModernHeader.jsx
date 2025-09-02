import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, MapPin, User, Search, Heart, MessageCircle, Calendar,
  Building, BarChart3, Wallet, Settings, LogOut, Home, Plus
} from 'lucide-react';

const ModernHeader = ({ variant = 'landing', user = null, onSignIn, onSignUp, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const Logo = () => (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className="text-xl font-bold text-gray-900">LockifyHub</span>
    </Link>
  );

  const ClientNavigation = () => (
    <nav className="hidden md:flex items-center space-x-1">
      <Link
        to="/client/browse"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/client/browse')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Search className="w-4 h-4 inline mr-2" />
        Browse Storage
      </Link>
      <Link
        to="/client/bookings"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/client/bookings')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        My Bookings
      </Link>
      <Link
        to="/client/favorites"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/client/favorites')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Heart className="w-4 h-4 inline mr-2" />
        Favorites
      </Link>
      <Link
        to="/client/messages"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/client/messages')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <MessageCircle className="w-4 h-4 inline mr-2" />
        Messages
      </Link>
    </nav>
  );

  const HostNavigation = () => (
    <nav className="hidden md:flex items-center space-x-1">
      <Link
        to="/host-dashboard"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host-dashboard')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Home className="w-4 h-4 inline mr-2" />
        Dashboard
      </Link>
      <Link
        to="/host/listings"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host/listings')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Building className="w-4 h-4 inline mr-2" />
        My Listings
      </Link>
      <Link
        to="/host/bookings"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host/bookings')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        Bookings
      </Link>
      <Link
        to="/host/analytics"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host/analytics')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <BarChart3 className="w-4 h-4 inline mr-2" />
        Analytics
      </Link>
      <Link
        to="/host/wallet"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host/wallet')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <Wallet className="w-4 h-4 inline mr-2" />
        Wallet
      </Link>
      <Link
        to="/host/messages"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/host/messages')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <MessageCircle className="w-4 h-4 inline mr-2" />
        Messages
      </Link>
    </nav>
  );

  const LandingNavigation = () => (
    <nav className="hidden md:flex items-center space-x-8">
      <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
        How it works
      </a>
      <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
        Pricing
      </a>
      <a href="#safety" className="text-gray-700 hover:text-blue-600 transition-colors">
        Safety
      </a>
      <a href="#support" className="text-gray-700 hover:text-blue-600 transition-colors">
        Support
      </a>
    </nav>
  );

  const UserProfile = () => {
    if (!user) {
      return (
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={onSignIn}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={onSignUp}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign up
          </button>
        </div>
      );
    }

    return (
      <div className="relative group">
        <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {user.profile?.name || user.user?.email?.split('@')[0]}
          </span>
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <Link 
            to={`/${user.userType === 'host' ? 'host' : 'client'}/profile`} 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Profile
          </Link>
          <Link 
            to={`/${user.userType === 'host' ? 'host' : 'client'}/settings`} 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Settings
          </Link>
          <hr className="my-1" />
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  };

  const MobileMenu = () => (
    <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
      <div className="fixed top-0 right-0 z-50 w-64 h-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <Logo />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {variant === 'client' && (
            <>
              <Link to="/client/browse" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Search className="w-5 h-5 text-gray-500" />
                <span>Browse Storage</span>
              </Link>
              <Link to="/client/bookings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>My Bookings</span>
              </Link>
              <Link to="/client/favorites" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-500" />
                <span>Favorites</span>
              </Link>
              <Link to="/client/messages" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-5 h-5 text-gray-500" />
                <span>Messages</span>
              </Link>
            </>
          )}
          
          {variant === 'host' && (
            <>
              <Link to="/host/listings" className="block p-2 rounded-lg hover:bg-gray-50">My Listings</Link>
              <Link to="/host/bookings" className="block p-2 rounded-lg hover:bg-gray-50">Bookings</Link>
              <Link to="/host/analytics" className="block p-2 rounded-lg hover:bg-gray-50">Analytics</Link>
              <Link to="/host/messages" className="block p-2 rounded-lg hover:bg-gray-50">Messages</Link>
            </>
          )}
          
          {variant === 'landing' && (
            <>
              <a href="#how-it-works" className="block p-2 rounded-lg hover:bg-gray-50">How it works</a>
              <a href="#pricing" className="block p-2 rounded-lg hover:bg-gray-50">Pricing</a>
              <a href="#safety" className="block p-2 rounded-lg hover:bg-gray-50">Safety</a>
              <a href="#support" className="block p-2 rounded-lg hover:bg-gray-50">Support</a>
            </>
          )}
          
          {user ? (
            <div className="pt-4 border-t space-y-2">
              <Link 
                to={`/${user.userType === 'host' ? 'host' : 'client'}/profile`} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-gray-500" />
                <span>Profile</span>
              </Link>
              <Link 
                to={`/${user.userType === 'host' ? 'host' : 'client'}/settings`} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-gray-50 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t space-y-2">
              <button
                onClick={onSignIn}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Sign in
              </button>
              <button
                onClick={onSignUp}
                className="w-full bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={`sticky top-0 z-30 transition-all duration-200 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
            </div>

            <div className="flex-1 flex justify-center">
              {variant === 'client' && <ClientNavigation />}
              {variant === 'host' && <HostNavigation />}
              {variant === 'landing' && <LandingNavigation />}
            </div>

            <div className="flex items-center space-x-4">
              <UserProfile />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu />
    </>
  );
};

export default ModernHeader;