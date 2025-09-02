import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

const ListingStatusDebug = () => {
  const [specificListing, setSpecificListing] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LISTING_ID = 'c3mZwLTtur3HYITlbgsD';

  const debugSpecificListing = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Debugging specific listing:', LISTING_ID);
      
      // Try to get the specific listing by ID
      const listingRef = doc(db, 'listings', LISTING_ID);
      const listingDoc = await getDoc(listingRef);
      
      if (listingDoc.exists()) {
        const data = listingDoc.data();
        console.log('✅ Found specific listing:', data);
        setSpecificListing({ id: listingDoc.id, ...data });
      } else {
        console.log('❌ Listing not found with ID:', LISTING_ID);
        setSpecificListing({ notFound: true });
      }
      
      // Get all listings to see what exists
      console.log('🔍 Fetching all listings...');
      const allQuery = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const allSnapshot = await getDocs(allQuery);
      
      const allListingsData = [];
      allSnapshot.forEach(doc => {
        const data = doc.data();
        allListingsData.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          type: data.type,
          pricing: data.pricing,
          createdAt: data.createdAt,
          location: data.location
        });
        console.log(`📋 Listing ${doc.id}: status="${data.status}", title="${data.title}"`);
      });
      setAllListings(allListingsData);
      
      // Get only 'available' listings
      console.log('🔍 Fetching available listings...');
      const availableQuery = query(
        collection(db, 'listings'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const availableSnapshot = await getDocs(availableQuery);
      
      const availableListingsData = [];
      availableSnapshot.forEach(doc => {
        const data = doc.data();
        availableListingsData.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          type: data.type,
          pricing: data.pricing
        });
      });
      setAvailableListings(availableListingsData);
      console.log('✅ Available listings found:', availableListingsData.length);
      
      // Check for other status values
      console.log('🔍 Checking for other status values...');
      const statusVariations = ['active', 'published', 'open', 'ready'];
      
      for (const status of statusVariations) {
        try {
          const statusQuery = query(
            collection(db, 'listings'),
            where('status', '==', status),
            limit(5)
          );
          const statusSnapshot = await getDocs(statusQuery);
          if (!statusSnapshot.empty) {
            console.log(`📊 Found ${statusSnapshot.size} listings with status: "${status}"`);
          }
        } catch (err) {
          console.log(`❌ Error checking status "${status}":`, err.message);
        }
      }
      
    } catch (err) {
      console.error('❌ Debug error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugSpecificListing();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'published': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🔍 Listing Status Debug</h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🔍 Listing Status Debug Analysis</h2>
        <p className="text-gray-600 mb-4">
          Debugging listing ID: <code className="bg-gray-100 px-2 py-1 rounded">{LISTING_ID}</code>
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Specific Listing */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Specific Listing Analysis</h3>
          {specificListing ? (
            specificListing.notFound ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">❌ Listing not found in database</p>
                <p className="text-red-600 text-sm mt-1">
                  The listing with ID "{LISTING_ID}" does not exist in Firebase.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Title:</strong> {specificListing.title || 'N/A'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(specificListing.status)}`}>
                        "{specificListing.status || 'undefined'}"
                      </span>
                    </p>
                    <p><strong>Type:</strong> {specificListing.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Price:</strong> ₱{specificListing.pricing?.daily || 'N/A'}</p>
                    <p><strong>Location:</strong> {specificListing.location?.city || 'N/A'}</p>
                    <p><strong>Created:</strong> {specificListing.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-800">Root Cause Analysis:</h4>
                  {specificListing.status === 'available' ? (
                    <p className="text-blue-700 text-sm">
                      ✅ Status is "available" - should appear in browse results. Check client-side filtering.
                    </p>
                  ) : (
                    <p className="text-blue-700 text-sm">
                      ❌ Status is "{specificListing.status}" but browse page filters for "available" only. 
                      This explains why the listing doesn't appear.
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <p>No data loaded yet...</p>
          )}
        </div>

        {/* All Listings Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Database Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">All Listings ({allListings.length})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allListings.map(listing => (
                  <div key={listing.id} className="text-sm flex justify-between items-center">
                    <span className="truncate mr-2">{listing.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(listing.status)}`}>
                      {listing.status || 'undefined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-green-800">Available Listings ({availableListings.length})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availableListings.map(listing => (
                  <div key={listing.id} className="text-sm">
                    <span className="truncate">{listing.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Query Analysis</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Browse page uses: <code>where('status', '==', 'available')</code></li>
            <li>• Total listings in DB: {allListings.length}</li>
            <li>• Listings with status 'available': {availableListings.length}</li>
            <li>• Check browser console for additional debug logs from useStorageListings</li>
          </ul>
        </div>

        <button
          onClick={debugSpecificListing}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          🔄 Refresh Debug Analysis
        </button>
      </div>
    </div>
  );
};

export default ListingStatusDebug;