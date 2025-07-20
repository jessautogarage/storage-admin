import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = databaseService.subscribe(
      collectionName,
      queryConstraints,
      (data) => {
        setData(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
};