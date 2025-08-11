import React, { useState } from 'react';
import { Calendar, User, DollarSign, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import HostLayout from '../Layout/HostLayout';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock data - replace with actual data from Firebase
  const [bookings] = useState([
    {
      id: '1',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      listingTitle: 'Spacious Garage Storage',
      startDate: '2025-02-01',
      endDate: '2025-04-01',
      amount: 300,
      status: 'confirmed',
      createdAt: '2025-01-25',
      notes: 'Need access on weekends only'
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.j@email.com',
      listingTitle: 'Climate Controlled Unit',
      startDate: '2025-02-15',
      endDate: '2025-05-15',
      amount: 600,
      status: 'pending',
      createdAt: '2025-01-28',
      notes: 'Moving furniture temporarily'
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      clientEmail: 'mike.davis@email.com',
      listingTitle: 'Outdoor Storage Shed',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      amount: 75,
      status: 'active',
      createdAt: '2025-01-10',
      notes: 'Storing seasonal equipment'
    },
    {
      id: '4',
      clientName: 'Emily Wilson',
      clientEmail: 'emily.w@email.com',
      listingTitle: 'Spacious Garage Storage',
      startDate: '2024-12-01',
      endDate: '2025-01-01',
      amount: 150,
      status: 'completed',
      createdAt: '2024-11-25',
      notes: 'Holiday decorations storage'
    }
  ]);

  const tabs = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length }
  ];

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
      case 'active':
        return <CheckCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleApprove = (bookingId) => {
    // TODO: Implement booking approval
    console.log('Approving booking:', bookingId);
  };

  const handleReject = (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      // TODO: Implement booking rejection
      console.log('Rejecting booking:', bookingId);
    }
  };

  const handleContact = (booking) => {
    // TODO: Implement messaging
    console.log('Contacting client:', booking.clientEmail);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  return (
    <HostLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your storage space bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Bookings</div>
          </div>
          <div className="card p-6">
            <div className="text-2xl font-bold text-blue-600">
              ${bookings.filter(b => b.status === 'active' || b.status === 'confirmed').reduce((sum, b) => sum + b.amount, 0)}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? 'Your bookings will appear here once clients start booking your listings'
                    : `No ${activeTab} bookings at the moment`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.listingTitle}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{booking.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                            <span className="text-gray-400">({calculateDuration(booking.startDate, booking.endDate)} months)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${booking.amount}</div>
                        <div className="text-sm text-gray-600">total</div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleContact(booking)}
                          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare size={16} />
                          Contact
                        </button>
                        
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default Bookings;