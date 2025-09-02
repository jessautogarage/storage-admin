import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  Shield,
  Smartphone,
  Bell
} from 'lucide-react';
import EnhancedSearch from '../Search/EnhancedSearch';
import EnhancedMetricCard from '../Dashboard/EnhancedMetricCard';
import { useEnhancedToast } from '../Notifications/EnhancedToast';
import { sanitize, validate, FormValidator } from '../../utils/security';

const EnhancementsDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showConfirm } = useEnhancedToast();
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Demo listings data
  const demoListings = [
    {
      id: '1',
      title: 'Modern Garage Storage',
      description: 'Clean and secure garage space',
      location: 'Makati City',
      address: '123 Ayala Avenue, Makati',
      price: 5000,
      size: 100,
      spaceType: 'garage',
      rating: 4.8,
      verified: true,
      availability: 'available',
      createdAt: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Basement Storage Room',
      description: 'Dry basement storage with easy access',
      location: 'Quezon City',
      address: '456 EDSA, QC',
      price: 3500,
      size: 75,
      spaceType: 'basement',
      rating: 4.5,
      verified: false,
      availability: 'available',
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      title: 'Warehouse Space',
      description: 'Large warehouse space for bulk storage',
      location: 'Pasig City',
      address: '789 Ortigas, Pasig',
      price: 12000,
      size: 500,
      spaceType: 'warehouse',
      rating: 4.9,
      verified: true,
      availability: 'available',
      createdAt: '2024-01-20'
    }
  ];

  // Demo metrics
  const demoMetrics = [
    {
      title: 'Total Users',
      value: 1254,
      icon: Users,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Monthly Revenue',
      value: 89750,
      icon: DollarSign,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Active Listings',
      value: 342,
      icon: Package,
      color: 'purple',
      format: 'number'
    },
    {
      title: 'Growth Rate',
      value: 23.5,
      icon: TrendingUp,
      color: 'orange',
      format: 'percentage'
    }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const validator = new FormValidator();
    
    // Validate form fields
    validator
      .validate('name', formData.name, [
        validate.required,
        (value) => validate.minLength(value, 2, 'Name')
      ])
      .validate('email', formData.email, [
        validate.required,
        (value) => validate.email(value) ? { isValid: true } : { isValid: false, error: 'Invalid email format' }
      ])
      .validate('message', formData.message, [
        validate.required,
        (value) => validate.minLength(value, 10, 'Message')
      ]);

    if (validator.hasErrors()) {
      setErrors(validator.getErrors());
      showError('Please fix the form errors');
      return;
    }

    // Sanitize data
    const sanitizedData = {
      name: sanitize.text(formData.name),
      email: sanitize.email(formData.email),
      message: sanitize.text(formData.message)
    };

    console.log('Sanitized form data:', sanitizedData);
    showSuccess('Form submitted successfully!');
    setErrors({});
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  return (
    <div className="mobile-padding py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 LockifyHub Enhancements Demo</h1>
        <p className="text-gray-600">Experience all the new features implemented for better user experience</p>
      </div>

      {/* Feature Showcase Grid */}
      <div className="space-y-12">
        
        {/* Enhanced Search Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Enhanced Search & Filters</h2>
              <p className="text-gray-600">Advanced search with real-time filtering and sorting</p>
            </div>
          </div>
          
          <div className="card p-6">
            <EnhancedSearch
              listings={demoListings}
              onResultsChange={setSearchResults}
              onFilterChange={(state) => console.log('Filter state:', state)}
            />
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Search Results ({searchResults.length || demoListings.length})</h3>
              <div className="responsive-grid gap-4">
                {(searchResults.length ? searchResults : demoListings).map(listing => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{listing.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">₱{listing.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{listing.size} sq ft</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Dashboard Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Enhanced Dashboard Metrics</h2>
              <p className="text-gray-600">Interactive metrics with trends and better visualization</p>
            </div>
          </div>
          
          <div className="responsive-grid gap-6">
            {demoMetrics.map((metric, index) => (
              <EnhancedMetricCard
                key={index}
                {...metric}
                previousValue={metric.value * 0.8}
                showComparison={true}
                onClick={() => showInfo(`Clicked on ${metric.title} metrics`)}
              />
            ))}
          </div>
        </section>

        {/* Enhanced Notifications Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Bell className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Enhanced Notification System</h2>
              <p className="text-gray-600">Rich toast notifications with actions and progress</p>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => showSuccess('Operation completed successfully!')}
                className="btn-primary"
              >
                Success Toast
              </button>
              
              <button
                onClick={() => showError('Something went wrong!')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium min-h-[44px] flex items-center justify-center"
              >
                Error Toast
              </button>
              
              <button
                onClick={() => showWarning('Please check your input')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium min-h-[44px] flex items-center justify-center"
              >
                Warning Toast
              </button>
              
              <button
                onClick={() => showConfirm('Are you sure?', () => showSuccess('Action confirmed!'))}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium min-h-[44px] flex items-center justify-center"
              >
                Confirm Dialog
              </button>
            </div>
          </div>
        </section>

        {/* Security Enhancements Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Security Enhancements</h2>
              <p className="text-gray-600">Input validation, sanitization, and secure form handling</p>
            </div>
          </div>
          
          <div className="card p-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`input ${errors.message ? 'border-red-300' : ''}`}
                  rows={4}
                  placeholder="Enter your message (min 10 characters)"
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-1">{errors.message[0]}</p>
                )}
              </div>
              
              <button type="submit" className="btn-primary">
                Submit (with Security Validation)
              </button>
            </form>
          </div>
        </section>

        {/* Mobile Enhancements Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Smartphone className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mobile Optimizations</h2>
              <p className="text-gray-600">Responsive design and touch-friendly interface</p>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="space-y-4">
              <div className="mobile-text">
                <strong>✅ Touch-friendly buttons:</strong> Minimum 44px height for all interactive elements
              </div>
              <div className="mobile-text">
                <strong>✅ Responsive grids:</strong> Adapts from 1 column on mobile to 4 columns on desktop
              </div>
              <div className="mobile-text">
                <strong>✅ Mobile navigation:</strong> Bottom navigation bar for mobile devices (hidden on desktop)
              </div>
              <div className="mobile-text">
                <strong>✅ Optimized forms:</strong> Larger text inputs and better spacing for mobile
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-600">
                  Try resizing your browser window or viewing on mobile to see these optimizations in action!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnhancementsDemo;