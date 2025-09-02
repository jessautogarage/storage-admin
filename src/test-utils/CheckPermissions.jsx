import React, { useState, useEffect, useContext } from 'react';
import { Shield, User, Database, AlertCircle } from 'lucide-react';
import { auth, db } from '../../utils/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContextSafe';

const CheckPermissions = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Get user document
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        setUserInfo({
          uid: currentUser.uid,
          email: currentUser.email,
          userData: userData,
          authContext: authContext
        });
        
        // Get all listings with their owners
        const listingsSnap = await getDocs(collection(db, 'listings'));
        const listingsData = [];
        
        listingsSnap.forEach(docSnap => {
          const data = docSnap.data();
          listingsData.push({
            id: docSnap.id,
            title: data.title || 'Untitled',
            hostId: data.hostId || 'NO HOST ID',
            createdBy: data.createdBy || 'UNKNOWN',
            userId: data.userId || 'NO USER ID',
            canDelete: data.hostId === currentUser.uid || 
                      data.createdBy === currentUser.uid ||
                      data.userId === currentUser.uid ||
                      userData?.userType === 'admin'
          });
        });
        
        setListings(listingsData);
      } else {
        setUserInfo({ error: 'Not logged in' });
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setUserInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Loading permissions check...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Permissions Check
        </h2>
        
        {/* User Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <User className="w-5 h-5" />
            Current User
          </h3>
          {userInfo?.error ? (
            <p className="text-red-600">{userInfo.error}</p>
          ) : (
            <div className="space-y-1 text-sm">
              <p><strong>UID:</strong> {userInfo?.uid}</p>
              <p><strong>Email:</strong> {userInfo?.email}</p>
              <p><strong>User Type:</strong> {userInfo?.userData?.userType || 'NOT SET'}</p>
              <p><strong>Role:</strong> {userInfo?.userData?.role || 'NOT SET'}</p>
              <p><strong>Is Admin:</strong> {userInfo?.userData?.userType === 'admin' ? 'YES' : 'NO'}</p>
            </div>
          )}
        </div>
        
        {/* Listings Ownership */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Listings Ownership ({listings.length} total)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Host ID</th>
                  <th className="px-2 py-1 text-left">Can Delete?</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id} className="border-b">
                    <td className="px-2 py-1">{listing.title}</td>
                    <td className="px-2 py-1 text-xs font-mono">
                      {listing.hostId === userInfo?.uid ? (
                        <span className="text-green-600">YOU</span>
                      ) : (
                        <span className="text-gray-500">{listing.hostId.substring(0, 8)}...</span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {listing.canDelete ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Summary */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Summary
          </h3>
          <ul className="text-sm space-y-1">
            <li>• You can delete {listings.filter(l => l.canDelete).length} out of {listings.length} listings</li>
            <li>• {userInfo?.userData?.userType === 'admin' ? 'You ARE an admin' : 'You are NOT an admin'}</li>
            <li>• Listings you don't own: {listings.filter(l => l.hostId !== userInfo?.uid).length}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckPermissions;