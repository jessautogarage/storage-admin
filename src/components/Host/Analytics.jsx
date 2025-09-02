import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useHostAnalytics } from '../../hooks/useHostAnalytics';
import { BarChart3, TrendingUp, DollarSign, Eye, Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import ModernHeader from '../Layout/ModernHeader';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Use the host analytics hook
  const { analytics, loading, error, refresh } = useHostAnalytics(selectedPeriod);

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
    return `₱${amount.toLocaleString()}`;
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Skeleton loader component
  const SkeletonLoader = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  // Error component
  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
      <p className="text-red-700 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <RefreshCw className="mr-2" size={16} />
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        variant="host"
        user={user}
        onSignIn={() => navigate('/signin')}
        onSignUp={() => navigate('/signup')}
        onLogout={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your storage business performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            disabled={loading}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorDisplay message={error} onRetry={refresh} />
      )}

      {/* Key Metrics */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.overview?.totalRevenue || 0)}
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.revenueChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.revenueChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {(analytics?.overview?.totalViews || 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.viewsChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.viewsChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.overview?.totalBookings || 0}
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.bookingsChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.bookingsChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {(analytics?.overview?.occupancyRate || 0).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.occupancyChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.occupancyChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.overview?.averageBookingValue || 0)}
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.avgBookingChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.avgBookingChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.overview?.repeatCustomers || 0}
                  </p>
                )}
              </div>
            </div>
            {loading ? (
              <SkeletonLoader className="h-6 w-12" />
            ) : (
              <div className={`flex items-center space-x-1 ${getChangeColor(analytics?.overview?.repeatCustomersChange || 0)}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(analytics?.overview?.repeatCustomersChange || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Revenue Chart */}
      {!error && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
            {!loading && (
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
            )}
          </div>
          
          {/* Chart content */}
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="animate-spin text-gray-400" size={24} />
                <span className="text-gray-500">Loading chart data...</span>
              </div>
            ) : (
              <div className="text-center">
                <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-500">Revenue chart visualization</p>
                <p className="text-sm text-gray-400">
                  {analytics?.revenueData?.length ? 
                    `${analytics.revenueData.length} data points available` : 
                    'No revenue data available'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Tables */}
      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Performance */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Listing Performance</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <SkeletonLoader className="h-5 w-40 mb-2" />
                        <div className="flex items-center gap-4">
                          <SkeletonLoader className="h-4 w-16" />
                          <SkeletonLoader className="h-4 w-16" />
                          <SkeletonLoader className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <SkeletonLoader className="h-5 w-20 mb-1" />
                        <SkeletonLoader className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics?.listingPerformance?.length > 0 ? (
                    analytics.listingPerformance.map((listing, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{listing.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{listing.views} views</span>
                            <span>{listing.bookings} bookings</span>
                            <span>★ {listing.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(listing.revenue)}</div>
                          <div className="text-sm text-gray-600">revenue</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No listing data available</p>
                      <p className="text-sm text-gray-400 mt-1">Start hosting to see performance metrics</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Locations</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <SkeletonLoader className="w-8 h-8 rounded-full" />
                        <div>
                          <SkeletonLoader className="h-5 w-32 mb-1" />
                          <SkeletonLoader className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <SkeletonLoader className="h-5 w-20 mb-1" />
                        <SkeletonLoader className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics?.topLocations?.length > 0 ? (
                    analytics.topLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No location data available</p>
                      <p className="text-sm text-gray-400 mt-1">Data will appear as you get bookings</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Analytics;