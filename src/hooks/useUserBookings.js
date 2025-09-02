import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const useUserBookings = (userId, userType = 'client') => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeCount: 0,
    completedCount: 0,
    upcomingCount: 0,
    reviewsCount: 0
  });

  // Fetch bookings based on user type
  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query bookings based on user type
      const constraints = userType === 'client' 
        ? [where('clientId', '==', userId)]
        : [where('hostId', '==', userId)];
      
      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, 'bookings'), ...constraints);
      const snapshot = await getDocs(q);

      const bookingsData = [];
      let totalSpent = 0;
      let activeCount = 0;
      let completedCount = 0;
      let upcomingCount = 0;

      // Process each booking
      for (const bookingDoc of snapshot.docs) {
        const bookingData = {
          id: bookingDoc.id,
          ...bookingDoc.data()
        };

        // Fetch related listing data if exists
        if (bookingData.listingId) {
          try {
            const listingDoc = await getDoc(doc(db, 'listings', bookingData.listingId));
            if (listingDoc.exists()) {
              bookingData.listing = listingDoc.data();
            }
          } catch (err) {
            console.error('Error fetching listing:', err);
          }
        }

        // Fetch host data if client view
        if (userType === 'client' && bookingData.hostId) {
          try {
            const hostDoc = await getDoc(doc(db, 'users', bookingData.hostId));
            if (hostDoc.exists()) {
              bookingData.host = hostDoc.data();
            }
          } catch (err) {
            console.error('Error fetching host:', err);
          }
        }

        // Fetch client data if host view
        if (userType === 'host' && bookingData.clientId) {
          try {
            const clientDoc = await getDoc(doc(db, 'users', bookingData.clientId));
            if (clientDoc.exists()) {
              bookingData.client = clientDoc.data();
            }
          } catch (err) {
            console.error('Error fetching client:', err);
          }
        }

        // Calculate stats
        if (userType === 'client') {
          totalSpent += bookingData.totalAmount || 0;
        }

        // Count booking statuses
        switch (bookingData.status) {
          case 'active':
            activeCount++;
            break;
          case 'completed':
            completedCount++;
            break;
          case 'upcoming':
          case 'confirmed':
            upcomingCount++;
            break;
        }

        bookingsData.push(bookingData);
      }

      setBookings(bookingsData);
      setStats({
        totalSpent,
        activeCount,
        completedCount,
        upcomingCount,
        reviewsCount: 0 // Could be calculated from reviews collection
      });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Create a new booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      const newBooking = {
        ...bookingData,
        clientId: userId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Fetch the created booking with its ID
      const bookingDoc = await getDoc(docRef);
      const createdBooking = {
        id: docRef.id,
        ...bookingDoc.data()
      };

      // Update local state
      setBookings(prev => [createdBooking, ...prev]);

      return { success: true, booking: createdBooking };
    } catch (err) {
      console.error('Error creating booking:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  // Update booking status
  const updateBooking = useCallback(async (bookingId, updates) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates }
          : booking
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating booking:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId, reason = '') => {
    return updateBooking(bookingId, {
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: serverTimestamp()
    });
  }, [updateBooking]);

  // Confirm a booking (for hosts)
  const confirmBooking = useCallback(async (bookingId) => {
    return updateBooking(bookingId, {
      status: 'confirmed',
      confirmedAt: serverTimestamp()
    });
  }, [updateBooking]);

  // Mark booking as active (when storage period starts)
  const activateBooking = useCallback(async (bookingId) => {
    return updateBooking(bookingId, {
      status: 'active',
      activatedAt: serverTimestamp()
    });
  }, [updateBooking]);

  // Complete a booking
  const completeBooking = useCallback(async (bookingId) => {
    return updateBooking(bookingId, {
      status: 'completed',
      completedAt: serverTimestamp()
    });
  }, [updateBooking]);

  // Get booking by ID
  const getBookingById = useCallback(async (bookingId) => {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      
      if (bookingDoc.exists()) {
        const bookingData = {
          id: bookingDoc.id,
          ...bookingDoc.data()
        };

        // Fetch related data
        if (bookingData.listingId) {
          const listingDoc = await getDoc(doc(db, 'listings', bookingData.listingId));
          if (listingDoc.exists()) {
            bookingData.listing = listingDoc.data();
          }
        }

        return { success: true, booking: bookingData };
      } else {
        return { success: false, error: 'Booking not found' };
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Calculate total revenue (for hosts)
  const getTotalRevenue = useCallback(() => {
    if (userType !== 'host') return 0;

    return bookings.reduce((total, booking) => {
      if (booking.status === 'completed' || booking.status === 'active') {
        return total + (booking.hostEarnings || booking.totalAmount * 0.85 || 0);
      }
      return total;
    }, 0);
  }, [bookings, userType]);

  // Get upcoming bookings
  const getUpcomingBookings = useCallback(() => {
    return bookings.filter(booking => 
      booking.status === 'upcoming' || 
      booking.status === 'confirmed'
    );
  }, [bookings]);

  // Get active bookings
  const getActiveBookings = useCallback(() => {
    return bookings.filter(booking => booking.status === 'active');
  }, [bookings]);

  // Set up real-time listener
  useEffect(() => {
    if (!userId) return;

    const constraints = userType === 'client' 
      ? [where('clientId', '==', userId)]
      : [where('hostId', '==', userId)];
    
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'bookings'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const bookingsData = [];
        let totalSpent = 0;
        let activeCount = 0;
        let completedCount = 0;
        let upcomingCount = 0;

        for (const bookingDoc of snapshot.docs) {
          const bookingData = {
            id: bookingDoc.id,
            ...bookingDoc.data()
          };

          // Calculate stats
          if (userType === 'client') {
            totalSpent += bookingData.totalAmount || 0;
          }

          switch (bookingData.status) {
            case 'active':
              activeCount++;
              break;
            case 'completed':
              completedCount++;
              break;
            case 'upcoming':
            case 'confirmed':
              upcomingCount++;
              break;
          }

          bookingsData.push(bookingData);
        }

        setBookings(bookingsData);
        setStats({
          totalSpent,
          activeCount,
          completedCount,
          upcomingCount,
          reviewsCount: 0
        });
        setLoading(false);
      },
      (err) => {
        console.error('Real-time listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userType]);

  // Initial fetch with enriched data
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    stats,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    activateBooking,
    completeBooking,
    getBookingById,
    getTotalRevenue,
    getUpcomingBookings,
    getActiveBookings,
    refresh: fetchBookings
  };
};

export default useUserBookings;