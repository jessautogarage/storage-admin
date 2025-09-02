import React, { useState } from 'react';
import { quickSeed, fullSeed, testSeed, clearDatabase, seedDatabase } from '../../utils/seedFirebase';
import { Database, Trash2, Upload, Loader, CheckCircle, XCircle, Users, Package, Calendar, Star } from 'lucide-react';

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [customOptions, setCustomOptions] = useState({
    hostCount: 5,
    clientCount: 10,
    listingsPerHost: 3,
    bookingsPerListing: 2
  });

  const handleQuickSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const seedResult = await quickSeed();
      setResult({
        message: 'Quick seed completed successfully!',
        stats: seedResult
      });
    } catch (err) {
      setError('Failed to seed database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFullSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const seedResult = await fullSeed();
      setResult({
        message: 'Full seed completed successfully!',
        stats: seedResult
      });
    } catch (err) {
      setError('Failed to seed database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const seedResult = await testSeed();
      setResult({
        message: 'Test seed completed successfully!',
        stats: seedResult
      });
    } catch (err) {
      setError('Failed to seed database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const seedResult = await seedDatabase({
        clearFirst: true,
        ...customOptions
      });
      setResult({
        message: 'Custom seed completed successfully!',
        stats: seedResult
      });
    } catch (err) {
      setError('Failed to seed database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      await clearDatabase();
      setResult({
        message: 'Database cleared successfully!',
        stats: null
      });
    } catch (err) {
      setError('Failed to clear database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (field, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Firebase Database Seeder</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Warning:</strong> Seeding will create realistic test data in your Firebase database. 
            The "Clear First" option will delete all existing data before seeding.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Seed</h3>
            <p className="text-sm text-gray-600 mb-3">
              Minimal test data: 3 hosts, 5 clients, 6 listings
            </p>
            <button
              onClick={handleTestSeed}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Seeding...' : 'Test Seed'}
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Seed</h3>
            <p className="text-sm text-gray-600 mb-3">
              Standard data: 5 hosts, 10 clients, 15 listings
            </p>
            <button
              onClick={handleQuickSeed}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Seeding...' : 'Quick Seed'}
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Full Seed</h3>
            <p className="text-sm text-gray-600 mb-3">
              Complete data: 15 hosts, 30 clients, 60 listings
            </p>
            <button
              onClick={handleFullSeed}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Seeding...' : 'Full Seed'}
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Clear Database</h3>
            <p className="text-sm text-gray-600 mb-3">
              Removes all data including conversations
            </p>
            <button
              onClick={handleClearDatabase}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </div>

        {/* Custom Seed Options */}
        <div className="border rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Custom Seed Options</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Hosts
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={customOptions.hostCount}
                onChange={(e) => handleOptionChange('hostCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Clients
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={customOptions.clientCount}
                onChange={(e) => handleOptionChange('clientCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listings per Host
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={customOptions.listingsPerHost}
                onChange={(e) => handleOptionChange('listingsPerHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bookings per Listing
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={customOptions.bookingsPerListing}
                onChange={(e) => handleOptionChange('bookingsPerListing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleCustomSeed}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Seeding...' : 'Run Custom Seed'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-800">Processing database operation...</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">{result.message}</p>
                {result.stats && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {result.stats.admins > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">Admins</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{result.stats.admins}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Hosts</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.stats.hosts}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Clients</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.stats.clients}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Listings</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.stats.listings}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Bookings</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.stats.bookings}</p>
                    </div>
                    {result.stats.conversations > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-600">Chats</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{result.stats.conversations}</p>
                      </div>
                    )}
                    {result.stats.messages > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-pink-500" />
                          <span className="text-sm text-gray-600">Messages</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{result.stats.messages}</p>
                      </div>
                    )}
                    {result.stats.reviews > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">Reviews</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{result.stats.reviews}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Generated Data Includes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Users:</strong> Admin account, hosts with detailed profiles, and client accounts</li>
            <li>• <strong>Authentication:</strong> Filipino names with realistic phone numbers and emails</li>
            <li>• <strong>Locations:</strong> Metro Manila areas (Makati, BGC, Quezon City, Pasig, etc.)</li>
            <li>• <strong>Storage Types:</strong> Units, garages, warehouses, parking, rooms, basements</li>
            <li>• <strong>Pricing:</strong> Dynamic rates based on location, size, and storage type</li>
            <li>• <strong>Bookings:</strong> Various statuses (pending, confirmed, active, completed, cancelled)</li>
            <li>• <strong>Messaging:</strong> Conversations and realistic message exchanges</li>
            <li>• <strong>Reviews:</strong> Detailed ratings with aspects and helpful comments</li>
            <li>• <strong>Features:</strong> Security, access control, climate control, and amenities</li>
          </ul>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Admin Login:</strong> admin@lockifyhub.com | 
              <strong> Test Data:</strong> All users have example.com emails for testing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSeeder;