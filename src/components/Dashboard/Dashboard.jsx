import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Star,
  Activity
} from 'lucide-react';
import MetricCard from './MetricCard';
import RevenueChart from './RevenueChart';
import { useFirestore } from '../../hooks/useFirestore';
import { format } from 'date-fns';


const Dashboard = () => {
  const { data: users } = useFirestore('users');
  const { data: listings } = useFirestore('listings');
  const { data: bookings } = useFirestore('bookings');
  const [recentActivity, setRecentActivity] = useState([]);

  // Calculate metrics
  const metrics = {
    totalUsers: users.length,
    newUsersThisMonth: users.filter(u => {
      const createdDate = u.createdAt?.toDate?.() || new Date(u.createdAt);
      const currentMonth = new Date().getMonth();
      return createdDate.getMonth() === currentMonth;
    }).length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalListings: listings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    platformFees: bookings.reduce((sum, b) => sum + (b.amount || 0) * 0.09, 0),
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      subtitle: `+${metrics.newUsersThisMonth} this month`,
      icon: Users,
      color: 'primary',
      trend: '+12%'
    },
    {
      title: 'Active Listings',
      value: metrics.activeListings,
      subtitle: `${metrics.totalListings} total`,
      icon: Package,
      color: 'green',
      trend: '+8%'
    },
    {
      title: 'Total Revenue',
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      subtitle: `$${metrics.platformFees.toFixed(2)} fees`,
      icon: DollarSign,
      color: 'blue',
      trend: '+23%'
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings,
      subtitle: `${metrics.pendingBookings} pending`,
      icon: Calendar,
      color: 'purple',
      trend: '+5%'
    }
  ];

  // Combine and sort recent activities
  useEffect(() => {
    const activities = [];
    
    // Recent users
    users.slice(0, 3).forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'New user registered',
        description: user.name || user.email,
        time: user.createdAt,
        icon: Users,
        color: 'text-blue-600'
      });
    });
    
    // Recent listings
    listings.slice(0, 3).forEach(listing => {
      activities.push({
        id: `listing-${listing.id}`,
        type: 'listing',
        title: 'New listing created',
        description: listing.title,
        time: listing.createdAt,
        icon: Package,
        color: 'text-green-600'
      });
    });
    
    // Recent bookings
    bookings.slice(0, 3).forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        title: 'New booking',
        description: `${booking.clientName} - ${booking.listingTitle}`,
        time: booking.createdAt,
        icon: Calendar,
        color: 'text-purple-600'
      });
    });
    
    // Sort by time
    activities.sort((a, b) => {
      const timeA = a.time?.toDate?.() || new Date(a.time);
      const timeB = b.time?.toDate?.() || new Date(b.time);
      return timeB - timeA;
    });
    
    setRecentActivity(activities.slice(0, 8));
  }, [users, listings, bookings]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart bookings={bookings} />
        </div>
        
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Activity size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${activity.color}`}>
                    <activity.icon size={16} />
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Performing Listings</h3>
            <Star size={20} className="text-yellow-500" />
          </div>
          <div className="space-y-3">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.hostName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${listing.pricePerMonth}/mo</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={12} />
                    <span>{listing.rating || '4.5'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pending Verifications</h3>
            <Users size={20} className="text-orange-500" />
          </div>
          <div className="space-y-3">
            {users.filter(u => u.status === 'pending').slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {user.type}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Messages</h3>
            <MessageSquare size={20} className="text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No new messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;