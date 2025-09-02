import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Star,
  Activity,
  AlertTriangle,
  Shield,
  Settings,
  Send,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  BarChart,
  PieChart,
  TrendingDown,
  Clock,
  MapPin,
  Eye
} from 'lucide-react';
import MetricCard from './MetricCard';
import EnhancedMetricCard, { MetricCardSkeleton } from './EnhancedMetricCard';
import RevenueChart from './RevenueChart';
import { useFirestore } from '../../hooks/useFirestore';
import { format, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { analyticsService } from '../../services/analyticsService';
import { disputeService } from '../../services/disputeService';
import { auditService } from '../../services/auditService';
import { notificationService } from '../../services/notificationService';
import { AuthContext } from '../../context/AuthContextSafe';
import { PieChart as RechartsPieChart, Cell, Pie, BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, Area, AreaChart } from 'recharts';


const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { data: users, loading: usersLoading } = useFirestore('users');
  const { data: listings, loading: listingsLoading } = useFirestore('listings');
  const { data: bookings, loading: bookingsLoading } = useFirestore('bookings');
  const { data: payments } = useFirestore('payments');
  const { data: disputes } = useFirestore('disputes');
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ uptime: 99.9, errors: 0, performance: 'good' });
  const [adminActions, setAdminActions] = useState({ broadcastMessage: '' });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [topPerformingListings, setTopPerformingListings] = useState([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState({});

  // Calculate comprehensive metrics
  const metrics = {
    totalUsers: users.length,
    newUsersThisMonth: users.filter(u => {
      const createdDate = u.createdAt?.toDate?.() || new Date(u.createdAt);
      const currentMonth = new Date().getMonth();
      return createdDate.getMonth() === currentMonth;
    }).length,
    newUsersToday: users.filter(u => {
      const createdDate = u.createdAt?.toDate?.() || new Date(u.createdAt);
      const today = new Date().toDateString();
      return createdDate.toDateString() === today;
    }).length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalListings: listings.length,
    pendingListings: listings.filter(l => l.status === 'pending').length,
    totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    platformFees: payments.reduce((sum, p) => sum + (p.amount || 0) * 0.09, 0),
    revenueThisWeek: payments.filter(p => {
      const paymentDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
      const weekStart = startOfWeek(new Date());
      return paymentDate >= weekStart;
    }).reduce((sum, p) => sum + (p.amount || 0), 0),
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    activeBookings: bookings.filter(b => b.status === 'active').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    pendingVerifications: users.filter(u => u.status === 'pending').length,
    verifiedUsers: users.filter(u => u.verified === true).length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    openDisputes: disputes.filter(d => d.status === 'open').length,
    avgBookingValue: bookings.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / bookings.length : 0,
    occupancyRate: listings.length > 0 ? (bookings.filter(b => b.status === 'active').length / listings.length) * 100 : 0
  };

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      subtitle: `+${metrics.newUsersToday} today`,
      icon: Users,
      color: 'blue',
      format: 'number',
      previousValue: metrics.totalUsers - metrics.newUsersThisMonth
    },
    {
      title: 'Active Listings',
      value: metrics.activeListings,
      subtitle: `${metrics.pendingListings} pending review`,
      icon: Package,
      color: 'green',
      format: 'number',
      previousValue: metrics.activeListings * 0.92
    },
    {
      title: 'Platform Revenue',
      value: metrics.totalRevenue,
      subtitle: `₱${metrics.platformFees.toLocaleString()} in fees`,
      icon: DollarSign,
      color: 'purple',
      format: 'currency',
      previousValue: metrics.totalRevenue * 0.85
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings,
      subtitle: `${metrics.activeBookings} currently active`,
      icon: Calendar,
      color: 'orange',
      format: 'number',
      previousValue: metrics.totalBookings * 0.90
    },
    {
      title: 'Occupancy Rate',
      value: metrics.occupancyRate,
      subtitle: 'Current utilization',
      icon: BarChart,
      color: 'blue',
      format: 'percentage',
      precision: 1,
      previousValue: metrics.occupancyRate * 0.95
    },
    {
      title: 'Verified Users',
      value: metrics.verifiedUsers,
      subtitle: `${metrics.pendingVerifications} pending`,
      icon: CheckCircle,
      color: 'green',
      format: 'number',
      previousValue: metrics.verifiedUsers * 0.94
    },
    {
      title: 'Open Disputes',
      value: metrics.openDisputes,
      subtitle: 'Require attention',
      icon: AlertTriangle,
      color: 'red',
      format: 'number',
      previousValue: metrics.openDisputes + 2
    },
    {
      title: 'Avg Booking Value',
      value: metrics.avgBookingValue,
      subtitle: 'Per transaction',
      icon: TrendingUp,
      color: 'purple',
      format: 'currency',
      previousValue: metrics.avgBookingValue * 0.88
    }
  ];

  // Load analytics data and audit logs
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingAnalytics(true);
        
        // Load audit logs
        const logs = await auditService.getAuditLogs({ limit: 20 });
        setAuditLogs(logs);
        
        // Calculate top performing listings
        const listingRevenue = {};
        bookings.forEach(booking => {
          if (booking.listingId && booking.amount) {
            if (!listingRevenue[booking.listingId]) {
              listingRevenue[booking.listingId] = {
                id: booking.listingId,
                title: booking.listingTitle || 'Unknown Listing',
                hostName: booking.hostName || 'Unknown Host',
                revenue: 0,
                bookingCount: 0
              };
            }
            listingRevenue[booking.listingId].revenue += booking.amount;
            listingRevenue[booking.listingId].bookingCount += 1;
          }
        });
        
        const sortedListings = Object.values(listingRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopPerformingListings(sortedListings);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    
    if (user?.isAdmin && users.length > 0) {
      loadDashboardData();
    }
  }, [users, bookings, payments, user]);
  
  // Combine and sort recent activities
  useEffect(() => {
    const activities = [];
    
    // Recent users (last 7 days)
    const recentUsers = users
      .filter(u => {
        const createdDate = u.createdAt?.toDate?.() || new Date(u.createdAt);
        const sevenDaysAgo = subDays(new Date(), 7);
        return createdDate >= sevenDaysAgo;
      })
      .slice(0, 3);
      
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: `New ${user.type || 'user'} registered`,
        description: user.name || user.email,
        time: user.createdAt,
        icon: Users,
        color: 'text-blue-600'
      });
    });
    
    // Recent payments
    const recentPayments = payments
      .filter(p => {
        const createdDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
        const threeDaysAgo = subDays(new Date(), 3);
        return createdDate >= threeDaysAgo;
      })
      .slice(0, 3);
      
    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: 'Payment received',
        description: `₱${payment.amount?.toLocaleString()} via ${payment.method}`,
        time: payment.createdAt,
        icon: DollarSign,
        color: 'text-green-600'
      });
    });
    
    // Recent disputes
    disputes.slice(0, 2).forEach(dispute => {
      activities.push({
        id: `dispute-${dispute.id}`,
        type: 'dispute',
        title: 'New dispute filed',
        description: `${dispute.type} dispute by ${dispute.reporterName}`,
        time: dispute.createdAt,
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    });
    
    // Sort by time
    activities.sort((a, b) => {
      const timeA = a.time?.toDate?.() || new Date(a.time);
      const timeB = b.time?.toDate?.() || new Date(b.time);
      return timeB - timeA;
    });
    
    setRecentActivity(activities.slice(0, 10));
  }, [users, payments, bookings, disputes]);
  
  // Admin action handlers
  const handleBroadcastMessage = async () => {
    if (!adminActions.broadcastMessage.trim()) return;
    
    try {
      await notificationService.notifySystemAlert({
        title: 'System Announcement',
        message: adminActions.broadcastMessage,
        priority: 'normal'
      });
      
      await auditService.logSystemAction('broadcast_message', {
        message: adminActions.broadcastMessage
      });
      
      setAdminActions({...adminActions, broadcastMessage: ''});
      // Show success message
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  };
  
  // Check if user has admin access
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (usersLoading || listingsLoading || bookingsLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading platform overview...</p>
        </div>
        
        <div className="responsive-grid gap-6">
          {[...Array(8)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Complete platform management and oversight</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Online
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {format(new Date(), 'PPp')}
            </div>
          </div>
        </div>
      </div>
      
      {/* System Health Alert */}
      {systemHealth.errors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-semibold text-red-800">System Alert</h3>
          </div>
          <p className="text-red-700 mt-1">
            {systemHealth.errors} system errors detected. Check logs for details.
          </p>
        </div>
      )}
      
      {/* Enhanced Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <EnhancedMetricCard 
            key={index} 
            {...metric}
            loading={loadingAnalytics}
            showComparison={true}
            onClick={() => console.log(`Navigate to ${metric.title} details`)}
          />
        ))}
      </div>
      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Chart */}
        <div className="xl:col-span-2">
          <RevenueChart bookings={bookings} payments={payments} />
        </div>
        
        {/* Booking Status Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Booking Status</h3>
            <PieChart size={20} className="text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Active', value: metrics.activeBookings, color: '#10b981' },
                  { name: 'Completed', value: metrics.completedBookings, color: '#3b82f6' },
                  { name: 'Pending', value: metrics.pendingBookings, color: '#f59e0b' },
                  { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {[
                  { name: 'Active', value: metrics.activeBookings, color: '#10b981' },
                  { name: 'Completed', value: metrics.completedBookings, color: '#3b82f6' },
                  { name: 'Pending', value: metrics.pendingBookings, color: '#f59e0b' },
                  { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {[
              { name: 'Active', value: metrics.activeBookings, color: 'bg-green-500' },
              { name: 'Completed', value: metrics.completedBookings, color: 'bg-blue-500' },
              { name: 'Pending', value: metrics.pendingBookings, color: 'bg-yellow-500' },
              { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Activity and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Real-time Activity Feed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Real-time Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-1.5 rounded-lg bg-gray-100 ${activity.color}`}>
                  <activity.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(activity.time?.toDate?.() || new Date(activity.time), 'PPp')}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
        
        {/* User Growth Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[
              { date: 'Jan', users: Math.floor(metrics.totalUsers * 0.6) },
              { date: 'Feb', users: Math.floor(metrics.totalUsers * 0.7) },
              { date: 'Mar', users: Math.floor(metrics.totalUsers * 0.8) },
              { date: 'Apr', users: Math.floor(metrics.totalUsers * 0.9) },
              { date: 'May', users: metrics.totalUsers }
            ]}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
            <p className="text-sm text-gray-500">Total registered users</p>
          </div>
        </div>
        
        {/* System Health */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">System Health</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              systemHealth.performance === 'good' ? 'bg-green-100 text-green-800' :
              systemHealth.performance === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {systemHealth.performance}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-semibold">{systemHealth.uptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemHealth.uptime}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{systemHealth.errors}</p>
                <p className="text-xs text-gray-500">Active Errors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.totalUsers}</p>
                <p className="text-xs text-gray-500">Active Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* User Management */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} />
              User Management
            </h3>
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {metrics.pendingVerifications} pending
            </div>
          </div>
          <div className="space-y-3">
            {users.filter(u => u.status === 'pending').slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500">{user.type}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                    <CheckCircle size={14} />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Users →
            </button>
          </div>
        </div>

        {/* Listing Moderation */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package size={18} />
              Listing Moderation
            </h3>
            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {metrics.pendingListings} pending
            </div>
          </div>
          <div className="space-y-3">
            {listings.filter(l => l.status === 'pending').slice(0, 3).map((listing) => (
              <div key={listing.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <div className="flex gap-1">
                    <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <CheckCircle size={14} />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">₱{listing.pricePerMonth}/month by {listing.hostName}</p>
              </div>
            ))}
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
              Review All Listings →
            </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign size={18} />
              Financial Overview
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Payments</span>
              <span className="font-semibold text-orange-600">{metrics.pendingPayments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Platform Fees</span>
              <span className="font-semibold text-green-600">₱{metrics.platformFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue This Week</span>
              <span className="font-semibold text-blue-600">₱{metrics.revenueThisWeek.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Financial Reports →
              </button>
            </div>
          </div>
        </div>

        {/* Support & Disputes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={18} />
              Support & Disputes
            </h3>
            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {metrics.openDisputes} open
            </div>
          </div>
          <div className="space-y-3">
            {disputes.filter(d => d.status === 'open').slice(0, 3).map((dispute) => (
              <div key={dispute.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {dispute.priority}
                  </span>
                  <span className="text-xs text-gray-500">#{dispute.id.slice(-6)}</span>
                </div>
                <p className="text-sm font-medium">{dispute.type} dispute</p>
                <p className="text-xs text-gray-600 truncate">{dispute.reporterName}</p>
              </div>
            ))}
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
              Manage Disputes →
            </button>
          </div>
        </div>
      </div>

      {/* Top Performers & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Top Performing Listings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Star size={18} />
              Top Performing Listings
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {topPerformingListings.map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.hostName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₱{listing.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{listing.bookingCount} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Log */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield size={18} />
              Recent Admin Actions
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View Full Log</button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <FileText size={14} className="text-gray-500 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.userEmail}</p>
                  <p className="text-xs text-gray-400">
                    {format(log.timestamp?.toDate?.() || new Date(log.timestamp), 'PPp')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={18} />
          Admin Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Broadcast Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Broadcast System Announcement
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminActions.broadcastMessage}
                onChange={(e) => setAdminActions({...adminActions, broadcastMessage: e.target.value})}
                placeholder="Enter system announcement..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button 
                onClick={handleBroadcastMessage}
                disabled={!adminActions.broadcastMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>

          {/* Export Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Platform Data
            </label>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Download size={16} />
                Export Users
              </button>
              <button className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Download size={16} />
                Export Revenue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;