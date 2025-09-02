import React, { useState } from 'react';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import { format, addDays } from 'date-fns';

const DateAvailabilityTest = () => {
  const [hostAvailability, setHostAvailability] = useState({
    availableDates: [
      format(new Date(), 'yyyy-MM-dd'),
      format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      format(addDays(new Date(), 6), 'yyyy-MM-dd'),
      format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      format(addDays(new Date(), 10), 'yyyy-MM-dd'),
      format(addDays(new Date(), 11), 'yyyy-MM-dd'),
      format(addDays(new Date(), 12), 'yyyy-MM-dd'),
    ],
    blackoutDates: [
      format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      format(addDays(new Date(), 4), 'yyyy-MM-dd'),
    ]
  });

  const [bookedDates] = useState([
    format(addDays(new Date(), 8), 'yyyy-MM-dd'),
    format(addDays(new Date(), 9), 'yyyy-MM-dd'),
  ]);

  const [bookingSelection, setBookingSelection] = useState({
    startDate: null,
    endDate: null,
    days: 0,
    isValid: false
  });

  const handleHostAvailabilityChange = (data) => {
    setHostAvailability({
      availableDates: data.availableDates,
      blackoutDates: data.blackoutDates
    });
    console.log('Host availability updated:', data);
  };

  const handleBookingDateChange = (dateRange) => {
    setBookingSelection(dateRange);
    console.log('Booking selection updated:', dateRange);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Date Availability System Test</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Host Mode Test */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Host Mode - Set Availability</h2>
            <p className="text-sm text-gray-600 mb-6">
              Test the host interface for setting available and blackout dates
            </p>
            
            <DateAvailabilityCalendar
              mode="host"
              availableDates={hostAvailability.availableDates}
              blackoutDates={hostAvailability.blackoutDates}
              bookedDates={bookedDates}
              onAvailabilityChange={handleHostAvailabilityChange}
              minBookingDays={1}
              maxBookingDays={14}
              isEditing={true}
            />

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Current Settings:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>Available dates: {hostAvailability.availableDates.length}</div>
                <div>Blackout dates: {hostAvailability.blackoutDates.length}</div>
                <div>Booked dates: {bookedDates.length}</div>
              </div>
            </div>
          </div>

          {/* Client Mode Test */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Mode - Book Dates</h2>
            <p className="text-sm text-gray-600 mb-6">
              Test the client interface for selecting booking dates
            </p>
            
            <DateAvailabilityCalendar
              mode="client"
              availableDates={hostAvailability.availableDates}
              blackoutDates={hostAvailability.blackoutDates}
              bookedDates={bookedDates}
              onDateRangeChange={handleBookingDateChange}
              selectedStartDate={bookingSelection.startDate}
              selectedEndDate={bookingSelection.endDate}
              minBookingDays={1}
              maxBookingDays={7}
              listingId="test-listing"
            />

            {/* Booking Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Booking Selection:</h3>
              {bookingSelection.isValid ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Start: {bookingSelection.startDate?.toLocaleDateString()}</div>
                  <div>End: {bookingSelection.endDate?.toLocaleDateString()}</div>
                  <div>Duration: {bookingSelection.days} day(s)</div>
                  <div className="text-green-600 font-medium">✓ Valid selection</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No valid date range selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Available Dates</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {hostAvailability.availableDates.map((date, index) => (
                  <div key={index} className="text-green-600">{date}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Blackout Dates</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {hostAvailability.blackoutDates.map((date, index) => (
                  <div key={index} className="text-gray-600">{date}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Booked Dates</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bookedDates.map((date, index) => (
                  <div key={index} className="text-red-600">{date}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateAvailabilityTest;