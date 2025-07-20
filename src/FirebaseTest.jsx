import { useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from './firebaseConfig';

const FirebaseTest = () => {
  // Function to write data
  const writeData = () => {
    set(ref(database, 'users/jesrel'), {
      name: "Jesrel Agang",
      role: "Admin",
    });
  };

  // Function to read data
  const fetchData = () => {
    const userRef = ref(database, 'users/jesrel');
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched data:", data);
    });
  };

  // Write on button click, fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Firebase Realtime DB Test</h2>
      <button
        onClick={writeData}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Write Sample Data
      </button>
    </div>
  );
};

export default FirebaseTest;
