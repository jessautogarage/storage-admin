import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Eye, Users, Calendar } from 'lucide-react';
import HostLayout from '../Layout/HostLayout';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock analytics data - replace with actual data from Firebase
  const analyticsData = {
    overview: {
      totalRevenue: 2450,
      totalViews: 1234,
      totalBookings: 18,
      occupancyRate: 75,
      averageBookingValue: 136,
      repeatCustomers: 12
    },
    revenueData: [
      { month: 'Jan', revenue: 1200, bookings: 8 },
      { month: 'Feb', revenue: 1800, bookings: 12 },
      { month: 'Mar', revenue: 2200, bookings: 15 },
      { month: 'Apr', revenue: 1900, bookings: 13 },
      { month: 'May', revenue: 2450, bookings: 18 }
    ],
    listingPerformance: [
      { name: 'Spacious Garage Storage', views: 245, bookings: 8, revenue: 1200, rating: 4.8 },
      { name: 'Climate Controlled Unit', views: 198, bookings: 6, revenue: 1200, rating: 4.9 },
      { name: 'Outdoor Storage Shed', views: 124, bookings: 4, revenue: 300, rating: 4.2 }
    ],
    topLocations: [
      { city: 'Los Angeles', bookings: 12, revenue: 1800 },
      { city: 'Beverly Hills', bookings: 4, revenue: 800 },
      { city: 'Santa Monica', bookings: 2, revenue: 300 }
    ]
  };

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <HostLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your storage business performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analyticsData.overview.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+8.2%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyticsData.overview.totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+15.3%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyticsData.overview.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+5.7%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyticsData.overview.occupancyRate}%
            </div>
            <div className="text-sm text-gray-600">Occupancy Rate</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-pink-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+3.1%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analyticsData.overview.averageBookingValue)}
            </div>
            <div className="text-sm text-gray-600">Avg. Booking Value</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+25.0%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyticsData.overview.repeatCustomers}
            </div>
            <div className="text-sm text-gray-600">Repeat Customers</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Bookings</span>
              </div>
            </div>
          </div>
          
          {/* Simple chart placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500">Revenue chart would go here</p>
              <p className="text-sm text-gray-400">Integration with Chart.js or similar library needed</p>
            </div>
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Performance */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Listing Performance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.listingPerformance.map((listing, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{listing.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{listing.views} views</span>
                        <span>{listing.bookings} bookings</span>
                        <span>★ {listing.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(listing.revenue)}</div>
                      <div className="text-sm text-gray-600">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Locations</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{location.city}</h3>
                        <div className="text-sm text-gray-600">{location.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(location.revenue)}</div>
                      <div className="text-sm text-gray-600">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default Analytics;