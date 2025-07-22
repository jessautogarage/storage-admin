// src/components/Analytics/ListingAnalytics.jsx
import React from 'react';

const ListingAnalytics = ({ data, dateRange }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        No listing analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Listing Analytics</h2>
      <p className="text-gray-600">Total Listings: {data.total}</p>
      <p className="text-gray-600">Active Listings: {data.active}</p>
      <p className="text-gray-600">Avg Price: ₱{data.avgPrice?.toLocaleString()}</p>
      <p className="text-gray-600">Utilization Rate: {data.utilizationRate?.toFixed(1)}%</p>
    </div>
  );
};

export default ListingAnalytics;