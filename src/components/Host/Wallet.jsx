import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useHostWallet from '../../hooks/useHostWallet';
import ModernHeader from '../Layout/ModernHeader';
import {
  Wallet as WalletIcon,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Plus,
  ChevronRight,
  Clock,
  Check,
  X,
  Info,
  BanknoteIcon,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Wallet = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('month');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  // Get the actual uid from the nested user object
  const userId = user?.user?.uid;

  // Use the real wallet hook with the correct userId
  const {
    walletData,
    transactions,
    loading,
    error,
    earnings,
    createWithdrawal,
    addTestFunds,
    refresh
  } = useHostWallet(userId);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleWithdrawal = async () => {
    if (walletData.balance <= 0) {
      alert('Insufficient balance for withdrawal');
      return;
    }

    const amount = prompt(`Enter withdrawal amount (Available: ₱${walletData.balance.toLocaleString()}):`);
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > walletData.balance) {
      alert('Withdrawal amount exceeds available balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await createWithdrawal(withdrawalAmount);
      if (result.success) {
        alert('Withdrawal request submitted successfully!');
      } else {
        alert(`Withdrawal failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Withdrawal failed: ${err.message}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleTestTopUp = async () => {
    // Check if user is authenticated first
    if (!user || !userId) {
      alert('Please sign in first to add test funds');
      navigate('/signin');
      return;
    }

    const amount = prompt('Enter test amount to add (default: ₱5,000):');
    const topupAmount = amount && !isNaN(amount) ? parseFloat(amount) : 5000;
    
    if (topupAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    setIsTopupLoading(true);
    try {
      const result = await addTestFunds(topupAmount);
      if (result.success) {
        alert(`Successfully added ₱${topupAmount.toLocaleString()} test funds!`);
      } else {
        alert(`Test top-up failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Test top-up error:', err);
      alert(`Test top-up failed: ${err.message}`);
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const formatNextPayout = (nextPayout) => {
    if (!nextPayout) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    return formatDate(nextPayout);
  };

  // Loading skeleton component
  const LoadingSkeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-red-900">Error Loading Wallet Data</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'refund': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  // Check if user is authenticated
  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="host"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={handleSignOut}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to access your wallet</p>
            <button
              onClick={() => navigate('/signin')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="host"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your earnings and payouts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleTestTopUp}
              disabled={isTopupLoading}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isTopupLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isTopupLoading ? 'Adding...' : 'Test Top Up'}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage />}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Available</span>
            </div>
            {loading ? (
              <LoadingSkeleton className="h-8 w-32 mb-4" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                ₱{walletData.balance.toLocaleString()}
              </div>
            )}
            <button 
              onClick={handleWithdrawal}
              disabled={loading || isWithdrawing || walletData.balance <= 0}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isWithdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Withdraw Funds'
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
            {loading ? (
              <LoadingSkeleton className="h-8 w-32 mb-4" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                ₱{walletData.pending.toLocaleString()}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              Next payout: {formatNextPayout(walletData.nextPayout)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BanknoteIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Total Withdrawn</span>
            </div>
            {loading ? (
              <LoadingSkeleton className="h-8 w-32 mb-4" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                ₱{walletData.withdrawn.toLocaleString()}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              Account: {walletData.bankAccount || '****1234'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              {loading ? (
                <LoadingSkeleton className="h-4 w-12" />
              ) : (
                <span className={`text-xs font-medium ${
                  earnings.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {earnings.growth >= 0 ? '+' : ''}{earnings.growth}%
                </span>
              )}
            </div>
            {loading ? (
              <LoadingSkeleton className="h-8 w-32 mb-4" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                ₱{earnings.thisMonth.toLocaleString()}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              This month's earnings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payouts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payouts
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <LoadingSkeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <LoadingSkeleton className="h-4 w-48 mb-2" />
                            <LoadingSkeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="text-right">
                          <LoadingSkeleton className="h-4 w-20 mb-2" />
                          <LoadingSkeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No transactions yet</p>
                    <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div key={transaction.id || `transaction-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {transaction.user || transaction.reference} • {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                      <option>All Transactions</option>
                      <option>Earnings</option>
                      <option>Withdrawals</option>
                      <option>Refunds</option>
                    </select>
                    <input
                      type="date"
                      className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-4">
                          <LoadingSkeleton className="w-8 h-8 rounded-full" />
                          <div>
                            <LoadingSkeleton className="h-4 w-48 mb-2" />
                            <LoadingSkeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <LoadingSkeleton className="h-4 w-20" />
                          <LoadingSkeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No transactions found</p>
                    <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                          <tr key={transaction.id || `transaction-full-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {transaction.description}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {transaction.user || transaction.reference}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Automatic Payouts Enabled</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your earnings are automatically transferred to your bank account every Monday.
                        Next payout: {walletData.nextPayout}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payout Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Next Payout</h4>
                      {loading ? (
                        <div>
                          <LoadingSkeleton className="h-8 w-32 mb-2" />
                          <LoadingSkeleton className="h-4 w-24" />
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">₱{walletData.pending.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-1">{formatNextPayout(walletData.nextPayout)}</p>
                        </div>
                      )}
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Payout Method</h4>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">Bank Account</p>
                          <p className="text-sm text-gray-500">{walletData.bankAccount || '****1234'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">January 22, 2025</p>
                          <p className="text-sm text-gray-500">Bank Transfer • {walletData.bankAccount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₱15,000</p>
                          <span className="inline-flex items-center text-xs text-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">January 15, 2025</p>
                          <p className="text-sm text-gray-500">Bank Transfer • {walletData.bankAccount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₱12,500</p>
                          <span className="inline-flex items-center text-xs text-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Bank Account</h4>
                          <p className="text-sm text-gray-500">Your primary payout method</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">BDO Savings Account</p>
                          <p className="text-sm text-gray-500">{walletData.bankAccount || '****1234'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Payout Schedule</h4>
                          <p className="text-sm text-gray-500">When you receive your earnings</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Change
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payout"
                            defaultChecked
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Weekly (Every Monday)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payout"
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Bi-weekly</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payout"
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Monthly</span>
                        </label>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Minimum Payout Amount</h4>
                          <p className="text-sm text-gray-500">Currently set to ₱1,000</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Tax Documents</h4>
                        <p className="text-sm text-gray-500">Download your tax forms and statements</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Download 2024 Tax Summary</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;