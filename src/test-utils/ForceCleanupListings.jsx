import React, { useState, useEffect, useContext } from 'react';
import { Trash2, CheckCircle, AlertCircle, AlertTriangle, User, Shield, Eye, Database, Search } from 'lucide-react';
import forceCleanupListings from '../../utils/forceCleanupListings';
import inspectListingsDatabase from '../../utils/listingsDatabaseInspector';
import { AuthContext } from '../../context/AuthContextSafe';
import { auth } from '../../utils/firebaseConfig';

const ForceCleanupListings = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [inspectionResult, setInspectionResult] = useState(null);
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

  const handleInspection = async () => {
    setProcessing(true);
    setError(null);
    setInspectionResult(null);
    
    try {
      console.log('🔍 Starting database inspection...');
      const inspectionResult = await inspectListingsDatabase();
      
      if (!inspectionResult.error) {
        setInspectionResult(inspectionResult);
      } else {
        setError(inspectionResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDryRun = async () => {
    setProcessing(true);
    setError(null);
    setDryRunResult(null);
    
    try {
      console.log('🔍 Starting dry run analysis...');
      const dryRunResult = await forceCleanupListings({ dryRun: true });
      
      if (dryRunResult.success) {
        setDryRunResult(dryRunResult);
      } else {
        setError(dryRunResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleForceCleanup = async () => {
    if (!confirmed) return;
    
    setProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🚨 Starting FORCE cleanup...');
      const cleanupResult = await forceCleanupListings({ dryRun: false });
      
      if (cleanupResult.success) {
        setResult(cleanupResult);
        // Reload page after 3 seconds to show updated listings
        setTimeout(() => {
          window.location.href = '/client/browse';
        }, 3000);
      } else {
        setError(cleanupResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Force Cleanup Listings</h2>
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
              <h3 className="font-medium text-red-800 mb-2">⚠️ AGGRESSIVE CLEANUP WARNING</h3>
              <p className="text-sm text-red-700 mb-2">
                This is a <strong>FORCE CLEANUP</strong> that will:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-3">
                <li>Delete ALL listings in the entire database</li>
                <li>Bypass user permissions and ownership checks</li>
                <li>Keep ONLY the listing titled: <code className="bg-red-100 px-1 rounded">dfgbnchnfbfgnfgnfgnfgbn</code></li>
                <li>Cannot be undone once executed</li>
              </ul>
              <p className="text-sm text-red-700 font-semibold">
                Use this when normal cleanup fails and listings persist!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Why use Force Cleanup?</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Normal cleanup didn't remove all listings</li>
            <li>Listings have ₱0 prices (likely test/seed data)</li>
            <li>Listings may have been created by different users or processes</li>
            <li>Need to ensure complete database cleanup</li>
          </ul>
        </div>

        {/* Analysis Section */}
        <div className="mb-6 space-y-3">
          <button
            onClick={handleInspection}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Search className="w-5 h-5" />
            <span>{processing ? 'Inspecting...' : 'Inspect Database (Detailed Analysis)'}</span>
          </button>
          
          <button
            onClick={handleDryRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Eye className="w-5 h-5" />
            <span>{processing ? 'Analyzing...' : 'Analyze Cleanup (Dry Run)'}</span>
          </button>
        </div>

        {/* Database Inspection Results */}
        {inspectionResult && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Search className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-800">Database Inspection Results</h3>
            </div>
            
            {inspectionResult.empty ? (
              <div className="text-sm text-purple-700">
                <p className="font-medium">✅ Database is completely empty!</p>
                <p>No listings found in the database.</p>
              </div>
            ) : (
              <div className="text-sm text-purple-700 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded p-3">
                    <p className="font-medium">Total Found</p>
                    <p className="text-xl font-bold text-purple-600">{inspectionResult.total}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium">Target Found</p>
                    <p className="text-xl font-bold text-green-600">{inspectionResult.targetFound ? 'YES' : 'NO'}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium">Free Listings</p>
                    <p className="text-xl font-bold text-orange-600">{inspectionResult.issues?.free || 0}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium">No Host ID</p>
                    <p className="text-xl font-bold text-red-600">{inspectionResult.issues?.noHostId || 0}</p>
                  </div>
                </div>
                
                {inspectionResult.issues?.free > 0 && (
                  <div className="bg-orange-100 rounded p-3">
                    <p className="font-medium text-orange-800 mb-1">⚠️ Free Listings (₱0):</p>
                    <p className="text-sm text-orange-700">
                      {inspectionResult.issues.free} listings have ₱0 price, likely test/seed data that wasn't cleaned up properly.
                    </p>
                  </div>
                )}
                
                {inspectionResult.issues?.noHostId > 0 && (
                  <div className="bg-red-100 rounded p-3">
                    <p className="font-medium text-red-800 mb-1">❌ Missing Host ID:</p>
                    <p className="text-sm text-red-700">
                      {inspectionResult.issues.noHostId} listings have no hostId, which might cause cleanup issues.
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-100 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Recommendation:</strong> Force cleanup will delete ALL {inspectionResult.total - (inspectionResult.targetFound ? 1 : 0)} unwanted listings.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dry Run Results */}
        {dryRunResult && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Database Analysis Results</h3>
            </div>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded p-3">
                  <p className="font-medium">Total Found</p>
                  <p className="text-xl font-bold text-blue-600">{dryRunResult.found}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-medium">To Delete</p>
                  <p className="text-xl font-bold text-red-600">{dryRunResult.toDelete}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-medium">To Keep</p>
                  <p className="text-xl font-bold text-green-600">{dryRunResult.toKeep}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-medium">Status</p>
                  <p className="text-sm font-bold text-blue-600">Ready for cleanup</p>
                </div>
              </div>
              
              {dryRunResult.keptListings?.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-green-700 mb-2">Listings that will be KEPT:</p>
                  <div className="bg-green-100 rounded p-3 space-y-1">
                    {dryRunResult.keptListings.map(listing => (
                      <div key={listing.id} className="text-sm">
                        ✅ "{listing.title}" (ID: {listing.id})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Section */}
        {!confirmed && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-gray-700 text-sm">
                I understand this will <strong>PERMANENTLY DELETE ALL LISTINGS</strong> except "dfgbnchnfbfgnfgnfgnfgbn" and cannot be undone
              </span>
            </label>
          </div>
        )}

        {/* Force Cleanup Button */}
        <div className="space-y-3">
          <button
            onClick={handleForceCleanup}
            disabled={processing || !confirmed}
            className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-2 ${
              processing || !confirmed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
            }`}
          >
            <Shield className="w-6 h-6" />
            <span>{processing ? 'FORCE DELETING...' : 'EXECUTE FORCE CLEANUP'}</span>
          </button>
        </div>

        {/* Success Results */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Force Cleanup Complete!</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Found</p>
                <p className="text-xl font-bold">{result.found}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Deleted</p>
                <p className="text-xl font-bold text-red-600">{result.deleted}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-xl font-bold text-orange-600">{result.failed}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold text-blue-600">{result.remaining}</p>
              </div>
            </div>
            
            {result.failedListings?.length > 0 && (
              <div className="mt-4 bg-orange-50 rounded p-3">
                <p className="font-medium text-orange-800 mb-2">Failed to delete:</p>
                {result.failedListings.map((listing, index) => (
                  <div key={index} className="text-sm text-orange-700">
                    ❌ {listing.title}: {listing.error}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700 font-medium">
                Redirecting to browse page in 3 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Error Results */}
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

export default ForceCleanupListings;