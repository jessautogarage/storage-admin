import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { useGlobalSettings } from '../../context/SettingsContext';
import { isFirebaseReady, getCurrentUser } from '../../utils/firebaseUtils';

const FirebaseSettingsTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { settings, loading: contextLoading, error: contextError } = useGlobalSettings();

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Firebase Connection
    try {
      results.firebaseReady = isFirebaseReady();
      results.currentUser = getCurrentUser();
    } catch (error) {
      results.firebaseError = error.message;
    }

    // Test 2: Direct Settings Service Test
    try {
      const directSettings = await settingsService.getSettings();
      results.directSettingsLoad = {
        success: true,
        hasData: !!directSettings,
        settingsKeys: directSettings ? Object.keys(directSettings) : []
      };
    } catch (error) {
      results.directSettingsLoad = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Settings Context Test
    results.settingsContext = {
      loading: contextLoading,
      error: contextError,
      hasSettings: !!settings,
      settingsKeys: settings ? Object.keys(settings) : []
    };

    // Test 4: Settings Subscription Test
    try {
      const unsubscribe = settingsService.subscribeToSettings(
        (subscriptionSettings) => {
          results.subscription = {
            success: true,
            hasData: !!subscriptionSettings,
            settingsKeys: subscriptionSettings ? Object.keys(subscriptionSettings) : []
          };
          setTestResults(prev => ({ ...prev, subscription: results.subscription }));
          unsubscribe();
        },
        (error) => {
          results.subscription = {
            success: false,
            error: error.message
          };
          setTestResults(prev => ({ ...prev, subscription: results.subscription }));
        }
      );
    } catch (error) {
      results.subscription = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const formatTestResult = (testName, result) => {
    let status = 'unknown';
    let message = '';

    if (testName === 'firebaseReady') {
      status = result ? 'success' : 'error';
      message = result ? 'Firebase is ready' : 'Firebase not initialized';
    } else if (testName === 'currentUser') {
      status = 'info';
      message = result ? `User: ${result.email || result.uid}` : 'No user authenticated';
    } else if (typeof result === 'object' && result.success !== undefined) {
      status = result.success ? 'success' : 'error';
      message = result.success ? 
        `Success - Keys: ${result.settingsKeys?.join(', ') || 'none'}` :
        `Error: ${result.error}`;
    } else {
      status = 'info';
      message = JSON.stringify(result, null, 2);
    }

    return { status, message };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Firebase Settings Connection Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(testResults).map(([testName, result]) => {
          const { status, message } = formatTestResult(testName, result);
          
          return (
            <div key={testName} className="border rounded p-4">
              <div className="flex items-center mb-2">
                <h3 className="font-semibold text-lg capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h3>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  status === 'success' ? 'bg-green-100 text-green-800' :
                  status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">{message}</pre>
            </div>
          );
        })}
      </div>

      {settings && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Current Settings from Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings).filter(([key]) => key !== 'createdAt' && key !== 'updatedAt' && key !== 'lastUpdatedBy').map(([category, categorySettings]) => (
              <div key={category} className="bg-white p-3 rounded border">
                <h4 className="font-medium capitalize text-gray-700">{category}</h4>
                <p className="text-sm text-gray-600">
                  {typeof categorySettings === 'object' ? 
                    `${Object.keys(categorySettings).length} settings` :
                    String(categorySettings)
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">What this test checks:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Firebase connection and initialization</li>
          <li>• Authentication state</li>
          <li>• Direct settings service functionality</li>
          <li>• Settings context state</li>
          <li>• Real-time settings subscription</li>
          <li>• Firestore permissions</li>
          <li>• Error handling and fallback behavior</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseSettingsTest;