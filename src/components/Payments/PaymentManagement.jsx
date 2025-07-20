// src/components/Payments/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Download,
  Filter,
  CreditCard,
  Building,
  Smartphone,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { paymentService } from '../../services/paymentService';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import PaymentDetails from './PaymentDetails';
import PaymentVerification from './PaymentVerification';

const PaymentManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: payments, loading } = useFirestore('payments');
  const { data: bookings } = useFirestore('bookings');

  // Calculate metrics
  const calculateMetrics = () => {
    const filteredByDate = payments.filter(payment => {
      const paymentDate = payment.createdAt?.toDate() || new Date(payment.createdAt);
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    });

    return {
      total: filteredByDate.length,
      pending: filteredByDate.filter(p => p.status === 'pending').length,
      verified: filteredByDate.filter(p => p.status === 'verified').length,
      failed: filteredByDate.filter(p => p.status === 'failed').length,
      totalAmount: filteredByDate
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      platformFees: filteredByDate
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0) * 0.09, 0),
      gcashTotal: filteredByDate
        .filter(p => p.method === 'gcash' && p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      bankTotal: filteredByDate
        .filter(p => p.method === 'bank' && p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    };
  };

  const metrics = calculateMetrics();

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    const matchesSearch = 
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const paymentDate = payment.createdAt?.toDate() || new Date(payment.createdAt);
    const matchesDate = paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    
    return matchesStatus && matchesMethod && matchesSearch && matchesDate;
  });

  const handleVerifyPayment = async (paymentId, verificationData) => {
    try {
      await paymentService.verifyPayment(paymentId, verificationData);
      
      // Update related booking
      const payment = payments.find(p => p.id === paymentId);
      if (payment?.bookingId) {
        await paymentService.updateBookingPaymentStatus(payment.bookingId, 'paid');
      }
      
      setShowVerification(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      await paymentService.rejectPayment(paymentId, reason);
      setShowVerification(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const exportPayments = () => {
    const data = filteredPayments.map(payment => ({
      'Payment ID': payment.id,
      'Date': format(payment.createdAt?.toDate() || new Date(), 'yyyy-MM-dd HH:mm'),
      'User': payment.userName,
      'Email': payment.userEmail,
      'Method': payment.method.toUpperCase(),
      'Reference': payment.referenceNumber,
      'Amount': payment.amount,
      'Platform Fee': (payment.amount * 0.09).toFixed(2),
      'Net Amount': (payment.amount * 0.91).toFixed(2),
      'Status': payment.status.toUpperCase()
    }));

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and verify platform payments</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportPayments}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FileText size={20} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{metrics.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-green-600">{metrics.verified}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{metrics.failed}</p>
        </div>
        <div className="card p-4 col-span-2">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-xl font-bold">₱{metrics.totalAmount.toLocaleString()}</p>
        </div>
        <div className="card p-4 col-span-2">
          <p className="text-sm text-gray-600">Platform Fees (9%)</p>
          <p className="text-xl font-bold">₱{metrics.platformFees.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">GCash Payments</h3>
            <Smartphone className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold">₱{metrics.gcashTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            {((metrics.gcashTotal / metrics.totalAmount) * 100 || 0).toFixed(1)}% of total
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Bank Transfers</h3>
            <Building className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold">₱{metrics.bankTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            {((metrics.bankTotal / metrics.totalAmount) * 100 || 0).toFixed(1)}% of total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by reference, user..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            className="input"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="gcash">GCash</option>
            <option value="bank">Bank Transfer</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              className="input"
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({
                ...dateRange,
                start: parseISO(e.target.value)
              })}
            />
            <input
              type="date"
              className="input"
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({
                ...dateRange,
                end: parseISO(e.target.value)
              })}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium">
                        #{payment.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(payment.createdAt?.toDate() || new Date(), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {payment.bookingId && (
                        <div className="text-xs text-primary-600">
                          Booking: #{payment.bookingId.slice(-6).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{payment.userName}</div>
                      <div className="text-gray-500">{payment.userEmail}</div>
                      {payment.userPhone && (
                        <div className="text-xs text-gray-400">{payment.userPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {payment.method === 'gcash' ? (
                        <Smartphone className="text-blue-600" size={16} />
                      ) : (
                        <Building className="text-green-600" size={16} />
                      )}
                      <span className="text-sm capitalize">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium">₱{payment.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        Fee: ₱{(payment.amount * 0.09).toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono">{payment.referenceNumber || 'N/A'}</div>
                    {payment.accountName && (
                      <div className="text-xs text-gray-500">{payment.accountName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                    {payment.verifiedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {format(payment.verifiedAt.toDate(), 'MMM dd, HH:mm')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowVerification(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Verify Payment"
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

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No payments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetails && selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => {
            setShowDetails(false);
            setSelectedPayment(null);
          }}
        />
      )}

      {showVerification && selectedPayment && (
        <PaymentVerification
          payment={selectedPayment}
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
          onClose={() => {
            setShowVerification(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentManagement;