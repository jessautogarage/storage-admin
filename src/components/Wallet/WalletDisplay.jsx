import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../hooks/useAuth';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

const WalletDisplay = ({ compact = false }) => {
  const { user } = useAuth();
  const userId = user?.user?.uid || user?.uid;
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    if (userId) {
      loadWallet();
    }
  }, [userId]);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const result = await walletService.getWallet(userId);
      
      if (result.success) {
        setWallet(result.wallet);
      } else {
        // Initialize wallet if it doesn't exist
        const userType = user?.userType || 'client';
        const initResult = await walletService.initializeWallet(userId, userType);
        if (initResult.success) {
          setWallet(initResult.wallet);
        }
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const result = await walletService.addFunds(userId, amount);
      if (result.success) {
        alert(result.message);
        setAddAmount('');
        setShowAddFunds(false);
        loadWallet(); // Reload wallet data
      } else {
        alert('Failed to add funds: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Failed to add funds');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load wallet</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-xl font-bold text-gray-900">
                ₱{wallet.balance.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddFunds(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Add Funds
          </button>
        </div>
        
        {wallet.userType === 'host' && wallet.balance < wallet.minBalance && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Your balance is below the minimum required (₱{wallet.minBalance})
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Wallet</h2>
          <button
            onClick={loadWallet}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold mt-1">
                ₱{wallet.balance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-blue-100 text-xs">Total Earned</p>
              <p className="text-lg font-semibold">
                ₱{(wallet.totalEarned || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-xs">Total Spent</p>
              <p className="text-lg font-semibold">
                ₱{(wallet.totalSpent || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {wallet.userType === 'host' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Minimum balance requirement: ₱{wallet.minBalance}
                </span>
              </div>
              {wallet.balance >= wallet.minBalance ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Funds</span>
          </button>
          <button
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>
      
      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddFunds(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Wallet</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    min="1"
                    step="100"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setAddAmount('500')}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    ₱500
                  </button>
                  <button
                    onClick={() => setAddAmount('1000')}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    ₱1,000
                  </button>
                  <button
                    onClick={() => setAddAmount('5000')}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    ₱5,000
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium mb-1">Test Mode</p>
                  <p className="text-xs">This is a mockup wallet system for testing. No real money is involved.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAddFunds}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Funds
                </button>
                <button
                  onClick={() => {
                    setShowAddFunds(false);
                    setAddAmount('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDisplay;