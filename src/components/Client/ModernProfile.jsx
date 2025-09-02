import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useUserBookings from '../../hooks/useUserBookings';
import { db } from '../../utils/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ModernHeader from '../Layout/ModernHeader';
import useImageUpload from '../../hooks/useImageUpload';
import { 
  User, 
  Camera, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  Shield,
  Edit,
  X,
  Loader
} from 'lucide-react';

const ModernProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: '',
    profileImage: null,
    preferences: {
      storageType: 'indoor',
      maxDistance: 10,
      priceRange: { min: 50, max: 200 },
      features: []
    }
  });

  // Get user ID from auth context
  const userId = user?.user?.uid || user?.uid;
  
  // Fetch real user bookings data
  const { 
    bookings: userBookings, 
    stats: bookingStats,
    loading: bookingsLoading 
  } = useUserBookings(userId, 'client');

  // Load user profile data from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: userData.displayName || userData.name || '',
            email: userData.email || user?.user?.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            zipCode: userData.zipCode || '',
            bio: userData.bio || '',
            profileImage: userData.profileImage || null,
            preferences: {
              storageType: userData.preferences?.storageType || 'indoor',
              maxDistance: userData.preferences?.maxDistance || 10,
              priceRange: userData.preferences?.priceRange || { min: 50, max: 200 },
              features: userData.preferences?.features || []
            }
          });
        } else {
          // Initialize with basic user data if profile doesn't exist
          setFormData(prev => ({
            ...prev,
            displayName: user?.user?.displayName || '',
            email: user?.user?.email || ''
          }));
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, user]);

  // Calculate client stats from real booking data
  const clientStats = {
    joinDate: user?.user?.metadata?.creationTime || new Date().toISOString(),
    totalBookings: bookingStats?.completedCount + bookingStats?.activeCount + bookingStats?.upcomingCount || 0,
    currentBookings: bookingStats?.activeCount + bookingStats?.upcomingCount || 0,
    averageRating: 4.8, // This would come from reviews collection
    totalSpent: bookingStats?.totalSpent || 0,
    verificationLevel: user?.profile?.verified ? 'verified' : 'unverified'
  };

  // Process recent bookings from real data
  const recentBookings = userBookings?.slice(0, 3).map(booking => ({
    id: booking.id,
    listing: booking.listing?.title || 'Storage Space',
    host: booking.host?.displayName || booking.host?.name || 'Host',
    period: booking.startDate && booking.endDate ? 
      `${new Date(booking.startDate.seconds * 1000).toLocaleDateString()} - ${new Date(booking.endDate.seconds * 1000).toLocaleDateString()}` : 
      'Date pending',
    status: booking.status,
    rating: booking.rating || 0
  })) || [];

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);

      const userDocRef = doc(db, 'users', userId);
      const updateData = {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        bio: formData.bio,
        profileImage: formData.profileImage,
        preferences: formData.preferences,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);
      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const { uploadImage, uploading: imageUploading } = useImageUpload();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await uploadImage(file, { folder: 'profiles' });
      
      if (result.success) {
        setFormData(prev => ({ ...prev, profileImage: result.url }));
        
        // Auto-save profile image
        if (userId) {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            profileImage: result.url,
            updatedAt: serverTimestamp()
          });
          console.log('Profile image updated successfully');
        }
      } else {
        setError('Failed to upload image: ' + result.error);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload profile image');
    }
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getVerificationBadge = (level) => {
    if (level === 'verified') {
      return (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
          <Shield className="w-4 h-4" />
          <span>Verified Client</span>
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-gray-100 text-gray-800';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ModernHeader 
          variant="client" 
          user={user} 
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ModernHeader 
          variant="client" 
          user={user} 
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <X className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ModernHeader 
        variant="client" 
        user={user} 
        onLogout={() => {
          logout();
          navigate('/');
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 p-8 mb-8">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-white w-12 h-12" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-white text-violet-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                      {imageUploading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-3xl font-bold">{formData.displayName}</h1>
                  <p className="text-white/80 mt-1">Client since {formatJoinDate(clientStats.joinDate)}</p>
                  <div className="mt-2">
                    {getVerificationBadge(clientStats.verificationLevel)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Bookings</span>
                  <span className="text-2xl font-bold text-blue-600">{clientStats.currentBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="text-2xl font-bold text-violet-600">{clientStats.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current w-5 h-5" />
                    <span className="text-xl font-bold text-gray-900">{clientStats.averageRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="text-2xl font-bold text-emerald-600">${clientStats.totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="group hover:bg-white/50 rounded-xl p-3 transition-all duration-200 cursor-pointer">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {booking.listing}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">with {booking.host}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{booking.period}</span>
                      <div className="flex items-center gap-1">
                        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/client/bookings')}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200 font-medium"
              >
                View All Bookings
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About You
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell hosts about yourself, your storage needs, and what kind of client you are..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Search Preferences */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Search Preferences</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Storage Type
                    </label>
                    <select
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.preferences.storageType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, storageType: e.target.value }
                      }))}
                      disabled={!isEditing}
                    >
                      <option value="indoor">Indoor Storage</option>
                      <option value="outdoor">Outdoor Storage</option>
                      <option value="garage">Garage</option>
                      <option value="basement">Basement</option>
                      <option value="any">Any Type</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Distance (miles)
                    </label>
                    <select
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.preferences.maxDistance}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, maxDistance: parseInt(e.target.value) }
                      }))}
                      disabled={!isEditing}
                    >
                      <option value={5}>Within 5 miles</option>
                      <option value={10}>Within 10 miles</option>
                      <option value={25}>Within 25 miles</option>
                      <option value={50}>Within 50 miles</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per month)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Min Price"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.preferences.priceRange.min}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          priceRange: { ...prev.preferences.priceRange, min: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      disabled={!isEditing}
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={formData.preferences.priceRange.max}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          priceRange: { ...prev.preferences.priceRange, max: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['24/7 Access', 'Security Cameras', 'Climate Controlled', 'Ground Level', 'Drive-up Access', 'Electronic Gate'].map(feature => (
                      <label key={feature} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.features.includes(feature)}
                          onChange={(e) => {
                            if (!isEditing) return;
                            const newFeatures = e.target.checked
                              ? [...formData.preferences.features, feature]
                              : formData.preferences.features.filter(f => f !== feature);
                            setFormData(prev => ({ 
                              ...prev, 
                              preferences: { ...prev.preferences, features: newFeatures }
                            }));
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!isEditing}
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfile;