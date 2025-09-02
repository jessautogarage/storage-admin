import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Info
} from 'lucide-react';

const EnhancedMetricCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  trendText,
  loading = false,
  onClick,
  className = '',
  color = 'blue',
  subtitle,
  actionButton,
  showComparison = true,
  format = 'number', // 'number', 'currency', 'percentage'
  precision = 0
}) => {
  // Format the value based on type
  const formatValue = (val) => {
    if (loading || val === null || val === undefined) return '---';
    
    const num = Number(val);
    if (isNaN(num)) return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(num);
      
      case 'percentage':
        return `${num.toFixed(precision)}%`;
      
      case 'number':
      default:
        if (num >= 1000000) {
          return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
          return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toLocaleString();
    }
  };

  // Calculate trend percentage
  const getTrendPercentage = () => {
    if (!previousValue || previousValue === 0) return null;
    return (((value - previousValue) / previousValue) * 100);
  };

  const trendPercentage = getTrendPercentage();
  const trendDirection = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'neutral';

  // Color schemes
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div 
      className={`
        card p-6 transition-all duration-200 hover:shadow-md cursor-pointer relative group
        ${scheme.bg} ${scheme.border} border
        ${className}
      `}
      onClick={onClick}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${scheme.bg} border ${scheme.border}`}>
              <Icon className={scheme.icon} size={24} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {actionButton || (
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white hover:bg-opacity-50 rounded">
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {loading ? (
            <div className="skeleton h-8 w-24"></div>
          ) : (
            formatValue(value)
          )}
        </div>
        
        {/* Trend Indicator */}
        {showComparison && !loading && trendPercentage !== null && (
          <div className="flex items-center space-x-2">
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
              ${scheme.trend[trendDirection]}
            `}>
              <TrendIcon size={12} />
              <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-gray-500">
              {trendText || `vs last period`}
            </span>
          </div>
        )}
        
        {/* Custom Trend Text */}
        {trendValue && !showComparison && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>{trendValue}</span>
            {trendText && <span className="text-xs text-gray-500">• {trendText}</span>}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {onClick && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Click to view details</span>
          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      )}
    </div>
  );
};

// Skeleton version for loading states
export const MetricCardSkeleton = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="skeleton h-10 w-10 rounded-lg"></div>
        <div>
          <div className="skeleton h-4 w-24 mb-2"></div>
          <div className="skeleton h-3 w-16"></div>
        </div>
      </div>
    </div>
    <div className="mb-4">
      <div className="skeleton h-8 w-32 mb-2"></div>
      <div className="skeleton h-4 w-20"></div>
    </div>
  </div>
);

export default EnhancedMetricCard;