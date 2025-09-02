import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';
import DateAvailabilityCalendar from '../Common/DateAvailabilityCalendar';
import { useToast } from '../Notifications/EnhancedToast';
import listingService from '../../services/listingService';

const ManageAvailability = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.user?.uid || user?.uid;
  const { showSuccess, showError, showLoading, removeToast } = useToast();

  const [listing, setListing] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load listing and availability data
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError('No listing ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get listing details
        const listingResult = await listingService.getListing(listingId);
        if (!listingResult.success) {
          throw new Error('Listing not found');
        }

        const listingData = listingResult.data;
        
        // Verify ownership
        if (listingData.hostId !== userId) {
          throw new Error('You can only manage your own listings');
        }

        setListing(listingData);

        // Get availability data
        const availabilityResult = await listingService.getListingAvailability(listingId);
        if (availabilityResult.success) {
          setAvailability(availabilityResult.availability);
        }

      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.message || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchListing();
    }
  }, [listingId, userId]);

  const handleAvailabilityChange = (data) => {
    setAvailability(prev => ({
      ...prev,
      availableDates: data.availableDates,
      blackoutDates: data.blackoutDates
    }));
  };

  const handleSettingChange = (field, value) => {
    setAvailability(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!availability) return;

    let loadingToastId;

    try {
      setSaving(true);
      
      loadingToastId = showLoading('Updating availability...', {
        dismissible: false
      });

      const result = await listingService.updateListingAvailability(
        listingId, 
        availability, 
        userId
      );

      if (result.success) {
        if (loadingToastId) removeToast(loadingToastId);
        
        showSuccess('Availability updated successfully!', {
          duration: 4000,
          title: 'Success!'
        });

        // Navigate back to host dashboard after a short delay
        setTimeout(() => {
          navigate('/host-dashboard', {
            state: { 
              message: 'Your listing availability has been updated!',
              listingId 
            }
          });
        }, 1500);
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      
      if (loadingToastId) removeToast(loadingToastId);
      
      showError(
        err.message || 'Failed to update availability. Please try again.',
        {
          title: 'Error Updating Availability',
          duration: 7000
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="host"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={handleSignOut}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          variant="host"
          user={user}
          onSignIn={() => navigate('/signin')}
          onSignUp={() => navigate('/signup')}
          onLogout={handleSignOut}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Listing not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The listing you're trying to manage doesn't exist or you don't have permission to access it.
            </p>
            <button
              onClick={() => navigate('/host-dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="host"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to listing
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
            </div>
            <p className="text-gray-600">
              Set your storage space availability for <strong>{listing.title}</strong>
            </p>
          </div>

          <div className="space-y-8">
            {/* Listing Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₱{listing.pricing?.daily || 0}</div>
                  <div className="text-sm text-gray-500">per day</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {availability?.availableDates?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">available days</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {availability?.bookedDates?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">booked days</div>
                </div>
              </div>
            </div>

            {/* Booking Settings */}
            {availability && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Settings</h2>
                
                {/* Duration Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Booking (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={availability.minBookingDays || 1}
                      onChange={(e) => handleSettingChange('minBookingDays', parseInt(e.target.value) || 1)}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Booking (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={availability.maxBookingDays || 30}
                      onChange={(e) => handleSettingChange('maxBookingDays', parseInt(e.target.value) || 30)}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking (days)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="365"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={availability.advanceBookingDays || 365}
                      onChange={(e) => handleSettingChange('advanceBookingDays', parseInt(e.target.value) || 365)}
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Booking Approval Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="instant-book"
                      checked={availability.instantBook || false}
                      onChange={(e) => handleSettingChange('instantBook', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={saving}
                    />
                    <div>
                      <label htmlFor="instant-book" className="font-medium text-gray-900 cursor-pointer">
                        Enable Instant Booking
                      </label>
                      <p className="text-sm text-gray-600">
                        Allow guests to book instantly without approval
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="require-approval"
                      checked={availability.requireApproval && !availability.instantBook}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSettingChange('instantBook', false);
                          handleSettingChange('requireApproval', true);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={saving || availability.instantBook}
                    />
                    <div>
                      <label htmlFor="require-approval" className="font-medium text-gray-900 cursor-pointer">
                        Require Manual Approval
                      </label>
                      <p className="text-sm text-gray-600">
                        Review each booking request before approval
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar */}
            {availability && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <DateAvailabilityCalendar
                  mode="host"
                  availableDates={availability.availableDates || []}
                  bookedDates={availability.bookedDates || []}
                  blackoutDates={availability.blackoutDates || []}
                  onAvailabilityChange={handleAvailabilityChange}
                  minBookingDays={availability.minBookingDays || 1}
                  maxBookingDays={availability.maxBookingDays || 30}
                  listingId={listingId}
                  isEditing={true}
                />
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAvailability;