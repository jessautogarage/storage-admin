import React, { useState, useEffect, useContext } from 'react';
import { Calendar, TestTube, User, Home } from 'lucide-react';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import { AuthContext } from '../../context/AuthContextSafe';

const CalendarTest = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [testListingId, setTestListingId] = useState('test-listing-123');
  const [mode, setMode] = useState('host');
  const [availableDates, setAvailableDates] = useState([
    '2024-08-26',
    '2024-08-27',
    '2024-08-28',
    '2024-09-01',
    '2024-09-02'
  ]);
  const [bookedDates] = useState([
    '2024-08-29',
    '2024-08-30'
  ]);
  
  const handleAvailabilityChange = (data) => {
    console.log('Availability changed:', data);
    setAvailableDates(data.availableDates);
  };
  
  const handleDateRangeChange = (range) => {
    console.log('Date range selected:', range);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Simplified Calendar Test
          </h1>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-800 mb-2">Test Information</h2>
          <div className="text-sm text-green-700 space-y-1">
            <div>User ID: {user?.uid || 'Not logged in'}</div>
            <div>Test Listing ID: {testListingId}</div>
            <div>Mode: {mode}</div>
            <div>Available Dates: {availableDates.length} dates</div>
            <div>Booked Dates: {bookedDates.length} dates</div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Select Mode</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('host')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'host'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            Host Mode (Set Availability)
          </button>
          <button
            onClick={() => setMode('client')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'client'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            Client Mode (Book Dates)
          </button>
        </div>
      </div>

      {/* Test Listing ID Input */}
      {mode === 'host' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label htmlFor="listing-id" className="block text-sm font-medium text-gray-700 mb-2">
            Test Listing ID (for database operations)
          </label>
          <input
            id="listing-id"
            type="text"
            value={testListingId}
            onChange={(e) => setTestListingId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter test listing ID"
          />
          <p className="mt-2 text-sm text-gray-500">
            This ID will be used for database operations when testing calendar save functionality.
          </p>
        </div>
      )}

      {/* Calendar Component */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <DateAvailabilityCalendar
          mode={mode}
          availableDates={availableDates}
          bookedDates={bookedDates}
          onAvailabilityChange={handleAvailabilityChange}
          onDateRangeChange={handleDateRangeChange}
          listingId={testListingId}
          userId={user?.uid}
          isEditing={mode === 'host'}
          minBookingDays={1}
          maxBookingDays={30}
        />
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Debug Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Current Available Dates:</strong>
            <div className="mt-1 p-2 bg-green-100 rounded text-green-800 font-mono text-xs">
              {JSON.stringify(availableDates, null, 2)}
            </div>
          </div>
          <div>
            <strong>Current Booked Dates:</strong>
            <div className="mt-1 p-2 bg-red-100 rounded text-red-800 font-mono text-xs">
              {JSON.stringify(bookedDates, null, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Test Instructions</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div>
            <strong>Host Mode:</strong> Click ANY date to toggle availability. Gray dates become green (available), 
            green dates become gray (unavailable). Quick buttons add multiple dates at once.
          </div>
          <div>
            <strong>Client Mode:</strong> Click on green (available) dates to select check-in and check-out dates. 
            The calendar will show your selection and calculate duration.
          </div>
          <div>
            <strong>NEW Features:</strong> Individual date clicking now works! Enhanced hover effects, 
            better visual feedback, and manual date picking focus over preset buttons.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTest;