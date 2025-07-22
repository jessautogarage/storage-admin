import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import VerificationQueue from './VerificationQueue';
import VerificationDetails from './VerificationDetails';
import { format } from 'date-fns';

const VerificationCenter = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
    searchTerm: ''
  });

  const { verifications, stats, loading, approveVerification, rejectVerification } = useVerification(filters);

  const handleApprove = async (verificationId, notes) => {
    await approveVerification(verificationId, notes);
    setShowDetails(false);
    setSelectedVerification(null);
  };

  const handleReject = async (verificationId, reason) => {
    await rejectVerification(verificationId, reason);
    setShowDetails(false);
    setSelectedVerification(null);
  };

  const MetricCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={color} size={20} />
        {change !== undefined && (
          <span className={`text-xs flex items-center gap-1 ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={14} className={change < 0 ? 'rotate-180' : ''} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification Center</h1>
          <p className="text-gray-600 mt-1">Manage user identity verification requests</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <FileText size={20} />
          Export Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          icon={Shield}
          title="Total Requests"
          value={stats?.total || 0}
          color="text-gray-600"
        />
        <MetricCard
          icon={Clock}
          title="Pending"
          value={stats?.pending || 0}
          color="text-yellow-600"
        />
        <MetricCard
          icon={CheckCircle}
          title="Approved"
          value={stats?.approved || 0}
          change={12}
          color="text-green-600"
        />
        <MetricCard
          icon={XCircle}
          title="Rejected"
          value={stats?.rejected || 0}
          color="text-red-600"
        />
        <MetricCard
          icon={Clock}
          title="Avg Processing"
          value={`${stats?.avgProcessingTime?.toFixed(1) || 0}h`}
          color="text-blue-600"
        />
      </div>

      {/* Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-medium mb-3">Verification by Type</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Host Verifications</span>
              <span className="font-medium">{stats?.byType?.host || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Client Verifications</span>
              <span className="font-medium">{stats?.byType?.premiumClient || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="font-medium mb-3">Processing Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium">
                  {stats?.total > 0 
                    ? ((stats?.approved / stats?.total) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${stats?.total > 0 
                      ? ((stats?.approved / stats?.total) * 100) 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
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
            <option value="host">Host Verification</option>
            <option value="premium_client">Premium Client</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { id: 'pending', label: 'Pending Review', count: stats?.pending || 0 },
          { id: 'approved', label: 'Approved', count: stats?.approved || 0 },
          { id: 'rejected', label: 'Rejected', count: stats?.rejected || 0 },
          { id: 'all', label: 'All Requests', count: stats?.total || 0 }
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

      {/* Verification Queue */}
      <VerificationQueue
        verifications={verifications}
        loading={loading}
        onSelectVerification={(verification) => {
          setSelectedVerification(verification);
          setShowDetails(true);
        }}
      />

      {/* Details Modal */}
      {showDetails && selectedVerification && (
        <VerificationDetails
          verification={selectedVerification}
          onClose={() => {
            setShowDetails(false);
            setSelectedVerification(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default VerificationCenter;