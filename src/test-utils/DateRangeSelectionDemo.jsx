import React, { useState } from 'react';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import { Calendar, Target, Check } from 'lucide-react';

const DateRangeSelectionDemo = () => {
  const [availableDates, setAvailableDates] = useState(['2025-08-26', '2025-08-27', '2025-08-30']);
  const [bookedDates] = useState(['2025-08-28', '2025-08-29']);
  const [demoMessage, setDemoMessage] = useState('');

  const handleAvailabilityChange = (data) => {
    console.log('Availability changed:', data);
    setAvailableDates(data.availableDates);
    setDemoMessage(`Updated ${data.availableDates.length} available dates`);
    
    // Clear message after 3 seconds
    setTimeout(() => setDemoMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Target className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Date Range Selection Demo
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This demo showcases the new date range selection feature for hosts. 
          Toggle Range Mode to select start and end dates, automatically filling all dates in between.
        </p>
      </div>

      {/* Demo Status */}
      {demoMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{demoMessage}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          How Range Selection Works
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
            <span>Click "Range Mode" to activate range selection</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
            <span>Click any available date to set the <strong className="text-blue-600">START</strong> date (blue circle)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
            <span>Click another date to set the <strong className="text-red-600">END</strong> date (red circle)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-green-200 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</span>
            <span>All dates between start and end are automatically selected (green)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-yellow-200 text-yellow-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">!</span>
            <span>Hover over dates to preview the range before selecting</span>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <DateAvailabilityCalendar
          mode="host"
          enableRangeSelection={true}  // Enable the new range selection feature
          availableDates={availableDates}
          bookedDates={bookedDates}
          onAvailabilityChange={handleAvailabilityChange}
          listingId="demo-listing-123"
          userId="demo-user-456"
          isEditing={true}
          minBookingDays={1}
          maxBookingDays={30}
        />
      </div>

      {/* Current State Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            Available Dates ({availableDates.length})
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            {availableDates.length > 0 ? (
              availableDates.map(date => (
                <div key={date} className="font-mono">{date}</div>
              ))
            ) : (
              <div className="text-gray-500 italic">No available dates set</div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            Booked Dates ({bookedDates.length})
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            {bookedDates.map(date => (
              <div key={date} className="font-mono">{date}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Range Selection Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Visual start/end indicators</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Hover preview of range</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Auto-fill dates in range</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Smart start/end ordering</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Easy range clearing</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Skips booked dates</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Visual Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-700 rounded-full border-2 border-blue-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span>Range Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-red-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span>Range End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-600"></div>
            <span>Range Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500"></div>
            <span>Hover Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelectionDemo;