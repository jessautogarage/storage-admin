import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { settingsService } from '../../services/settingsService';

const SettingsConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [results, setResults] = useState([]);

  const addResult = (test, success, message) => {
    setResults(prev => [...prev, { test, success, message }]);
  };

  useEffect(() => {
    const runTests = async () => {
      try {
        setStatus('Testing Firebase connection...');
        
        // Test 1: Firebase config
        try {
          addResult('Firebase Config', true, 'Firebase initialized successfully');
        } catch (error) {
          addResult('Firebase Config', false, `Firebase init error: ${error.message}`);
        }

        // Test 2: Firestore connection
        try {
          const testDoc = doc(db, 'test', 'connection');
          await setDoc(testDoc, { timestamp: new Date(), test: 'connection' });
          addResult('Firestore Write', true, 'Successfully wrote to Firestore');
          
          const testRead = await getDoc(testDoc);
          if (testRead.exists()) {
            addResult('Firestore Read', true, 'Successfully read from Firestore');
          } else {
            addResult('Firestore Read', false, 'Could not read test document');
          }
        } catch (error) {
          addResult('Firestore Connection', false, `Firestore error: ${error.message}`);
        }

        // Test 3: Settings service initialization
        try {
          setStatus('Testing settings service...');
          await settingsService.initializeDefaultSettings();
          addResult('Settings Init', true, 'Settings initialized successfully');
        } catch (error) {
          addResult('Settings Init', false, `Settings error: ${error.message}`);
        }

        // Test 4: Settings read
        try {
          const settings = await settingsService.getSettings();
          addResult('Settings Read', true, `Settings loaded: ${Object.keys(settings).length} categories`);
        } catch (error) {
          addResult('Settings Read', false, `Settings read error: ${error.message}`);
        }

        setStatus('Tests completed');
      } catch (error) {
        setStatus(`Test error: ${error.message}`);
      }
    };

    runTests();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings Firebase Connection Test</h2>
      
      <div className="mb-4">
        <div className="text-lg font-semibold mb-2">Status: {status}</div>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className={`p-3 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="font-semibold flex items-center gap-2">
              {result.success ? '✅' : '❌'} {result.test}
            </div>
            <div className="text-sm mt-1">{result.message}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>If all tests pass, your Settings component should work correctly</li>
          <li>Navigate to Settings page in admin dashboard to test the UI</li>
          <li>Try modifying some settings to test the update functionality</li>
          <li>Check the browser console for any additional errors</li>
        </ol>
      </div>
    </div>
  );
};

export default SettingsConnectionTest;