import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Star, MapPin, DollarSign } from 'lucide-react';
import HostLayout from '../Layout/HostLayout';

const Listings = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with actual data from Firebase
  const [listings] = useState([
    {
      id: '1',
      title: 'Spacious Garage Storage',
      address: '123 Main St, Los Angeles, CA',
      pricePerMonth: 150,
      size: 100,
      storageType: 'garage',
      status: 'active',
      views: 45,
      rating: 4.8,
      reviews: 12,
      images: [],
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      title: 'Climate Controlled Unit',
      address: '456 Oak Ave, Los Angeles, CA',
      pricePerMonth: 200,
      size: 80,
      storageType: 'indoor',
      status: 'active',
      views: 23,
      rating: 4.9,
      reviews: 8,
      images: [],
      createdAt: '2025-01-10'
    },
    {
      id: '3',
      title: 'Outdoor Storage Shed',
      address: '789 Pine St, Los Angeles, CA',
      pricePerMonth: 75,
      size: 50,
      storageType: 'outdoor',
      status: 'inactive',
      views: 12,
      rating: 4.2,
      reviews: 3,
      images: [],
      createdAt: '2025-01-05'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/host/listings/${listingId}/edit`);
  };

  const handleDelete = (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      // TODO: Implement delete functionality
      console.log('Deleting listing:', listingId);
    }
  };

  const handleToggleStatus = (listingId, currentStatus) => {
    // TODO: Implement status toggle
    console.log('Toggling status for listing:', listingId, currentStatus);
  };

  return (
    <HostLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">Manage your storage space listings</p>
          </div>
          <button
            onClick={() => navigate('/host/listings/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Listing
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
            <div className="text-sm text-gray-600">Total Listings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-blue-600">
              {listings.reduce((sum, l) => sum + l.views, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-purple-600">
              ${listings.filter(l => l.status === 'active').reduce((sum, l) => sum + l.pricePerMonth, 0)}
            </div>
            <div className="text-sm text-gray-600">Potential Monthly Revenue</div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Start earning by creating your first storage listing</p>
            <button
              onClick={() => navigate('/host/listings/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="card overflow-hidden">
                {/* Image placeholder */}
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400">No images yet</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star size={14} className="fill-current" />
                      <span>{listing.rating}</span>
                      <span className="text-gray-400">({listing.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">{listing.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{listing.size} sq ft</span>
                    <span className="capitalize">{listing.storageType}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${listing.pricePerMonth}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye size={14} className="mr-1" />
                      <span>{listing.views} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(listing.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        listing.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default Listings;