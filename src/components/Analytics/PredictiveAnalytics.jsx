
// src/components/Analytics/PredictiveAnalytics.jsx
import React from 'react';

const PredictiveAnalytics = ({ data, dateRange }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        No predictive analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Predictive Analytics</h2>
      <p className="text-gray-600">Revenue Forecast: ₱{data.revenuePrediction?.forecast?.toLocaleString()}</p>
      <p className="text-gray-600">Demand Forecast: {data.demandForecast?.projectedBookings} bookings</p>
      <p className="text-gray-600">Growth Rate: {data.growthProjections?.growthRate?.toFixed(2)}%</p>
      <p className="text-gray-600">Risk Areas: {data.riskIndicators?.length || 0}</p>
      <p className="text-gray-600">Opportunities: {data.opportunities?.length || 0}</p>
    </div>
  );
};

export default PredictiveAnalytics;
