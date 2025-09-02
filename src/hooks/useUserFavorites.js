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
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const useUserFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorites with listing details
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query favorites for this user
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const favoritesData = [];

      // Fetch listing details for each favorite
      for (const favoriteDoc of snapshot.docs) {
        const favoriteData = {
          id: favoriteDoc.id,
          ...favoriteDoc.data()
        };

        // Fetch listing details
        if (favoriteData.listingId) {
          try {
            const listingDoc = await getDoc(doc(db, 'listings', favoriteData.listingId));
            if (listingDoc.exists()) {
              favoriteData.listing = {
                id: listingDoc.id,
                ...listingDoc.data()
              };
            }
          } catch (err) {
            console.error('Error fetching listing:', err);
          }
        }

        favoritesData.push(favoriteData);
      }

      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add a favorite
  const addFavorite = useCallback(async (listingId) => {
    if (!userId || !listingId) return { success: false, error: 'Missing required data' };

    try {
      // Check if already favorited
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('listingId', '==', listingId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return { success: false, error: 'Already in favorites' };
      }

      // Add new favorite
      const favoriteData = {
        userId,
        listingId,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
      
      // Fetch listing details for the new favorite
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      const newFavorite = {
        id: docRef.id,
        ...favoriteData,
        listing: listingDoc.exists() ? { id: listingDoc.id, ...listingDoc.data() } : null
      };

      // Update local state
      setFavorites(prev => [newFavorite, ...prev]);

      return { success: true, favorite: newFavorite };
    } catch (err) {
      console.error('Error adding favorite:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  // Remove a favorite
  const removeFavorite = useCallback(async (favoriteId) => {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      
      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));

      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Remove favorite by listing ID
  const removeFavoriteByListingId = useCallback(async (listingId) => {
    if (!userId || !listingId) return { success: false, error: 'Missing required data' };

    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('listingId', '==', listingId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Favorite not found' };
      }

      // Delete the favorite document
      const favoriteDoc = snapshot.docs[0];
      await deleteDoc(favoriteDoc.ref);
      
      // Update local state
      setFavorites(prev => prev.filter(fav => fav.listingId !== listingId));

      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (listingId) => {
    const isFavorited = favorites.some(fav => fav.listingId === listingId);
    
    if (isFavorited) {
      return removeFavoriteByListingId(listingId);
    } else {
      return addFavorite(listingId);
    }
  }, [favorites, addFavorite, removeFavoriteByListingId]);

  // Check if a listing is favorited
  const isFavorited = useCallback((listingId) => {
    return favorites.some(fav => fav.listingId === listingId);
  }, [favorites]);

  // Remove multiple favorites
  const removeFavorites = useCallback(async (favoriteIds) => {
    const results = [];
    
    for (const favoriteId of favoriteIds) {
      const result = await removeFavorite(favoriteId);
      results.push(result);
    }
    
    return results;
  }, [removeFavorite]);

  // Set up real-time listener with stable dependency
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const favoritesData = [];

        for (const favoriteDoc of snapshot.docs) {
          const favoriteData = {
            id: favoriteDoc.id,
            ...favoriteDoc.data()
          };

          // Try to get cached listing data
          if (favoriteData.listingId) {
            try {
              const listingDoc = await getDoc(doc(db, 'listings', favoriteData.listingId));
              if (listingDoc.exists()) {
                favoriteData.listing = {
                  id: listingDoc.id,
                  ...listingDoc.data()
                };
              }
            } catch (err) {
              console.error('Error fetching listing:', err);
            }
          }

          favoritesData.push(favoriteData);
        }

        setFavorites(favoritesData);
        setLoading(false);
      },
      (err) => {
        console.error('Real-time listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]); // Only depend on userId to prevent infinite loops

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    removeFavoriteByListingId,
    removeFavorites,
    toggleFavorite,
    isFavorited,
    refresh: fetchFavorites
  };
};

export default useUserFavorites;