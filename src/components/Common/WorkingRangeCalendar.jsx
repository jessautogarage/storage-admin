import React, { useState } from 'react';
import { Calendar, Check, RotateCcw, Info } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, isAfter, isSameDay } from 'date-fns';

const WorkingRangeCalendar = ({ onDatesChange, bookedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [firstClick, setFirstClick] = useState(null);
  const [mode, setMode] = useState('waiting'); // 'waiting', 'selecting', 'completed'

  const getDateString = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const handleDateClick = (date) => {
    const dateStr = getDateString(date);
    
    // Don't allow past dates or booked dates
    if (isBefore(date, new Date()) || bookedDates.includes(dateStr)) {
      return;
    }

    console.log(`Clicked: ${dateStr}, Mode: ${mode}, FirstClick: ${firstClick ? getDateString(firstClick) : 'none'}`);

    if (mode === 'waiting' || mode === 'completed') {
      // First click - set start date
      console.log('Setting START date:', dateStr);
      setFirstClick(date);
      setSelectedDates(new Set([dateStr]));
      setMode('selecting');
      
    } else if (mode === 'selecting' && firstClick) {
      // Second click - fill the range
      console.log('Setting END date:', dateStr);
      
      // Determine start and end
      const start = isBefore(firstClick, date) ? firstClick : date;
      const end = isAfter(firstClick, date) ? firstClick : date;
      
      // Generate all dates in range
      const range = eachDayOfInterval({ start, end });
      const newDates = new Set();
      
      range.forEach(d => {
        const str = getDateString(d);
        // Skip booked dates
        if (!bookedDates.includes(str)) {
          newDates.add(str);
        }
      });
      
      console.log(`Range selected: ${newDates.size} dates from ${getDateString(start)} to ${getDateString(end)}`);
      setSelectedDates(newDates);
      setMode('completed');
      
      // Notify parent
      if (onDatesChange) {
        onDatesChange(Array.from(newDates));
      }
    }
  };

  const reset = () => {
    setSelectedDates(new Set());
    setFirstClick(null);
    setMode('waiting');
    if (onDatesChange) onDatesChange([]);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get day of week for first day (0 = Sunday)
    const startDay = monthStart.getDay();
    
    // Add empty cells for days before month starts
    const emptyCells = Array(startDay).fill(null);
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        {/* Month Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="text-lg font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}
          
          {days.map(date => {
            const dateStr = getDateString(date);
            const isSelected = selectedDates.has(dateStr);
            const isBooked = bookedDates.includes(dateStr);
            const isPast = isBefore(date, new Date());
            const isStart = firstClick && isSameDay(date, firstClick);
            const isClickable = !isPast && !isBooked;
            
            let className = 'h-10 flex items-center justify-center text-sm rounded cursor-pointer relative ';
            
            if (isPast) {
              className += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
            } else if (isBooked) {
              className += 'bg-red-100 text-red-400 cursor-not-allowed ';
            } else if (isStart && mode === 'selecting') {
              className += 'bg-blue-500 text-white font-bold ';
            } else if (isSelected) {
              className += 'bg-green-500 text-white ';
            } else {
              className += 'hover:bg-gray-200 ';
            }
            
            return (
              <div
                key={dateStr}
                onClick={() => isClickable && handleDateClick(date)}
                className={className}
              >
                {format(date, 'd')}
                {isStart && mode === 'selecting' && (
                  <span className="absolute -top-5 text-[10px] bg-blue-500 text-white px-1 rounded">
                    START
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Date Range Selection (Working Version)
      </h2>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-2">How to use:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Click first date (becomes START - blue)</li>
              <li>Click second date (auto-fills range - green)</li>
              <li>Click Reset to start over</li>
            </ol>
            <div className="mt-2 p-2 bg-yellow-100 rounded">
              <p className="text-sm font-medium text-yellow-800">
                Example: Click Aug 2, then Aug 5 = Selects Aug 2, 3, 4, 5
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="flex gap-4 mb-4">
        {mode === 'waiting' && (
          <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            👆 Click a date to start
          </div>
        )}
        {mode === 'selecting' && firstClick && (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Start: {getDateString(firstClick)} - Now click END date
          </div>
        )}
        {mode === 'completed' && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            ✅ Range selected: {selectedDates.size} dates
          </div>
        )}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCalendar()}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Next Month */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h3 className="text-lg font-bold">
              {format(addDays(currentMonth, 32), 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Next month days */}
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const nextMonth = addDays(currentMonth, 32);
              const monthStart = startOfMonth(nextMonth);
              const monthEnd = endOfMonth(nextMonth);
              const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
              const startDay = monthStart.getDay();
              const emptyCells = Array(startDay).fill(null);
              
              return (
                <>
                  {emptyCells.map((_, index) => (
                    <div key={`empty-next-${index}`} className="h-10" />
                  ))}
                  
                  {days.map(date => {
                    const dateStr = getDateString(date);
                    const isSelected = selectedDates.has(dateStr);
                    const isBooked = bookedDates.includes(dateStr);
                    const isPast = isBefore(date, new Date());
                    const isStart = firstClick && isSameDay(date, firstClick);
                    const isClickable = !isPast && !isBooked;
                    
                    let className = 'h-10 flex items-center justify-center text-sm rounded cursor-pointer relative ';
                    
                    if (isPast) {
                      className += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
                    } else if (isBooked) {
                      className += 'bg-red-100 text-red-400 cursor-not-allowed ';
                    } else if (isStart && mode === 'selecting') {
                      className += 'bg-blue-500 text-white font-bold ';
                    } else if (isSelected) {
                      className += 'bg-green-500 text-white ';
                    } else {
                      className += 'hover:bg-gray-200 ';
                    }
                    
                    return (
                      <div
                        key={dateStr}
                        onClick={() => isClickable && handleDateClick(date)}
                        className={className}
                      >
                        {format(date, 'd')}
                        {isStart && mode === 'selecting' && (
                          <span className="absolute -top-5 text-[10px] bg-blue-500 text-white px-1 rounded">
                            START
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        
        {selectedDates.size > 0 && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded font-medium">
            Selected: {Array.from(selectedDates).sort().join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingRangeCalendar;