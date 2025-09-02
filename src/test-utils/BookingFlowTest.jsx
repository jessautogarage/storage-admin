import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import listingService from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { Calendar, CheckCircle, XCircle, AlertCircle, Package, User, DollarSign, Clock } from 'lucide-react';

const BookingFlowTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testBookingDates, setTestBookingDates] = useState({
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] // 3 days from now
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const result = await listingService.getActiveListings();
      if (result.success) {
        // Filter listings with available dates
        const withAvailability = result.data.filter(l => 
          l.availability?.availableDates?.length > 0
        );
        setListings(withAvailability);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const addTestResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runCompleteBookingTest = async () => {
    if (!selectedListing) {
      alert('Please select a listing first');
      return;
    }

    if (!user) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check listing has available dates
      addTestResult(
        'Listing Availability',
        selectedListing.availability?.availableDates?.length > 0,
        `Listing has ${selectedListing.availability?.availableDates?.length || 0} available dates`,
        { availableDates: selectedListing.availability?.availableDates?.slice(0, 10) }
      );

      // Test 2: Check date availability
      const availabilityCheck = await listingService.checkDateAvailability(
        selectedListing.id,
        testBookingDates.startDate,
        testBookingDates.endDate
      );

      addTestResult(
        'Date Availability Check',
        availabilityCheck.success && availabilityCheck.isAvailable,
        availabilityCheck.isAvailable 
          ? 'Dates are available for booking'
          : `Dates not available: ${availabilityCheck.conflictReasons?.map(c => c.reason).join(', ')}`,
        availabilityCheck
      );

      if (!availabilityCheck.isAvailable) {
        addTestResult(
          'Booking Creation',
          false,
          'Skipped - dates not available',
          null
        );
        return;
      }

      // Test 3: Attempt to create booking
      const bookingResult = await bookingService.createBooking({
        listingId: selectedListing.id,
        clientId: user.uid,
        hostId: selectedListing.hostId,
        startDate: testBookingDates.startDate,
        endDate: testBookingDates.endDate,
        listingPrice: selectedListing.pricing?.daily || 100,
        paymentMethod: 'test',
        clientName: user.displayName || 'Test Client',
        clientEmail: user.email,
        hostName: selectedListing.hostName || 'Test Host',
        hostEmail: selectedListing.hostEmail || 'host@test.com',
        listingTitle: selectedListing.title,
        listingAddress: selectedListing.location?.address || 'Test Address'
      });

      addTestResult(
        'Booking Creation',
        bookingResult.success,
        bookingResult.success 
          ? `Booking created successfully (ID: ${bookingResult.bookingId})`
          : `Failed to create booking: ${bookingResult.error}`,
        bookingResult
      );

      if (bookingResult.success) {
        // Test 4: Verify booking was saved
        const userBookings = await bookingService.getUserBookings(user.uid, 'client');
        const bookingFound = userBookings.bookings?.find(b => b.id === bookingResult.bookingId);

        addTestResult(
          'Booking Verification',
          !!bookingFound,
          bookingFound 
            ? 'Booking found in user bookings'
            : 'Booking not found in user bookings',
          bookingFound
        );

        // Test 5: Check if dates are now booked
        const updatedListing = await listingService.getListing(selectedListing.id);
        const bookedDatesUpdated = updatedListing.data?.bookedDates?.includes(testBookingDates.startDate);

        addTestResult(
          'Booked Dates Update',
          bookedDatesUpdated,
          bookedDatesUpdated
            ? 'Listing booked dates updated correctly'
            : 'Listing booked dates not updated',
          { bookedDates: updatedListing.data?.bookedDates }
        );

        // Test 6: Try double booking (should fail)
        const doubleBookingResult = await bookingService.createBooking({
          listingId: selectedListing.id,
          clientId: user.uid,
          hostId: selectedListing.hostId,
          startDate: testBookingDates.startDate,
          endDate: testBookingDates.endDate,
          listingPrice: selectedListing.pricing?.daily || 100,
          paymentMethod: 'test',
          clientName: user.displayName || 'Test Client 2',
          clientEmail: user.email,
          hostName: selectedListing.hostName || 'Test Host',
          hostEmail: selectedListing.hostEmail || 'host@test.com',
          listingTitle: selectedListing.title,
          listingAddress: selectedListing.location?.address || 'Test Address'
        });

        addTestResult(
          'Double Booking Prevention',
          !doubleBookingResult.success,
          !doubleBookingResult.success
            ? 'Double booking prevented successfully'
            : 'ERROR: Double booking was allowed!',
          doubleBookingResult
        );

        // Test 7: Cancel the test booking
        if (bookingFound) {
          const cancelResult = await bookingService.cancelBooking(
            bookingResult.bookingId,
            'Test booking - automatic cancellation'
          );

          addTestResult(
            'Booking Cancellation',
            cancelResult.success,
            cancelResult.success
              ? 'Test booking cancelled successfully'
              : `Failed to cancel: ${cancelResult.error}`,
            cancelResult
          );
        }
      }

    } catch (error) {
      addTestResult(
        'Unexpected Error',
        false,
        error.message,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Booking Flow Test</h1>

        {/* Test Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listing Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Listing to Test
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
                    {listing.title} ({listing.availability?.availableDates?.length || 0} available dates)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Booking Dates
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={testBookingDates.startDate}
                  onChange={(e) => setTestBookingDates(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="flex-1 p-2 border rounded-lg"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  value={testBookingDates.endDate}
                  onChange={(e) => setTestBookingDates(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className="flex-1 p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Selected Listing Info */}
          {selectedListing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Selected Listing Details:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <div className="font-medium">{selectedListing.title}</div>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <div className="font-medium">₱{selectedListing.pricing?.daily || 0}/day</div>
                </div>
                <div>
                  <span className="text-gray-600">Available Days:</span>
                  <div className="font-medium">{selectedListing.availability?.availableDates?.length || 0}</div>
                </div>
                <div>
                  <span className="text-gray-600">Booked Days:</span>
                  <div className="font-medium">{selectedListing.bookedDates?.length || 0}</div>
                </div>
              </div>
              
              {/* Show first few available dates */}
              {selectedListing.availability?.availableDates?.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Sample Available Dates:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedListing.availability.availableDates.slice(0, 10).map(date => (
                      <span key={date} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {date}
                      </span>
                    ))}
                    {selectedListing.availability.availableDates.length > 10 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{selectedListing.availability.availableDates.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run Test Button */}
          <button
            onClick={runCompleteBookingTest}
            disabled={!selectedListing || loading}
            className={`mt-4 px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedListing && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Running Tests...' : 'Run Complete Booking Test'}
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {result.test}
                      </div>
                      <div className={`text-sm mt-1 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </div>
                      
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
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

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Test Instructions</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li>Select a listing that has available dates set</li>
                <li>Choose test dates (default is tomorrow to 3 days from now)</li>
                <li>Click "Run Complete Booking Test"</li>
                <li>The test will automatically create and cancel a booking</li>
                <li>Check results to ensure all validations are working</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowTest;