import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  startAfter
} from 'firebase/firestore';

const useStorageListings = (options = {}) => {
  const {
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc',
    pageSize = 10,
    realtime = true
  } = options;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Enhanced debug logging
  const debugLog = (message, data = null) => {
    console.log(`🔍 useStorageListings: ${message}`, data);
  };

  // Build query with enhanced debugging and error handling
  const buildQuery = useCallback((lastDocument = null) => {
    debugLog('Building query with options:', {
      filters,
      sortBy,
      sortOrder,
      pageSize,
      lastDocument: lastDocument ? 'yes' : 'no'
    });

    const constraints = [];
    
    try {
      // Strategy: Use single-field queries only to avoid composite index requirements
      // All complex filtering will be done client-side
      
      // Basic status filter (always include for browsing)
      // Check for both 'available' and 'active' status values
      if (filters.available !== false) {
        // Use 'available' as that's what's currently in the database
        constraints.push(where('status', '==', 'available'));
        debugLog('Added status filter: available');
      }
      
      // Only add ONE additional server-side filter to avoid composite indexes
      // Priority: location > type > featured (most common filters)
      if (filters.city) {
        constraints.push(where('location.city', '==', filters.city));
        constraints.push(orderBy('createdAt', 'desc'));
        debugLog('Added city filter and createdAt ordering:', filters.city);
      } else if (filters.type) {
        constraints.push(where('type', '==', filters.type));
        constraints.push(orderBy('createdAt', 'desc'));
        debugLog('Added type filter and createdAt ordering:', filters.type);
      } else if (filters.featured) {
        constraints.push(where('featured', '==', true));
        constraints.push(orderBy('rating', 'desc'));
        debugLog('Added featured filter and rating ordering');
      } else {
        // Default case: no additional filters, can use flexible ordering
        switch (sortBy) {
          case 'pricing.daily':
            // For price sorting, we'll do it client-side to avoid indexes
            constraints.push(orderBy('createdAt', 'desc'));
            debugLog('Using createdAt ordering (price sorting will be client-side)');
            break;
          case 'rating':
            constraints.push(orderBy('rating', 'desc'));
            debugLog('Added rating ordering');
            break;
          case 'createdAt':
          default:
            constraints.push(orderBy(sortBy, sortOrder));
            debugLog('Added default ordering:', { sortBy, sortOrder });
            break;
        }
      }
      
      // Add pagination
      constraints.push(limit(pageSize * 2)); // Get more docs for client-side filtering
      debugLog('Added limit:', pageSize * 2);
      
      if (lastDocument) {
        constraints.push(startAfter(lastDocument));
        debugLog('Added startAfter pagination');
      }
      
      const finalQuery = query(collection(db, 'listings'), ...constraints);
      debugLog('Query built successfully with constraints count:', constraints.length);
      return finalQuery;
      
    } catch (error) {
      console.error('❌ Error building query:', error);
      debugLog('Query build error, falling back to simple query');
      
      // Fallback: simplest possible query
      return query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
  }, [filters.available, filters.city, filters.type, filters.featured, sortBy, sortOrder, pageSize]);

  // Enhanced client-side filtering and sorting
  const applyClientSideFilters = useCallback((listings) => {
    debugLog('Applying client-side filters to listings:', listings.length);
    let filtered = [...listings];
    
    // Apply price filters (client-side only)
    if (filters.minPrice !== undefined) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(listing => 
        (listing.pricing?.daily || 0) >= filters.minPrice
      );
      debugLog(`Price filter (min ${filters.minPrice}): ${beforeCount} -> ${filtered.length}`);
    }
    
    if (filters.maxPrice !== undefined) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(listing => 
        (listing.pricing?.daily || 0) <= filters.maxPrice
      );
      debugLog(`Price filter (max ${filters.maxPrice}): ${beforeCount} -> ${filtered.length}`);
    }
    
    // Apply feature filters
    if (filters.features && filters.features.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(listing => 
        filters.features.every(feature => 
          listing.features && listing.features.includes(feature)
        )
      );
      debugLog(`Features filter (${filters.features.join(', ')}): ${beforeCount} -> ${filtered.length}`);
    }
    
    // Apply size filters
    if (filters.minSize !== undefined) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(listing => 
        (listing.size?.value || listing.size || 0) >= filters.minSize
      );
      debugLog(`Size filter (min ${filters.minSize}): ${beforeCount} -> ${filtered.length}`);
    }
    
    // Apply client-side sorting if needed
    if (sortBy === 'pricing.daily') {
      filtered.sort((a, b) => {
        const priceA = a.pricing?.daily || 0;
        const priceB = b.pricing?.daily || 0;
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
      debugLog('Applied client-side price sorting');
    } else if (sortBy === 'distance' && filters.userLocation) {
      // TODO: Implement distance calculation
      // For now, just sort by creation date
      filtered.sort((a, b) => 
        sortOrder === 'desc' 
          ? new Date(b.createdAt?.seconds * 1000) - new Date(a.createdAt?.seconds * 1000)
          : new Date(a.createdAt?.seconds * 1000) - new Date(b.createdAt?.seconds * 1000)
      );
      debugLog('Applied client-side distance sorting (fallback to date)');
    }
    
    const finalFiltered = filtered.slice(0, pageSize);
    debugLog('Final filtered results:', finalFiltered.length);
    
    return finalFiltered;
  }, [filters.minPrice, filters.maxPrice, filters.features, filters.minSize, sortBy, sortOrder, pageSize]);
  
  // Load initial listings with enhanced debugging
  const loadListings = useCallback(async () => {
    debugLog('🚀 Starting loadListings...');
    setLoading(true);
    setError(null);
    
    try {
      // First, let's check if there are any listings at all in the database
      debugLog('Checking total listings in database...');
      const totalQuery = query(collection(db, 'listings'), limit(1));
      const totalSnapshot = await getDocs(totalQuery);
      debugLog('Total listings check result:', {
        empty: totalSnapshot.empty,
        size: totalSnapshot.size,
        docs: totalSnapshot.docs.length
      });
      
      if (totalSnapshot.empty) {
        debugLog('❌ No listings found in database at all!');
        setError('No listings found in database. Please seed the database first.');
        setListings([]);
        return;
      }
      
      // Now try our main query
      const q = buildQuery();
      debugLog('Executing main query...');
      const snapshot = await getDocs(q);
      
      debugLog('Main query results:', {
        empty: snapshot.empty,
        size: snapshot.size,
        docs: snapshot.docs.length
      });
      
      let listingsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const listing = {
          id: doc.id,
          ...data
        };
        listingsData.push(listing);
        
        // Debug first few listings
        if (listingsData.length <= 3) {
          debugLog(`Listing ${listingsData.length}:`, {
            id: doc.id,
            title: data.title,
            status: data.status,
            type: data.type,
            pricing: data.pricing,
            location: data.location
          });
        }
      });
      
      debugLog('Raw listings data count:', listingsData.length);
      
      // Apply client-side filtering and sorting
      listingsData = applyClientSideFilters(listingsData);
      
      debugLog('Final processed listings count:', listingsData.length);
      
      setListings(listingsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize * 2); // Account for increased fetch size
      
      debugLog('✅ loadListings completed successfully');
      
    } catch (err) {
      console.error('❌ Error loading listings:', err);
      debugLog('Main query failed, trying fallback...');
      setError(err.message);
      
      // Fallback: Try even simpler query
      try {
        // Try query without status filter first
        debugLog('Fallback 1: Query without status filter');
        const noStatusQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        const noStatusSnapshot = await getDocs(noStatusQuery);
        debugLog('No status query results:', {
          empty: noStatusSnapshot.empty,
          size: noStatusSnapshot.size
        });
        
        if (!noStatusSnapshot.empty) {
          const simpleListings = [];
          noStatusSnapshot.forEach((doc) => {
            const data = doc.data();
            simpleListings.push({
              id: doc.id,
              ...data
            });
            
            // Debug the status values we're actually finding
            if (simpleListings.length <= 5) {
              debugLog(`Found listing with status: "${data.status}"`);
            }
          });
          
          const filteredSimple = applyClientSideFilters(simpleListings);
          setListings(filteredSimple);
          setError(null); // Clear error if fallback works
          debugLog('✅ Fallback query successful, found listings:', filteredSimple.length);
          return;
        }
        
        // If still no results, try different status values
        debugLog('Fallback 2: Trying "available" status');
        const availableQuery = query(
          collection(db, 'listings'),
          where('status', '==', 'available'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        const availableSnapshot = await getDocs(availableQuery);
        
        if (!availableSnapshot.empty) {
          const availableListings = [];
          availableSnapshot.forEach((doc) => {
            availableListings.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          const filteredAvailable = applyClientSideFilters(availableListings);
          setListings(filteredAvailable);
          setError(null);
          debugLog('✅ Found listings with "available" status:', filteredAvailable.length);
          return;
        }
        
      } catch (fallbackErr) {
        console.error('❌ Fallback query also failed:', fallbackErr);
        debugLog('All fallback queries failed');
        setError('Unable to load listings. Please check database connection and try again.');
      }
    } finally {
      setLoading(false);
      debugLog('🏁 loadListings finished');
    }
  }, [buildQuery, pageSize, applyClientSideFilters]);

  // Load more listings (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;
    
    debugLog('Loading more listings...');
    setLoading(true);
    
    try {
      const q = buildQuery(lastDoc);
      const snapshot = await getDocs(q);
      
      const newListings = [];
      snapshot.forEach((doc) => {
        newListings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      const filteredNew = applyClientSideFilters(newListings);
      setListings(prev => [...prev, ...filteredNew]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize * 2);
      debugLog('✅ Load more completed, new total:', filteredNew.length);
    } catch (err) {
      console.error('❌ Error loading more listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastDoc, buildQuery, pageSize, applyClientSideFilters]);

  // Search listings with full-text search simulation
  const searchListings = useCallback(async (searchTerm, searchFilters = {}) => {
    debugLog('🔍 Starting search:', { searchTerm, searchFilters });
    setLoading(true);
    setError(null);
    
    try {
      // Combine search filters with existing filters
      const combinedFilters = { ...filters, ...searchFilters };
      
      // Use simple query for search to avoid complex indexes
      const q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(100) // Get more results for text search
      );
      
      const snapshot = await getDocs(q);
      let listingsData = [];
      
      snapshot.forEach((doc) => {
        listingsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      debugLog('Search found raw listings:', listingsData.length);
      
      // Client-side search filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        listingsData = listingsData.filter(listing => 
          listing.title?.toLowerCase().includes(term) ||
          listing.description?.toLowerCase().includes(term) ||
          listing.location?.address?.toLowerCase().includes(term) ||
          listing.location?.city?.toLowerCase().includes(term) ||
          listing.location?.district?.toLowerCase().includes(term) ||
          listing.type?.toLowerCase().includes(term) ||
          listing.features?.some(feature => feature.toLowerCase().includes(term))
        );
        debugLog('After search term filter:', listingsData.length);
      }
      
      // Apply additional filters
      if (combinedFilters.city) {
        listingsData = listingsData.filter(listing => 
          listing.location?.city === combinedFilters.city
        );
      }
      
      if (combinedFilters.type) {
        listingsData = listingsData.filter(listing => 
          listing.type === combinedFilters.type
        );
      }
      
      if (combinedFilters.minPrice !== undefined) {
        listingsData = listingsData.filter(listing => 
          (listing.pricing?.daily || 0) >= combinedFilters.minPrice
        );
      }
      
      if (combinedFilters.maxPrice !== undefined) {
        listingsData = listingsData.filter(listing => 
          (listing.pricing?.daily || 0) <= combinedFilters.maxPrice
        );
      }
      
      setListings(listingsData.slice(0, pageSize));
      setHasMore(listingsData.length > pageSize);
      debugLog('✅ Search completed, final results:', listingsData.slice(0, pageSize).length);
    } catch (err) {
      console.error('❌ Error searching listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  // Get listings by location
  const getListingsByLocation = useCallback(async (city, district = null) => {
    debugLog('📍 Getting listings by location:', { city, district });
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'listings'),
        where('location.city', '==', city),
        orderBy('rating', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const listingsData = [];
      
      snapshot.forEach((doc) => {
        const data = {
          id: doc.id,
          ...doc.data()
        };
        
        // Filter by district if specified
        if (!district || data.location?.district === district) {
          listingsData.push(data);
        }
      });
      
      setListings(listingsData);
      setHasMore(snapshot.docs.length === pageSize);
      debugLog('✅ Location search completed:', listingsData.length);
    } catch (err) {
      console.error('❌ Error getting listings by location:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Get featured listings
  const getFeaturedListings = useCallback(async () => {
    debugLog('⭐ Getting featured listings...');
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'listings'),
        where('featured', '==', true),
        orderBy('rating', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const listingsData = [];
      
      snapshot.forEach((doc) => {
        listingsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setListings(listingsData);
      debugLog('✅ Featured listings completed:', listingsData.length);
    } catch (err) {
      console.error('❌ Error getting featured listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Set up real-time listener if enabled
  useEffect(() => {
    debugLog('🔄 Setting up effect, realtime:', realtime);
    
    if (!realtime) {
      loadListings();
      return;
    }

    const q = buildQuery();
    
    debugLog('🔄 Setting up real-time listener...');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        debugLog('🔄 Real-time update received, docs:', snapshot.docs.length);
        let listingsData = [];
        snapshot.forEach((doc) => {
          listingsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Apply client-side filtering for real-time updates too
        listingsData = applyClientSideFilters(listingsData);
        
        setListings(listingsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === pageSize * 2);
        setLoading(false);
        setError(null);
        debugLog('✅ Real-time update processed, final count:', listingsData.length);
      },
      (err) => {
        console.error('❌ Real-time listener error:', err);
        debugLog('Real-time listener failed, falling back to regular loading');
        setError(err.message);
        setLoading(false);
        // Fallback to regular loading
        loadListings();
      }
    );

    return () => {
      debugLog('🔄 Cleaning up real-time listener');
      unsubscribe();
    };
  }, [realtime, buildQuery, pageSize, loadListings, applyClientSideFilters]);

  // Refresh listings
  const refresh = useCallback(() => {
    debugLog('🔄 Refreshing listings...');
    setLastDoc(null);
    setHasMore(true);
    loadListings();
  }, [loadListings]);

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchListings,
    getListingsByLocation,
    getFeaturedListings
  };
};

export default useStorageListings;