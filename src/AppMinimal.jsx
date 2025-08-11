import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Minimal test component
const MinimalTest = () => {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 SUCCESS!</h1>
        <p className="text-gray-700 mb-4">This minimal app is working perfectly!</p>
        <div className="space-y-2 text-sm">
          <p><strong>URL:</strong> {window.location.pathname}</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        </div>
        <div className="mt-6 space-y-2">
          <a href="/minimal-test" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Test Route
          </a>
          <a href="/another-test" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Another Test
          </a>
        </div>
      </div>
    </div>
  );
};

function AppMinimal() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MinimalTest />} />
        <Route path="/minimal-test" element={<MinimalTest />} />
        <Route path="/another-test" element={<MinimalTest />} />
        <Route path="*" element={<MinimalTest />} />
      </Routes>
    </Router>
  );
}

export default AppMinimal;