import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebaseConfig';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { Database, AlertCircle, CheckCircle, Package, Users } from 'lucide-react';

const DatabaseDebug = () => {
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    collections: {},
    error: null,
    loading: true
  });

  const checkDatabase = async () => {
    console.log('🔍 Starting database debug check...');
    setDbStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const collectionsToCheck = ['listings', 'users', 'bookings', 'settings'];
      const results = {};
      
      for (const collectionName of collectionsToCheck) {
        try {
          console.log(`🔍 Checking collection: ${collectionName}`);
          const q = query(collection(db, collectionName), limit(5));
          const snapshot = await getDocs(q);
          
          const docs = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            docs.push({
              id: doc.id,
              ...data
            });
          });
          
          results[collectionName] = {
            exists: true,
            count: snapshot.size,
            empty: snapshot.empty,
            samples: docs.slice(0, 3)
          };
          
          console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
          
          // Special debug for listings
          if (collectionName === 'listings' && docs.length > 0) {
            console.log('🔍 Listing samples:', docs.map(doc => ({
              id: doc.id,
              title: doc.title,
              status: doc.status,
              type: doc.type,
              location: doc.location
            })));
          }
          
        } catch (error) {
          console.error(`❌ Error checking ${collectionName}:`, error);
          results[collectionName] = {
            exists: false,
            error: error.message
          };
        }
      }
      
      setDbStatus({
        connected: true,
        collections: results,
        error: null,
        loading: false
      });
      
      console.log('✅ Database check completed');
      
    } catch (error) {
      console.error('❌ Database check failed:', error);
      setDbStatus({
        connected: false,
        collections: {},
        error: error.message,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const seedQuick = async () => {
    try {
      console.log('🌱 Starting quick seed...');
      const { quickSeed } = await import('../../utils/seedFirebase');
      await quickSeed();
      console.log('✅ Quick seed completed');
      // Refresh the database check
      setTimeout(checkDatabase, 1000);
    } catch (error) {
      console.error('❌ Quick seed failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Database Debug Tool</h2>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={checkDatabase}
            disabled={dbStatus.loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {dbStatus.loading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={seedQuick}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Quick Seed Data
          </button>
        </div>

        {dbStatus.loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">Checking database connection and collections...</p>
          </div>
        )}

        {dbStatus.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Database Connection Error</h3>
                <p className="text-red-700">{dbStatus.error}</p>
              </div>
            </div>
          </div>
        )}

        {!dbStatus.loading && dbStatus.connected && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">Database Connected Successfully</h3>
              </div>
            </div>

            <div className="grid gap-4">
              {Object.entries(dbStatus.collections).map(([collectionName, info]) => (
                <div
                  key={collectionName}
                  className={`border rounded-lg p-4 ${
                    info.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {collectionName === 'listings' && <Package className="w-5 h-5" />}
                      {collectionName === 'users' && <Users className="w-5 h-5" />}
                      {collectionName !== 'listings' && collectionName !== 'users' && (
                        <Database className="w-5 h-5" />
                      )}
                      <h4 className="font-semibold capitalize">{collectionName}</h4>
                    </div>
                    
                    {info.exists ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        info.count > 0 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {info.count} documents
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Error
                      </span>
                    )}
                  </div>

                  {info.exists ? (
                    <div>
                      {info.empty ? (
                        <p className="text-yellow-700 text-sm">Collection exists but is empty</p>
                      ) : (
                        <div>
                          <p className="text-green-700 text-sm mb-2">
                            Found {info.count} documents
                          </p>
                          
                          {info.samples && info.samples.length > 0 && (
                            <div className="bg-white rounded p-3 mt-2">
                              <h5 className="font-medium text-gray-900 mb-2">Sample Documents:</h5>
                              <div className="space-y-2">
                                {info.samples.map((doc, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                                      <div><strong>ID:</strong> {doc.id}</div>
                                      {collectionName === 'listings' && (
                                        <div>
                                          <div><strong>Title:</strong> {doc.title || 'N/A'}</div>
                                          <div><strong>Status:</strong> {doc.status || 'N/A'}</div>
                                          <div><strong>Type:</strong> {doc.type || 'N/A'}</div>
                                          <div><strong>Location:</strong> {doc.location?.city || 'N/A'}</div>
                                          <div><strong>Price:</strong> ₱{doc.pricing?.daily || 'N/A'}/day</div>
                                        </div>
                                      )}
                                      {collectionName === 'users' && (
                                        <div>
                                          <div><strong>Name:</strong> {doc.name || 'N/A'}</div>
                                          <div><strong>Type:</strong> {doc.userType || doc.type || 'N/A'}</div>
                                          <div><strong>Email:</strong> {doc.email || 'N/A'}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-700 text-sm">
                      Error: {info.error}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2 text-sm">
                <p><strong>No listings found?</strong> Click "Quick Seed Data" to populate the database with test data.</p>
                <p><strong>Status issues?</strong> The seeder creates listings with "available" status, but the hook looks for "active".</p>
                <p><strong>Index errors?</strong> The debug query uses simple queries to avoid Firestore index requirements.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseDebug;