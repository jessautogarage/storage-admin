// src/components/Disputes/DisputeCenter.jsx
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';
import { useDisputes } from '../../hooks/useDisputes';
import DisputeDetails from './DisputeDetails';
import { format } from 'date-fns';

const DisputeCenter = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'open',
    type: 'all',
    priority: 'all',
    searchTerm: ''
  });

  const { disputes, stats, loading, updateStatus, assignDispute, resolveDispute } = useDisputes(filters);

  const handleResolve = async (disputeId, resolution) => {
    await resolveDispute(disputeId, resolution);
    setShowDetails(false);
    setSelectedDispute(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      payment: '💰',
      damage: '🔨',
      cancellation: '❌',
      service: '🛎️',
      communication: '💬',
      other: '❓'
    };
    return icons[type] || '❓';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution Center</h1>
          <p className="text-gray-600 mt-1">Manage and resolve user disputes</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <FileText size={20} />
          Export Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-gray-600" size={20} />
            <span className="text-2xl font-bold">{stats?.total || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Total Disputes</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-yellow-600" size={20} />
            <span className="text-2xl font-bold">{stats?.open || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Open Cases</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600" size={20} />
            <span className="text-2xl font-bold">{stats?.inProgress || 0}</span>
          </div>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-2xl font-bold">{stats?.resolved || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-purple-600" size={20} />
            <span className="text-2xl font-bold">{stats?.avgResolutionTime?.toFixed(1) || 0}d</span>
          </div>
          <p className="text-sm text-gray-600">Avg Resolution</p>
        </div>
      </div>

      {/* Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-medium mb-3">Disputes by Type</h3>
          <div className="space-y-2">
            {Object.entries(stats?.byType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(type)}</span>
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="font-medium mb-3">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats?.byPriority || {}).map(([priority, count]) => {
              const percentage = stats?.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">{priority} Priority</span>
                    <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        priority === 'high' ? 'bg-red-500' :
                        priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search disputes..."
              className="input pl-10"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
          
          <select
            className="input w-full md:w-48"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="payment">Payment</option>
            <option value="damage">Damage</option>
            <option value="cancellation">Cancellation</option>
            <option value="service">Service</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </select>
          
          <select
            className="input w-full md:w-48"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { id: 'open', label: 'Open', count: stats?.open || 0 },
          { id: 'in_progress', label: 'In Progress', count: stats?.inProgress || 0 },
          { id: 'resolved', label: 'Resolved', count: stats?.resolved || 0 },
          { id: 'all', label: 'All Cases', count: stats?.total || 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFilters({ ...filters, status: tab.id === 'all' ? '' : tab.id });
            }}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="card p-8 text-center">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No disputes found</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div 
              key={dispute.id} 
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedDispute(dispute);
                setShowDetails(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(dispute.type)}</span>
                    <h3 className="font-semibold">Case #{dispute.id.slice(-6).toUpperCase()}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority} priority
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dispute.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      dispute.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{dispute.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{dispute.reporterName} vs {dispute.respondentName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Filed {format(dispute.createdAt?.toDate() || new Date(), 'MMM dd, yyyy')}</span>
                    </div>
                    {dispute.amount && (
                      <div className="flex items-center gap-1">
                        <span>₱{dispute.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {dispute.assignedToName && (
                    <div className="mt-2 text-sm text-gray-600">
                      Assigned to: <span className="font-medium">{dispute.assignedToName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedDispute && (
        <DisputeDetails
          dispute={selectedDispute}
          onClose={() => {
            setShowDetails(false);
            setSelectedDispute(null);
          }}
          onResolve={handleResolve}
          onUpdateStatus={updateStatus}
          onAssign={assignDispute}
        />
      )}
    </div>
  );
};

export default DisputeCenter;