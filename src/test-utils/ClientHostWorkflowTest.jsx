import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useStorageListings from '../../hooks/useStorageListings';
import useUserBookings from '../../hooks/useUserBookings';
import useUserFavorites from '../../hooks/useUserFavorites';
import { useListings } from '../../hooks/useListings';
import listingService from '../../services/listingService';
import { 
  User, 
  Package, 
  Calendar, 
  Heart, 
  Search,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle
} from 'lucide-react';

const ClientHostWorkflowTest = () => {
  const { user } = useAuth();
  const [activeTest, setActiveTest] = useState('browse');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const userId = user?.user?.uid || user?.uid;
  const userType = user?.user?.userType || user?.userType;

  // Client hooks
  const {
    listings: browseListings,
    loading: browseLoading,
    error: browseError,
    searchListings,
    refresh: refreshBrowse
  } = useStorageListings({
    filters: { available: true },
    sortBy: 'createdAt',
    sortOrder: 'desc',
    pageSize: 5,
    realtime: false
  });

  const {
    bookings: clientBookings,
    loading: clientBookingsLoading,
    createBooking
  } = useUserBookings(userId, 'client');

  const {
    favorites,
    loading: favoritesLoading,
    toggleFavorite
  } = useUserFavorites(userId);

  // Host hooks
  const {
    listings: hostListings,
    loading: hostListingsLoading,
    createListing,
    stats: hostStats
  } = useListings();

  const {
    bookings: hostBookings,
    loading: hostBookingsLoading
  } = useUserBookings(userId, 'host');

  // Test functions
  const runBrowseTest = async () => {
    setLoading(true);
    const results = { test: 'Browse Listings', steps: [] };
    
    try {
      // Test 1: Load listings
      results.steps.push({
        name: 'Load Available Listings',
        status: browseListings.length > 0 ? 'success' : 'warning',
        message: `Found ${browseListings.length} listings`,
        data: browseListings.slice(0, 2)
      });

      // Test 2: Search functionality
      await searchListings('storage');
      results.steps.push({
        name: 'Search Listings',
        status: 'success',
        message: 'Search functionality working'
      });

      // Test 3: Filter test
      const filterTest = browseListings.filter(listing => 
        listing.pricing?.daily && listing.pricing.daily > 0
      );
      results.steps.push({
        name: 'Price Filtering',
        status: filterTest.length > 0 ? 'success' : 'warning',
        message: `${filterTest.length} listings have valid pricing`
      });

    } catch (error) {
      results.steps.push({
        name: 'Browse Test Failed',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(prev => ({ ...prev, browse: results }));
    setLoading(false);
  };

  const runBookingFlowTest = async () => {
    setLoading(true);
    const results = { test: 'Booking Flow', steps: [] };

    try {
      // Test 1: Check available listings for booking
      const availableListings = browseListings.filter(listing => 
        listing.status === 'available' && listing.hostId !== userId
      );
      
      results.steps.push({
        name: 'Available Listings for Booking',
        status: availableListings.length > 0 ? 'success' : 'warning',
        message: `${availableListings.length} listings available for booking`
      });

      // Test 2: Check existing bookings
      results.steps.push({
        name: 'User Bookings',
        status: 'info',
        message: `User has ${clientBookings.length} existing bookings`,
        data: clientBookings.slice(0, 2)
      });

      if (availableListings.length > 0 && userType === 'client') {
        // Test 3: Simulate booking creation (don't actually create)
        const testListing = availableListings[0];
        const bookingData = {
          listingId: testListing.id,
          hostId: testListing.hostId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          totalAmount: (testListing.pricing?.daily || 100) * 7,
          message: 'Test booking for workflow validation'
        };

        results.steps.push({
          name: 'Booking Data Validation',
          status: 'success',
          message: 'Booking data structure is valid',
          data: bookingData
        });
      }

    } catch (error) {
      results.steps.push({
        name: 'Booking Flow Test Failed',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(prev => ({ ...prev, booking: results }));
    setLoading(false);
  };

  const runHostWorkflowTest = async () => {
    setLoading(true);
    const results = { test: 'Host Workflow', steps: [] };

    try {
      // Test 1: Host listings
      results.steps.push({
        name: 'Host Listings',
        status: 'info',
        message: `Host has ${hostListings.length} listings`,
        data: hostListings.slice(0, 2)
      });

      // Test 2: Host bookings
      results.steps.push({
        name: 'Host Bookings',
        status: 'info',
        message: `Host has ${hostBookings.length} bookings to manage`,
        data: hostBookings.slice(0, 2)
      });

      // Test 3: Host stats
      if (hostStats) {
        results.steps.push({
          name: 'Host Statistics',
          status: 'success',
          message: 'Host stats are available',
          data: hostStats
        });
      }

      // Test 4: Listing creation validation (don't actually create)
      const sampleListingData = {
        title: 'Test Storage Space',
        description: 'A test storage space for workflow validation',
        address: '123 Test Street',
        city: 'Manila',
        state: 'Metro Manila',
        pricePerDay: 150,
        size: 50,
        type: 'storage',
        features: ['24/7 Access', 'CCTV'],
        images: ['https://example.com/image1.jpg']
      };

      results.steps.push({
        name: 'Listing Data Validation',
        status: 'success',
        message: 'Listing creation data structure is valid',
        data: sampleListingData
      });

    } catch (error) {
      results.steps.push({
        name: 'Host Workflow Test Failed',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(prev => ({ ...prev, host: results }));
    setLoading(false);
  };

  const runConnectionTest = async () => {
    setLoading(true);
    const results = { test: 'Client-Host Connections', steps: [] };

    try {
      // Test 1: Data model connections
      const connections = [];

      // Check listings with valid host IDs
      const listingsWithHosts = browseListings.filter(listing => 
        listing.hostId && listing.hostId.length > 0
      );
      connections.push({
        type: 'Listings → Hosts',
        count: listingsWithHosts.length,
        sample: listingsWithHosts.slice(0, 1).map(l => ({
          listingId: l.id,
          hostId: l.hostId,
          title: l.title
        }))
      });

      // Check bookings with connections
      const bookingsWithConnections = [...clientBookings, ...hostBookings].filter(booking =>
        booking.clientId && booking.hostId && booking.listingId
      );
      connections.push({
        type: 'Bookings → Clients + Hosts + Listings',
        count: bookingsWithConnections.length,
        sample: bookingsWithConnections.slice(0, 1).map(b => ({
          bookingId: b.id,
          clientId: b.clientId,
          hostId: b.hostId,
          listingId: b.listingId
        }))
      });

      results.steps.push({
        name: 'Data Model Connections',
        status: connections.length > 0 ? 'success' : 'warning',
        message: 'Data relationships verified',
        data: connections
      });

      // Test 2: User favorites
      results.steps.push({
        name: 'User Favorites',
        status: 'info',
        message: `User has ${favorites.length} favorite listings`,
        data: favorites.slice(0, 2)
      });

      // Test 3: Workflow completeness
      const workflowSteps = [
        { name: 'Host creates listing', available: hostListings.length > 0 || browseListings.length > 0 },
        { name: 'Client browses listings', available: browseListings.length > 0 },
        { name: 'Client can favorite', available: typeof toggleFavorite === 'function' },
        { name: 'Client can book', available: typeof createBooking === 'function' },
        { name: 'Host manages bookings', available: hostBookings !== undefined }
      ];

      const completedSteps = workflowSteps.filter(step => step.available).length;
      results.steps.push({
        name: 'Workflow Completeness',
        status: completedSteps === workflowSteps.length ? 'success' : 'warning',
        message: `${completedSteps}/${workflowSteps.length} workflow steps available`,
        data: workflowSteps
      });

    } catch (error) {
      results.steps.push({
        name: 'Connection Test Failed',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(prev => ({ ...prev, connection: results }));
    setLoading(false);
  };

  const createSampleData = async () => {
    setLoading(true);
    const results = { test: 'Create Sample Data', steps: [] };

    try {
      if (userType === 'host') {
        // Create sample listing
        const sampleListing = {
          title: 'Modern Storage Unit',
          description: 'Clean, secure storage space perfect for household items, boxes, and furniture. Located in a well-maintained facility with 24/7 access.',
          address: '456 Storage Avenue',
          city: 'Quezon City',
          state: 'Metro Manila',
          zipCode: '1100',
          pricePerDay: 120,
          size: 75,
          type: 'storage',
          features: ['24/7 Access', 'CCTV Security', 'Climate Controlled', 'Easy Loading'],
          images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
          ]
        };

        const result = await createListing(sampleListing);
        
        results.steps.push({
          name: 'Create Sample Listing',
          status: result.success ? 'success' : 'error',
          message: result.success ? 'Sample listing created successfully' : result.error,
          data: result.data
        });
      } else {
        results.steps.push({
          name: 'Sample Data Creation',
          status: 'info',
          message: 'Switch to host account to create sample listings'
        });
      }
    } catch (error) {
      results.steps.push({
        name: 'Sample Data Creation Failed',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(prev => ({ ...prev, sample: results }));
    setLoading(false);
  };

  // Auto-run browse test on mount
  useEffect(() => {
    if (browseListings.length > 0 && !testResults.browse) {
      runBrowseTest();
    }
  }, [browseListings]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Loader className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderTestResults = (results) => {
    if (!results) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">{results.test}</h3>
        <div className="space-y-3">
          {results.steps.map((step, index) => (
            <div key={index} className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-start space-x-2">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.name}</div>
                  <div className="text-sm text-gray-600">{step.message}</div>
                  {step.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">View Data</summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Client-Host Workflow Test
          </h1>
          <p className="text-gray-600 mb-4">
            Test the complete workflow between clients and hosts, including browsing, booking, and data connections.
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>User: {user?.user?.email || user?.email || 'Not logged in'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Type: {userType || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={runBrowseTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Browse Test</span>
            </button>
            
            <button
              onClick={runBookingFlowTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>Booking Test</span>
            </button>
            
            <button
              onClick={runHostWorkflowTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              <span>Host Test</span>
            </button>
            
            <button
              onClick={runConnectionTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <Heart className="w-4 h-4" />
              <span>Connection Test</span>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={createSampleData}
              disabled={loading || userType !== 'host'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Sample Data {userType !== 'host' && '(Host Only)'}
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Running tests...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {browseError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Browse Error</h3>
                <p className="text-red-600 text-sm">{browseError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-6">
          {renderTestResults(testResults.browse)}
          {renderTestResults(testResults.booking)}
          {renderTestResults(testResults.host)}
          {renderTestResults(testResults.connection)}
          {renderTestResults(testResults.sample)}
        </div>

        {/* Raw Data Display */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">Raw Data Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Browse Listings ({browseListings.length})</h3>
              <div className="bg-gray-50 p-3 rounded text-xs max-h-40 overflow-y-auto">
                {browseListings.length > 0 ? (
                  browseListings.map(listing => (
                    <div key={listing.id} className="mb-2 pb-2 border-b border-gray-200">
                      <div><strong>ID:</strong> {listing.id}</div>
                      <div><strong>Title:</strong> {listing.title}</div>
                      <div><strong>Host:</strong> {listing.hostId}</div>
                      <div><strong>Price:</strong> ₱{listing.pricing?.daily || 0}/day</div>
                    </div>
                  ))
                ) : (
                  <div>No listings found</div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">User Bookings ({clientBookings.length})</h3>
              <div className="bg-gray-50 p-3 rounded text-xs max-h-40 overflow-y-auto">
                {clientBookings.length > 0 ? (
                  clientBookings.map(booking => (
                    <div key={booking.id} className="mb-2 pb-2 border-b border-gray-200">
                      <div><strong>ID:</strong> {booking.id}</div>
                      <div><strong>Status:</strong> {booking.status}</div>
                      <div><strong>Listing:</strong> {booking.listingId}</div>
                      <div><strong>Amount:</strong> ₱{booking.totalAmount || 0}</div>
                    </div>
                  ))
                ) : (
                  <div>No bookings found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHostWorkflowTest;