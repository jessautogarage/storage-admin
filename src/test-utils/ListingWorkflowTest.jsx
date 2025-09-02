import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import listingService from '../../services/listingService';
import { CheckCircle, XCircle, AlertCircle, Image, Ruler, DollarSign, MapPin, Package } from 'lucide-react';

const ListingWorkflowTest = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const result = await listingService.getActiveListings();
      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const addTestResult = (field, expected, actual, success) => {
    setTestResults(prev => [...prev, {
      field,
      expected,
      actual,
      success,
      timestamp: new Date().toISOString()
    }]);
  };

  const testListingDisplay = () => {
    if (!selectedListing) {
      alert('Please select a listing to test');
      return;
    }

    setTestResults([]);
    
    // Test 1: Check if size is properly structured
    const sizeTest = selectedListing.size && selectedListing.size.value;
    addTestResult(
      'Size Structure',
      'Object with value and unit',
      selectedListing.size ? JSON.stringify(selectedListing.size) : 'undefined',
      sizeTest
    );

    // Test 2: Check if images array exists
    const imagesTest = Array.isArray(selectedListing.images) && selectedListing.images.length > 0;
    addTestResult(
      'Images Array',
      'Array with at least one image',
      selectedListing.images ? `Array with ${selectedListing.images.length} images` : 'undefined',
      imagesTest
    );

    // Test 3: Check status field
    const statusTest = selectedListing.status === 'active' || selectedListing.status === 'available';
    addTestResult(
      'Status Field',
      'active or available',
      selectedListing.status || 'undefined',
      statusTest
    );

    // Test 4: Check pricing structure
    const pricingTest = selectedListing.pricing && selectedListing.pricing.daily;
    addTestResult(
      'Pricing Structure',
      'Object with daily rate',
      selectedListing.pricing ? JSON.stringify(selectedListing.pricing) : 'undefined',
      pricingTest
    );

    // Test 5: Check location structure
    const locationTest = selectedListing.location && selectedListing.location.city;
    addTestResult(
      'Location Structure',
      'Object with city',
      selectedListing.location ? JSON.stringify(selectedListing.location) : 'undefined',
      locationTest
    );

    // Test 6: Check availability structure
    const availabilityTest = selectedListing.availability && Array.isArray(selectedListing.availability.availableDates);
    addTestResult(
      'Availability Structure',
      'Object with availableDates array',
      selectedListing.availability ? `${selectedListing.availability.availableDates?.length || 0} available dates` : 'undefined',
      availabilityTest
    );

    // Test 7: Check features array
    const featuresTest = Array.isArray(selectedListing.features);
    addTestResult(
      'Features Array',
      'Array of features',
      selectedListing.features ? `Array with ${selectedListing.features.length} features` : 'undefined',
      featuresTest
    );

    // Test 8: Check host information
    const hostTest = selectedListing.hostId && selectedListing.hostName;
    addTestResult(
      'Host Information',
      'hostId and hostName present',
      `hostId: ${selectedListing.hostId ? 'present' : 'missing'}, hostName: ${selectedListing.hostName || 'missing'}`,
      hostTest
    );
  };

  const createTestListing = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    // Check if user object has the uid property
    const userId = user?.uid || user?.user?.uid;
    if (!userId) {
      alert('User ID not found. Please try logging out and logging in again.');
      console.error('User object:', user);
      return;
    }

    console.log('Creating test listing with userId:', userId);
    setLoading(true);
    try {
      const testListingData = {
        title: `Test Listing ${Date.now()}`,
        description: 'This is a test listing to verify data structure',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        pricePerDay: 150,
        size: {
          value: 100,
          unit: 'sqm'
        },
        storageType: 'storage',
        features: ['Climate Controlled', '24/7 Access', 'Security Cameras'],
        images: [
          { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
          { url: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800' }
        ],
        availability: {
          availableDates: [
            new Date(Date.now() + 86400000).toISOString().split('T')[0],
            new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
            new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
          ]
        }
      };

      const result = await listingService.createListing(testListingData, userId);
      
      if (result.success) {
        alert(`Test listing created successfully! ID: ${result.id}`);
        await loadListings();
        
        // Find and select the newly created listing
        setTimeout(async () => {
          const updatedResult = await listingService.getListing(result.id);
          if (updatedResult.success) {
            setSelectedListing(updatedResult.data);
            testListingDisplay();
          }
        }, 1000);
      } else {
        alert('Failed to create test listing: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating test listing:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Listing Display Workflow Test</h1>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Controls</h2>
          
          {/* User Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">User Status:</span>
              {user ? (
                <span className="text-green-600 ml-2">
                  ✅ Logged in as {user.email || user.displayName || 'User'}
                  (ID: {user.uid || user.user?.uid || 'Unknown'})
                </span>
              ) : (
                <span className="text-red-600 ml-2">❌ Not logged in</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listing Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Listing ({listings.length} found)
              </label>
              <select
                value={selectedListing?.id || ''}
                onChange={(e) => {
                  const listing = listings.find(l => l.id === e.target.value);
                  setSelectedListing(listing);
                }}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">-- Select a listing --</option>
                {listings.map(listing => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} (Status: {listing.status})
                  </option>
                ))}
              </select>
              
              {listings.length === 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  No listings found. Try creating a new one or check if you're logged in.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={testListingDisplay}
                disabled={!selectedListing}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedListing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Test Selected Listing
              </button>
              
              <button
                onClick={createTestListing}
                disabled={loading || !user}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  !loading && user
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating...' : 'Create & Test New Listing'}
              </button>
              
              <button
                onClick={async () => {
                  console.log('Debug: Current user object:', user);
                  console.log('Debug: Current listings:', listings);
                  await loadListings();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
              >
                🔍 Debug: Refresh & Check Data
              </button>
            </div>
          </div>

          {/* Selected Listing Preview */}
          {selectedListing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Selected Listing Data:</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <div className="font-medium">{selectedListing.title}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${
                      (selectedListing.status === 'active' || selectedListing.status === 'available')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedListing.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Size:</span>
                  <div className="font-medium">
                    {selectedListing.size?.value 
                      ? `${selectedListing.size.value} ${selectedListing.size.unit || 'sqm'}`
                      : typeof selectedListing.size === 'number' 
                        ? `${selectedListing.size} sqm`
                        : 'Not specified'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Price:</span>
                  <div className="font-medium">
                    ₱{selectedListing.pricing?.daily || selectedListing.pricePerDay || 0}/day
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Images:</span>
                  <div className="font-medium">
                    {selectedListing.images?.length || 0} images
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Location:</span>
                  <div className="font-medium">
                    {selectedListing.location?.city || selectedListing.city || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Raw Data View */}
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  View Raw Data
                </summary>
                <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(selectedListing, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    result.success 
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {result.field}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>Expected: {result.expected}</div>
                      <div>Actual: {result.actual}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">
                  Test Summary
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">
                      {testResults.filter(r => r.success).length} Passed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">
                      {testResults.filter(r => !r.success).length} Failed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Issues */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Common Issues & Solutions</h3>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                <li><strong>Size not showing:</strong> Size must be an object with 'value' and 'unit' properties</li>
                <li><strong>Images not showing:</strong> Images must be an array of objects with 'url' property</li>
                <li><strong>Status issues:</strong> Status should be 'active' for listings to appear in browse</li>
                <li><strong>Price not showing:</strong> Price should be in pricing.daily field</li>
                <li><strong>Location not showing:</strong> Location should be an object with city, state fields</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingWorkflowTest;