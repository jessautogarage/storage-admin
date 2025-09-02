import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';

const usePaymentHistory = (userId, userType = 'client') => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPayments: 0,
    avgPayment: 0,
    lastPayment: null
  });

  // Fetch payment history
  const fetchPayments = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query payments based on user type
      const field = userType === 'client' ? 'clientId' : 'hostId';
      const q = query(
        collection(db, 'payments'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const paymentsData = [];
      let totalPaid = 0;

      // Process each payment
      for (const paymentDoc of snapshot.docs) {
        const paymentData = {
          id: paymentDoc.id,
          ...paymentDoc.data(),
          createdAt: paymentDoc.data().createdAt?.toDate()
        };

        // Fetch related booking data if exists
        if (paymentData.bookingId) {
          try {
            const bookingDoc = await getDoc(doc(db, 'bookings', paymentData.bookingId));
            if (bookingDoc.exists()) {
              paymentData.booking = bookingDoc.data();
            }
          } catch (err) {
            console.error('Error fetching booking:', err);
          }
        }

        // Fetch related listing data if exists
        if (paymentData.listingId) {
          try {
            const listingDoc = await getDoc(doc(db, 'listings', paymentData.listingId));
            if (listingDoc.exists()) {
              paymentData.listing = listingDoc.data();
            }
          } catch (err) {
            console.error('Error fetching listing:', err);
          }
        }

        // Calculate totals
        if (paymentData.status === 'verified' || paymentData.status === 'completed') {
          totalPaid += paymentData.amount || 0;
        }

        paymentsData.push(paymentData);
      }

      // If no real payments, create mock data for demo
      if (paymentsData.length === 0 && userType === 'client') {
        const mockPayments = [
          {
            id: 'demo-payment-1',
            amount: 2500,
            method: 'gcash',
            status: 'verified',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            bookingId: 'demo-booking-1',
            referenceNumber: 'GC-' + Date.now().toString().slice(-6),
            listing: {
              title: 'Secure Storage Unit in Makati',
              location: { city: 'Makati', district: 'CBD' }
            },
            booking: {
              startDate: new Date(Date.now() + 86400000),
              endDate: new Date(Date.now() + 2592000000), // 30 days
              duration: 30
            }
          },
          {
            id: 'demo-payment-2',
            amount: 1800,
            method: 'bank',
            status: 'verified',
            createdAt: new Date(Date.now() - 604800000), // 1 week ago
            bookingId: 'demo-booking-2',
            referenceNumber: 'BK-' + (Date.now() - 604800000).toString().slice(-6),
            listing: {
              title: 'Climate-Controlled Storage',
              location: { city: 'Quezon City', district: 'Diliman' }
            },
            booking: {
              startDate: new Date(Date.now() - 518400000), // 6 days ago
              endDate: new Date(Date.now() + 2073600000), // 24 days
              duration: 30
            }
          }
        ];
        
        setPayments(mockPayments);
        setStats({
          totalPaid: 4300,
          totalPayments: 2,
          avgPayment: 2150,
          lastPayment: mockPayments[0]
        });
      } else {
        setPayments(paymentsData);
        
        // Calculate stats
        const verifiedPayments = paymentsData.filter(p => p.status === 'verified' || p.status === 'completed');
        const avgPayment = verifiedPayments.length > 0 ? totalPaid / verifiedPayments.length : 0;
        
        setStats({
          totalPaid,
          totalPayments: verifiedPayments.length,
          avgPayment,
          lastPayment: paymentsData[0] || null
        });
      }
      
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
      
      // Fallback to empty state with mock data for client
      if (userType === 'client') {
        const fallbackPayment = {
          id: 'fallback-payment',
          amount: 0,
          method: 'gcash',
          status: 'pending',
          createdAt: new Date(),
          listing: { title: 'No payments yet' }
        };
        setPayments([fallbackPayment]);
        setStats({ totalPaid: 0, totalPayments: 0, avgPayment: 0, lastPayment: null });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Get recent payments (last 5)
  const getRecentPayments = useCallback(() => {
    return payments.slice(0, 5);
  }, [payments]);

  // Get payments by status
  const getPaymentsByStatus = useCallback((status) => {
    return payments.filter(p => p.status === status);
  }, [payments]);

  // Get payments by method
  const getPaymentsByMethod = useCallback((method) => {
    return payments.filter(p => p.method === method);
  }, [payments]);

  // Get monthly payment total
  const getMonthlyTotal = useCallback((month, year) => {
    return payments
      .filter(p => {
        const paymentDate = p.createdAt;
        return paymentDate && 
               paymentDate.getMonth() === month && 
               paymentDate.getFullYear() === year &&
               (p.status === 'verified' || p.status === 'completed');
      })
      .reduce((total, p) => total + (p.amount || 0), 0);
  }, [payments]);

  // Get payment method breakdown
  const getMethodBreakdown = useCallback(() => {
    const breakdown = { gcash: 0, bank: 0, other: 0 };
    
    payments
      .filter(p => p.status === 'verified' || p.status === 'completed')
      .forEach(p => {
        if (breakdown.hasOwnProperty(p.method)) {
          breakdown[p.method] += p.amount || 0;
        } else {
          breakdown.other += p.amount || 0;
        }
      });
    
    return breakdown;
  }, [payments]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    stats,
    getRecentPayments,
    getPaymentsByStatus,
    getPaymentsByMethod,
    getMonthlyTotal,
    getMethodBreakdown,
    refresh: fetchPayments
  };
};

export default usePaymentHistory;