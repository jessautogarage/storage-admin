// src/components/Reviews/ReviewAnalytics.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
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
  Legend
} from 'recharts';

const ReviewAnalytics = ({ reviews, onBack }) => {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // Filter reviews by date range
  const filteredReviews = reviews.filter(review => {
    const reviewDate = review.createdAt?.toDate() || new Date();
    return reviewDate >= dateRange.start && reviewDate <= dateRange.end;
  });

  // Calculate analytics
  const calculateAnalytics = () => {
    const approved = filteredReviews.filter(r => r.status === 'approved');
    
    // Overall metrics
    const metrics = {
      totalReviews: filteredReviews.length,
      approvedReviews: approved.length,
      averageRating: approved.length > 0
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
        : 0,
      responseRate: filteredReviews.filter(r => r.response).length / filteredReviews.length * 100 || 0,
      approvalRate: approved.length / filteredReviews.length * 100 || 0
    };

    // Rating distribution
    const ratingDistribution = [
      { rating: '5 Stars', count: approved.filter(r => r.rating === 5).length },
      { rating: '4 Stars', count: approved.filter(r => r.rating === 4).length },
      { rating: '3 Stars', count: approved.filter(r => r.rating === 3).length },
      { rating: '2 Stars', count: approved.filter(r => r.rating === 2).length },
      { rating: '1 Star', count: approved.filter(r => r.rating === 1).length }
    ];

    // Status distribution
    const statusDistribution = [
      { name: 'Approved', value: filteredReviews.filter(r => r.status === 'approved').length },
      { name: 'Pending', value: filteredReviews.filter(r => r.status === 'pending').length },
      { name: 'Flagged', value: filteredReviews.filter(r => r.status === 'flagged').length },
      { name: 'Rejected', value: filteredReviews.filter(r => r.status === 'rejected').length }
    ];

    // Reviews over time
    const reviewsOverTime = [];
    const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      const dayReviews = filteredReviews.filter(r => {
        const reviewDate = r.createdAt?.toDate() || new Date();
        return format(reviewDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      reviewsOverTime.push({
        date: format(date, 'MMM dd'),
        reviews: dayReviews.length,
        avgRating: dayReviews.length > 0
          ? dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length
          : 0
      });
    }

    // Top reviewed hosts/listings
    const targetCounts = {};
    filteredReviews.forEach(review => {
      const key = review.targetId;
      if (!targetCounts[key]) {
        targetCounts[key] = {
          id: key,
          name: review.targetName,
          count: 0,
          totalRating: 0,
          type: review.type
        };
      }
      targetCounts[key].count++;
      targetCounts[key].totalRating += review.rating;
    });

    const topTargets = Object.values(targetCounts)
      .map(target => ({
        ...target,
        avgRating: target.totalRating / target.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      metrics,
      ratingDistribution,
      statusDistribution,
      reviewsOverTime,
      topTargets
    };
  };

  const analytics = calculateAnalytics();
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">Review Analytics</h2>
      </div>

      {/* Date Range Selector */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-400" />
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="text-gray-400" size={20} />
            <span className="text-2xl font-bold">{analytics.metrics.totalReviews}</span>
          </div>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="text-yellow-500" size={20} />
            <span className="text-2xl font-bold">
              {analytics.metrics.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-500" size={20} />
            <span className="text-2xl font-bold">
              {analytics.metrics.approvalRate.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Approval Rate</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="text-blue-500" size={20} />
            <span className="text-2xl font-bold">
              {analytics.metrics.responseRate.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Response Rate</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-purple-500" size={20} />
            <span className="text-2xl font-bold">
              {(analytics.metrics.totalReviews / 30).toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Reviews/Day</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reviews Over Time */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Reviews Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.reviewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="reviews" 
                stroke="#3b82f6" 
                name="Reviews"
              />
              <Line 
                type="monotone" 
                dataKey="avgRating" 
                stroke="#f59e0b" 
                name="Avg Rating"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Review Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={analytics.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Reviewed */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Most Reviewed</h3>
          <div className="space-y-3">
            {analytics.topTargets.map((target, index) => (
              <div key={target.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{target.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{target.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{target.count} reviews</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{target.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;