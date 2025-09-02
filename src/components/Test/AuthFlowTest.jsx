import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthFlowTest = () => {
  const { user, login, logout, resetPassword, loading } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (testName, status, details = '') => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      testName,
      status, // 'pass', 'fail', 'warning'
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Firebase Config Check
      try {
        const { auth, db } = await import('../../utils/firebaseConfig');
        if (auth && db) {
          addTestResult('Firebase Configuration', 'pass', 'Auth and Firestore initialized');
        } else {
          addTestResult('Firebase Configuration', 'fail', 'Missing auth or db instance');
        }
      } catch (error) {
        addTestResult('Firebase Configuration', 'fail', error.message);
      }

      // Test 2: Auth Context Check
      if (typeof login === 'function' && typeof logout === 'function') {
        addTestResult('Auth Context', 'pass', 'All auth methods available');
      } else {
        addTestResult('Auth Context', 'fail', 'Missing auth methods');
      }

      // Test 3: User State Check
      if (loading !== undefined) {
        addTestResult('Auth State Management', 'pass', `Loading: ${loading}, User: ${user ? 'authenticated' : 'not authenticated'}`);
      } else {
        addTestResult('Auth State Management', 'fail', 'Loading state not defined');
      }

      // Test 4: Environment Variables Check
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID'
      ];

      let missingVars = [];
      requiredEnvVars.forEach(varName => {
        if (!import.meta.env[varName]) {
          missingVars.push(varName);
        }
      });

      if (missingVars.length === 0) {
        addTestResult('Environment Variables', 'pass', 'All required variables present');
      } else {
        addTestResult('Environment Variables', 'fail', `Missing: ${missingVars.join(', ')}`);
      }

      // Test 5: Reset Password Function
      if (typeof resetPassword === 'function') {
        addTestResult('Password Reset', 'pass', 'Function available');
      } else {
        addTestResult('Password Reset', 'warning', 'Function not available in context');
      }

      // Test 6: User Type Detection (if logged in)
      if (user) {
        const userType = user.userType || user.profile?.userType || user.profile?.type;
        if (userType) {
          addTestResult('User Type Detection', 'pass', `User type: ${userType}`);
        } else {
          addTestResult('User Type Detection', 'warning', 'User type not detected');
        }

        // Test admin status
        if (user.isAdmin !== undefined) {
          addTestResult('Admin Status Check', 'pass', `Admin: ${user.isAdmin}`);
        } else {
          addTestResult('Admin Status Check', 'warning', 'Admin status not defined');
        }
      } else {
        addTestResult('User Authentication', 'warning', 'No user currently logged in');
      }

      // Test 7: Firestore Rules Test (if authenticated)
      if (user) {
        try {
          const { databaseService } = await import('../../services/database');
          const userId = user.user?.uid || user.uid;
          const userResult = await databaseService.getById('users', userId);
          
          if (userResult.success) {
            addTestResult('Firestore Access', 'pass', 'Can read user document');
          } else {
            addTestResult('Firestore Access', 'fail', userResult.error);
          }
        } catch (error) {
          addTestResult('Firestore Access', 'fail', error.message);
        }
      }

    } catch (error) {
      addTestResult('Test Suite', 'fail', `Test suite error: ${error.message}`);
    }

    setIsRunning(false);
  };

  const handleTestLogin = async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'testpass123';
    
    try {
      addTestResult('Test Login', 'pass', 'Attempting login...');
      const result = await login(testEmail, testPassword);
      
      if (result.success) {
        addTestResult('Test Login', 'pass', 'Login successful');
      } else {
        addTestResult('Test Login', 'warning', `Login failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('Test Login', 'fail', error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Authentication Flow Test Suite</h2>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={runAuthTests}
          disabled={isRunning}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Auth Tests'}
        </button>
        
        <button
          onClick={handleTestLogin}
          disabled={isRunning}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Test Login Flow
        </button>
        
        {user && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>

      {/* Current Auth State */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Auth State</h3>
        <div className="text-sm text-gray-700">
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
          {user && (
            <>
              <p>User Type: {user.userType || user.profile?.userType || 'Unknown'}</p>
              <p>Admin: {user.isAdmin ? 'Yes' : 'No'}</p>
              <p>Email: {user.user?.email || user.email || 'Unknown'}</p>
            </>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">Test Results ({testResults.length})</h3>
        
        {testResults.length === 0 && !isRunning && (
          <p className="text-gray-500 italic">No tests run yet. Click "Run Auth Tests" to begin.</p>
        )}
        
        {testResults.map((result) => (
          <div
            key={result.id}
            className={`p-3 rounded-lg border-l-4 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon(result.status)}</span>
              <span className="font-medium">{result.testName}</span>
              <span className="text-sm text-gray-500 ml-auto">{result.timestamp}</span>
            </div>
            {result.details && (
              <p className="text-sm mt-1 ml-6">{result.details}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Summary */}
      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test Summary</h4>
          <div className="text-sm space-x-4">
            <span className="text-green-600">
              Passed: {testResults.filter(r => r.status === 'pass').length}
            </span>
            <span className="text-red-600">
              Failed: {testResults.filter(r => r.status === 'fail').length}
            </span>
            <span className="text-yellow-600">
              Warnings: {testResults.filter(r => r.status === 'warning').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthFlowTest;