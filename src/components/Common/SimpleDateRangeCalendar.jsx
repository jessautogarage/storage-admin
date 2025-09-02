import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, Check, Save, Info } from 'lucide-react';
import { format, eachDayOfInterval, isAfter, isBefore } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const SimpleDateRangeCalendar = ({ 
  onDatesChange,
  initialDates = [],
  bookedDates = []
}) => {
  const [selectedDates, setSelectedDates] = useState(new Set(initialDates));
  const [firstClick, setFirstClick] = useState(null);
  const [secondClick, setSecondClick] = useState(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  // Convert date to string format
  const getDateString = (date) => {
    if (Array.isArray(date)) date = date[0];
    if (!date) return null;
    if (!(date instanceof Date)) date = new Date(date);
    return format(date, 'yyyy-MM-dd');
  };

  // Handle date click - RANGE SELECTION LOGIC
  const handleDateClick = (date) => {
    if (Array.isArray(date)) date = date[0];
    
    // If we don't have a first click, this is the start
    if (!firstClick) {
      console.log('Setting START date:', getDateString(date));
      setFirstClick(date);
      setIsSelectingRange(true);
      
      // Add just the first date
      const dateStr = getDateString(date);
      const newDates = new Set(selectedDates);
      newDates.add(dateStr);
      setSelectedDates(newDates);
      
    } else if (!secondClick) {
      // This is the end date - SELECT THE RANGE
      console.log('Setting END date:', getDateString(date));
      setSecondClick(date);
      
      // Calculate all dates in the range
      const start = isBefore(firstClick, date) ? firstClick : date;
      const end = isAfter(firstClick, date) ? firstClick : date;
      
      const range = eachDayOfInterval({ start, end });
      
      // Add all dates in range to selected
      const newDates = new Set(selectedDates);
      range.forEach(d => {
        const dateStr = getDateString(d);
        // Skip booked dates
        if (!bookedDates.includes(dateStr)) {
          newDates.add(dateStr);
        }
      });
      
      setSelectedDates(newDates);
      setIsSelectingRange(false);
      
      // Notify parent
      if (onDatesChange) {
        onDatesChange(Array.from(newDates));
      }
      
      console.log(`Selected range: ${range.length} dates from ${getDateString(start)} to ${getDateString(end)}`);
      
    } else {
      // Reset and start new selection
      console.log('Resetting selection');
      setFirstClick(date);
      setSecondClick(null);
      setIsSelectingRange(true);
      
      // Clear all and start with new date
      const dateStr = getDateString(date);
      const newDates = new Set([dateStr]);
      setSelectedDates(newDates);
    }
  };

  // Custom day styling
  const getDayClassName = (date) => {
    const dateStr = getDateString(date);
    const classes = [];
    
    // Check if it's the first click (START)
    if (firstClick && getDateString(firstClick) === dateStr) {
      classes.push('range-start');
    }
    
    // Check if it's the second click (END)
    if (secondClick && getDateString(secondClick) === dateStr) {
      classes.push('range-end');
    }
    
    // Check if it's selected
    if (selectedDates.has(dateStr)) {
      classes.push('selected-date');
    }
    
    // Check if it's booked
    if (bookedDates.includes(dateStr)) {
      classes.push('booked-date');
    }
    
    return classes.join(' ');
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedDates(new Set());
    setFirstClick(null);
    setSecondClick(null);
    setIsSelectingRange(false);
    if (onDatesChange) onDatesChange([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date Range Selection
        </h3>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">How to select dates:</p>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>Click first date (START) - turns blue</li>
                <li>Click second date (END) - automatically selects all dates in between</li>
                <li>Click again to start a new selection</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-4 mb-4">
          {isSelectingRange && firstClick && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Start: {getDateString(firstClick)} - Now select END date
            </div>
          )}
          
          {!isSelectingRange && firstClick && secondClick && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Range: {getDateString(firstClick)} to {getDateString(secondClick)}
            </div>
          )}
          
          <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {selectedDates.size} dates selected
          </div>
        </div>
      </div>

      {/* Calendar */}
      <DatePicker
        inline
        selected={null}
        onChange={() => {}} // Required but not used
        onSelect={handleDateClick}
        dayClassName={getDayClassName}
        minDate={new Date()}
        monthsShown={2}
        showMonthDropdown
        showYearDropdown
        highlightDates={Array.from(selectedDates).map(d => new Date(d))}
      />

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={clearSelection}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear All
        </button>
        
        {selectedDates.size > 0 && (
          <button
            onClick={() => {
              console.log('Saving dates:', Array.from(selectedDates));
              // Add save logic here
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save {selectedDates.size} Dates
          </button>
        )}
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        :global(.range-start) {
          background-color: #3b82f6 !important;
          color: white !important;
          border-radius: 50% !important;
          font-weight: bold !important;
          position: relative !important;
        }
        
        :global(.range-start::after) {
          content: 'START' !important;
          position: absolute !important;
          top: -18px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          font-size: 9px !important;
          background: #3b82f6 !important;
          color: white !important;
          padding: 1px 4px !important;
          border-radius: 3px !important;
        }
        
        :global(.range-end) {
          background-color: #ef4444 !important;
          color: white !important;
          border-radius: 50% !important;
          font-weight: bold !important;
          position: relative !important;
        }
        
        :global(.range-end::after) {
          content: 'END' !important;
          position: absolute !important;
          top: -18px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          font-size: 9px !important;
          background: #ef4444 !important;
          color: white !important;
          padding: 1px 4px !important;
          border-radius: 3px !important;
        }
        
        :global(.selected-date) {
          background-color: #10b981 !important;
          color: white !important;
          font-weight: 500 !important;
        }
        
        :global(.booked-date) {
          background-color: #dc2626 !important;
          color: white !important;
          pointer-events: none !important;
          opacity: 0.5 !important;
        }
        
        :global(.react-datepicker__day:hover) {
          background-color: #fbbf24 !important;
          color: #111827 !important;
        }
      `}</style>
    </div>
  );
};

export default SimpleDateRangeCalendar;