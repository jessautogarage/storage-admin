import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { Save, X, AlertCircle, CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';
import ImageUpload from '../Common/ImageUpload';
import { useToast } from '../Notifications/EnhancedToast';

const EditListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user, logout } = useAuth();
  const { getListing, updateListing } = useListings();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    pricePerDay: '',
    size: '',
    storageType: 'indoor',
    features: [],
    images: []
  });
  
  const [originalListing, setOriginalListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const { showSuccess, showError, showLoading, removeToast } = useToast();

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

  // Fetch listing data on mount
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        showError('Invalid listing ID');
        navigate('/host/listings');
        return;
      }

      try {
        setLoading(true);
        const result = await getListing(listingId);
        
        if (result.success && result.data) {
          const listing = result.data;
          
          // Check if current user is the owner of this listing
          const userId = user?.user?.uid || user?.uid;
          if (listing.hostId !== userId) {
            showError('You are not authorized to edit this listing');
            navigate('/host/listings');
            return;
          }
          
          // Set the original listing data
          setOriginalListing(listing);
          
          // Populate form with existing data
          // Extract price from various possible locations
          const price = listing.pricing?.daily || listing.pricePerDay || listing.price || '';
          
          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            address: listing.location?.address || listing.address || '',
            city: listing.location?.city || listing.city || '',
            state: listing.location?.state || listing.state || '',
            zipCode: listing.location?.zipCode || listing.zipCode || '',
            pricePerDay: price.toString(),
            size: (listing.size?.value || listing.size || '').toString(),
            storageType: listing.type || listing.storageType || 'indoor',
            features: listing.features || [],
            images: listing.images || []
          });
        } else {
          throw new Error('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        showError('Failed to load listing data');
        navigate('/host/listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, getListing, user, navigate, showError]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required text fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    // Numeric fields
    if (!formData.pricePerDay || parseFloat(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = 'Price must be greater than 0';
    }
    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = 'Size must be greater than 0';
    }
    
    // Images
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    // Title length
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    // Description length
    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalListing) return false;
    
    return (
      formData.title !== (originalListing.title || '') ||
      formData.description !== (originalListing.description || '') ||
      formData.address !== (originalListing.address || '') ||
      formData.city !== (originalListing.city || '') ||
      formData.state !== (originalListing.state || '') ||
      formData.zipCode !== (originalListing.zipCode || '') ||
      parseFloat(formData.pricePerDay) !== (originalListing.pricing?.daily || originalListing.pricePerDay || originalListing.price || 0) ||
      parseFloat(formData.size) !== (originalListing.size || 0) ||
      formData.storageType !== (originalListing.storageType || 'indoor') ||
      JSON.stringify(formData.features.sort()) !== JSON.stringify((originalListing.features || []).sort()) ||
      JSON.stringify(formData.images) !== JSON.stringify(originalListing.images || [])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Check if user is logged in
    const userId = user?.user?.uid || user?.uid;
    if (!userId) {
      showError('You must be logged in to update a listing');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors below and try again');
      return;
    }

    // Check if there are changes to save
    if (!hasChanges()) {
      showError('No changes to save');
      return;
    }
    
    let loadingToastId;
    
    try {
      setSaving(true);
      
      // Show loading toast
      loadingToastId = showLoading('Updating your listing...', {
        dismissible: false
      });
      
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        // Update location structure
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim()
        },
        // Legacy fields for backward compatibility
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        // Price will be converted to pricing structure in the service
        pricePerDay: parseFloat(formData.pricePerDay),
        size: {
          value: parseFloat(formData.size),
          unit: 'sqm'
        },
        type: formData.storageType,
        storageType: formData.storageType,
        features: formData.features,
        images: formData.images,
        updatedAt: new Date().toISOString()
      };
      
      const result = await updateListing(listingId, updateData);
      
      if (result.success) {
        // Remove loading toast
        if (loadingToastId) removeToast(loadingToastId);
        
        // Show success toast
        showSuccess('Listing updated successfully!', {
          duration: 4000,
          title: 'Success!'
        });
        
        // Navigate back to listings after a short delay
        setTimeout(() => {
          navigate('/host/listings');
        }, 1500);
      } else {
        throw new Error('Failed to update listing');
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      
      // Remove loading toast
      if (loadingToastId) removeToast(loadingToastId);
      
      // Show error toast
      showError(
        err.message || 'Failed to update listing. Please try again.',
        {
          title: 'Error Updating Listing',
          duration: 7000
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureToggle = (feature) => {
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
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
    
    // Clear image errors if images are added
    if (images.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/host/listings');
      }
    } else {
      navigate('/host/listings');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Input component with error styling
  const FormInput = ({ label, name, type = 'text', placeholder, required = false, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
          errors[name] && submitAttempted
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={(e) => handleInputChange(name, e.target.value)}
        disabled={saving}
        {...props}
      />
      {errors[name] && submitAttempted && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[name]}
        </div>
      )}
    </div>
  );

  // Textarea component with error styling
  const FormTextarea = ({ label, name, placeholder, required = false, rows = 4, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        rows={rows}
        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-colors resize-none ${
          errors[name] && submitAttempted
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={(e) => handleInputChange(name, e.target.value)}
        disabled={saving}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        <div>
          {errors[name] && submitAttempted && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors[name]}
            </div>
          )}
        </div>
        <div className={`text-sm ${
          formData[name].length > 800 ? 'text-red-500' : 'text-gray-400'
        }`}>
          {formData[name].length}/1000
        </div>
      </div>
    </div>
  );

  // Loading state
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading listing data...</p>
            </div>
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
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate('/host/listings')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
                <p className="text-gray-600 mt-2">Update your storage space listing</p>
              </div>
            </div>
            
            {hasChanges() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-700">You have unsaved changes</p>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Listing Title"
                  name="title"
                  placeholder="e.g., Spacious Garage Storage"
                  required
                  maxLength={100}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Type
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.storageType}
                    onChange={(e) => handleInputChange('storageType', e.target.value)}
                    disabled={saving}
                  >
                    {storageTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <FormTextarea
                  label="Description"
                  name="description"
                  placeholder="Describe your storage space, access hours, and any special instructions..."
                  required
                  rows={4}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormInput
                    label="Street Address"
                    name="address"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <FormInput
                  label="City"
                  name="city"
                  placeholder="Enter city"
                  required
                />
                <FormInput
                  label="State/Province"
                  name="state"
                  placeholder="Enter state or province"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormInput
                  label="ZIP/Postal Code"
                  name="zipCode"
                  placeholder="12345"
                  required
                />
              </div>
            </div>

            {/* Pricing & Size */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Size</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Daily Price (₱)"
                  name="pricePerDay"
                  type="number"
                  placeholder="85"
                  required
                  min="1"
                  step="0.01"
                />
                <FormInput
                  label="Size (sq ft)"
                  name="size"
                  type="number"
                  placeholder="100"
                  required
                  min="1"
                  step="0.1"
                />
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
                      disabled={saving}
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
              <p className="text-gray-600 mb-4">Upload high-quality photos of your storage space. Good photos help attract more clients!</p>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={10}
                folder="listings"
                existingImages={formData.images}
                placeholder="Upload photos of your storage space"
                description="Show the space, access points, security features, and any amenities"
                className={errors.images && submitAttempted ? 'border-red-300' : ''}
              />
              {errors.images && submitAttempted && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.images}
                </div>
              )}
            </div>

            {/* Form Summary */}
            {submitAttempted && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="flex items-center">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Section */}
            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ready to save changes?</h3>
                  <p className="text-sm text-gray-600">
                    Your listing will be updated with the new information.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </div>
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListing;