import React, { useState } from 'react';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import fixListingPricing from '../../utils/fixListingPricing';

const FixListingData = () => {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFix = async () => {
    setFixing(true);
    setError(null);
    setResult(null);
    
    try {
      const fixResult = await fixListingPricing();
      if (fixResult.success) {
        setResult(fixResult);
      } else {
        setError(fixResult.error);
      }
    } catch (err) {
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
          <h2 className="text-2xl font-bold text-gray-900">Fix Listing Data</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">What this does:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Checks all listings in the database</li>
            <li>Adds proper pricing structure (daily, weekly, monthly)</li>
            <li>Fixes missing price data</li>
            <li>Ensures compatibility with browse filters</li>
          </ul>
        </div>

        <button
          onClick={handleFix}
          disabled={fixing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            fixing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {fixing ? 'Fixing Listings...' : 'Fix Listing Pricing Structure'}
        </button>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Fix Complete!</h3>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Updated: {result.updated} listings</p>
              <p>Skipped: {result.skipped} listings (already had correct structure)</p>
              <p>Total processed: {result.total} listings</p>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700">
                You can now go to <a href="/client/browse" className="underline font-medium">Browse Page</a> to see the listings with correct pricing.
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

export default FixListingData;