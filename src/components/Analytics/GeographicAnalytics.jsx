import React from 'react';

const GeographicAnalytics = ({ data, dateRange }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        No geographic analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Geographic Analytics</h2>
      <ul className="list-disc pl-5">
        {data.topRegions?.map((region, idx) => (
          <li key={idx} className="text-gray-600">
            {region.name} – ₱{region.revenue.toLocaleString()} revenue, {region.bookings} bookings
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GeographicAnalytics;