import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import nuclearCleanup from '../../utils/nuclearCleanup';

const NuclearCleanup = () => {
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [doubleConfirmed, setDoubleConfirmed] = useState(false);

  const handleNuclearCleanup = async () => {
    if (!confirmed || !doubleConfirmed) {
      setError('You must check both confirmation boxes');
      return;
    }
    
    setCleaning(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Starting nuclear cleanup...');
      const cleanupResult = await nuclearCleanup();
      
      if (cleanupResult.success) {
        setResult(cleanupResult);
        // Reload after showing success
        setTimeout(() => {
          window.location.href = '/client/browse';
        }, 3000);
      } else {
        setError(cleanupResult.error);
      }
    } catch (err) {
      console.error('Nuclear cleanup error:', err);
      setError(err.message);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-red-900 rounded-xl shadow-2xl p-8 border-4 border-red-500">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
          <h2 className="text-3xl font-black text-white">NUCLEAR CLEANUP</h2>
          <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
        </div>

        <div className="bg-black border-2 border-yellow-400 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-bold text-yellow-400 text-xl mb-3">
                ⚠️ EXTREME WARNING ⚠️
              </h3>
              <p className="text-yellow-300 mb-3 font-bold">
                This is the NUCLEAR OPTION. It will:
              </p>
              <ul className="list-disc list-inside text-yellow-200 space-y-2 ml-4">
                <li>Delete EVERY SINGLE LISTING in the database</li>
                <li>Completely reset the listings collection</li>
                <li>Re-create ONLY "dfgbnchnfbfgnfgnfgnfgbn" if it exists</li>
                <li>This action is IRREVERSIBLE</li>
                <li>This bypasses ALL safety checks</li>
              </ul>
              <p className="text-red-400 mt-4 font-bold text-lg">
                USE ONLY AS A LAST RESORT!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-red-800 p-4 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-white font-bold">
                I understand this will DELETE ALL LISTINGS
              </span>
            </label>
          </div>

          <div className="bg-red-800 p-4 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={doubleConfirmed}
                onChange={(e) => setDoubleConfirmed(e.target.checked)}
                className="w-6 h-6 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-white font-bold">
                I REALLY want to do this (double confirmation)
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleNuclearCleanup}
          disabled={cleaning || !confirmed || !doubleConfirmed}
          className={`w-full py-4 px-6 rounded-lg font-black text-lg transition-all transform ${
            cleaning || !confirmed || !doubleConfirmed
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 hover:scale-105 animate-pulse'
          }`}
        >
          {cleaning ? (
            <span className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>NUCLEAR CLEANUP IN PROGRESS...</span>
            </span>
          ) : (
            '☢️ EXECUTE NUCLEAR CLEANUP ☢️'
          )}
        </button>

        {result && (
          <div className="mt-6 bg-green-900 border-2 border-green-400 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="font-bold text-green-400 text-lg">Nuclear Cleanup Complete!</h3>
            </div>
            <div className="text-green-300 space-y-1">
              <p>Deleted: {result.deleted} listings</p>
              <p>Kept: {result.kept} listings</p>
              <p>Final count: {result.finalCount} listings</p>
            </div>
            <div className="mt-3 pt-3 border-t border-green-600">
              <p className="text-green-400 font-bold">
                Redirecting to browse page in 3 seconds...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-800 border-2 border-red-400 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-bold text-red-400">Nuclear Cleanup Failed</h3>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Check the browser console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default NuclearCleanup;