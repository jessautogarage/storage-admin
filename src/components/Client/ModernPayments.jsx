import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserBookings from '../../hooks/useUserBookings';
import ModernHeader from '../Layout/ModernHeader';
import {
  CreditCard,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Check,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  TrendingUp,
  PieChart,
  DollarSign
} from 'lucide-react';

const ModernPayments = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fetch user bookings to get payment data
  const userId = user?.user?.uid || user?.uid;
  const { bookings, loading: bookingsLoading, stats } = useUserBookings(userId, 'client');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, failed
  const [filterType, setFilterType] = useState('all'); // all, booking, refund, fee
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Mock payment methods data
  const mockPaymentMethods = [
    {
      id: 'card_1',
      type: 'credit_card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      nickname: 'Personal Visa'
    },
    {
      id: 'card_2',
      type: 'credit_card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
      nickname: 'Business Card'
    },
    {
      id: 'gcash_1',
      type: 'gcash',
      phoneNumber: '+639171234567',
      isDefault: false,
      nickname: 'GCash Account'
    }
  ];

  // Mock transaction data - in real app, this would come from payment service
  const mockTransactions = [
    {
      id: 'txn_1',
      bookingId: 'BK-2024-001',
      listingTitle: 'Secure Storage Unit in Makati CBD',
      type: 'booking',
      amount: 2500,
      status: 'completed',
      paymentMethod: mockPaymentMethods[0],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      description: 'Monthly storage rental payment',
      receiptUrl: '/api/receipts/txn_1.pdf',
      hostName: 'Maria Santos'
    },
    {
      id: 'txn_2',
      bookingId: 'BK-2024-002',
      listingTitle: 'Climate-Controlled Warehouse Space',
      type: 'booking',
      amount: 8000,
      status: 'completed',
      paymentMethod: mockPaymentMethods[1],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      description: 'Monthly warehouse rental payment',
      receiptUrl: '/api/receipts/txn_2.pdf',
      hostName: 'Anna Reyes'
    },
    {
      id: 'txn_3',
      bookingId: 'BK-2024-003',
      listingTitle: 'Budget Storage Room - Quezon City',
      type: 'refund',
      amount: 600,
      status: 'completed',
      paymentMethod: mockPaymentMethods[0],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      description: 'Partial refund for early checkout',
      receiptUrl: '/api/receipts/txn_3.pdf',
      hostName: 'Carlos Mendoza'
    },
    {
      id: 'txn_4',
      bookingId: 'BK-2024-004',
      listingTitle: 'Covered Parking Space - BGC',
      type: 'booking',
      amount: 3500,
      status: 'pending',
      paymentMethod: mockPaymentMethods[2],
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      description: 'Monthly parking rental payment',
      hostName: 'Juan Dela Cruz'
    },
    {
      id: 'txn_5',
      bookingId: 'BK-2024-001',
      listingTitle: 'Platform Service Fee',
      type: 'fee',
      amount: 125,
      status: 'completed',
      paymentMethod: mockPaymentMethods[0],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      description: 'LockifyHub service fee (5%)',
      hostName: 'LockifyHub'
    }
  ];

  // Generate transactions from real booking data
  const transactions = bookings ? bookings.map(booking => ({
    id: `txn_${booking.id}`,
    bookingId: booking.id,
    listingTitle: booking.listingTitle || 'Storage Space',
    type: 'booking',
    amount: booking.pricing?.totalAmount || booking.totalAmount || 0,
    status: booking.paymentStatus || (booking.status === 'confirmed' ? 'completed' : 'pending'),
    date: booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt),
    method: booking.paymentMethod || 'GCash',
    methodLogo: '/api/placeholder/32/32?text=GC',
    description: `Payment for ${booking.listingTitle}`,
    receiptUrl: null
  })) : [];

  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.hostName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'refund':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'fee':
        return <Receipt className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (method.type === 'credit_card') {
      return `•••• ${method.last4}`;
    } else if (method.type === 'gcash') {
      return `GCash ${method.phoneNumber.slice(-4)}`;
    }
    return method.nickname || 'Unknown';
  };

  const getPaymentMethodIcon = (method) => {
    if (method.type === 'credit_card') {
      return <CreditCard className="w-5 h-5 text-gray-600" />;
    } else if (method.type === 'gcash') {
      return <Wallet className="w-5 h-5 text-blue-600" />;
    }
    return <CreditCard className="w-5 h-5 text-gray-600" />;
  };

  // Calculate summary statistics
  const getTotalSpent = () => {
    return filteredTransactions
      .filter(t => t.type === 'booking' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalRefunds = () => {
    return filteredTransactions
      .filter(t => t.type === 'refund' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPendingAmount = () => {
    return filteredTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const PaymentSummary = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">₱{getTotalSpent().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Refunds</p>
            <p className="text-2xl font-bold text-gray-900">₱{getTotalRefunds().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">₱{getPendingAmount().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentMethodCard = ({ method }) => (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getPaymentMethodIcon(method)}
          <div>
            <p className="font-medium text-gray-900">{method.nickname}</p>
            <p className="text-sm text-gray-600">
              {getPaymentMethodDisplay(method)}
              {method.type === 'credit_card' && (
                <span className="ml-2">• Expires {method.expiryMonth}/{method.expiryYear}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {method.isDefault && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
              Default
            </span>
          )}
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  const TransactionCard = ({ transaction }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="flex items-center space-x-2">
            {getTypeIcon(transaction.type)}
            <div className="flex items-center space-x-2">
              {getStatusIcon(transaction.status)}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {transaction.listingTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {transaction.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Host: {transaction.hostName}</span>
              <span>•</span>
              <span>{formatDateTime(transaction.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-lg font-bold ${
            transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'
          }`}>
            {transaction.type === 'refund' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
          </div>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {getPaymentMethodIcon(transaction.paymentMethod)}
          <span>{getPaymentMethodDisplay(transaction.paymentMethod)}</span>
        </div>

        <div className="flex items-center space-x-3">
          {transaction.receiptUrl && (
            <button
              onClick={() => {
                setSelectedPayment(transaction);
                setShowReceiptModal(true);
              }}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Receipt</span>
            </button>
          )}
          
          {transaction.receiptUrl && (
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
          
          {transaction.bookingId && (
            <button
              onClick={() => navigate('/client/bookings')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Show loading state while bookings are loading
  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="client"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="client"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-green-600" />
            <span>Payments</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your payment methods and view transaction history
          </p>
        </div>

        {/* Payment Summary */}
        <PaymentSummary />

        {/* Payment Methods Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="refund">Refunds</option>
              <option value="fee">Fees</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="text-center py-16">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Complete your first booking to see payment transactions here.'
                }
              </p>
              {!searchQuery && filterStatus === 'all' && filterType === 'all' && (
                <button
                  onClick={() => navigate('/client/browse')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Storage Spaces
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernPayments;