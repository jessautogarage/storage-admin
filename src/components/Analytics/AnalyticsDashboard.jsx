// src/components/Analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  MapPin,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import RevenueAnalytics from './RevenueAnalytics';
import UserAnalytics from './UserAnalytics';
import ListingAnalytics from './ListingAnalytics';
import GeographicAnalytics from './GeographicAnalytics';
import PredictiveAnalytics from './PredictiveAnalytics';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [compareRange, setCompareRange] = useState({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: endOfMonth(subMonths(new Date(), 1))
  });

  const { analytics, loading, exportData } = useAnalytics(dateRange, compareRange);

  const handleExport = async (type) => {
    await exportData(type);
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => {
    const isPositive = change > 0;
    
    return (
      <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
        <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-xs text-gray-500 mt-1">vs previous period</p>
      </div>
    );
  };

  const QuickStats = () => {
    const stats = analytics?.overview || {};
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Revenue"
          value={stats.revenue?.total || 0}
          change={stats.revenue?.change || 0}
          icon={DollarSign}
          color="bg-green-600"
          prefix="₱"
        />
        <MetricCard
          title="Active Users"
          value={stats.users?.active || 0}
          change={stats.users?.change || 0}
          icon={Users}
          color="bg-blue-600"
        />
        <MetricCard
          title="Total Bookings"
          value={stats.bookings?.total || 0}
          change={stats.bookings?.change || 0}
          icon={Package}
          color="bg-purple-600"
        />
        <MetricCard
          title="Conversion Rate"
          value={stats.conversion?.rate || 0}
          change={stats.conversion?.change || 0}
          icon={Target}
          color="bg-orange-600"
          suffix="%"
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'revenue':
        return <RevenueAnalytics data={analytics?.revenue} dateRange={dateRange} />;
      case 'users':
        return <UserAnalytics data={analytics?.users} dateRange={dateRange} />;
      case 'listings':
        return <ListingAnalytics data={analytics?.listings} dateRange={dateRange} />;
      case 'geographic':
        return <GeographicAnalytics data={analytics?.geographic} dateRange={dateRange} />;
      case 'predictive':
        return <PredictiveAnalytics data={analytics?.predictive} dateRange={dateRange} />;
      default:
        return <OverviewDashboard analytics={analytics} />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Period:</span>
            <input
              type="date"
              className="input"
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({
                ...dateRange,
                start: new Date(e.target.value)
              })}
            />
            <span>to</span>
            <input
              type="date"
              className="input"
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({
                ...dateRange,
                end: new Date(e.target.value)
              })}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">Last 7 days</button>
            <button className="btn-secondary">Last 30 days</button>
            <button className="btn-secondary">Last 90 days</button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'revenue', label: 'Revenue', icon: DollarSign },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'listings', label: 'Listings', icon: Package },
          { id: 'geographic', label: 'Geographic', icon: MapPin },
          { id: 'predictive', label: 'Predictive', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

// Overview Dashboard Component
const OverviewDashboard = ({ analytics }) => {
  const data = analytics?.overview || {};

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                name="Revenue"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="platformFees" 
                stroke="#10b981" 
                name="Platform Fees"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={data.bookingStatus || []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(data.bookingStatus || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="hosts" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="clients" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Categories */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Popular Storage Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.categories || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hosts */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Hosts</h3>
          <div className="space-y-3">
            {(data.topHosts || []).map((host, index) => (
              <div key={host.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{host.name}</p>
                    <p className="text-xs text-gray-500">{host.listings} listings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₱{host.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{host.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Listings */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Listings</h3>
          <div className="space-y-3">
            {(data.topListings || []).map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{listing.bookings}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{listing.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Locations</h3>
          <div className="space-y-3">
            {(data.topLocations || []).map((location, index) => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-xs text-gray-500">{location.listings} listings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₱{location.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{location.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;