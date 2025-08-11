import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't subscribe if collectionName is null/undefined
    if (!collectionName) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    let unsubscribe;
    
    try {
      unsubscribe = databaseService.subscribe(
        collectionName,
        queryConstraints,
        (data) => {
          setData(data);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error(`Firestore error in ${collectionName}:`, error);
          setError(error);
          setLoading(false);
          // Set empty data on error to prevent crashes
          setData([]);
        }
      );
    } catch (err) {
      console.error(`Failed to subscribe to ${collectionName}:`, err);
      setError(err);
      setLoading(false);
      setData([]);
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};