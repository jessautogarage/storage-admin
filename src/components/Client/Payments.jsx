import React, { useState } from 'react';
import { CreditCard, Download, Calendar, CheckCircle, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import ClientLayout from '../Layout/ClientLayout';

const Payments = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Mock data - replace with actual data from Firebase
  const [payments] = useState([
    {
      id: '1',
      date: '2025-02-01',
      amount: 150,
      status: 'completed',
      method: 'Credit Card (**** 1234)',
      listing: 'Spacious Garage Storage',
      host: 'John Doe',
      invoiceNumber: 'INV-2025-001',
      period: 'February 2025'
    },
    {
      id: '2',
      date: '2025-01-01',
      amount: 150,
      status: 'completed',
      method: 'Credit Card (**** 1234)',
      listing: 'Spacious Garage Storage',
      host: 'John Doe',
      invoiceNumber: 'INV-2025-002',
      period: 'January 2025'
    },
    {
      id: '3',
      date: '2024-12-01',
      amount: 150,
      status: 'completed',
      method: 'Credit Card (**** 1234)',
      listing: 'Spacious Garage Storage',
      host: 'John Doe',
      invoiceNumber: 'INV-2024-123',
      period: 'December 2024'
    },
    {
      id: '4',
      date: '2025-02-03',
      amount: 200,
      status: 'pending',
      method: 'Credit Card (**** 5678)',
      listing: 'Climate Controlled Unit',
      host: 'Sarah Johnson',
      invoiceNumber: 'INV-2025-003',
      period: 'February 2025',
      dueDate: '2025-02-05'
    },
    {
      id: '5',
      date: '2024-11-15',
      amount: 75,
      status: 'failed',
      method: 'Credit Card (**** 9012)',
      listing: 'Outdoor Storage Shed',
      host: 'Mike Davis',
      invoiceNumber: 'INV-2024-115',
      period: 'November 2024',
      failureReason: 'Insufficient funds'
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '1234',
      expiry: '12/2026',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '5678',
      expiry: '09/2025',
      isDefault: false
    }
  ]);

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Calendar size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const completed = payments.filter(p => p.status === 'completed');
    const total = completed.reduce((sum, p) => sum + p.amount, 0);
    const average = completed.length > 0 ? total / completed.length : 0;
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    
    return { total, average, pending, count: completed.length };
  };

  const stats = calculateStats();

  const handleDownloadInvoice = (payment) => {
    // TODO: Implement invoice download
    console.log('Download invoice:', payment.invoiceNumber);
  };

  const handleRetryPayment = (paymentId) => {
    // TODO: Implement payment retry
    console.log('Retry payment:', paymentId);
  };

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method
    console.log('Add payment method');
  };

  const handleSetDefaultMethod = (methodId) => {
    // TODO: Implement set default payment method
    console.log('Set default payment method:', methodId);
  };

  const handleRemoveMethod = (methodId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      // TODO: Implement remove payment method
      console.log('Remove payment method:', methodId);
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">Manage your payments and billing information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.total}</div>
            <div className="text-sm text-gray-600">Total Paid</div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.average.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Average Payment</div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Payments</div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
            <div className="text-sm text-gray-600">Successful Payments</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment History */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {periods.map(period => (
                      <option key={period.value} value={period.value}>{period.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6">
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                    <p className="text-gray-600">Your payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{payment.listing}</h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                {payment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Host: {payment.host} • {payment.period}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">${payment.amount}</div>
                            <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            <span className="font-medium">Invoice:</span> {payment.invoiceNumber}
                            <span className="mx-2">•</span>
                            <span>{payment.method}</span>
                          </div>
                          <div className="flex gap-2">
                            {payment.status === 'completed' && (
                              <button
                                onClick={() => handleDownloadInvoice(payment)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800"
                              >
                                <Download size={14} />
                                Invoice
                              </button>
                            )}
                            {payment.status === 'failed' && (
                              <button
                                onClick={() => handleRetryPayment(payment.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Retry Payment
                              </button>
                            )}
                          </div>
                        </div>

                        {payment.status === 'pending' && payment.dueDate && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Payment due by {formatDate(payment.dueDate)}
                            </p>
                          </div>
                        )}

                        {payment.status === 'failed' && payment.failureReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800">
                              Failed: {payment.failureReason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                  <button
                    onClick={handleAddPaymentMethod}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Add New
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {method.brand} •••• {method.last4}
                            </p>
                            <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-3">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultMethod(method.id)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMethod(method.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Automatic Payments</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Your monthly storage fees are automatically charged to your default payment method.
                  </p>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-sm text-blue-800">Enable automatic payments</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Payments;