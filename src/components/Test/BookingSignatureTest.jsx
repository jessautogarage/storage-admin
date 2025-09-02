import React, { useState, useEffect } from 'react';
import BookingFlow from '../Booking/BookingFlow';
import BookingAgreement from '../Booking/BookingAgreement';
import { fixListingAvailability } from '../../utils/fixListingAvailability';

const BookingSignatureTest = () => {
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [availabilityFixed, setAvailabilityFixed] = useState(false);
  
  // Fix availability for test listing on component mount
  useEffect(() => {
    const fixAvailability = async () => {
      const testListingId = 'ycWUxJpEVKerwJLmG5rd'; // Your test listing ID
      const result = await fixListingAvailability(testListingId);
      if (result.success) {
        setAvailabilityFixed(true);
        console.log('✅ Listing availability fixed!');
      }
    };
    fixAvailability();
  }, []);
  
  // Mock listing data
  const mockListing = {
    id: 'test-listing-123',
    title: '1 Room Storage for Parcels',
    address: 'South Cotabato, Philippines',
    location: {
      address: 'South Cotabato, Philippines',
      lat: 6.5069,
      lng: 124.8473
    },
    pricePerDay: 100,
    pricing: {
      daily: 100
    },
    hostId: 'host-123',
    hostName: 'John Host',
    hostEmail: 'host@test.com',
    images: ['https://via.placeholder.com/600x400'],
    features: ['24/7 Access', 'Climate Controlled', 'Security Cameras']
  };
  
  // Mock booking dates
  const mockBookingDates = {
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    days: 7,
    isValid: true
  };
  
  const mockBookingDetails = {
    startDate: mockBookingDates.startDate,
    endDate: mockBookingDates.endDate,
    days: 7,
    dailyRate: 100,
    subtotal: 700,
    serviceFee: 70,
    totalAmount: 770,
    listingId: mockListing.id,
    listingTitle: mockListing.title,
    hostId: mockListing.hostId
  };
  
  const mockHostInfo = {
    name: 'John Host',
    email: 'host@test.com',
    phone: '+63 912 345 6789'
  };
  
  const mockClientInfo = {
    name: 'Test Client',
    email: 'testclient@test.com',
    phone: '+63 987 654 3210'
  };
  
  const handleAgreementAccept = (agreementData) => {
    console.log('Agreement accepted with signature:', agreementData);
    alert(`Agreement signed successfully!\n\nSignature: ${agreementData.signature}\nType: ${agreementData.signatureType || 'typed'}\nTime: ${agreementData.agreedAt}`);
    setShowAgreement(false);
  };
  
  const handleAgreementDecline = () => {
    console.log('Agreement declined');
    setShowAgreement(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Booking Signature Test Page</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Components</h2>
          <p className="text-gray-600 mb-6">
            Click the buttons below to test the booking flow with animated signature functionality
          </p>
          
          {/* Availability Status */}
          {availabilityFixed && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Listing availability has been fixed - dates are now available for booking!
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowBookingFlow(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Full Booking Flow
            </button>
            
            <button
              onClick={() => setShowAgreement(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Agreement Only
            </button>
          </div>
        </div>
        
        {/* Test Status Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Features to Test:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Type signature with animation effect</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Draw signature with canvas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Signature verification animation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Glow effect on signature field</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Date/time/IP recording</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Terms acceptance checkbox</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <BookingFlow
          listing={mockListing}
          selectedDates={mockBookingDates}
          onClose={() => setShowBookingFlow(false)}
        />
      )}
      
      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BookingAgreement
              listing={mockListing}
              bookingDetails={mockBookingDetails}
              hostInfo={mockHostInfo}
              clientInfo={mockClientInfo}
              onAccept={handleAgreementAccept}
              onDecline={handleAgreementDecline}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSignatureTest;