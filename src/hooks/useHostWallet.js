import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const useHostWallet = (userId) => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    pending: 0,
    withdrawn: 0,
    nextPayout: null,
    bankAccount: null,
    currency: 'PHP'
  });
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    growth: 0
  });

  // Calculate earnings statistics
  const calculateEarnings = useCallback((transactionsData, bookingsData = []) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    let thisYearTotal = 0;

    // Calculate from completed bookings
    bookingsData.forEach(booking => {
      if (booking.status === 'completed' && booking.hostEarnings) {
        const bookingDate = booking.completedAt?.toDate() || booking.createdAt?.toDate();
        if (bookingDate) {
          const bookingMonth = bookingDate.getMonth();
          const bookingYear = bookingDate.getFullYear();

          if (bookingYear === thisYear) {
            thisYearTotal += booking.hostEarnings;
            
            if (bookingMonth === thisMonth) {
              thisMonthTotal += booking.hostEarnings;
            }
          }

          if (bookingYear === lastMonthYear && bookingMonth === lastMonth) {
            lastMonthTotal += booking.hostEarnings;
          }
        }
      }
    });

    // Also include earning transactions
    transactionsData.forEach(transaction => {
      if (transaction.type === 'earning' && transaction.status === 'completed') {
        const transactionDate = transaction.createdAt?.toDate();
        if (transactionDate) {
          const transactionMonth = transactionDate.getMonth();
          const transactionYear = transactionDate.getFullYear();

          if (transactionYear === thisYear) {
            thisYearTotal += transaction.amount;
            
            if (transactionMonth === thisMonth) {
              thisMonthTotal += transaction.amount;
            }
          }

          if (transactionYear === lastMonthYear && transactionMonth === lastMonth) {
            lastMonthTotal += transaction.amount;
          }
        }
      }
    });

    const growth = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    return {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      thisYear: thisYearTotal,
      growth: Number(growth.toFixed(1))
    };
  }, []);

  // Fetch wallet data and transactions
  const fetchWalletData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch wallet document
      const walletDoc = await getDoc(doc(db, 'wallets', userId));
      
      if (walletDoc.exists()) {
        const walletInfo = walletDoc.data();
        setWalletData({
          balance: walletInfo.balance || 0,
          pending: walletInfo.pending || 0,
          withdrawn: walletInfo.withdrawn || 0,
          nextPayout: walletInfo.nextPayout,
          bankAccount: walletInfo.bankAccount,
          currency: walletInfo.currency || 'PHP'
        });
      } else {
        // Create initial wallet document
        const initialWallet = {
          balance: 0,
          pending: 0,
          withdrawn: 0,
          nextPayout: null,
          bankAccount: null,
          currency: 'PHP',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'wallets', userId), initialWallet);
        setWalletData(initialWallet);
      }

      // Fetch transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('hostId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Deduplicate transactions by ID
      const uniqueTransactions = Array.from(
        new Map(transactionsData.map(t => [t.id, t])).values()
      );

      setTransactions(uniqueTransactions);

      // Fetch bookings for earnings calculation
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('hostId', '==', userId),
        where('status', '==', 'completed')
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate earnings
      const earningsStats = calculateEarnings(uniqueTransactions, bookingsData);
      setEarnings(earningsStats);

    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, calculateEarnings]);

  // Create a withdrawal request
  const createWithdrawal = useCallback(async (amount, bankAccount = null) => {
    try {
      if (amount > walletData.balance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create withdrawal transaction
      const withdrawalData = {
        hostId: userId,
        type: 'withdrawal',
        description: `Bank Transfer to ${bankAccount || walletData.bankAccount || '****1234'}`,
        amount: -Math.abs(amount),
        status: 'pending',
        reference: `WD-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'transactions'), withdrawalData);

      // Update wallet balance
      await updateDoc(doc(db, 'wallets', userId), {
        balance: walletData.balance - amount,
        pending: walletData.pending + amount,
        updatedAt: serverTimestamp()
      });

      // Update local state
      const newTransaction = {
        id: docRef.id,
        ...withdrawalData,
        createdAt: Timestamp.now()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance - amount,
        pending: prev.pending + amount
      }));

      return { success: true, transaction: newTransaction };
    } catch (err) {
      console.error('Error creating withdrawal:', err);
      return { success: false, error: err.message };
    }
  }, [userId, walletData]);

  // Add test funds for development
  const addTestFunds = useCallback(async (amount = 5000) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Create test earning transaction
      const testEarningData = {
        hostId: userId,
        clientId: 'test-system',
        type: 'earning',
        description: `Test Top Up - Development Funds`,
        amount: amount,
        status: 'completed',
        user: 'System Test',
        bookingId: `test-${Date.now()}`,
        paymentMethod: 'test',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'transactions'), testEarningData);

      // Check if wallet exists, if not create it
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        // Initialize wallet if it doesn't exist
        await setDoc(walletRef, {
          userId: userId,
          balance: amount,
          currency: 'PHP',
          userType: 'host',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          minBalance: 500,
          maxBalance: 1000000,
          totalDeposits: amount,
          totalWithdrawals: 0,
          totalEarned: amount,
          totalSpent: 0,
          isVerified: false,
          lastTransactionAt: serverTimestamp()
        });
      } else {
        // Update existing wallet balance
        const currentBalance = walletDoc.data().balance || 0;
        await updateDoc(walletRef, {
          balance: currentBalance + amount,
          totalDeposits: (walletDoc.data().totalDeposits || 0) + amount,
          totalEarned: (walletDoc.data().totalEarned || 0) + amount,
          lastTransactionAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Update local state
      const newBalance = walletDoc.exists() 
        ? (walletDoc.data().balance || 0) + amount 
        : amount;
        
      const newTransaction = {
        id: docRef.id,
        hostId: userId,
        clientId: 'test-system',
        type: 'earning',
        description: `Test Top Up - Development Funds`,
        amount: amount,
        status: 'completed',
        user: 'System Test',
        createdAt: Timestamp.now()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setWalletData(prev => ({
        ...prev,
        balance: newBalance,
        totalDeposits: (prev.totalDeposits || 0) + amount,
        totalEarned: (prev.totalEarned || 0) + amount
      }));

      return { success: true, transaction: newTransaction };
    } catch (err) {
      console.error('Error adding test funds:', err);
      return { success: false, error: err.message };
    }
  }, [userId, walletData]);

  // Refresh wallet data
  const refresh = useCallback(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Set up real-time listener for transactions
  useEffect(() => {
    if (!userId) return;

    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('hostId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Deduplicate transactions by ID
        const uniqueTransactions = Array.from(
          new Map(transactionsData.map(t => [t.id, t])).values()
        );

        setTransactions(uniqueTransactions);
        
        // Recalculate earnings when transactions change
        const earningsStats = calculateEarnings(uniqueTransactions);
        setEarnings(earningsStats);
      },
      (err) => {
        console.error('Real-time transactions listener error:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [userId, calculateEarnings]);

  // Set up real-time listener for wallet
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'wallets', userId),
      (doc) => {
        if (doc.exists()) {
          const walletInfo = doc.data();
          setWalletData({
            balance: walletInfo.balance || 0,
            pending: walletInfo.pending || 0,
            withdrawn: walletInfo.withdrawn || 0,
            nextPayout: walletInfo.nextPayout,
            bankAccount: walletInfo.bankAccount,
            currency: walletInfo.currency || 'PHP'
          });
        }
      },
      (err) => {
        console.error('Real-time wallet listener error:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    walletData,
    transactions,
    loading,
    error,
    earnings,
    createWithdrawal,
    addTestFunds,
    refresh
  };
};

export default useHostWallet;