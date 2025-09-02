import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const AvailabilityCalendar = ({ 
  listingId, 
  onDateSelect, 
  selectedStartDate, 
  selectedEndDate,
  unavailableDates = [] 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if date is unavailable
  const isDateUnavailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return unavailableDates.includes(dateString) || date < today;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedStartDate) return false;
    
    const dateString = date.toISOString().split('T')[0];
    const startString = selectedStartDate.toISOString().split('T')[0];
    
    if (!selectedEndDate) {
      return dateString === startString;
    }
    
    const endString = selectedEndDate.toISOString().split('T')[0];
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  // Check if date is in range (for hover effect)
  const isDateInRange = (date) => {
    if (!selectedStartDate || selectedEndDate) return false;
    if (!hoveredDate) return false;
    
    const start = selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate;
    const end = selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate;
    
    return date >= start && date <= end;
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (isDateUnavailable(date)) return;
    
    onDateSelect(date);
  };

  // Generate calendar days
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isUnavailable = isDateUnavailable(date);
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={isUnavailable}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative
            ${isUnavailable 
              ? 'text-gray-300 cursor-not-allowed line-through' 
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
            }
            ${isSelected 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : ''
            }
            ${isInRange && !isSelected 
              ? 'bg-blue-100 text-blue-600' 
              : ''
            }
            ${isToday && !isSelected
              ? 'ring-2 ring-blue-400 ring-opacity-50' 
              : ''
            }
          `}
        >
          {day}
          {isToday && !isSelected && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendar()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
          <span>Selected dates</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 border-2 border-blue-400 rounded mr-2"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Selected date info */}
      {selectedStartDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">Selected Dates:</div>
          <div className="text-sm text-blue-700">
            {selectedStartDate.toLocaleDateString()}
            {selectedEndDate && selectedEndDate !== selectedStartDate && (
              <span> - {selectedEndDate.toLocaleDateString()}</span>
            )}
          </div>
          {selectedEndDate && selectedEndDate !== selectedStartDate && (
            <div className="text-xs text-blue-600 mt-1">
              {Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) + 1} days
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;