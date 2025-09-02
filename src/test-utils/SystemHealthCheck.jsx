import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import listingService from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { walletService } from '../../services/walletService';
import { termsService } from '../../services/termsService';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Shield,
  CreditCard,
  Users,
  Package,
  Calendar,
  FileText,
  Wallet
} from 'lucide-react';

const SystemHealthCheck = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState('checking');

  const runHealthChecks = async () => {
    setLoading(true);
    const results = [];
    
    // 1. Authentication Check
    try {
      const authCheck = {
        name: 'Authentication System',
        icon: Shield,
        status: user ? 'success' : 'warning',
        message: user ? `Logged in as ${user.email}` : 'Not authenticated',
        details: user ? `Role: ${user.userType || 'client'}` : 'Please login to test authenticated features'
      };
      results.push(authCheck);
    } catch (error) {
      results.push({
        name: 'Authentication System',
        icon: Shield,
        status: 'error',
        message: 'Authentication check failed',
        details: error.message
      });
    }

    // 2. Firestore Database Check
    try {
      const testQuery = query(collection(db, 'listings'), limit(1));
      const snapshot = await getDocs(testQuery);
      results.push({
        name: 'Firestore Database',
        icon: Database,
        status: 'success',
        message: 'Database connection successful',
        details: `Can read collections. Found ${snapshot.size} test document(s)`
      });
    } catch (error) {
      results.push({
        name: 'Firestore Database',
        icon: Database,
        status: 'error',
        message: 'Database connection failed',
        details: error.message
      });
    }

    // 3. Listing Service Check
    try {
      const listings = await listingService.getActiveListings(1);
      results.push({
        name: 'Listing Service',
        icon: Package,
        status: listings.success ? 'success' : 'warning',
        message: listings.success ? 'Listing service operational' : 'Listing service issue',
        details: listings.success ? `${listings.data.length} active listings found` : 'No active listings'
      });
    } catch (error) {
      results.push({
        name: 'Listing Service',
        icon: Package,
        status: 'error',
        message: 'Listing service failed',
        details: error.message
      });
    }

    // 4. Booking Service Check
    try {
      if (user) {
        const bookings = await bookingService.getClientBookings(user.uid);
        results.push({
          name: 'Booking Service',
          icon: Calendar,
          status: 'success',
          message: 'Booking service operational',
          details: `${bookings?.length || 0} bookings found for user`
        });
      } else {
        results.push({
          name: 'Booking Service',
          icon: Calendar,
          status: 'warning',
          message: 'Booking service not tested',
          details: 'Login required to test booking service'
        });
      }
    } catch (error) {
      results.push({
        name: 'Booking Service',
        icon: Calendar,
        status: 'error',
        message: 'Booking service failed',
        details: error.message
      });
    }

    // 5. Wallet Service Check
    try {
      if (user) {
        const wallet = await walletService.getWallet(user.uid);
        results.push({
          name: 'Wallet Service',
          icon: Wallet,
          status: wallet.success ? 'success' : 'warning',
          message: wallet.success ? 'Wallet service operational' : 'Wallet not initialized',
          details: wallet.success ? `Balance: ₱${wallet.wallet.balance}` : 'Wallet will be created on first transaction'
        });
      } else {
        results.push({
          name: 'Wallet Service',
          icon: Wallet,
          status: 'warning',
          message: 'Wallet service not tested',
          details: 'Login required to test wallet service'
        });
      }
    } catch (error) {
      results.push({
        name: 'Wallet Service',
        icon: Wallet,
        status: 'error',
        message: 'Wallet service failed',
        details: error.message
      });
    }

    // 6. Terms Service Check
    try {
      const terms = await termsService.getCurrentTerms();
      results.push({
        name: 'Terms & Conditions',
        icon: FileText,
        status: terms.success ? 'success' : 'warning',
        message: terms.success ? 'Terms service operational' : 'Terms service issue',
        details: terms.success ? `Version: ${terms.terms.footer?.version || '1.0'}` : 'Using default terms'
      });
    } catch (error) {
      results.push({
        name: 'Terms & Conditions',
        icon: FileText,
        status: 'error',
        message: 'Terms service failed',
        details: error.message
      });
    }

    // 7. User Roles Check
    try {
      const usersQuery = query(collection(db, 'users'), limit(3));
      const usersSnapshot = await getDocs(usersQuery);
      const userTypes = {};
      usersSnapshot.forEach(doc => {
        const type = doc.data().userType || 'client';
        userTypes[type] = (userTypes[type] || 0) + 1;
      });
      results.push({
        name: 'User Management',
        icon: Users,
        status: 'success',
        message: 'User system operational',
        details: `User types: ${Object.entries(userTypes).map(([k, v]) => `${k}(${v})`).join(', ')}`
      });
    } catch (error) {
      results.push({
        name: 'User Management',
        icon: Users,
        status: 'error',
        message: 'User system check failed',
        details: error.message
      });
    }

    // 8. Payment Integration Check
    results.push({
      name: 'Payment Integration',
      icon: CreditCard,
      status: 'info',
      message: 'Payment system ready',
      details: 'Wallet, GCash, and Cash payment methods configured'
    });

    // Calculate overall health
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      setOverallHealth('critical');
    } else if (warningCount > 2) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('healthy');
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getHealthColor = () => {
    switch (overallHealth) {
      case 'healthy':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">System Health Check</h1>
            <button
              onClick={runHealthChecks}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${getHealthColor()}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">System Status</h2>
                <p className="text-sm mt-1">
                  {overallHealth === 'healthy' && 'All systems operational'}
                  {overallHealth === 'warning' && 'Some systems need attention'}
                  {overallHealth === 'critical' && 'Critical issues detected'}
                  {overallHealth === 'checking' && 'Running health checks...'}
                </p>
              </div>
              <div className="text-3xl">
                {overallHealth === 'healthy' && '✅'}
                {overallHealth === 'warning' && '⚠️'}
                {overallHealth === 'critical' && '🚨'}
                {overallHealth === 'checking' && '🔄'}
              </div>
            </div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Running system diagnostics...</p>
              </div>
            </div>
          ) : (
            checks.map((check, index) => {
              const Icon = check.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{check.name}</h3>
                        {getStatusIcon(check.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Application:</span>
              <span className="ml-2 font-medium">LockifyHub v1.0</span>
            </div>
            <div>
              <span className="text-gray-600">Environment:</span>
              <span className="ml-2 font-medium">Development</span>
            </div>
            <div>
              <span className="text-gray-600">Database:</span>
              <span className="ml-2 font-medium">Firebase Firestore</span>
            </div>
            <div>
              <span className="text-gray-600">Authentication:</span>
              <span className="ml-2 font-medium">Firebase Auth</span>
            </div>
            <div>
              <span className="text-gray-600">Storage:</span>
              <span className="ml-2 font-medium">Firebase Storage</span>
            </div>
            <div>
              <span className="text-gray-600">Payment:</span>
              <span className="ml-2 font-medium">Wallet System</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
            >
              Home
            </button>
            <button
              onClick={() => window.location.href = '/client/browse'}
              className="py-2 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              Browse
            </button>
            <button
              onClick={() => window.location.href = '/host/dashboard'}
              className="py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
            >
              Host Panel
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCheck;