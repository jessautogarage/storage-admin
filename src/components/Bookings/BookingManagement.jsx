import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { databaseService } from '../../services/database';
import { format } from 'date-fns';

const BookingManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { data: bookings, loading } = useFirestore('bookings');
  
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const handleStatusUpdate = async (bookingId, newStatus) => {
    await databaseService.update('bookings', bookingId, { status: newStatus });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const metrics = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount || 0), 0),
    platformFees: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount || 0) * 0.09, 0)
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform bookings</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{metrics.confirmed}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{metrics.completed}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{metrics.cancelled}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-lg font-bold">${metrics.revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Platform Fees</p>
            <p className="text-lg font-bold">${metrics.platformFees.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Filter size={20} className="text-gray-400" />
        <select
          className="input w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(booking.createdAt?.toDate?.() || new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.clientName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.clientEmail || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.listingTitle || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Host: {booking.hostName || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.startDate && booking.endDate ? (
                        <>
                          {format(booking.startDate?.toDate?.() || new Date(booking.startDate), 'MMM dd')} - 
                          {format(booking.endDate?.toDate?.() || new Date(booking.endDate), 'MMM dd, yyyy')}
                        </>
                      ) : (
                        'No dates'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${booking.amount || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Fee: ${((booking.amount || 0) * 0.09).toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[booking.status] || statusColors.pending
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-medium">#{selectedBooking.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[selectedBooking.status] || statusColors.pending
                  }`}>
                    {selectedBooking.status || 'pending'}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedBooking.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedBooking.clientEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Listing Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{selectedBooking.listingTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Host</p>
                    <p className="font-medium">{selectedBooking.hostName || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {selectedBooking.startDate 
                        ? format(selectedBooking.startDate?.toDate?.() || new Date(selectedBooking.startDate), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">
                      {selectedBooking.endDate 
                        ? format(selectedBooking.endDate?.toDate?.() || new Date(selectedBooking.endDate), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-lg">${selectedBooking.amount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform Fee (9%)</p>
                    <p className="font-medium">${((selectedBooking.amount || 0) * 0.09).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {format(selectedBooking.createdAt?.toDate?.() || new Date(selectedBooking.createdAt), 'PPp')}
                    </span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {format(selectedBooking.updatedAt?.toDate?.() || new Date(selectedBooking.updatedAt), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedBooking(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedBooking.id, 'confirmed');
                      setShowDetails(false);
                      setSelectedBooking(null);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Confirm Booking
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;