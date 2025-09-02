import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

class WalletService {
  constructor() {
    this.collection = collection(db, 'wallets');
  }

  /**
   * Initialize wallet for a new user
   * @param {string} userId - User ID
   * @param {string} userType - User type (client/host/admin)
   * @returns {Promise<Object>} Wallet creation result
   */
  async initializeWallet(userId, userType = 'client') {
    try {
      const walletRef = doc(this.collection, userId);
      const walletDoc = await getDoc(walletRef);
      
      if (walletDoc.exists()) {
        return {
          success: true,
          message: 'Wallet already exists',
          wallet: walletDoc.data()
        };
      }

      // Set initial balance based on user type (mockup amounts)
      let initialBalance = 0;
      if (userType === 'admin') {
        initialBalance = 10000; // Admin starts with ₱10,000
      } else if (userType === 'host') {
        initialBalance = 0; // Host starts with ₱0 (must add funds to list)
      } else {
        initialBalance = 2000; // Client starts with ₱2,000 for testing
      }

      const walletData = {
        userId,
        balance: initialBalance,
        currency: 'PHP',
        userType,
        transactions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        // Wallet limits
        minBalance: userType === 'host' ? 500 : 0,
        maxBalance: 1000000,
        // Transaction history summary
        totalDeposits: initialBalance,
        totalWithdrawals: 0,
        totalSpent: 0,
        totalEarned: 0,
        // Additional fields
        isVerified: userType === 'admin',
        lastTransactionAt: null
      };

      await setDoc(walletRef, walletData);

      return {
        success: true,
        message: 'Wallet created successfully',
        wallet: walletData
      };
    } catch (error) {
      console.error('Error initializing wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get wallet balance and details
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Wallet details
   */
  async getWallet(userId) {
    try {
      const walletRef = doc(this.collection, userId);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        return {
          success: false,
          error: 'Wallet not found'
        };
      }

      return {
        success: true,
        wallet: { id: walletDoc.id, ...walletDoc.data() }
      };
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process booking payment with proper fee distribution
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Transaction result
   */
  async processBookingPayment(paymentData) {
    const {
      clientId,
      hostId,
      bookingId,
      amount,
      serviceFee,
      paymentMethod,
      listingTitle
    } = paymentData;

    try {
      return await runTransaction(db, async (transaction) => {
        // Get all wallets involved
        const clientWalletRef = doc(this.collection, clientId);
        const hostWalletRef = doc(this.collection, hostId);
        const adminWalletRef = doc(this.collection, 'admin'); // System admin wallet
        
        const clientWallet = await transaction.get(clientWalletRef);
        const hostWallet = await transaction.get(hostWalletRef);
        const adminWallet = await transaction.get(adminWalletRef);
        
        // Validate wallets exist
        if (!clientWallet.exists()) {
          throw new Error('Client wallet not found');
        }
        if (!hostWallet.exists()) {
          throw new Error('Host wallet not found');
        }
        if (!adminWallet.exists()) {
          // Create admin wallet if it doesn't exist
          const adminWalletData = {
            userId: 'admin',
            balance: 10000,
            currency: 'PHP',
            userType: 'admin',
            transactions: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
            minBalance: 0,
            maxBalance: 1000000000,
            totalDeposits: 10000,
            totalWithdrawals: 0,
            totalSpent: 0,
            totalEarned: 0,
            isVerified: true,
            lastTransactionAt: null
          };
          transaction.set(adminWalletRef, adminWalletData);
        }
        
        const clientBalance = clientWallet.data().balance;
        const hostBalance = hostWallet.data().balance;
        const hostMinBalance = hostWallet.data().minBalance || 500;
        
        // Calculate amounts
        // Client pays only the storage fee
        const clientPayment = amount - serviceFee; // Client doesn't pay service fee
        // Host receives storage fee minus service fee (host pays the service fee)
        const hostReceives = amount - serviceFee; // Host gets the amount minus service fee
        
        // Validate based on payment method
        if (paymentMethod === 'wallet') {
          // Check client has enough balance
          if (clientBalance < clientPayment) {
            throw new Error(`Insufficient wallet balance. Need ₱${clientPayment}, have ₱${clientBalance}`);
          }
        }
        
        // Check host minimum balance after service fee deduction
        if (hostBalance < hostMinBalance) {
          throw new Error(`Host wallet below minimum balance of ₱${hostMinBalance}`);
        }
        
        // Create transaction record
        const transactionRecord = {
          bookingId,
          type: 'booking_payment',
          amount: amount,
          serviceFee: serviceFee,
          clientPays: clientPayment,
          hostReceives: hostReceives,
          paymentMethod,
          listingTitle,
          timestamp: serverTimestamp(),
          status: 'completed'
        };
        
        // Update wallets based on payment method
        if (paymentMethod === 'wallet') {
          // Deduct from client wallet
          transaction.update(clientWalletRef, {
            balance: increment(-clientPayment),
            totalSpent: increment(clientPayment),
            lastTransactionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Add to host wallet (minus service fee that goes to admin)
          transaction.update(hostWalletRef, {
            balance: increment(hostReceives),
            totalEarned: increment(hostReceives),
            lastTransactionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Add service fee to admin wallet
          transaction.update(adminWalletRef, {
            balance: increment(serviceFee),
            totalEarned: increment(serviceFee),
            lastTransactionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else if (paymentMethod === 'gcash' || paymentMethod === 'cash') {
          // For external payment methods, only credit host and admin
          // Client payment is handled externally
          
          // Add to host wallet (minus service fee)
          transaction.update(hostWalletRef, {
            balance: increment(hostReceives),
            totalEarned: increment(hostReceives),
            lastTransactionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Add service fee to admin wallet
          transaction.update(adminWalletRef, {
            balance: increment(serviceFee),
            totalEarned: increment(serviceFee),
            lastTransactionAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // Store transaction record in a separate collection
        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
          ...transactionRecord,
          clientId,
          hostId,
          transactionId: transactionRef.id
        });
        
        return {
          success: true,
          transactionId: transactionRef.id,
          message: 'Payment processed successfully',
          details: transactionRecord
        };
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add funds to wallet (for testing)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @returns {Promise<Object>} Result
   */
  async addFunds(userId, amount) {
    try {
      const walletRef = doc(this.collection, userId);
      
      await updateDoc(walletRef, {
        balance: increment(amount),
        totalDeposits: increment(amount),
        lastTransactionAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: `Successfully added ₱${amount} to wallet`
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has sufficient balance
   * @param {string} userId - User ID
   * @param {number} amount - Required amount
   * @returns {Promise<boolean>} Has sufficient balance
   */
  async hasSufficientBalance(userId, amount) {
    try {
      const result = await this.getWallet(userId);
      if (!result.success) return false;
      
      return result.wallet.balance >= amount;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get transaction history
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Transaction history
   */
  async getTransactionHistory(userId) {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('clientId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const transactions = [];
      
      snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        transactions: transactions.sort((a, b) => b.timestamp - a.timestamp)
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const walletService = new WalletService();