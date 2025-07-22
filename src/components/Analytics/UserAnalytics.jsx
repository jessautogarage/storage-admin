// src/components/Analytics/UserAnalytics.jsx
import React from 'react';

const UserAnalytics = ({ data, dateRange }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        No user analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">User Analytics</h2>
      {/* You can expand this section with charts or tables using Recharts or similar */}
      <p className="text-gray-600">Active Users: {data.active}</p>
      <p className="text-gray-600">Total Users: {data.total}</p>
      <p className="text-gray-600">Hosts: {data.hosts}</p>
      <p className="text-gray-600">Clients: {data.clients}</p>
    </div>
  );
};

export default UserAnalytics;
