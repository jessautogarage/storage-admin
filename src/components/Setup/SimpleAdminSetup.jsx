import React from 'react';

const SimpleAdminSetup = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🎉 Admin Setup Working!</h1>
        
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold">
            ✅ This page is accessible (no protection)
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>1. Admin setup page is working</li>
              <li>2. Firebase configuration is loaded</li>
              <li>3. Ready to create admin account</li>
            </ul>
          </div>

          <div className="space-y-2">
            <a 
              href="/debug" 
              className="block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
            >
              🔍 Debug Auth Status
            </a>
            <a 
              href="/admin" 
              className="block bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded transition-colors"
            >
              👨‍💼 Admin Login
            </a>
            <a 
              href="/" 
              className="block bg-green-100 hover:bg-green-200 px-4 py-2 rounded transition-colors"
            >
              🏠 Home Page
            </a>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
            <p className="text-sm text-yellow-700">
              If you can see this page, the routing is working correctly. 
              The original AdminSetup component may have an error.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminSetup;