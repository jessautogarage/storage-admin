import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Upload, MapPin, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';
import ImageUpload from '../Common/ImageUpload';
import { useToast } from '../Notifications/EnhancedToast';
import listingService from '../../services/listingService';
import DOMPurify from 'dompurify';

// Dynamically import React Quill
const ReactQuill = lazy(() => import('react-quill'));
import 'react-quill/dist/quill.snow.css';

// Custom toolbar configuration for the rich text editor
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'link',
  'color', 'background'
];

const AddListing = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  
  const [loading, setLoading] = useState(false);
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
    
    let loadingToastId;
    
    try {
      setLoading(true);
      
      // Show loading toast
      loadingToastId = showLoading('Creating your listing...', {
        dismissible: false
      });
      
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        pricePerDay: parseFloat(formData.pricePerDay),
        size: parseFloat(formData.size),
        storageType: formData.storageType,
        features: formData.features,
        images: formData.images
      };
      
      const result = await listingService.createListing(listingData, userId);
      
      if (result.success) {
        // Remove loading toast
        if (loadingToastId) removeToast(loadingToastId);
        
        // Show success toast
        showSuccess('Listing created successfully! You will be redirected to your dashboard.', {
          duration: 4000,
          title: 'Success!'
        });
        
        // Navigate to host dashboard after a short delay
        setTimeout(() => {
          navigate('/host/dashboard', {
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
        disabled={loading}
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
        disabled={loading}
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

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Listing</h1>
          <p className="text-gray-600 mt-2">Create a new storage space listing to start earning</p>
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
                    disabled={loading}
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
                  <h3 className="font-semibold text-gray-900 mb-1">Ready to publish?</h3>
                  <p className="text-sm text-gray-600">
                    Your listing will be live immediately and available for bookings.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/host/dashboard')}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Create Listing</span>
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

export default AddListing;