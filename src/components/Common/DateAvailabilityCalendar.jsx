import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, Check, Save, RotateCcw } from 'lucide-react';
import { format, addDays, isAfter, isBefore, isSameDay, eachDayOfInterval } from 'date-fns';
import useDateAvailability from '../../hooks/useDateAvailability';
import "react-datepicker/dist/react-datepicker.css";
import './DateAvailabilityCalendar.css';

const DateAvailabilityCalendar = ({ 
  mode = 'host', // 'host' for setting availability, 'client' for booking
  availableDates = [], 
  bookedDates = [], 
  onDateRangeChange,
  onAvailabilityChange,
  selectedStartDate,
  selectedEndDate,
  minBookingDays = 1,
  maxBookingDays = 30,
  listingId,
  userId,
  isEditing = false,
  enableRangeSelection = false // New prop to enable range selection for hosts
}) => {
  const [startDate, setStartDate] = useState(selectedStartDate || null);
  const [endDate, setEndDate] = useState(selectedEndDate || null);
  const [selectedDates, setSelectedDates] = useState(new Set(availableDates));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Range selection state for hosts
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [isRangeModeActive, setIsRangeModeActive] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Hook for database operations
  const { updateAvailability, loading: dbLoading } = useDateAvailability(listingId, userId);

  // Initialize selected dates from props
  useEffect(() => {
    console.log('DateAvailabilityCalendar initialized with:', {
      mode,
      availableDatesCount: availableDates?.length || 0,
      availableDates: availableDates?.slice(0, 5), // Show first 5 for debugging
      bookedDatesCount: bookedDates?.length || 0
    });
    setSelectedDates(new Set(availableDates));
  }, [availableDates, mode]);

  // Helper functions
  const getDateString = (date) => {
    // Handle array of dates (react-datepicker sometimes returns arrays)
    if (Array.isArray(date)) {
      date = date[0];
    }
    
    // Convert to Date object if it's not already
    if (date && !(date instanceof Date)) {
      date = new Date(date);
    }
    
    // Validate that date is a valid Date object
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date passed to getDateString:', date);
      return null;
    }
    
    try {
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return null;
    }
  };
  
  const isDateAvailable = (date) => {
    const dateStr = getDateString(date);
    const isAvailable = dateStr ? selectedDates.has(dateStr) : false;
    // Add detailed logging for debugging in client mode
    if (mode === 'client' && dateStr) {
      console.log(`Checking availability for ${dateStr}:`, {
        isAvailable,
        selectedDatesSize: selectedDates.size,
        hasDate: selectedDates.has(dateStr)
      });
    }
    return isAvailable;
  };

  const isDateBooked = (date) => {
    const dateStr = getDateString(date);
    return dateStr ? bookedDates.includes(dateStr) : false;
  };

  const isDateInPast = (date) => {
    // Handle array of dates
    if (Array.isArray(date)) {
      date = date[0];
    }
    
    // Convert to Date object if it's not already
    if (date && !(date instanceof Date)) {
      date = new Date(date);
    }
    
    // Validate date first
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false; // Invalid dates are not in the past
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      return isBefore(date, today);
    } catch (error) {
      console.error('Error checking if date is in past:', error, date);
      return false;
    }
  };

  // Helper function to get dates in a range
  const getDatesInRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Enhanced date click handler with range selection support
  const handleDateClick = (date) => {
    // Handle array of dates
    if (Array.isArray(date)) {
      date = date[0];
    }
    
    // Convert to Date object if needed
    if (date && !(date instanceof Date)) {
      date = new Date(date);
    }
    
    if (mode !== 'host' || isDateBooked(date) || isDateInPast(date)) return;

    const dateStr = getDateString(date);
    
    // If date is invalid, return early to prevent errors
    if (!dateStr) {
      console.warn('Invalid date clicked, ignoring:', date);
      return;
    }
    
    if (enableRangeSelection && isRangeModeActive) {
      // Range selection logic for hosts
      if (!rangeStartDate) {
        // First click: Set start date
        setRangeStartDate(date);
        setSaveMessage('Select end date to complete range selection');
      } else if (!rangeEndDate) {
        // Second click: Set end date and fill range
        let startDateForRange = rangeStartDate;
        let endDateForRange = date;
        
        // Ensure start is before end
        if (date < rangeStartDate) {
          startDateForRange = date;
          endDateForRange = rangeStartDate;
        }
        
        setRangeEndDate(endDateForRange);
        
        // Fill all dates in the range
        const rangeString = getDatesInRange(startDateForRange, endDateForRange);
        const newSelectedDates = new Set(selectedDates);
        
        rangeString.forEach(rangeDate => {
          if (!isDateBooked(rangeDate) && !isDateInPast(rangeDate)) {
            const rangeDateStr = getDateString(rangeDate);
            if (rangeDateStr) {
              newSelectedDates.add(rangeDateStr);
            }
          }
        });
        
        setSelectedDates(newSelectedDates);
        setSaveMessage(`Range selected: ${startDateForRange.toLocaleDateString()} - ${endDateForRange.toLocaleDateString()}. Click "Clear Range" to start over.`);
        
        // Provide immediate feedback
        if (onAvailabilityChange) {
          onAvailabilityChange({
            availableDates: Array.from(newSelectedDates),
            blackoutDates: [],
            listingId
          });
        }
      } else {
        // Third click: Clear range and start over
        clearRangeSelection();
      }
    } else {
      // Normal single date toggle
      const newSelectedDates = new Set(selectedDates);
      
      if (selectedDates.has(dateStr)) {
        // Remove date from available dates
        newSelectedDates.delete(dateStr);
      } else {
        // Add date to available dates
        newSelectedDates.add(dateStr);
      }
      
      setSelectedDates(newSelectedDates);
      
      // Provide immediate feedback
      if (onAvailabilityChange) {
        onAvailabilityChange({
          availableDates: Array.from(newSelectedDates),
          blackoutDates: [],
          listingId
        });
      }
    }
  };
  
  // Clear range selection
  const clearRangeSelection = () => {
    setRangeStartDate(null);
    setRangeEndDate(null);
    setHoveredDate(null);
    setSaveMessage('Range cleared. Click to start new range selection.');
  };
  
  // Toggle range selection mode
  const toggleRangeMode = () => {
    if (isRangeModeActive) {
      clearRangeSelection();
    }
    setIsRangeModeActive(!isRangeModeActive);
    setSaveMessage('');
  };

  // Universal date selection handler for both modes
  const handleDateSelect = (date) => {
    if (mode === 'host') {
      handleDateClick(date);
    } else {
      handleBookingDateSelect(date);
    }
  };

  // Enhanced booking date selection for clients with range support
  const handleBookingDateSelect = (date) => {
    if (mode !== 'client') return;
    
    // Validate date first
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date selected for booking:', date);
      return;
    }
    
    const dateStr = getDateString(date);
    const isPast = isDateInPast(date);
    const isAvailable = isDateAvailable(date);
    const isBooked = isDateBooked(date);
    
    console.log('Client selecting date:', dateStr, {
      isPast,
      isAvailable,
      isBooked,
      availableDatesCount: selectedDates.size,
      currentStartDate: startDate ? getDateString(startDate) : null,
      currentEndDate: endDate ? getDateString(endDate) : null
    });
    
    // Only allow selection of available dates that are not booked or in the past
    if (isPast || !isAvailable || isBooked) {
      console.log('Date not selectable:', dateStr, {
        reason: isPast ? 'past date' : !isAvailable ? 'not available' : 'already booked'
      });
      return; // Silently ignore unavailable dates
    }

    if (!startDate) {
      // First click - set start date
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      // Second click - set end date
      if (isBefore(date, startDate)) {
        // If clicked date is before start, make it the new start
        setStartDate(date);
        setEndDate(null);
      } else {
        // Set as end date and validate all dates in range
        let validRange = true;
        const currentDate = new Date(startDate);
        const endCheckDate = new Date(date);
        
        // Check if all dates in the range are available
        while (currentDate <= endCheckDate) {
          const checkDateStr = getDateString(currentDate);
          if (!selectedDates.has(checkDateStr) || bookedDates.includes(checkDateStr)) {
            validRange = false;
            break;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (!validRange) {
          alert('Some dates in the selected range are not available. Please select a different range.');
          setStartDate(date);
          setEndDate(null);
          return;
        }
        
        setEndDate(date);
        
        // Notify parent component
        if (onDateRangeChange) {
          const daysDiff = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
          onDateRangeChange({
            startDate,
            endDate: date,
            days: daysDiff,
            isValid: true
          });
        }
      }
    } else {
      // Third click - reset and start new selection
      setStartDate(date);
      setEndDate(null);
      // Clear parent component
      if (onDateRangeChange) {
        onDateRangeChange({
          startDate: null,
          endDate: null,
          days: 0,
          isValid: false
        });
      }
    }
  };

  // Quick date range selection for hosts
  const setQuickRange = (days) => {
    try {
      const today = new Date();
      const endDate = addDays(today, days);
      const dateRange = eachDayOfInterval({ start: today, end: endDate });
      
      const newSelectedDates = new Set(selectedDates);
      dateRange.forEach(date => {
        if (!isDateInPast(date)) {
          const dateStr = getDateString(date);
          if (dateStr) { // Only add if date string is valid
            newSelectedDates.add(dateStr);
          }
        }
      });
      
      setSelectedDates(newSelectedDates);
    } catch (error) {
      console.error('Error setting quick range:', error);
    }
  };

  // Save availability changes to database
  const saveAvailability = async () => {
    if (!listingId || !userId) {
      setSaveMessage('Missing required information');
      return;
    }

    setSaving(true);
    setSaveMessage('');
    
    try {
      const availabilityData = {
        availableDates: Array.from(selectedDates),
        blackoutDates: [], // Simplified - no blackout dates
        isEnabled: true,
        minBookingDays,
        maxBookingDays
      };
      
      const result = await updateAvailability(availabilityData);
      
      if (result.success) {
        setSaveMessage('Availability saved successfully!');
        if (onAvailabilityChange) {
          onAvailabilityChange({
            availableDates: Array.from(selectedDates),
            blackoutDates: [],
            listingId
          });
        }
      } else {
        setSaveMessage('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setSaveMessage('Error saving availability');
    } finally {
      setSaving(false);
    }
  };

  // Enhanced day class names with range selection support
  const getDayClassName = (date) => {
    let classes = ['calendar-day'];

    // Validate date first
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      classes.push('invalid-date');
      return classes.join(' ');
    }

    if (isDateInPast(date)) {
      classes.push('past-date');
    } else if (mode === 'host') {
      if (isDateBooked(date)) {
        classes.push('booked-date');
      } else if (isDateAvailable(date)) {
        classes.push('available-date-green'); // Green for available
      } else {
        classes.push('neutral-date');
      }
      
      // Range selection highlighting for hosts
      if (enableRangeSelection && isRangeModeActive) {
        if (rangeStartDate && isSameDay(date, rangeStartDate)) {
          classes.push('range-start-date');
        } else if (rangeEndDate && isSameDay(date, rangeEndDate)) {
          classes.push('range-end-date');
        } else if (rangeStartDate && rangeEndDate) {
          // Date is in completed range
          if (isAfter(date, rangeStartDate) && isBefore(date, rangeEndDate)) {
            classes.push('range-middle-date');
          }
        } else if (rangeStartDate && hoveredDate && !rangeEndDate) {
          // Show preview range on hover
          const start = rangeStartDate < hoveredDate ? rangeStartDate : hoveredDate;
          const end = rangeStartDate < hoveredDate ? hoveredDate : rangeStartDate;
          
          if (isAfter(date, start) && isBefore(date, end)) {
            classes.push('range-preview-date');
          } else if (isSameDay(date, hoveredDate)) {
            classes.push('range-hover-date');
          }
        }
      }
    } else if (mode === 'client') {
      // Client mode: Show available dates in green, others as unavailable
      if (isDateBooked(date)) {
        classes.push('booked-date'); // Red for booked
      } else if (!isDateAvailable(date)) {
        classes.push('unavailable-date'); // Red with strikethrough for unavailable
      } else {
        classes.push('bookable-date-green'); // Green for available and bookable
      }

      // Highlight selected range for clients
      if (startDate && endDate) {
        if (isSameDay(date, startDate)) {
          classes.push('range-start-date');
        } else if (isSameDay(date, endDate)) {
          classes.push('range-end-date');
        } else if (isAfter(date, startDate) && isBefore(date, endDate)) {
          classes.push('range-middle-date');
        }
      } else if (startDate && !endDate) {
        if (isSameDay(date, startDate)) {
          classes.push('range-start-date');
        }
      }
      
      // Original check for single selected dates
      if (startDate && !endDate && isSameDay(date, startDate)) {
        classes.push('selected-start-green');
      } else if (startDate && endDate) {
        if (isSameDay(date, startDate) ||
          (isSameDay(date, endDate)) ||
          (isAfter(date, startDate) && isBefore(date, endDate))
        ) {
          classes.push('selected-range-green');
        }
      } else if (startDate && isSameDay(date, startDate)) {
        classes.push('selected-start-green');
      }
    }

    return classes.join(' ');
  };
  
  // Handle mouse events for range preview
  const handleDateMouseEnter = (date) => {
    if (enableRangeSelection && isRangeModeActive && rangeStartDate && !rangeEndDate) {
      setHoveredDate(date);
    }
  };
  
  const handleDateMouseLeave = () => {
    if (enableRangeSelection && isRangeModeActive) {
      setHoveredDate(null);
    }
  };

  return (
    <div className="date-availability-calendar">

      {/* Enhanced Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'host' ? 'Set Available Dates' : 'Select Your Dates'}
            </h3>
          </div>
          
          {/* Range Mode Toggle for Hosts */}
          {mode === 'host' && enableRangeSelection && (
            <button
              type="button"
              onClick={toggleRangeMode}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isRangeModeActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isRangeModeActive ? 'Exit Range Mode' : 'Range Mode'}
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          {mode === 'host' ? (
            isRangeModeActive ? (
              <span className="text-blue-700">
                <strong>Range Mode Active:</strong> First click = start date, second click = end date (auto-fills range), third click = clear range.
              </span>
            ) : (
              'Click any date to toggle availability. Click green dates to make unavailable, click gray dates to make available.'
            )
          ) : (
            startDate && !endDate 
              ? `Check-in: ${format(startDate, 'MMM dd, yyyy')} - Now select check-out date`
              : startDate && endDate
              ? `Selected: ${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd, yyyy')} (${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} nights)`
              : 'Click to select check-in date. Green dates are available.'
          )}
        </p>
      </div>
      
      {/* Client Range Selection Status */}
      {mode === 'client' && startDate && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {startDate && !endDate && (
                <span className="text-green-800">
                  <strong>Check-in:</strong> {format(startDate, 'MMMM dd, yyyy')} 
                  <span className="ml-2 text-green-600">→ Select check-out date</span>
                </span>
              )}
              {startDate && endDate && (
                <div className="text-green-800">
                  <div><strong>Check-in:</strong> {format(startDate, 'MMMM dd, yyyy')}</div>
                  <div><strong>Check-out:</strong> {format(endDate, 'MMMM dd, yyyy')}</div>
                  <div className="text-green-600 font-semibold">
                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} nights
                  </div>
                </div>
              )}
            </div>
            {startDate && (
              <button
                type="button"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  if (onDateRangeChange) {
                    onDateRangeChange({
                      startDate: null,
                      endDate: null,
                      days: 0,
                      isValid: false
                    });
                  }
                }}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Range Selection Status */}
      {mode === 'host' && isRangeModeActive && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rangeStartDate ? (
                <span className="text-sm text-blue-800">
                  <strong>Start:</strong> {rangeStartDate.toLocaleDateString()}
                  {rangeEndDate && (
                    <span className="ml-2">
                      <strong>End:</strong> {rangeEndDate.toLocaleDateString()}
                      <span className="ml-2 text-blue-600">
                        ({getDatesInRange(rangeStartDate, rangeEndDate).length} days)
                      </span>
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-blue-700">Click a date to set range start</span>
              )}
            </div>
            
            {(rangeStartDate || rangeEndDate) && (
              <button
                type="button"
                onClick={clearRangeSelection}
                className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition-colors"
              >
                Clear Range
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Selection Helper (Optional) */}
      {mode === 'host' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 mb-2 font-medium">Quick helpers (optional):</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuickRange(30)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              + Next 30 days
            </button>
            <button
              type="button"
              onClick={() => setQuickRange(60)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              + Next 60 days
            </button>
            <button
              type="button"
              onClick={() => setQuickRange(90)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              + Next 90 days
            </button>
          </div>
        </div>
      )}

      {/* Save Status Message */}
      {mode === 'host' && saveMessage && (
        <div className={`mb-4 p-3 rounded-lg border ${
          saveMessage.includes('success') 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <DatePicker
          selected={mode === 'client' ? startDate : null}
          startDate={mode === 'client' ? startDate : null}
          endDate={mode === 'client' ? endDate : null}
          onChange={handleDateSelect}
          onSelect={handleDateSelect}
          dayClassName={getDayClassName}
          onDayMouseEnter={handleDateMouseEnter}
          onDayMouseLeave={handleDateMouseLeave}
          inline
          monthsShown={2}
          showDisabledMonthNavigation={false}
          minDate={new Date()}
          maxDate={addDays(new Date(), 365)}
          selectsRange={mode === 'client'}
          selectsMultiple={mode === 'host' && !isRangeModeActive}
          calendarClassName="custom-calendar"
          highlightDates={mode === 'host' ? Array.from(selectedDates).map(dateStr => new Date(dateStr)) : []}
        />
      </div>

      {/* Simple Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm text-gray-700">Unavailable</span>
        </div>
      </div>

      {/* Selected Date Info (Client Mode) */}
      {mode === 'client' && startDate && endDate && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Selected Dates</span>
          </div>
          <div className="text-sm text-green-700">
            <div>Check-in: {startDate && startDate instanceof Date && !isNaN(startDate.getTime()) ? format(startDate, 'PPP') : 'Invalid date'}</div>
            <div>Check-out: {endDate && endDate instanceof Date && !isNaN(endDate.getTime()) ? format(endDate, 'PPP') : 'Invalid date'}</div>
            <div>Duration: {startDate && endDate && startDate instanceof Date && endDate instanceof Date && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0} day(s)</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {mode === 'host' && isEditing && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedDates(new Set(availableDates));
              setSaveMessage('');
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={saveAvailability}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={saving || dbLoading}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DateAvailabilityCalendar;