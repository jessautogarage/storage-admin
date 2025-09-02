import React, { useState, useEffect } from 'react';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import { Calendar, Settings, Save, AlertCircle, Info } from 'lucide-react';

const HostCalendarManager = ({ listingId, userId, initialAvailableDates = [] }) => {
  const [availableDates, setAvailableDates] = useState(initialAvailableDates);
  const [bookedDates] = useState(['2025-08-28', '2025-08-29', '2025-09-15', '2025-09-16']);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleAvailabilityChange = (data) => {
    setAvailableDates(data.availableDates);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      console.log('Saved availability:', availableDates);
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Calendar Availability</h1>
          </div>
          
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
        
        <p className="text-gray-600">
          Set your property's availability using individual date selection or range selection mode. 
          Guests can only book on dates you mark as available.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Selection Mode</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="selectionMode"
                checked={!isRangeMode}
                onChange={() => setIsRangeMode(false)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-blue-800">Individual Dates</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="selectionMode"
                checked={isRangeMode}
                onChange={() => setIsRangeMode(true)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-blue-800">Range Selection</span>
            </label>
          </div>
        </div>
        
        <div className="text-sm text-blue-700">
          {isRangeMode ? (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Range Mode:</strong> Perfect for setting large blocks of availability. 
                Click a start date, then an end date, and all dates in between will be automatically selected.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Individual Mode:</strong> Click individual dates to toggle their availability. 
                Good for precise control over specific dates.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              You have unsaved changes. Don't forget to save your availability updates.
            </span>
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <DateAvailabilityCalendar
        mode="host"
        enableRangeSelection={isRangeMode} // Use our mode selection
        availableDates={availableDates}
        bookedDates={bookedDates}
        onAvailabilityChange={handleAvailabilityChange}
        listingId={listingId || "demo-listing"}
        userId={userId || "demo-user"}
        isEditing={true}
        minBookingDays={1}
        maxBookingDays={30}
      />

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{availableDates.length}</div>
          <div className="text-sm text-green-600">Available Days</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{bookedDates.length}</div>
          <div className="text-sm text-red-600">Booked Days</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {Math.round((availableDates.length / (availableDates.length + bookedDates.length + 100)) * 100) || 0}%
          </div>
          <div className="text-sm text-blue-600">Availability Rate</div>
        </div>
      </div>
    </div>
  );
};

export default HostCalendarManager;