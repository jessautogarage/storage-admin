import React, { useEffect, useState } from 'react';
import { useListings } from '../../hooks/useListings';
import { useAuth } from '../../hooks/useAuth';

const ListingDataDebug = () => {
  const { user } = useAuth();
  const { listings, loading, error, fetchHostListings } = useListings();
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    if (listings && listings.length > 0) {
      // Log the raw data structure
      console.log('Raw listings data:', listings);
      setRawData(listings);
    }
  }, [listings]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!listings || listings.length === 0) return <div>No listings found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Listing Data Debug</h1>
      
      {listings.map((listing, index) => (
        <div key={listing.id} className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Listing {index + 1}: {listing.title}</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold">Images Field:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(listing.images, null, 2)}
            </pre>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Image URLs (if array):</h3>
            {Array.isArray(listing.images) ? (
              <ul>
                {listing.images.map((img, idx) => (
                  <li key={idx} className="mb-2">
                    <div className="text-sm text-gray-600">Image {idx + 1}:</div>
                    <div className="text-xs break-all">{img}</div>
                    <img src={img} alt={`Preview ${idx}`} className="w-32 h-32 object-cover mt-1" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{display: 'none'}} className="text-red-500 text-xs">Failed to load image</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>Images is not an array: {typeof listing.images}</div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Full Listing Data:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(listing, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingDataDebug;