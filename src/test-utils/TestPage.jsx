import React, { useState } from 'react';
import DatabaseSeeder from './DatabaseSeeder';
import ImageUploadTest from './ImageUploadTest';
import ListingStatusDebug from '../Debug/ListingStatusDebug';
import ForceCleanupListings from './ForceCleanupListings';
import CalendarTest from './CalendarTest';
import DateClickTest from './DateClickTest';
import DateRangeSelectionDemo from './DateRangeSelectionDemo';
import BookingFlowTest from './BookingFlowTest';
import ListingWorkflowTest from './ListingWorkflowTest';

const TestPage = () => {
  const [activeTest, setActiveTest] = useState(null);
  
  if (activeTest === 'images') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <ImageUploadTest />
      </div>
    );
  }
  
  if (activeTest === 'listing-debug') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <ListingStatusDebug />
      </div>
    );
  }
  
  if (activeTest === 'force-cleanup') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <ForceCleanupListings />
      </div>
    );
  }
  
  if (activeTest === 'calendar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <CalendarTest />
      </div>
    );
  }
  
  if (activeTest === 'date-click') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <DateClickTest />
      </div>
    );
  }
  
  if (activeTest === 'date-range') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <DateRangeSelectionDemo />
      </div>
    );
  }
  
  if (activeTest === 'booking-flow') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <BookingFlowTest />
      </div>
    );
  }
  
  if (activeTest === 'listing-workflow') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          <button 
            onClick={() => setActiveTest(null)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Test Menu
          </button>
        </div>
        <ListingWorkflowTest />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Test Page Working!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-bold text-blue-900 mb-2">✅ Success!</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Route is accessible</li>
              <li>• No redirects happening</li>
              <li>• Component loads properly</li>
              <li>• No authentication required</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-bold text-yellow-900 mb-2">🔍 Debug Info</h2>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• URL: {window.location.href}</li>
              <li>• Path: {window.location.pathname}</li>
              <li>• Time: {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Test Navigation:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <a href="/" className="block bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-center text-sm">
              🏠 Home
            </a>
            <a href="/debug" className="block bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded text-center text-sm">
              🔍 Debug
            </a>
            <a href="/admin-setup" className="block bg-green-100 hover:bg-green-200 px-3 py-2 rounded text-center text-sm">
              ⚙️ Admin Setup
            </a>
            <a href="/admin" className="block bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded text-center text-sm">
              👨‍💼 Admin Login
            </a>
            <a href="/dashboard" className="block bg-red-100 hover:bg-red-200 px-3 py-2 rounded text-center text-sm">
              📊 Dashboard (Protected)
            </a>
            <a href="/admin-dashboard-bypass" className="block bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded text-center text-sm">
              🚪 Bypass (Should Work)
            </a>
            <button 
              onClick={() => setActiveTest('images')} 
              className="block bg-pink-100 hover:bg-pink-200 px-3 py-2 rounded text-center text-sm w-full text-left"
            >
              📸 Image Upload Test
            </button>
            <button 
              onClick={() => setActiveTest('listing-debug')} 
              className="block bg-red-100 hover:bg-red-200 px-3 py-2 rounded text-center text-sm w-full text-left"
            >
              🔍 Listing Status Debug
            </button>
            <button 
              onClick={() => setActiveTest('force-cleanup')} 
              className="block bg-red-200 hover:bg-red-300 px-3 py-2 rounded text-center text-sm w-full text-left font-bold"
            >
              🚨 FORCE Cleanup Listings
            </button>
            <button 
              onClick={() => setActiveTest('calendar')} 
              className="block bg-green-100 hover:bg-green-200 px-3 py-2 rounded text-center text-sm w-full text-left"
            >
              📅 Calendar Test (Green)
            </button>
            <button 
              onClick={() => setActiveTest('date-click')} 
              className="block bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded text-center text-sm w-full text-left font-bold"
            >
              🎯 Date Click Test (NEW)
            </button>
            <button 
              onClick={() => setActiveTest('date-range')} 
              className="block bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded text-center text-sm w-full text-left font-bold"
            >
              📅 Date Range Selection (NEW)
            </button>
            <button 
              onClick={() => setActiveTest('booking-flow')} 
              className="block bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded text-center text-sm w-full text-left font-bold"
            >
              🧪 Booking Flow Test (COMPLETE)
            </button>
            <button 
              onClick={() => setActiveTest('listing-workflow')} 
              className="block bg-yellow-100 hover:bg-yellow-200 px-3 py-2 rounded text-center text-sm w-full text-left font-bold"
            >
              🔍 Listing Display Test (FIX SIZE/IMAGE)
            </button>
            <a href="/minimal-settings" className="block bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded text-center text-sm">
              ⚙️ Minimal Settings Test
            </a>
          </div>
        </div>


        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Expected Behavior:</h3>
          <p className="text-gray-700 text-sm">
            This test page should be accessible without any authentication or redirects. 
            If you can see this page, it means the routing system is working properly 
            and the issue is likely in the Layout, Dashboard, or authentication components.
          </p>
        </div>

        {/* Database Seeder Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🌱 Database Seeder</h2>
          <DatabaseSeeder />
        </div>
      </div>
    </div>
  );
};

export default TestPage;