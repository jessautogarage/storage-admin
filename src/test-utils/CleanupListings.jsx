import React, { useState, useEffect, useContext } from 'react';
import { Trash2, CheckCircle, AlertCircle, AlertTriangle, User, Shield } from 'lucide-react';
import cleanupListings from '../../utils/cleanupListings';
import cleanupListingsOwned from '../../utils/cleanupListingsOwned';
import { AuthContext } from '../../context/AuthContextSafe';
import { auth } from '../../utils/firebaseConfig';

const CleanupListings = () => {
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const authContext = useContext(AuthContext);
  const userType = authContext?.userType;
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current auth state
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setCurrentUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  const handleCleanup = async (useOwnedOnly = false) => {
    if (!confirmed) return;
    
    if (!currentUser) {
      setError('You must be logged in to delete listings');
      return;
    }
    
    setCleaning(true);
    setError(null);
    setResult(null);
    
    try {
      // Use owned-only cleanup if permissions are insufficient
      const cleanupFunction = useOwnedOnly ? cleanupListingsOwned : cleanupListings;
      const cleanupResult = await cleanupFunction();
      
      if (cleanupResult.success) {
        setResult(cleanupResult);
        // Reload page after 2 seconds to show updated listings
        setTimeout(() => {
          window.location.href = '/client/browse';
        }, 2000);
      } else {
        setError(cleanupResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Trash2 className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Cleanup Listings</h2>
        </div>

        {/* User info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Current User:</strong> {currentUser?.email || 'Not logged in'}
              </p>
              <p className="text-sm text-blue-700">
                <strong>User Type:</strong> {userType || 'Unknown'}
              </p>
              <p className="text-sm text-blue-700">
                <strong>User ID:</strong> {currentUser?.uid || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 mb-2">⚠️ Warning: Destructive Action</h3>
              <p className="text-sm text-red-700 mb-2">
                This will DELETE all listings except the one titled:
              </p>
              <p className="font-mono text-sm bg-red-100 p-2 rounded">
                "dfgbnchnfbfgnfgnfgnfgbn"
              </p>
              <p className="text-sm text-red-700 mt-2">
                This action cannot be undone!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">What this will do:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Delete all test/seed listings</li>
            <li>Delete all other host-created listings</li>
            <li>Keep ONLY the listing titled "dfgbnchnfbfgnfgnfgnfgbn"</li>
            <li>Clean up the database for a fresh start</li>
          </ul>
        </div>

        {!confirmed && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">
                I understand this will permanently delete listings
              </span>
            </label>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleCleanup(false)}
            disabled={cleaning || !confirmed || userType !== 'admin'}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              cleaning || !confirmed || userType !== 'admin'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>{cleaning ? 'Cleaning up listings...' : 'Delete ALL Listings (Admin Only)'}</span>
          </button>
          
          <button
            onClick={() => handleCleanup(true)}
            disabled={cleaning || !confirmed || !currentUser}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              cleaning || !confirmed || !currentUser
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {cleaning ? 'Cleaning up listings...' : 'Delete MY Listings Except "dfgbnchnfbfgnfgnfgnfgbn"'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Cleanup Complete!</h3>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Deleted: {result.deleted} listings</p>
              {result.failed > 0 && <p className="text-orange-600">Failed: {result.failed} listings</p>}
              <p>Kept: {result.kept} listings</p>
              <p>Total processed: {result.total} listings</p>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700 font-medium">
                Redirecting to browse page in 2 seconds...
              </p>
            </div>
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
      </div>
    </div>
  );
};

export default CleanupListings;