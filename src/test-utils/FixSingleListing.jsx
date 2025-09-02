import React, { useState } from 'react';
import { db } from '../../utils/firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Wrench, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const FixSingleListing = () => {
  const { currentUser, isAdmin } = useAuth();
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fixLatestListing = async () => {
    setFixing(true);
    setError(null);
    setResult(null);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to fix listings');
      }
      
      console.log('🔧 Looking for your listings without pricing...');
      
      // Get listings - only user's own listings if not admin
      const listingsRef = collection(db, 'listings');
      let q;
      
      if (isAdmin) {
        // Admin can fix all listings
        q = listingsRef;
        console.log('🔑 Admin mode: Checking all listings');
      } else {
        // Regular users can only fix their own listings
        q = query(listingsRef, where('hostId', '==', currentUser.uid));
        console.log('👤 User mode: Checking only your listings');
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setResult({
          success: true,
          fixed: 0,
          alreadyFixed: 0,
          total: 0,
          message: isAdmin ? 'No listings found in database' : 'You have no listings'
        });
        return;
      }
      
      let fixed = 0;
      let alreadyFixed = 0;
      let unauthorized = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Double-check permissions for non-admin users
        if (!isAdmin && data.hostId !== currentUser.uid) {
          console.log(`⚠️ Skipping listing (not owner): ${data.title}`);
          unauthorized++;
          continue;
        }
        
        // Check if pricing is missing or invalid
        if (!data.pricing || !data.pricing.daily || isNaN(data.pricing.daily)) {
          console.log(`📝 Found listing without pricing: ${data.title || docSnapshot.id}`);
          
          // Try to get price from various fields
          const basePrice = 
            data.pricePerDay || 
            data.price || 
            data.dailyPrice ||
            100; // Default fallback
          
          const updatedData = {
            pricing: {
              daily: parseFloat(basePrice),
              weekly: parseFloat(basePrice) * 7 * 0.85,
              monthly: parseFloat(basePrice) * 30 * 0.75
            }
          };
          
          // Update the document
          await updateDoc(doc(db, 'listings', docSnapshot.id), updatedData);
          fixed++;
          console.log(`✅ Fixed pricing for ${data.title}: ₱${basePrice}/day`);
        } else {
          alreadyFixed++;
        }
      }
      
      setResult({
        success: true,
        fixed,
        alreadyFixed,
        total: snapshot.size
      });
      
      console.log(`📊 Fixed ${fixed} listings, ${alreadyFixed} already had pricing`);
      
      // Reload the page after a short delay to see the results
      if (fixed > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
    } catch (err) {
      console.error('❌ Error fixing listings:', err);
      setError(err.message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Wrench className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Fix Missing Pricing</h2>
        </div>

        {!currentUser ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Not Logged In</h3>
                <p className="text-sm text-red-700">You must be logged in as a host to fix your listings.</p>
                <a href="/signin" className="inline-block mt-2 text-sm font-medium text-red-800 underline">
                  Sign in as Host
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-800">
                    {isAdmin ? 'Admin Mode' : 'Host Mode'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {isAdmin 
                      ? 'As an admin, you can fix pricing for all listings.'
                      : 'As a host, you can only fix pricing for your own listings.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">This will:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>{isAdmin ? 'Find all listings' : 'Find your listings'} without proper pricing structure</li>
                <li>Add daily, weekly, and monthly pricing</li>
                <li>Fix your newly created listing if it's missing pricing</li>
                <li>Reload the page after fixing to show results</li>
              </ul>
            </div>
          </>
        )}

        <button
          onClick={fixLatestListing}
          disabled={fixing || !currentUser}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            fixing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {fixing ? 'Fixing Listings...' : 'Fix Missing Pricing'}
        </button>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Fix Complete!</h3>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Fixed: {result.fixed} listings</p>
              <p>Already had pricing: {result.alreadyFixed} listings</p>
              <p>Total processed: {result.total} listings</p>
            </div>
            {result.fixed > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Page will reload in 2 seconds to show the fixed listings...
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Quick Fix:</strong> Go to this page and click the button to fix any listings missing pricing data. After fixing, go back to{' '}
            <a href="/client/browse" className="underline font-medium">Browse Page</a> to see your listings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FixSingleListing;