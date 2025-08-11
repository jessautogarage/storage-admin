// src/components/Payments/PayoutManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Send, 
  Clock, 
  CheckCircle,
  User,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { payoutService } from '../../services/payoutService';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { where } from 'firebase/firestore';

const PayoutManagement = () => {
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [payoutPeriod, setPayoutPeriod] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  
  const { data: users } = useFirestore('users', [where('type', '==', 'host')]);
  const { data: bookings } = useFirestore('bookings');
  const { data: payouts } = useFirestore('payouts');

  // Calculate host earnings
  const calculateHostEarnings = () => {
    const hostEarnings = {};

    bookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
      .forEach(booking => {
        const bookingDate = booking.completedAt?.toDate() || new Date();
        if (bookingDate >= payoutPeriod.start && bookingDate <= payoutPeriod.end) {
          const hostId = booking.hostId;
          const amount = booking.amount || 0;
          const platformFee = amount * 0.09;
          const hostEarning = amount - platformFee;

          if (!hostEarnings[hostId]) {
            hostEarnings[hostId] = {
              hostId,
              hostName: booking.hostName,
              totalBookings: 0,
              totalAmount: 0,
              platformFees: 0,
              netEarnings: 0,
              bookings: []
            };
          }

          hostEarnings[hostId].totalBookings += 1;
          hostEarnings[hostId].totalAmount += amount;
          hostEarnings[hostId].platformFees += platformFee;
          hostEarnings[hostId].netEarnings += hostEarning;
          hostEarnings[hostId].bookings.push(booking);
        }
      });

    return Object.values(hostEarnings);
  };

  const hostEarnings = calculateHostEarnings();

  const handleCreatePayout = async (hostData) => {
    try {
      const payoutData = {
        hostId: hostData.hostId,
        hostName: hostData.hostName,
        period: {
          start: payoutPeriod.start,
          end: payoutPeriod.end
        },
        totalAmount: hostData.totalAmount,
        platformFees: hostData.platformFees,
        netAmount: hostData.netEarnings,
        bookingIds: hostData.bookings.map(b => b.id),
        status: 'pending'
      };

      await payoutService.createPayout(payoutData);
      alert('Payout created successfully!');
    } catch (error) {
      console.error('Error creating payout:', error);
      alert('Failed to create payout');
    }
  };

  const handleBatchPayout = async () => {
    try {
      const selectedHostData = hostEarnings.filter(h => selectedHosts.includes(h.hostId));
      
      for (const hostData of selectedHostData) {
        await handleCreatePayout(hostData);
      }
      
      setSelectedHosts([]);
      alert(`Created ${selectedHostData.length} payouts successfully!`);
    } catch (error) {
      console.error('Error creating batch payouts:', error);
      alert('Failed to create batch payouts');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600 mt-1">Manage host earnings and payouts</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          className="btn-primary flex items-center gap-2"
          disabled={selectedHosts.length === 0}
        >
          <Send size={20} />
          Create Payout ({selectedHosts.length})
        </button>
      </div>

      {/* Period Selector */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-400" />
          <div className="flex gap-2">
            <input
              type="date"
              className="input"
              value={format(payoutPeriod.start, 'yyyy-MM-dd')}
              onChange={(e) => setPayoutPeriod({
                ...payoutPeriod,
                start: new Date(e.target.value)
              })}
            />
            <span className="self-center">to</span>
            <input
              type="date"
              className="input"
              value={format(payoutPeriod.end, 'yyyy-MM-dd')}
              onChange={(e) => setPayoutPeriod({
                ...payoutPeriod,
                end: new Date(e.target.value)
              })}
            />
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Hosts</p>
          <p className="text-2xl font-bold">{hostEarnings.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">
            ₱{hostEarnings.reduce((sum, h) => sum + h.totalAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Platform Fees</p>
          <p className="text-2xl font-bold">
            ₱{hostEarnings.reduce((sum, h) => sum + h.platformFees, 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Net Payouts</p>
          <p className="text-2xl font-bold">
            ₱{hostEarnings.reduce((sum, h) => sum + h.netEarnings, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Host Earnings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedHosts.length === hostEarnings.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHosts(hostEarnings.map(h => h.hostId));
                      } else {
                        setSelectedHosts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Platform Fee (9%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Net Earnings
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
              {hostEarnings.map((host) => {
                const hasPayout = payouts.some(p => 
                  p.hostId === host.hostId && 
                  p.period.start.toDate() >= payoutPeriod.start &&
                  p.period.end.toDate() <= payoutPeriod.end
                );

                return (
                  <tr key={host.hostId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedHosts.includes(host.hostId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHosts([...selectedHosts, host.hostId]);
                          } else {
                            setSelectedHosts(selectedHosts.filter(id => id !== host.hostId));
                          }
                        }}
                        disabled={hasPayout}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{host.hostName}</p>
                          <p className="text-sm text-gray-500">ID: {host.hostId.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{host.totalBookings}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">₱{host.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-red-600">
                        -₱{host.platformFees.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">
                        ₱{host.netEarnings.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {hasPayout ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Payout Created
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCreatePayout(host)}
                        className="text-primary-600 hover:text-primary-800"
                        disabled={hasPayout}
                      >
                        Create Payout
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {hostEarnings.length === 0 && (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No earnings found for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Payouts</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payout ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.slice(0, 5).map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">#{payout.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{payout.hostName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">
                      {format(payout.period.start.toDate(), 'MMM dd')} - 
                      {format(payout.period.end.toDate(), 'MMM dd, yyyy')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">₱{payout.netAmount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payout.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payout.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">
                      {format(payout.createdAt.toDate(), 'MMM dd, yyyy')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutManagement;