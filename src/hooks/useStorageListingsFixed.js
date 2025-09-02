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

const useStorageListingsFixed = (options = {}) => {
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
    console.log(`🔍 useStorageListingsFixed: ${message}`, data);
  };

  // Build query with enhanced debugging and flexible status handling
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
      // FIXED: More flexible status filtering
      // Don't filter by status at all server-side - do it client-side instead
      // This allows us to catch all listings regardless of their status field value
      
      debugLog('🚨 FIXED: Skipping server-side status filter to catch all listings');
      
      // Only add ONE server-side filter to avoid composite indexes
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
      constraints.push(limit(pageSize * 3)); // Get more docs for client-side filtering
      debugLog('Added limit:', pageSize * 3);
      
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
  }, [filters.city, filters.type, filters.featured, sortBy, sortOrder, pageSize]);

  // Enhanced client-side filtering with flexible status handling
  const applyClientSideFilters = useCallback((listings) => {
    debugLog('🚨 FIXED: Applying enhanced client-side filters to listings:', listings.length);
    let filtered = [...listings];
    
    // Log all unique status values we find
    const statusValues = [...new Set(listings.map(l => l.status))];
    debugLog('📊 Found status values in data:', statusValues);
    
    // FIXED: Flexible status filtering - accept multiple status values
    if (filters.available !== false) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(listing => {
        const status = listing.status;
        // Accept: 'available', 'active', 'published', 'open', or any truthy status
        const isAvailable = status === 'available' || 
                          status === 'active' || 
                          status === 'published' || 
                          status === 'open' ||
                          (status && status !== 'inactive' && status !== 'closed' && status !== 'unavailable');
        
        if (!isAvailable) {
          debugLog(`❌ Filtered out listing "${listing.title}" with status: "${status}"`);
        }
        return isAvailable;
      });
      debugLog(`🔍 Status filter: ${beforeCount} -> ${filtered.length} (accepted: available, active, published, open)`);
    }

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
    debugLog('🎯 Final filtered results:', finalFiltered.length);
    
    // Log each final result for debugging
    finalFiltered.forEach((listing, index) => {
      debugLog(`  ${index + 1}. "${listing.title}" (ID: ${listing.id}, Status: "${listing.status}")`);
    });
    
    return finalFiltered;
  }, [filters.minPrice, filters.maxPrice, filters.features, filters.minSize, filters.available, sortBy, sortOrder, pageSize]);
  
  // Load initial listings with enhanced debugging
  const loadListings = useCallback(async () => {
    debugLog('🚀 Starting loadListings (FIXED VERSION)...');
    setLoading(true);
    setError(null);
    
    try {
      // First, let's check if there are any listings at all in the database
      debugLog('Checking total listings in database...');
      const totalQuery = query(collection(db, 'listings'), limit(5));
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
      
      // Log what we find in the first few documents
      debugLog('📋 Sample listings from database:');
      totalSnapshot.forEach((doc, index) => {
        const data = doc.data();
        debugLog(`  ${index + 1}. ID: ${doc.id}, Title: "${data.title}", Status: "${data.status}"`);
      });
      
      // Now try our main query (without status filter)
      const q = buildQuery();
      debugLog('Executing main query (FIXED - no status filter)...');
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
        if (listingsData.length <= 5) {
          debugLog(`Raw listing ${listingsData.length}:`, {
            id: doc.id,
            title: data.title,
            status: data.status,
            type: data.type,
            pricing: data.pricing,
            location: data.location
          });
        }
      });
      
      debugLog('🔍 Raw listings data count (before client filters):', listingsData.length);
      
      // Apply client-side filtering and sorting
      listingsData = applyClientSideFilters(listingsData);
      
      debugLog('✅ Final processed listings count:', listingsData.length);
      
      setListings(listingsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize * 3); // Account for increased fetch size
      
      debugLog('✅ loadListings completed successfully (FIXED VERSION)');
      
    } catch (err) {
      console.error('❌ Error loading listings:', err);
      debugLog('Main query failed:', err.message);
      setError(err.message);
      setListings([]);
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
      setHasMore(snapshot.docs.length === pageSize * 3);
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
    debugLog('🔍 Starting search (FIXED VERSION):', { searchTerm, searchFilters });
    setLoading(true);
    setError(null);
    
    try {
      // Combine search filters with existing filters
      const combinedFilters = { ...filters, ...searchFilters };
      
      // Use simple query for search to avoid complex indexes (no status filter)
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
      
      // Apply status filters using the fixed approach
      if (combinedFilters.available !== false) {
        const beforeCount = listingsData.length;
        listingsData = listingsData.filter(listing => {
          const status = listing.status;
          const isAvailable = status === 'available' || 
                            status === 'active' || 
                            status === 'published' || 
                            status === 'open' ||
                            (status && status !== 'inactive' && status !== 'closed' && status !== 'unavailable');
          return isAvailable;
        });
        debugLog(`Search status filter: ${beforeCount} -> ${listingsData.length}`);
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
      debugLog('✅ Search completed (FIXED), final results:', listingsData.slice(0, pageSize).length);
    } catch (err) {
      console.error('❌ Error searching listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  // Get listings by location
  const getListingsByLocation = useCallback(async (city, district = null) => {
    debugLog('📍 Getting listings by location (FIXED):', { city, district });
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
          // Apply status filtering using fixed approach
          const status = data.status;
          const isAvailable = status === 'available' || 
                            status === 'active' || 
                            status === 'published' || 
                            status === 'open' ||
                            (status && status !== 'inactive' && status !== 'closed' && status !== 'unavailable');
          
          if (isAvailable) {
            listingsData.push(data);
          }
        }
      });
      
      setListings(listingsData);
      setHasMore(snapshot.docs.length === pageSize);
      debugLog('✅ Location search completed (FIXED):', listingsData.length);
    } catch (err) {
      console.error('❌ Error getting listings by location:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Get featured listings
  const getFeaturedListings = useCallback(async () => {
    debugLog('⭐ Getting featured listings (FIXED)...');
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
        const data = doc.data();
        // Apply status filtering using fixed approach
        const status = data.status;
        const isAvailable = status === 'available' || 
                          status === 'active' || 
                          status === 'published' || 
                          status === 'open' ||
                          (status && status !== 'inactive' && status !== 'closed' && status !== 'unavailable');
        
        if (isAvailable) {
          listingsData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setListings(listingsData);
      debugLog('✅ Featured listings completed (FIXED):', listingsData.length);
    } catch (err) {
      console.error('❌ Error getting featured listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Set up real-time listener if enabled
  useEffect(() => {
    debugLog('🔄 Setting up effect (FIXED VERSION), realtime:', realtime);
    
    if (!realtime) {
      loadListings();
      return;
    }

    const q = buildQuery();
    
    debugLog('🔄 Setting up real-time listener (FIXED)...');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        debugLog('🔄 Real-time update received (FIXED), docs:', snapshot.docs.length);
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
        setHasMore(snapshot.docs.length === pageSize * 3);
        setLoading(false);
        setError(null);
        debugLog('✅ Real-time update processed (FIXED), final count:', listingsData.length);
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
      debugLog('🔄 Cleaning up real-time listener (FIXED)');
      unsubscribe();
    };
  }, [realtime, buildQuery, pageSize, loadListings, applyClientSideFilters]);

  // Refresh listings
  const refresh = useCallback(() => {
    debugLog('🔄 Refreshing listings (FIXED VERSION)...');
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

export default useStorageListingsFixed;