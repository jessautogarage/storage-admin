// src/components/Analytics/RevenueAnalytics.jsx
import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  CreditCard,
  PieChart,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

const RevenueAnalytics = ({ data, dateRange }) => {
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly
  const [revenueType, setRevenueType] = useState('all'); // all, bookings, fees

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (value) => `₱${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {data?.growth?.total || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">₱{data?.total?.toLocaleString() || 0}</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="text-blue-600" size={24} />
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {data?.growth?.bookings || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Booking Revenue</p>
          <p className="text-2xl font-bold">₱{data?.bookings?.toLocaleString() || 0}</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="text-purple-600" size={24} />
            <span className="text-xs text-purple-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {data?.growth?.fees || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Platform Fees</p>
          <p className="text-2xl font-bold">₱{data?.fees?.toLocaleString() || 0}</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-orange-600" size={24} />
          </div>
          <p className="text-sm text-gray-600">Average Transaction</p>
          <p className="text-2xl font-bold">₱{data?.avgTransaction?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'daily' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'weekly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'monthly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
          
          <select
            className="input"
            value={revenueType}
            onChange={(e) => setRevenueType(e.target.value)}
          >
            <option value="all">All Revenue</option>
            <option value="bookings">Booking Revenue</option>
            <option value="fees">Platform Fees</option>
          </select>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data?.trend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="fees" 
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="Platform Fees"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Payment Method */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue by Payment Method</h3>
          
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data.growth || []}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {(data?.paymentMethods || []).map((method, index) => (
              <div key={method.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{method.name}</span>
                </div>
                <span className="font-medium">₱{method.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue by Storage Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.categories || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatCurrency} />
              <Bar dataKey="revenue" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Revenue Generators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Revenue Hosts */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Revenue Hosts</h3>
          <div className="space-y-3">
            {(data?.topHosts || []).map((host, index) => (
              <div key={host.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{host.name}</p>
                    <p className="text-xs text-gray-500">{host.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₱{host.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((host.revenue / data?.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Revenue Listings */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Revenue Listings</h3>
          <div className="space-y-3">
            {(data?.topListings || []).map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₱{listing.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{listing.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue Forecast</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">This Month (Projected)</p>
              <p className="text-xl font-bold">₱{data?.forecast?.thisMonth?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Based on current trend
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Month (Estimated)</p>
              <p className="text-xl font-bold">₱{data?.forecast?.nextMonth?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Based on historical data
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quarter End (Projected)</p>
              <p className="text-xl font-bold">₱{data?.forecast?.quarter?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {data?.forecast?.confidence || 0}% confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold">Detailed Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Platform Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Net Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Transaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(data?.breakdown || []).map((row) => (
                <tr key={row.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {format(new Date(row.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm">{row.bookings}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ₱{row.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    ₱{row.fees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ₱{row.netRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    ₱{row.avgTransaction.toLocaleString()}
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

export default RevenueAnalytics;