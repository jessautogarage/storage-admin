import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const RevenueChart = ({ bookings }) => {
  const chartData = useMemo(() => {
    // Generate last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      days.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        revenue: 0,
        bookings: 0
      });
    }

    // Aggregate booking data
    bookings.forEach(booking => {
      const bookingDate = startOfDay(booking.createdAt?.toDate?.() || new Date(booking.createdAt));
      const dayIndex = days.findIndex(d => d.fullDate.getTime() === bookingDate.getTime());
      
      if (dayIndex !== -1) {
        days[dayIndex].revenue += booking.amount || 0;
        days[dayIndex].bookings += 1;
      }
    });

    return days;
  }, [bookings]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary-600">
            Revenue: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Bookings: {payload[0].payload.bookings}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <p className="text-sm text-gray-600">Last 30 days performance</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;