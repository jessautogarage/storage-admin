import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Upload, MapPin, DollarSign, AlertCircle, CheckCircle2, Calendar, Wallet } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';
import ImageUpload from '../Common/ImageUpload';
import WorkingRangeCalendar from '../Common/WorkingRangeCalendar';
import RichTextEditor from '../Common/RichTextEditor';
import LocationPicker from '../Common/LocationPicker';
import { useToast } from '../Notifications/EnhancedToast';
import listingService from '../../services/listingService';
import { walletService } from '../../services/walletService';
import { format, addDays } from 'date-fns';
import DOMPurify from 'dompurify';


const AddListing = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {},
    pricePerDay: '',
    size: '',
    storageType: 'indoor',
    features: [],
    images: [],
    availability: {
      isEnabled: true,
      availableDates: [],
      blackoutDates: [],
      instantBook: false,
      requireApproval: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  const [walletChecked, setWalletChecked] = useState(false);
  const { showSuccess, showError, showLoading, removeToast, showWarning } = useToast();

  const storageTypes = [
    { value: 'indoor', label: 'Indoor Storage' },
    { value: 'outdoor', label: 'Outdoor Storage' },
    { value: 'garage', label: 'Garage' },
    { value: 'basement', label: 'Basement' },
    { value: 'attic', label: 'Attic' },
    { value: 'shed', label: 'Shed' }
  ];

  const availableFeatures = [
    'Climate Controlled',
    '24/7 Access',
    'Security Cameras',
    'Lighting',
    'Easy Loading',
    'Ground Level',
    'Drive-up Access',
    'Electronic Gate'
  ];


  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required text fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    
    // Check description
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Check location - Temporarily disabled for testing
    // if (!formData.location.address) newErrors.location = 'Location is required';
    
    // Numeric fields
    if (!formData.pricePerDay || parseFloat(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = 'Price must be greater than 0';
    }
    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = 'Size must be greater than 0';
    }
    
    // Images - Temporarily disabled for testing
    // if (formData.images.length === 0) {
    //   newErrors.images = 'At least one image is required';
    // }
    
    // Title length
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    // Description length
    if (formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Check if user is logged in
    const userId = user?.user?.uid || user?.uid;
    if (!userId) {
      showError('You must be logged in to create a listing');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors below and try again');
      return;
    }
    
    // Check wallet balance first
    let hasInsufficientBalance = false;
    
    if (!walletChecked) {
      const walletResult = await walletService.getWallet(userId);
      
      if (!walletResult.success) {
        // Initialize wallet for new hosts
        const initResult = await walletService.initializeWallet(userId, 'host');
        if (initResult.success) {
          setWalletBalance(initResult.wallet.balance);
          hasInsufficientBalance = initResult.wallet.balance < 500;
        }
      } else {
        setWalletBalance(walletResult.wallet.balance);
        hasInsufficientBalance = walletResult.wallet.balance < 500;
      }
      
      setWalletChecked(true);
    } else {
      hasInsufficientBalance = walletBalance < 500;
    }
    
    if (hasInsufficientBalance) {
      setShowWalletWarning(true);
      showError(
        `Your wallet balance (₱${walletBalance}) is below the minimum ₱500 required. Your listing will be created but HIDDEN from clients until you add funds.`,
        { duration: 10000, title: 'Insufficient Wallet Balance' }
      );
      
      const proceed = window.confirm(
        `WALLET BALANCE WARNING:\n\nYour current balance: ₱${walletBalance}\nMinimum required: ₱500\n\nYour listing will be created but will be INVISIBLE to clients until you add funds.\n\nDo you want to continue anyway?`
      );
      if (!proceed) return;
    }
    
    let loadingToastId;
    
    try {
      setLoading(true);
      
      // Show loading toast
      loadingToastId = showLoading('Creating your listing...', {
        dismissible: false
      });
      
      // Sanitize the HTML description before saving
      const sanitizedDescription = DOMPurify.sanitize(formData.description, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strike', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'a', 'strong', 'em', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });
      
      const listingData = {
        title: formData.title.trim(),
        description: sanitizedDescription,
        address: formData.location.address || 'Test Address - Manila',
        city: formData.location.city || 'Manila',
        state: formData.location.state || 'Metro Manila',
        zipCode: formData.location.zipCode || '',
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
          formatted: formData.location.formatted
        },
        pricePerDay: parseFloat(formData.pricePerDay),
        size: {
          value: parseFloat(formData.size),
          unit: 'sqft'
        },
        storageType: formData.storageType,
        features: formData.features,
        images: formData.images, // Already contains just URLs now
        availability: formData.availability,
        // Set visibility based on wallet balance
        visibility: hasInsufficientBalance ? 0 : 1,
        status: hasInsufficientBalance ? 'inactive' : 'active'
      };
      
      // Debug log to see what we're sending
      console.log('Sending listing data to service:', listingData);
      console.log('Images being sent:', listingData.images);
      console.log('Size being sent:', listingData.size);
      
      const result = await listingService.createListing(listingData, userId);
      
      if (result.success) {
        // Remove loading toast
        if (loadingToastId) removeToast(loadingToastId);
        
        // Show success toast with appropriate message
        if (hasInsufficientBalance) {
          showSuccess(
            'Listing created but is currently hidden. Add funds to your wallet (minimum ₱500) to make it visible.',
            { duration: 6000, title: 'Listing Created (Hidden)' }
          );
        } else {
          showSuccess('Listing created successfully! You will be redirected to your dashboard.', {
            duration: 4000,
            title: 'Success!'
          });
        }
        
        // Navigate to host dashboard after a short delay
        setTimeout(() => {
          navigate('/host-dashboard', {
            state: { 
              message: 'Your new listing is now live and ready to receive bookings!',
              listingId: result.id 
            }
          });
        }, 1500);
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      
      // Remove loading toast
      if (loadingToastId) removeToast(loadingToastId);
      
      // Show error toast
      showError(
        err.message || 'Failed to create listing. Please try again.',
        {
          title: 'Error Creating Listing',
          duration: 7000
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = useCallback((feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
    
    // Clear feature errors if any
    if (errors.features) {
      setErrors(prev => ({ ...prev, features: undefined }));
    }
  }, [errors.features]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleLocationChange = useCallback((locationData) => {
    setFormData(prev => ({ ...prev, location: locationData }));
    
    // Clear location error if it exists
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: undefined }));
    }
  }, [errors.location]);

  const handleImagesChange = useCallback((images) => {
    // Extract just the URLs from the image objects
    const imageUrls = images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
    setFormData(prev => ({ ...prev, images: imageUrls }));
    
    // Clear image errors if images are added
    if (imageUrls.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  }, [errors.images]);

  const handleAvailabilityChange = useCallback((availabilityData) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        ...availabilityData
      }
    }));
  }, []);

  const handleAvailabilitySettingsChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };
  
  // Check wallet balance on component mount
  React.useEffect(() => {
    const checkWalletBalance = async () => {
      const userId = user?.user?.uid || user?.uid;
      if (!userId) return;
      
      const walletResult = await walletService.getWallet(userId);
      
      if (!walletResult.success) {
        // Initialize wallet for new hosts
        const initResult = await walletService.initializeWallet(userId, 'host');
        if (initResult.success) {
          setWalletBalance(initResult.wallet.balance);
          if (initResult.wallet.balance < 500) {
            setShowWalletWarning(true);
            showWarning(
              `Your wallet balance (₱${initResult.wallet.balance}) is below ₱500. Listings will be hidden until you add funds.`,
              { duration: 8000 }
            );
          }
        }
      } else {
        setWalletBalance(walletResult.wallet.balance);
        if (walletResult.wallet.balance < 500) {
          setShowWalletWarning(true);
          showWarning(
            `Your wallet balance (₱${walletResult.wallet.balance}) is below ₱500. Listings will be hidden until you add funds.`,
            { duration: 8000 }
          );
        }
      }
      
      setWalletChecked(true);
    };
    
    checkWalletBalance();
  }, [user, showWarning]);

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
        {/* Wallet Balance Warning Banner */}
        {walletChecked && walletBalance !== null && walletBalance < 500 && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Wallet className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">
                  Low Wallet Balance - Listing Will Be Hidden
                </h3>
                <p className="text-red-700 mt-1">
                  Your current balance: <span className="font-bold">₱{walletBalance}</span> | 
                  Minimum required: <span className="font-bold">₱500</span>
                </p>
                <p className="text-sm text-red-600 mt-2">
                  You can still create a listing, but it will be <strong>invisible to clients</strong> until you add funds to your wallet.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Listing</h1>
          <p className="text-gray-600 mt-2">Create a new storage space listing to start earning</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Title
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.title && submitAttempted
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Spacious Garage Storage"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={loading}
                  />
                  {errors.title && submitAttempted && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.storageType}
                    onChange={(e) => handleInputChange('storageType', e.target.value)}
                    disabled={loading}
                  >
                    {storageTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Rich Text Editor for Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Describe your storage space. Include details about access hours, security features, and any special instructions..."
                  error={errors.description}
                  showError={submitAttempted}
                  maxLength={2000}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
              <LocationPicker
                value={formData.location}
                onChange={handleLocationChange}
                error={errors.location}
                showError={submitAttempted}
                disabled={loading}
              />
            </div>

            {/* Pricing & Size */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Size</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Price (₱)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.pricePerDay && submitAttempted
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="85"
                    value={formData.pricePerDay}
                    onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                    disabled={loading}
                  />
                  {errors.pricePerDay && submitAttempted && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.pricePerDay}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (sq ft)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                      errors.size && submitAttempted
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="100"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    disabled={loading}
                  />
                  {errors.size && submitAttempted && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.size}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Photos
                <span className="text-red-500 ml-1">*</span>
              </h2>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={10}
                folder="listings"
                placeholder="Upload photos of your storage space"
              />
              {errors.images && submitAttempted && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </div>
              )}
            </div>

            {/* Availability & Booking Settings */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Availability & Booking Settings
                </div>
              </h2>
              
              {/* Booking Approval Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="instant-book"
                    checked={formData.availability.instantBook}
                    onChange={(e) => handleAvailabilitySettingsChange('instantBook', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
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
                    checked={formData.availability.requireApproval && !formData.availability.instantBook}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAvailabilitySettingsChange('instantBook', false);
                        handleAvailabilitySettingsChange('requireApproval', true);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading || formData.availability.instantBook}
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

              {/* Date Availability Calendar - RANGE SELECTION */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Set Available Dates</h3>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    📅 Click first date = START | Click second date = AUTO-FILL RANGE
                  </p>
                </div>
                
                <WorkingRangeCalendar
                  onDatesChange={(dates) => {
                    console.log('Selected dates:', dates);
                    // Update the form data with selected dates
                    setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        availableDates: dates
                      }
                    }));
                    
                    // Also call the original handler if it exists
                    if (handleAvailabilityChange) {
                      handleAvailabilityChange({
                        availableDates: dates,
                        blackoutDates: []
                      });
                    }
                  }}
                  bookedDates={[]}
                />
                
                {/* Show selected dates count */}
                {formData.availability.availableDates && formData.availability.availableDates.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ {formData.availability.availableDates.length} dates selected for availability
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/host/listings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Listing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;