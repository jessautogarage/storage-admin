import React, { useState } from 'react';
import SimpleDateRangeCalendar from '../Common/SimpleDateRangeCalendar';
import WorkingRangeCalendar from '../Common/WorkingRangeCalendar';

const RangeCalendarTest = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  
  const bookedDates = [
    '2025-08-10',
    '2025-08-11',
    '2025-08-20'
  ];

  const handleDatesChange = (dates) => {
    setSelectedDates(dates);
    console.log('Selected dates:', dates);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📅 Range Selection Calendar Test</h1>
        
        {/* Working Calendar - Custom Implementation */}
        <div className="mb-8">
          <WorkingRangeCalendar
            onDatesChange={handleDatesChange}
            bookedDates={bookedDates}
          />
        </div>
        
        <hr className="my-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Calendar Component */}
          <div>
            <h3 className="text-lg font-bold mb-4">Original DatePicker Version</h3>
            <SimpleDateRangeCalendar
              onDatesChange={handleDatesChange}
              initialDates={[]}
              bookedDates={bookedDates}
            />
          </div>
          
          {/* Debug Info */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Selected Dates ({selectedDates.length})</h3>
              
              {selectedDates.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedDates.sort().map((date, index) => (
                    <div key={date} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-sm font-mono">{index + 1}.</span>
                      <span className="text-sm font-medium">{date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No dates selected yet. Click on the calendar!</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
              <h3 className="text-lg font-bold mb-4">How It Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <div>
                    <p className="font-semibold">Click First Date</p>
                    <p className="text-gray-600">This becomes your START date (blue)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-red-600">2.</span>
                  <div>
                    <p className="font-semibold">Click Second Date</p>
                    <p className="text-gray-600">This becomes your END date (red)</p>
                    <p className="text-gray-600">All dates between are automatically selected!</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <div>
                    <p className="font-semibold">Result</p>
                    <p className="text-gray-600">All dates in range turn green</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded">
                <p className="text-sm font-medium text-yellow-800">
                  💡 Example: Click Aug 2, then Aug 5 = Selects Aug 2, 3, 4, 5
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 mt-4">
              <h4 className="font-bold text-red-800 mb-2">Booked Dates (Cannot Select)</h4>
              <div className="space-y-1">
                {bookedDates.map(date => (
                  <div key={date} className="text-sm text-red-700">{date}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeCalendarTest;