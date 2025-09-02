import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';

const DateClickTest = () => {
  const [availableDates, setAvailableDates] = useState(['2025-08-26', '2025-08-27']);
  const [testResults, setTestResults] = useState([]);

  const handleAvailabilityChange = (data) => {
    setAvailableDates(data.availableDates);
    
    // Log test result
    const newTest = {
      timestamp: new Date().toLocaleTimeString(),
      action: 'Date Toggle',
      result: `${data.availableDates.length} dates now available`,
      dates: data.availableDates
    };
    setTestResults(prev => [newTest, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const clearTests = () => {
    setTestResults([]);
    setAvailableDates([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Individual Date Click Test
          </h1>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-800 mb-2">Test Objective</h2>
          <p className="text-sm text-green-700">
            Verify that hosts can manually select individual dates by clicking on them. 
            Each click should toggle the date between available (green) and unavailable (gray).
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Test Controls</h3>
          <button
            onClick={clearTests}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear Tests
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Available Dates Count: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{availableDates.length}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <DateAvailabilityCalendar
          mode="host"
          availableDates={availableDates}
          bookedDates={[]}
          onAvailabilityChange={handleAvailabilityChange}
          listingId="test-listing"
          userId="test-user"
          isEditing={true}
          minBookingDays={1}
          maxBookingDays={30}
        />
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Results Log</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No test actions yet. Click on calendar dates to test functionality.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{result.action}</span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{result.result}</p>
                  <div className="mt-1 text-xs text-gray-500 font-mono">
                    Dates: [{result.dates.join(', ')}]
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">How to Test</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div>
            <strong>1.</strong> Click on any gray (unavailable) date - it should turn green and be added to available dates
          </div>
          <div>
            <strong>2.</strong> Click on any green (available) date - it should turn gray and be removed from available dates
          </div>
          <div>
            <strong>3.</strong> Watch the "Available Dates Count" update in real-time as you click
          </div>
          <div>
            <strong>4.</strong> Check the test results log to see each action recorded
          </div>
          <div>
            <strong>5.</strong> Past dates should not be clickable (should be grayed out)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateClickTest;