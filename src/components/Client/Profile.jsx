import React, { useState } from 'react';
import { User, Camera, Save, MapPin, Phone, Mail, Star, Calendar, Shield } from 'lucide-react';
import ClientLayout from '../Layout/ClientLayout';

const ClientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Avenue',
    city: 'Beverly Hills',
    state: 'CA',
    zipCode: '90210',
    bio: 'Reliable client looking for secure storage solutions for my belongings. I take good care of spaces and always follow host guidelines.',
    profileImage: null,
    preferences: {
      storageType: 'indoor',
      maxDistance: 10,
      priceRange: { min: 50, max: 200 },
      features: ['24/7 Access', 'Security Cameras', 'Climate Controlled']
    }
  });

  const [clientStats] = useState({
    joinDate: '2023-08-20',
    totalBookings: 8,
    currentBookings: 2,
    averageRating: 4.9,
    totalSpent: 2140,
    verificationLevel: 'verified'
  });

  const [recentBookings] = useState([
    {
      id: '1',
      listing: 'Spacious Garage Storage',
      host: 'John Doe',
      period: 'Feb 2025 - May 2025',
      status: 'active',
      rating: 5
    },
    {
      id: '2',
      listing: 'Climate Controlled Unit',
      host: 'Sarah Johnson',
      period: 'Nov 2024 - Jan 2025',
      status: 'completed',
      rating: 4
    },
    {
      id: '3',
      listing: 'Secure Basement Storage',
      host: 'Mike Wilson',
      period: 'Aug 2024 - Oct 2024',
      status: 'completed',
      rating: 5
    }
  ]);

  const handleSave = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Implement image upload
      console.log('Uploading image:', file);
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
    switch (level) {
      case 'verified':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <Shield size={16} />
            <span className="text-sm font-medium">Verified Client</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your client profile and preferences</p>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              ) : (
                <>
                  <User size={20} />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 text-center">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-green-600" size={48} />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">{formData.displayName}</h2>
                <p className="text-gray-600 mb-2">Client since {formatJoinDate(clientStats.joinDate)}</p>
                {getVerificationBadge(clientStats.verificationLevel)}

                {/* Client Stats */}
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium">{clientStats.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Bookings</span>
                    <span className="font-medium">{clientStats.currentBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span className="font-medium">{clientStats.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-medium">${clientStats.totalSpent}</span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="card p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="text-sm">
                      <div className="font-medium text-gray-900 truncate">{booking.listing}</div>
                      <div className="text-gray-600">with {booking.host}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500">{booking.period}</span>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-current" size={12} />
                          <span className="text-gray-600">{booking.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                
                <form className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                        value={formData.email}
                        disabled // Email typically shouldn't be editable
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About You
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Tell hosts about yourself, your storage needs, and what kind of client you are..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Search Preferences */}
              <div className="card p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Search Preferences</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Storage Type
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      <div>
                        <input
                          type="number"
                          placeholder="Min Price"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Max Price"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['24/7 Access', 'Security Cameras', 'Climate Controlled', 'Ground Level', 'Drive-up Access', 'Electronic Gate'].map(feature => (
                        <label key={feature} className="flex items-center">
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
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            disabled={!isEditing}
                          />
                          <span className="ml-2 text-sm text-gray-700">{feature}</span>
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
    </ClientLayout>
  );
};

export default ClientProfile;