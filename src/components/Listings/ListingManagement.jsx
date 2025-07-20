import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Calendar
} from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { databaseService } from '../../services/database';
import { format } from 'date-fns';

const ListingManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: listings, loading } = useFirestore('listings');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    size: '',
    pricePerMonth: '',
    pricePerDay: '',
    features: [],
    images: [],
    availability: 'available',
    status: 'active',
    hostId: '',
    hostName: ''
  });

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.hostName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const listingData = {
      ...formData,
      pricePerMonth: parseFloat(formData.pricePerMonth),
      pricePerDay: parseFloat(formData.pricePerDay)
    };

    if (editingListing) {
      await databaseService.update('listings', editingListing.id, listingData);
    } else {
      await databaseService.create('listings', {
        ...listingData,
        views: 0,
        ratings: []
      });
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      address: '',
      city: '',
      size: '',
      pricePerMonth: '',
      pricePerDay: '',
      features: [],
      images: [],
      availability: 'available',
      status: 'active',
      hostId: '',
      hostName: ''
    });
    setEditingListing(null);
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      address: listing.address || '',
      city: listing.city || '',
      size: listing.size || '',
      pricePerMonth: listing.pricePerMonth || '',
      pricePerDay: listing.pricePerDay || '',
      features: listing.features || [],
      images: listing.images || [],
      availability: listing.availability || 'available',
      status: listing.status || 'active',
      hostId: listing.hostId || '',
      hostName: listing.hostName || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await databaseService.delete('listings', id);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await databaseService.update('listings', id, { status: newStatus });
  };

  const metrics = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    inactive: listings.filter(l => l.status === 'inactive').length,
    totalValue: listings.reduce((sum, l) => sum + (l.pricePerMonth || 0), 0)
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading listings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listing Management</h1>
          <p className="text-gray-600 mt-1">Manage all storage spaces on the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Listing
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold">{metrics.total}</p>
            </div>
            <Package className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">{metrics.active}</p>
            </div>
            <Eye className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold">{metrics.inactive}</p>
            </div>
            <EyeOff className="text-gray-600" size={32} />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">${metrics.totalValue}</p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search listings..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="input w-full md:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Listings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {listing.images?.[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        <div className="text-sm text-gray-500">{listing.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {listing.city}
                      </div>
                      <div className="text-xs text-gray-500">{listing.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{listing.hostName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${listing.pricePerMonth}/mo
                    </div>
                    <div className="text-xs text-gray-500">
                      ${listing.pricePerDay}/day
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{listing.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span>{listing.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusToggle(listing.id, listing.status)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title={listing.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {listing.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(listing)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingListing ? 'Edit Listing' : 'Add New Listing'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 10x10"
                    className="input"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Month</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.pricePerMonth}
                    onChange={(e) => setFormData({...formData, pricePerMonth: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Day</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Host Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.hostName}
                    onChange={(e) => setFormData({...formData, hostName: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Climate controlled, 24/7 access, Security cameras"
                  className="input"
                  value={formData.features.join(', ')}
                  onChange={(e) => setFormData({...formData, features: e.target.value.split(',').map(f => f.trim())})}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingListing ? 'Update' : 'Create'} Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingManagement;